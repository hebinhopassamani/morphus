import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, NgZone, PLATFORM_ID, signal } from '@angular/core';
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
import { environment } from '@/environments/environment';
import { MpxLocalStorage } from '@core/morphus';
import { MpxMessageService } from '@core/morphus';
import {
  ConfirmEmailRequest,
  CreateAccountRequest,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  MpxSession,
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

export const MPX_SESSION_STORAGE_KEY = 'morphus:session';
export const MPX_RETURN_URL_STORAGE_KEY = 'morphus:returnUrl';

@Injectable({
  providedIn: 'root',
})
export class MpxSecurity {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly localStorage = inject(MpxLocalStorage);
  private readonly messageService = inject(MpxMessageService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly apiUrl = `${environment.apiUrl}/security`;

  private readonly sessionState = signal<MpxSession | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private activeLoadingCount = 0;
  private readonly errorState = signal<{ message: string } | null>(null);
  private readonly expirationTimerState = signal<string>('');
  readonly autoRefresh = signal<boolean>(true);
  private readonly refreshThresholdSeconds = 180;

  private refreshingTokenInProgress = false;
  private readonly refreshTokenSubject = new Subject<boolean>();
  readonly refreshToken$ = this.refreshTokenSubject.asObservable();

  private intervalSubscription: Subscription | null = null;

  readonly session = this.sessionState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();

  private beginLoading(): void {
    this.activeLoadingCount++;
    this.loadingState.set(true);
  }

  private endLoading(): void {
    this.activeLoadingCount = Math.max(0, this.activeLoadingCount - 1);
    this.loadingState.set(this.activeLoadingCount > 0);
  }
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

  readonly needsCorporationSelection = computed(() => {
    if (!this.isAuthenticated() || this.needsOnboarding()) {
      return false;
    }
    return this.availableCorporations().length > 1 && !this.corporationSelected();
  });

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

  accessTokenExpiresIn(): number {
    const accessExp = this.sessionState()?.accessToken?.expirationTime ?? 0;
    if (!accessExp) {
      return 0;
    }
    const diffMs = accessExp * 1000 - Date.now();
    return Math.round(diffMs / 1000);
  }

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

  refreshTokenRequired(): boolean {
    const current = this.sessionState();
    if (!current?.accessToken?.value || !current?.refreshToken?.value) {
      return false;
    }
    return this.expiresIn() > 0 && this.accessTokenExpiresIn() <= 0;
  }

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

  readonly isAdmin = computed<boolean>(() => {
    if (!this.isAuthenticated()) {
      return false;
    }
    const payload = this.decodedToken();
    if (payload) {
      const roleClaim =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        payload['role'] ??
        payload['roles'];
      if (typeof roleClaim === 'string' && roleClaim.toUpperCase() === 'ADMINISTRATOR') {
        return true;
      }
      if (Array.isArray(roleClaim) && roleClaim.some((r) => String(r).toUpperCase() === 'ADMINISTRATOR')) {
        return true;
      }
    }
    const activeCorpId = this.corporation()?.id;
    const summary = this.availableCorporations().find((c) => c.id === activeCorpId);
    if (summary?.isOwner || summary?.roles?.some((r) => r.toUpperCase() === 'ADMINISTRATOR')) {
      return true;
    }
    return false;
  });

  getPostLoginRedirectUrl(): string {
    return '/';
  }

  private isAuthFlowPath(urlOrPath: string): boolean {
    try {
      const path = urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')
        ? new URL(urlOrPath).pathname.toLowerCase()
        : urlOrPath.split('?')[0].toLowerCase();
      return (
        path.endsWith('/signin') ||
        path.endsWith('/signup') ||
        path.endsWith('/signout') ||
        path.endsWith('/onboarding') ||
        path.endsWith('/select-corporation') ||
        path.endsWith('/forgot-password') ||
        path.endsWith('/reset-password') ||
        path.endsWith('/confirm-email')
      );
    } catch {
      return false;
    }
  }

  private isPublicOrAuthEntryRoute(): boolean {
    const currentUrl = (this.router.url || '/').split('?')[0].toLowerCase();
    if (this.isAuthFlowPath(currentUrl)) {
      return true;
    }
    if (this.isBrowser) {
      const host = window.location.hostname.toLowerCase();
      if (host === 'morphus.one' || host === 'www.morphus.one') {
        return (
          currentUrl === '/' ||
          currentUrl === '/produtos' ||
          currentUrl === '/contato' ||
          currentUrl === '/privacidade' ||
          currentUrl === '/termos' ||
          currentUrl.startsWith('/website')
        );
      }
      if (host === 'security.morphus.one' && currentUrl === '/' && !this.isAuthenticated()) {
        return true;
      }
    }
    return (
      currentUrl === '/' ||
      currentUrl === '/produtos' ||
      currentUrl === '/contato' ||
      currentUrl === '/privacidade' ||
      currentUrl === '/termos' ||
      currentUrl.startsWith('/website')
    );
  }

  setReturnUrl(url: string | null | undefined): void {
    if (!this.isBrowser || !url) {
      return;
    }
    const trimmed = url.trim();
    if (!trimmed || this.isAuthFlowPath(trimmed)) {
      return;
    }
    this.localStorage.setItem(MPX_RETURN_URL_STORAGE_KEY, trimmed);
  }

  getReturnUrl(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    const saved = this.localStorage.getItem(MPX_RETURN_URL_STORAGE_KEY);
    if (!saved || this.isAuthFlowPath(saved)) {
      return null;
    }
    return saved;
  }

  consumeReturnUrl(): string | null {
    const saved = this.getReturnUrl();
    if (this.isBrowser) {
      this.localStorage.removeItem(MPX_RETURN_URL_STORAGE_KEY);
    }
    return saved;
  }

  redirectToLogin(targetReturnUrl?: string | null, mode: 'signin' | 'signup' = 'signin'): void {
    const fallbackUrl = this.isBrowser ? window.location.href : this.router.url || '/';
    const finalReturnUrl = (targetReturnUrl && !this.isAuthFlowPath(targetReturnUrl))
      ? targetReturnUrl
      : (!this.isAuthFlowPath(fallbackUrl) ? fallbackUrl : null);

    if (finalReturnUrl) {
      this.setReturnUrl(finalReturnUrl);
    }

    if (this.isBrowser) {
      const host = window.location.hostname.toLowerCase();
      if (host === 'morphus.one' || host.endsWith('.morphus.one')) {
        const path = mode === 'signup' ? '/signup' : '';
        const query = finalReturnUrl ? `?returnUrl=${encodeURIComponent(finalReturnUrl)}` : '';
        if (host !== 'security.morphus.one') {
          window.location.href = `${window.location.protocol}//security.morphus.one${path}${query}`;
          return;
        }
        void this.router.navigate([mode === 'signup' ? '/security/signup' : '/'], {
          queryParams: finalReturnUrl ? { returnUrl: finalReturnUrl } : undefined,
        });
        return;
      }
    }

    void this.router.navigate([mode === 'signup' ? '/security/signup' : '/security/signin'], {
      queryParams: finalReturnUrl ? { returnUrl: finalReturnUrl } : undefined,
    });
  }

  completePostAuthNavigation(explicitReturnUrl?: string | null): void {
    this.ngZone.run(() => {
      if (explicitReturnUrl && !this.isAuthFlowPath(explicitReturnUrl)) {
        this.setReturnUrl(explicitReturnUrl);
      }

      if (this.needsOnboarding()) {
        void this.router.navigateByUrl('/security/onboarding');
        return;
      }

      const pendingReturnUrl =
        (explicitReturnUrl && !this.isAuthFlowPath(explicitReturnUrl) ? explicitReturnUrl : null) ||
        this.getReturnUrl();

      if (this.needsCorporationSelection()) {
        void this.router.navigate(['/security/select-corporation'], {
          queryParams: pendingReturnUrl ? { returnUrl: pendingReturnUrl } : undefined,
        });
        return;
      }

      const target =
        (explicitReturnUrl && !this.isAuthFlowPath(explicitReturnUrl) ? explicitReturnUrl : null) ||
        this.consumeReturnUrl() ||
        this.getPostLoginRedirectUrl();
      this.localStorage.removeItem(MPX_RETURN_URL_STORAGE_KEY);

      if (this.isBrowser && (target.startsWith('http://') || target.startsWith('https://'))) {
        try {
          const parsed = new URL(target, window.location.origin);
          if (parsed.origin !== window.location.origin) {
            window.location.href = parsed.href;
            return;
          }
          const localPath = (parsed.pathname || '/') + parsed.search + parsed.hash;
          void this.router.navigateByUrl(localPath, { onSameUrlNavigation: 'reload' });
          return;
        } catch {
          // Fallback to default router navigation
        }
      }

      void this.router.navigateByUrl(target || '/', { onSameUrlNavigation: 'reload' });
    });
  }

  constructor() {
    if (this.isBrowser) {
      this.loadSessionFromStorage();
    }
  }

  loadSessionFromStorage(): MpxSession | null {
    try {
      const raw = this.localStorage.getItem(MPX_SESSION_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as MpxSession;
      if (parsed?.accessToken?.value) {
        const nowSeconds = Math.floor(Date.now() / 1000);
        const accessExp = parsed.accessToken.expirationTime ?? 0;
        const refreshExp = parsed.refreshToken?.expirationTime ?? accessExp;
        if (refreshExp <= nowSeconds) {
          this.localStorage.removeItem(MPX_SESSION_STORAGE_KEY);
          this.sessionState.set(null);
          return null;
        }

        this.sessionState.set(parsed);
        this.startExpirationInterval();
        return parsed;
      }
      return null;
    } catch {
      this.localStorage.removeItem(MPX_SESSION_STORAGE_KEY);
      return null;
    }
  }

  setSession(session: MpxSession | null): void {
    this.sessionState.set(session);
    this.errorState.set(null);

    if (!this.isBrowser) {
      return;
    }

    if (session?.accessToken?.value) {
      this.localStorage.setItem(MPX_SESSION_STORAGE_KEY, JSON.stringify(session));
      this.startExpirationInterval();
    } else {
      this.stopExpirationInterval();
      this.localStorage.removeItem(MPX_SESSION_STORAGE_KEY);
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
        if (this.isPublicOrAuthEntryRoute()) {
          this.messageService.messageType = 'NORMAL';
          this.clearInvalidSession();
          return;
        }
        this.messageService.messageType = 'SESSION_EXPIRED';
        const currentUrl = this.router.url || '';
        const targetUrl = currentUrl.startsWith('/') ? '/' : '/security/signin';
        this.logout(targetUrl);
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

  loginWithGoogle(request: GoogleLoginRequest): Observable<MpxSession> {
    this.beginLoading();
    this.errorState.set(null);

    return this.http.post<MpxSession>(`${this.apiUrl}/google-login`, request).pipe(
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
      finalize(() => this.endLoading()),
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

  loginWithCredentials(request: LoginRequest): Observable<MpxSession> {
    this.beginLoading();
    this.errorState.set(null);

    return this.http.post<MpxSession>(`${this.apiUrl}/login`, request).pipe(
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
      finalize(() => this.endLoading()),
    );
  }

  createAccount(request: CreateAccountRequest): Observable<MpxSession> {
    this.beginLoading();
    this.errorState.set(null);

    return this.http.post<MpxSession>(`${this.apiUrl}/create-account`, request).pipe(
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
      finalize(() => this.endLoading()),
    );
  }

  getOnboardingState(): Observable<OnboardingStateResponse> {
    return this.http.get<OnboardingStateResponse>(`${this.apiUrl}/onboarding/state`);
  }

  confirmEmail(request: ConfirmEmailRequest): Observable<{ message: string }> {
    this.beginLoading();
    this.errorState.set(null);

    return this.http.post<{ message: string }>(`${this.apiUrl}/confirm-email`, request).pipe(
      tap(() => this.markEmailConfirmed()),
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Link de confirmação inválido ou expirado.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.endLoading()),
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

  saveOnboardingCorporationStep(request: OnboardingCorporationStepRequest): Observable<MpxSession> {
    this.beginLoading();
    this.errorState.set(null);

    return this.http.post<MpxSession>(`${this.apiUrl}/onboarding/step-corporation`, request).pipe(
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
      finalize(() => this.endLoading()),
    );
  }

  saveOnboardingWorkspaceStep(request: OnboardingWorkspaceStepRequest): Observable<OnboardingStateResponse> {
    this.beginLoading();
    this.errorState.set(null);

    return this.http.post<OnboardingStateResponse>(`${this.apiUrl}/onboarding/step-workspace`, request).pipe(
      delay(1200),
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Não foi possível salvar os dados do workspace.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.endLoading()),
    );
  }

  completeOnboarding(request: OnboardingCompleteRequest): Observable<MpxSession> {
    this.beginLoading();
    this.errorState.set(null);

    return this.http.post<MpxSession>(`${this.apiUrl}/onboarding/complete`, request).pipe(
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
      finalize(() => this.endLoading()),
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    this.beginLoading();
    this.errorState.set(null);

    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, request).pipe(
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Não foi possível processar a solicitação.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.endLoading()),
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    this.beginLoading();
    this.errorState.set(null);

    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, request).pipe(
      catchError((err: HttpErrorResponse) => {
        const message = err.error?.message || 'Token de recuperação inválido ou expirado.';
        this.errorState.set({ message });
        return throwError(() => err);
      }),
      finalize(() => this.endLoading()),
    );
  }

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
          if (this.isPublicOrAuthEntryRoute()) {
            this.messageService.messageType = 'NORMAL';
            this.clearInvalidSession();
            return;
          }
          this.messageService.messageType = 'SESSION_EXPIRED';
          const currentUrl = this.router.url || '';
          const targetUrl = currentUrl.startsWith('/') ? '/' : '/security/signin';
          this.logout(targetUrl);
        },
      });
  }

  refreshToken(): Observable<MpxSession> {
    const currentRefreshToken = this.sessionState()?.refreshToken?.value;
    const currentCorporationId = this.sessionState()?.corporation?.id;
    const wasSelected = this.corporationSelected();

    const payload: RefreshTokenRequest = {
      refreshToken: currentRefreshToken ?? '',
      corporationId: currentCorporationId,
    };

    return this.http.post<MpxSession>(`${this.apiUrl}/refresh-token`, payload).pipe(
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: wasSelected,
        }),
      ),
    );
  }

  refreshSession(): Observable<MpxSession> {
    const wasSelected = this.corporationSelected();
    return this.http.post<MpxSession>(`${this.apiUrl}/refresh-session`, {}).pipe(
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: wasSelected,
        }),
      ),
    );
  }

  switchCorporation(corporationId: string): Observable<MpxSession> {
    const payload: SwitchCorporationRequest = { corporationId };
    this.beginLoading();

    return this.http.post<MpxSession>(`${this.apiUrl}/switch-corporation`, payload).pipe(
      delay(1200),
      tap((session) =>
        this.setSession({
          ...session,
          corporationSelected: true,
        }),
      ),
      finalize(() => this.endLoading()),
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

  openCorporationSelector(returnUrl = '/morphus', appPrefix: 'security' | 'website' = 'security'): void {
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

  clearInvalidSession(): void {
    this.stopExpirationInterval();
    this.setSession(null);
    const currentUrl = this.router.url || '';
    if (!currentUrl.startsWith('/') && !currentUrl.startsWith('/security/signin') && !currentUrl.startsWith('/security/signup')) {
      void this.router.navigateByUrl('/');
    }
  }

  logout(redirectUrl = '/security/signin'): void {
    const isSessionExpired =
      this.messageService.messageType === 'SESSION_EXPIRED' ||
      this.messageService.messageType === 'expired_session' ||
      this.messageService.messageType === 'expired';

    if (!isSessionExpired) {
      this.messageService.messageType = 'LOGOUT';
    }

    const hadValidAccessToken =
      Boolean(this.sessionState()?.accessToken?.value) && this.accessTokenExpiresIn() > 0;

    this.stopExpirationInterval();

    if (hadValidAccessToken) {
      this.http.post(`${this.apiUrl}/revoke`, {}).subscribe({
        error: () => {},
      });
    }

    this.setSession(null);
    if (this.isBrowser) {
      this.localStorage.removeItem(MPX_RETURN_URL_STORAGE_KEY);
      const host = window.location.hostname.toLowerCase();
      if (host === 'morphus.one' || host.endsWith('.morphus.one')) {
        if (isSessionExpired) {
          if (host !== 'security.morphus.one') {
            window.location.href = `${window.location.protocol}//security.morphus.one`;
            return;
          }
        } else if (host !== 'morphus.one' && host !== 'www.morphus.one' && host !== 'security.morphus.one') {
          window.location.href = `${window.location.protocol}//morphus.one`;
          return;
        } else if (host === 'security.morphus.one') {
          redirectUrl = '/';
        }
      }
    }
    void this.router.navigateByUrl(redirectUrl, { onSameUrlNavigation: 'reload' }).finally(() => {
      if (isSessionExpired) {
        this.messageService.messageType = 'SESSION_EXPIRED';
        this.messageService.showError(
          'Sua sessão expirou por segurança. Faça login novamente para continuar.',
          'Sessão expirada',
        );
      } else {
        this.messageService.messageType = 'NORMAL';
      }
    });
  }
}
