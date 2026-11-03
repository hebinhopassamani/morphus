import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, PLATFORM_ID, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  delay,
  finalize,
   interval,
  Observable,
  Subject,
  Subscription,
  take,
  tap,
  throwError,
} from 'rxjs';
import { MpxLocalStorage } from '@core/mpx-local-storage';
import { environment } from '@/environments/environment';
import {
  ConfirmEmailRequest,
  CreateAccountRequest,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  MorphusSession,
  OnboardingCompleteRequest,
  OnboardingCorporationStepRequest,
  OnboardingStateResponse,
  OnboardingWorkspaceStepRequest,
  RefreshTokenRequest,
  ResetPasswordRequest,
  SwitchCorporationRequest,
  UpdateUserProfileRequest,
} from '@security/entities/session';
import { User } from '@security/entities/user';

export const MORPHUS_SESSION_STORAGE_KEY = 'morphus:session';

@Injectable({
  providedIn: 'root',
})
export class MpxAuth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly localStorage = inject(MpxLocalStorage);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly apiUrl = `${environment.apiUrl}/security`;

  private readonly sessionState = signal<MorphusSession | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private readonly errorState = signal<{ message: string } | null>(null);
  private readonly expirationTimerState = signal<string>('');
  readonly autoRefresh = signal<boolean>(true);
  private readonly refreshThresholdSeconds = 180;

  // Semáforo e fila reativa para renovação automática de token (inspirado no MorphusAuthService original)
  private refreshingTokenInProgress = false;
  private readonly refreshTokenSubject = new Subject<boolean>();
  readonly refreshToken$ = this.refreshTokenSubject.asObservable();

  private intervalSubscription: Subscription | null = null;

  readonly session = this.sessionState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly expirationTimer = this.expirationTimerState.asReadonly();

  readonly user = computed(() => this.sessionState()?.user ?? null);
  readonly displayName = computed(
    () =>
      this.sessionState()?.user?.nickName?.trim() ||
      this.sessionState()?.user?.name?.trim() ||
      'Bem-vindo',
  );
  readonly corporation = computed(() => this.sessionState()?.corporation ?? null);
  readonly availableCorporations = computed(() => this.sessionState()?.availableCorporations ?? []);
  readonly accessToken = computed(() => this.sessionState()?.accessToken?.value ?? null);

  /**
   * Indica se a corporação já foi escolhida/confirmada pelo usuário nesta sessão.
   * Quando já existe `corporation.id` salvo na sessão e `corporationSelected` não foi explicitamente marcado como `false`,
   * considera-se a corporação já selecionada.
   */
  readonly corporationSelected = computed(() => {
    const current = this.sessionState();
    if (!current?.corporation?.id) {
      return false;
    }
    if (current.corporationSelected !== undefined) {
      return current.corporationSelected;
    }
    return true;
  });

  /**
   * Indica se o usuário acabou de autenticar, possui múltiplas corporações e ainda não escolheu uma.
   */
  readonly needsCorporationSelection = computed(() => {
    if (!this.isAuthenticated() || this.needsOnboarding()) {
      return false;
    }
    return this.availableCorporations().length > 1 && !this.corporationSelected();
  });

  /**
   * Segundos restantes para expiração da sessão completa (RefreshToken).
   */
  expiresIn(): number {
    const refreshExp =
      this.sessionState()?.refreshToken?.expirationTime ??
      this.sessionState()?.accessToken?.expirationTime ??
      0;
    if (!refreshExp) {
      return 0;
    }
    const diffMs = refreshExp * 1000 - Date.now();
    return Math.round(diffMs / 1000);
  }

  /**
   * Segundos restantes para expiração do AccessToken (JWT).
   */
  accessTokenExpiresIn(): number {
    const accessExp = this.sessionState()?.accessToken?.expirationTime ?? 0;
    if (!accessExp) {
      return 0;
    }
    const diffMs = accessExp * 1000 - Date.now();
    return Math.round(diffMs / 1000);
  }

  /**
   * A sessão permanece autenticada enquanto houver token e o RefreshToken (ou AccessToken)
   * ainda estiver dentro da validade. Se apenas o AccessToken vencer mas o RefreshToken estiver válido,
   * a próxima requisição renovará o AccessToken automaticamente via refreshTokenRequired().
   */
  readonly isAuthenticated = computed(() => {
    const current = this.sessionState();
    const token = current?.accessToken;
    if (!token?.value) {
      return false;
    }
    const maxExpiration =
      current?.refreshToken?.expirationTime ?? token.expirationTime ?? 0;
    const nowSeconds = Math.floor(Date.now() / 1000);
    return maxExpiration > nowSeconds;
  });

  /**
   * A sessão está autenticada e o RefreshToken ainda é válido, porém o AccessToken expirou.
   * Dispara a renovação transparente na próxima requisição HTTP.
   */
  refreshTokenRequired(): boolean {
    const current = this.sessionState();
    if (!current?.accessToken?.value || !current?.refreshToken?.value) {
      return false;
    }
    return this.expiresIn() > 0 && this.accessTokenExpiresIn() <= 0;
  }

  /**
   * Tanto o AccessToken quanto o RefreshToken expiraram; requer novo login.
   */
  expired(): boolean {
    const current = this.sessionState();
    if (!current?.accessToken?.value) {
      return false;
    }
    return this.expiresIn() <= 0;
  }

  readonly needsOnboarding = computed(() => {
    if (!this.isAuthenticated()) {
      return false;
    }
    const currentUser = this.user();
    return currentUser ? currentUser.onboardingCompleted === false : false;
  });

  readonly decodedToken = computed<Record<string, unknown> | null>(() => {
    const jwt = this.accessToken();
    if (!jwt) {
      return null;
    }
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload) as Record<string, unknown>;
    } catch {
      return null;
    }
  });

  constructor() {
    if (this.isBrowser) {
      this.loadSessionFromStorage();
    }
  }

  loadSessionFromStorage(): MorphusSession | null {
    try {
      const raw = this.localStorage.getItem(MORPHUS_SESSION_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as MorphusSession;
      if (parsed?.accessToken?.value) {
        this.sessionState.set(parsed);
        this.startExpirationInterval();
        return parsed;
      }
      return null;
    } catch {
      this.localStorage.removeItem(MORPHUS_SESSION_STORAGE_KEY);
      return null;
    }
  }

  setSession(session: MorphusSession | null): void {
    this.sessionState.set(session);
    this.errorState.set(null);

    if (!this.isBrowser) {
      return;
    }

    if (session?.accessToken?.value) {
      this.localStorage.setItem(MORPHUS_SESSION_STORAGE_KEY, JSON.stringify(session));
      this.startExpirationInterval();
    } else {
      this.stopExpirationInterval();
      this.localStorage.removeItem(MORPHUS_SESSION_STORAGE_KEY);
    }
  }

  private startExpirationInterval(): void {
    if (!this.isBrowser) {
      return;
    }
    this.stopExpirationInterval();

    const tick = (): void => {
      const accessSeconds = Math.max(0, this.accessTokenExpiresIn());
      const formatted = new Date(accessSeconds * 1000).toISOString().substring(14, 19);
      this.expirationTimerState.set(formatted);

      if (this.autoRefresh() && accessSeconds <= this.refreshThresholdSeconds && this.expiresIn() > 0) {
        this.triggerRefreshToken();
        return;
      }

      if (accessSeconds <= 0) {
        this.logout();
      }
    };

    tick();
    this.intervalSubscription = interval(1000).subscribe(() => tick());
  }

  private stopExpirationInterval(): void {
    if (this.intervalSubscription && !this.intervalSubscription.closed) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = null;
    }
  }

  clearError(): void {
    this.errorState.set(null);
  }

  setError(message: string): void {
    this.errorState.set({ message });
  }

  loginWithGoogle(request: GoogleLoginRequest): Observable<MorphusSession> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<MorphusSession>(`${this.apiUrl}/google-login`, request).pipe(
      delay(1200),
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: (session.availableCorporations?.length ?? 0) <= 1,
        }),
      ),
      catchError((err: HttpErrorResponse) => {
        const message =
          err.error?.message || 'Não foi possível autenticar com o Google.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.loadingState.set(false)),
    );
  }

  hasClaim(claimType: string, claimValue?: string): boolean {
    const payload = this.decodedToken();
    if (!payload) {
      return false;
    }

    const rawClaim = payload[claimType];
    if (rawClaim === undefined || rawClaim === null) {
      return false;
    }

    if (claimValue === undefined) {
      return true;
    }

    if (Array.isArray(rawClaim)) {
      return rawClaim.includes(claimValue);
    }

    return String(rawClaim) === claimValue;
  }

  loginWithCredentials(request: LoginRequest): Observable<MorphusSession> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<MorphusSession>(`${this.apiUrl}/login`, request).pipe(
      delay(1200),
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: (session.availableCorporations?.length ?? 0) <= 1,
        }),
      ),
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'E-mail ou senha inválidos.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.loadingState.set(false)),
    );
  }

  createAccount(request: CreateAccountRequest): Observable<MorphusSession> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<MorphusSession>(`${this.apiUrl}/create-account`, request).pipe(
      delay(1200),
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: true,
        }),
      ),
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Não foi possível criar a conta. Verifique os dados informados.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.loadingState.set(false)),
    );
  }

  getOnboardingState(): Observable<OnboardingStateResponse> {
    return this.http.get<OnboardingStateResponse>(`${this.apiUrl}/onboarding/state`);
  }

  confirmEmail(request: ConfirmEmailRequest): Observable<{ message: string }> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<{ message: string }>(`${this.apiUrl}/confirm-email`, request).pipe(
      tap(() => this.markEmailConfirmed()),
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Link de confirmação inválido ou expirado.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.loadingState.set(false)),
    );
  }

  resendConfirmationEmail(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/onboarding/resend-confirmation`, {});
  }

  markEmailConfirmed(): void {
    const current = this.sessionState();
    if (!current?.user || current.user.emailConfirmed) {
      return;
    }

    this.setSession({
      ...current,
      user: {
        ...current.user,
        emailConfirmed: true,
      },
    });
  }

  saveOnboardingCorporationStep(request: OnboardingCorporationStepRequest): Observable<MorphusSession> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<MorphusSession>(`${this.apiUrl}/onboarding/step-corporation`, request).pipe(
      delay(1200),
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: true,
        }),
      ),
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Não foi possível salvar os dados da matriz.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.loadingState.set(false)),
    );
  }

  saveOnboardingWorkspaceStep(request: OnboardingWorkspaceStepRequest): Observable<OnboardingStateResponse> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<OnboardingStateResponse>(`${this.apiUrl}/onboarding/step-workspace`, request).pipe(
      delay(1200),
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Não foi possível salvar os dados do workspace.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.loadingState.set(false)),
    );
  }

  completeOnboarding(request: OnboardingCompleteRequest): Observable<MorphusSession> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<MorphusSession>(`${this.apiUrl}/onboarding/complete`, request).pipe(
      delay(1200),
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: true,
        }),
      ),
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Não foi possível concluir a configuração inicial.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.loadingState.set(false)),
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, request).pipe(
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Não foi possível processar a solicitação.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.loadingState.set(false)),
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    this.loadingState.set(true);
    this.errorState.set(null);

    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, request).pipe(
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Token de recuperação inválido ou expirado.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.loadingState.set(false)),
    );
  }

  /**
   * Dispara a renovação do AccessToken protegido por semáforo (apenas 1 requisição de refresh por vez).
   * Todas as requisições pendentes que escutam refreshToken$ serão liberadas assim que concluir.
   */
  triggerRefreshToken(): void {
    if (this.refreshingTokenInProgress) {
      return;
    }

    this.refreshingTokenInProgress = true;

    this.refreshToken()
      .pipe(
        take(1),
        finalize(() => {
          this.refreshingTokenInProgress = false;
        }),
      )
      .subscribe({
        next: () => {
          this.refreshTokenSubject.next(true);
        },
        error: () => {
          this.refreshTokenSubject.next(false);
          this.logout();
        },
      });
  }

  refreshToken(): Observable<MorphusSession> {
    const currentRefreshToken = this.sessionState()?.refreshToken?.value;
    const currentCorporationId = this.sessionState()?.corporation?.id;
    const wasSelected = this.corporationSelected();

    const payload: RefreshTokenRequest = {
      refreshToken: currentRefreshToken ?? '',
      corporationId: currentCorporationId,
    };

    return this.http.post<MorphusSession>(`${this.apiUrl}/refresh-token`, payload).pipe(
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: wasSelected,
        }),
      ),
    );
  }

  refreshSession(): Observable<MorphusSession> {
    const wasSelected = this.corporationSelected();
    return this.http.post<MorphusSession>(`${this.apiUrl}/refresh-session`, {}).pipe(
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: wasSelected,
        }),
      ),
    );
  }

  switchCorporation(corporationId: string): Observable<MorphusSession> {
    const payload: SwitchCorporationRequest = { corporationId };
    this.loadingState.set(true);

    return this.http.post<MorphusSession>(`${this.apiUrl}/switch-corporation`, payload).pipe(
      delay(1200),
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: true,
        }),
      ),
      finalize(() => this.loadingState.set(false)),
    );
  }

  markCorporationSelected(selected = true): void {
    const current = this.sessionState();
    if (!current) {
      return;
    }
    this.setSession({
      ...current,
      corporationSelected: selected,
    });
  }

  openCorporationSelector(returnUrl = '/admin', appPrefix: 'security' | 'website' = 'security'): void {
    this.markCorporationSelected(false);
    void this.router.navigate([`/${appPrefix}/select-corporation`], {
      queryParams: { switch: 'true', returnUrl },
    });
  }

  updateProfile(request: UpdateUserProfileRequest): Observable<User> {
    const current = this.sessionState();
    if (current?.user) {
      this.setSession({
        ...current,
        user: {
          ...current.user,
          name: request.name !== undefined ? request.name.trim() || current.user.name : current.user.name,
          nickName: request.nickName !== undefined ? request.nickName.trim() : current.user.nickName,
          phoneNumber:
            request.phoneNumber !== undefined ? request.phoneNumber.trim() : current.user.phoneNumber,
        },
      });
    }

    return this.http.put<User>(`${this.apiUrl}/profile`, request).pipe(
      tap((updatedUser) => {
        const latest = this.sessionState();
        if (latest) {
          this.setSession({
            ...latest,
            user: {
              ...latest.user,
              ...updatedUser,
            },
          });
        }
      }),
    );
  }

  login(): void {
    this.router.navigateByUrl('/security/signin');
  }

  signup(): void {
    this.router.navigateByUrl('/security/signup');
  }

  logout(redirectUrl = '/security/signin'): void {
    this.stopExpirationInterval();

    if (this.sessionState()?.accessToken?.value) {
      this.http.post(`${this.apiUrl}/revoke`, {}).subscribe({
        error: () => {
          // Ignora falha de rede no revoke pois a sessão local será limpa de qualquer forma
        },
      });
    }

    this.setSession(null);
    this.router.navigateByUrl(redirectUrl);
  }
}
