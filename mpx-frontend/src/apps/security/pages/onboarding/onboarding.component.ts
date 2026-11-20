import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { MpxSecurity } from '@core/morphus';
import { OnboardingApplicationItem } from '@security/entities/session';

@Component({
  selector: 'sec-onboarding',
  templateUrl: './onboarding.component.html',
  host: { class: 'flex w-full flex-auto flex-col items-center justify-center p-4 sm:p-8' },
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatIcon,
  ],
  standalone: true,
})
export class OnboardingComponent implements OnInit, OnDestroy {
  protected readonly auth = inject(MpxSecurity);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly isLoadingState = signal(true);
  protected readonly emailConfirmed = signal(true);
  protected readonly userEmail = signal<string>('');
  protected readonly isResendingEmail = signal(false);
  protected readonly resendSuccessMessage = signal<string | null>(null);
  protected readonly currentStep = signal<1 | 2 | 3 | 4>(1);

  protected readonly corporationId = signal<string | null>(null);
  protected readonly userProfileSaved = signal<boolean>(false);
  protected readonly workspaceId = signal<string | null>(null);
  protected readonly availableApplications = signal<OnboardingApplicationItem[]>([]);
  protected readonly selectedApplicationIds = signal<string[]>([]);

  private emailPollTimer: ReturnType<typeof setInterval> | null = null;

  protected readonly optionalApplications = computed(() =>
    this.availableApplications().filter((a) => !a.system),
  );

  protected readonly coreApplications = computed(() =>
    this.availableApplications().filter((a) => a.system),
  );

  // ETAPA 1: Sua Matriz (apenas o nome da matriz — limite 40 caracteres)
  protected readonly step1Form = this.fb.nonNullable.group({
    corporationName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
  });

  // ETAPA 2: Seus Dados (Primeiro nome = 20 chars, Segundo nome = 20 chars e Como gostaria de ser chamado)
  protected readonly step2Form = this.fb.nonNullable.group({
    userFirstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    userLastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    userNickName: ['', [Validators.maxLength(40)]],
  });

  protected readonly nickNameManuallyEdited = signal<boolean>(false);
  protected readonly lastAutoSuggestedNickName = signal<string>('');

  // ETAPA 3: Workspace (Seu primeiro workspace — limite 35 caracteres)
  protected readonly step3Form = this.fb.nonNullable.group({
    workspaceName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(35)]],
  });

  ngOnInit(): void {
    this.auth.clearError();

    const currentUser = this.auth.user();
    if (currentUser?.firstName || currentUser?.lastName) {
      this.step2Form.patchValue({
        userFirstName: (currentUser.firstName ?? '').slice(0, 20),
        userLastName: (currentUser.lastName ?? '').slice(0, 20),
      });
    }
    if (currentUser?.nickName) {
      this.step2Form.patchValue({ userNickName: currentUser.nickName });
      this.nickNameManuallyEdited.set(true);
    }
    if (currentUser?.email) {
      this.userEmail.set(currentUser.email);
    }
    if (currentUser?.emailConfirmed !== undefined) {
      this.emailConfirmed.set(currentUser.emailConfirmed);
    }

    this.loadSavedState();
  }

  ngOnDestroy(): void {
    this.stopEmailPolling();
  }

  private loadSavedState(): void {
    this.isLoadingState.set(true);

    this.auth.getOnboardingState().subscribe({
      next: (state) => {
        if (state.onboardingCompleted) {
          this.stopEmailPolling();
          this.router.navigateByUrl(this.auth.getPostLoginRedirectUrl());
          return;
        }

        if (state.userEmail) {
          this.userEmail.set(state.userEmail);
        }

        this.emailConfirmed.set(state.emailConfirmed);

        if (!state.emailConfirmed) {
          this.startEmailPolling();
        } else {
          this.stopEmailPolling();
          this.auth.markEmailConfirmed();
        }

        if (state.userFirstName || state.userLastName) {
          this.step2Form.patchValue({
            userFirstName: (state.userFirstName ?? '').slice(0, 20),
            userLastName: (state.userLastName ?? '').slice(0, 20),
          });
        }
        if (state.userNickName) {
          this.step2Form.patchValue({ userNickName: state.userNickName });
          this.nickNameManuallyEdited.set(true);
        }

        if (state.corporationId && state.corporationName) {
          this.corporationId.set(state.corporationId);
          this.step1Form.patchValue({ corporationName: state.corporationName.slice(0, 40) });
        }

        if (state.workspaceId && state.workspaceName) {
          this.workspaceId.set(state.workspaceId);
          this.step3Form.patchValue({ workspaceName: state.workspaceName.slice(0, 35) });
        }

        this.availableApplications.set(state.availableApplications ?? []);
        this.selectedApplicationIds.set(state.selectedApplicationIds ?? []);

        // Retoma exatamente da etapa em que o usuário parou antes de fechar o navegador
        if (!state.corporationId) {
          this.currentStep.set(1);
        } else if (!state.userFirstName || !state.userLastName) {
          this.currentStep.set(2);
        } else if (!state.workspaceId || this.optionalApplications().length === 0) {
          this.userProfileSaved.set(true);
          this.currentStep.set(3);
        } else {
          this.userProfileSaved.set(true);
          this.currentStep.set(4);
        }

        this.isLoadingState.set(false);
      },
      error: () => {
        this.isLoadingState.set(false);
      },
    });
  }

  private startEmailPolling(): void {
    if (this.emailPollTimer) {
      return;
    }

    this.emailPollTimer = setInterval(() => {
      this.auth.getOnboardingState().subscribe({
        next: (state) => {
          if (state.emailConfirmed) {
            this.stopEmailPolling();
            this.emailConfirmed.set(true);
            this.auth.markEmailConfirmed();
          }
        },
      });
    }, 2500);
  }

  private stopEmailPolling(): void {
    if (this.emailPollTimer) {
      clearInterval(this.emailPollTimer);
      this.emailPollTimer = null;
    }
  }

  protected onResendConfirmationEmail(): void {
    if (this.isResendingEmail()) {
      return;
    }

    this.isResendingEmail.set(true);
    this.resendSuccessMessage.set(null);

    this.auth.resendConfirmationEmail().subscribe({
      next: () => {
        this.isResendingEmail.set(false);
        this.resendSuccessMessage.set('Novo link enviado! Verifique sua caixa de entrada e spam.');
      },
      error: () => {
        this.isResendingEmail.set(false);
      },
    });
  }

  protected onNickNameFocus(): void {
    const currentNick = this.step2Form.controls.userNickName.value.trim();

    // Uma vez que o usuário meteu a mão no campo (nickNameManuallyEdited = true), nunca mais sobrescreve!
    if (this.nickNameManuallyEdited() && currentNick.length > 0) {
      return;
    }

    const suggestion = this.buildSuggestedNickName(
      this.step2Form.controls.userFirstName.value,
      this.step2Form.controls.userLastName.value,
    );

    if (suggestion) {
      this.lastAutoSuggestedNickName.set(suggestion);
      this.step2Form.patchValue({ userNickName: suggestion });
    }
  }

  protected onNickNameInput(): void {
    const val = this.step2Form.controls.userNickName.value.trim();
    this.nickNameManuallyEdited.set(val.length > 0);
  }

  private buildSuggestedNickName(firstNameRaw: string, lastNameRaw: string): string {
    const firstParts = (firstNameRaw || '')
      .trim()
      .split(/\s+/)
      .filter((p) => p.length > 0);
    const lastParts = (lastNameRaw || '')
      .trim()
      .split(/\s+/)
      .filter((p) => p.length > 0);

    if (firstParts.length === 0 && lastParts.length === 0) {
      return '';
    }

    if (firstParts.length > 0 && lastParts.length > 0) {
      const firstWord = firstParts[0];
      const lastWord = lastParts[lastParts.length - 1];
      return `${firstWord} ${lastWord}`.slice(0, 40);
    }

    if (firstParts.length > 0) {
      return firstParts[0].slice(0, 40);
    }

    return lastParts[lastParts.length - 1].slice(0, 40);
  }

  private splitFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = (fullName || '')
      .trim()
      .split(/\s+/)
      .filter((p) => p.length > 0);
    if (parts.length === 0) {
      return { firstName: '', lastName: '' };
    }
    if (parts.length === 1) {
      return { firstName: parts[0].slice(0, 20), lastName: '' };
    }
    const half = Math.ceil(parts.length / 2);
    const firstName = parts.slice(0, half).join(' ').slice(0, 20);
    const lastName = parts.slice(half).join(' ').slice(0, 20);
    return { firstName, lastName };
  }

  protected onSaveStep1(): void {
    if (this.auth.isLoading()) {
      return;
    }
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }

    const { corporationName } = this.step1Form.getRawValue();

    this.auth
      .saveOnboardingCorporationStep({
        corporationName: corporationName.trim().slice(0, 40),
      })
      .subscribe({
        next: (session) => {
          if (session.corporation?.id) {
            this.corporationId.set(session.corporation.id);
          }
          this.currentStep.set(2);
        },
      });
  }

  protected onSaveStep2(): void {
    if (this.auth.isLoading()) {
      return;
    }
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }

    const { corporationName } = this.step1Form.getRawValue();
    const { userFirstName, userLastName, userNickName } = this.step2Form.getRawValue();
    const cleanFirst = userFirstName.trim().slice(0, 20);
    const cleanLast = userLastName.trim().slice(0, 20);
    const combinedName = `${cleanFirst} ${cleanLast}`.trim();
    const finalNick =
      userNickName.trim() || this.buildSuggestedNickName(cleanFirst, cleanLast) || undefined;

    this.auth
      .saveOnboardingCorporationStep({
        corporationName: corporationName.trim().slice(0, 40),
        userFirstName: cleanFirst,
        userLastName: cleanLast,
        userName: combinedName,
        userNickName: finalNick,
      })
      .subscribe({
        next: (session) => {
          if (session.corporation?.id) {
            this.corporationId.set(session.corporation.id);
          }
          this.userProfileSaved.set(true);
          this.currentStep.set(3);
        },
      });
  }

  protected onSaveStep3(): void {
    if (this.auth.isLoading()) {
      return;
    }
    if (this.step3Form.invalid) {
      this.step3Form.markAllAsTouched();
      return;
    }

    const { workspaceName } = this.step3Form.getRawValue();

    this.auth
      .saveOnboardingWorkspaceStep({
        workspaceName: workspaceName.trim(),
      })
      .subscribe({
        next: (state) => {
          this.workspaceId.set(state.workspaceId ?? null);
          this.availableApplications.set(state.availableApplications ?? []);
          this.selectedApplicationIds.set(state.selectedApplicationIds ?? []);
          if (this.optionalApplications().length === 0) {
            const coreIds = this.coreApplications().map((a) => a.id);
            this.finishOnboarding(coreIds);
            return;
          }
          this.currentStep.set(4);
        },
      });
  }

  protected goToStep(step: 1 | 2 | 3): void {
    if (this.auth.isLoading() || !this.emailConfirmed()) {
      return;
    }
    if (step === 2 && !this.corporationId()) {
      return;
    }
    if (step === 3 && (!this.corporationId() || !this.userProfileSaved())) {
      return;
    }
    this.auth.clearError();
    this.currentStep.set(step);
  }

  protected isAppSelected(appId: string): boolean {
    return this.selectedApplicationIds().includes(appId);
  }

  protected toggleApp(app: OnboardingApplicationItem, event?: Event): void {
    event?.stopPropagation();
    if (app.system || !app.availableForTrial) {
      return;
    }

    this.selectedApplicationIds.update((current) => {
      if (current.includes(app.id)) {
        return current.filter((id) => id !== app.id);
      }
      return [...current, app.id];
    });
  }

  protected onSkipApps(): void {
    const coreIds = this.coreApplications().map((a) => a.id);
    this.finishOnboarding(coreIds);
  }

  protected onCompleteOnboarding(): void {
    const coreIds = this.coreApplications().map((a) => a.id);
    const mergedIds = Array.from(new Set([...coreIds, ...this.selectedApplicationIds()]));
    this.finishOnboarding(mergedIds);
  }

  private finishOnboarding(applicationIds: string[]): void {
    this.auth.completeOnboarding({ applicationIds }).subscribe({
      next: () => {
        this.router.navigateByUrl(this.auth.getPostLoginRedirectUrl());
      },
    });
  }
}
