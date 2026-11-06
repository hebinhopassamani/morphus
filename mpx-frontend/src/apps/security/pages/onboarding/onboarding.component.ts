import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { Auth } from '@core/mpx-auth';
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
  protected readonly auth = inject(Auth);
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

  // ETAPA 1: Sua Matriz (apenas o nome da matriz)
  protected readonly step1Form = this.fb.nonNullable.group({
    corporationName: ['', [Validators.required, Validators.minLength(2)]],
  });

  // ETAPA 2: Seus Dados (Nome completo e Como gostaria de ser chamado)
  protected readonly step2Form = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.minLength(2)]],
    userNickName: [''],
  });

  // ETAPA 3: Workspace (Seu primeiro workspace)
  protected readonly step3Form = this.fb.nonNullable.group({
    workspaceName: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.auth.clearError();

    const currentUser = this.auth.user();
    if (currentUser?.name) {
      this.step2Form.patchValue({ userName: currentUser.name });
    }
    if (currentUser?.nickName) {
      this.step2Form.patchValue({ userNickName: currentUser.nickName });
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

        if (state.userName) {
          this.step2Form.patchValue({ userName: state.userName });
        }
        if (state.userNickName) {
          this.step2Form.patchValue({ userNickName: state.userNickName });
        }

        if (state.corporationId && state.corporationName) {
          this.corporationId.set(state.corporationId);
          this.step1Form.patchValue({ corporationName: state.corporationName });
        }

        if (state.workspaceId && state.workspaceName) {
          this.workspaceId.set(state.workspaceId);
          this.step3Form.patchValue({ workspaceName: state.workspaceName });
        }

        this.availableApplications.set(state.availableApplications ?? []);
        this.selectedApplicationIds.set(state.selectedApplicationIds ?? []);

        // Retoma exatamente da etapa em que o usuário parou antes de fechar o navegador
        if (!state.corporationId) {
          this.currentStep.set(1);
        } else if (!state.userName) {
          this.currentStep.set(2);
        } else if (!state.workspaceId) {
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

  protected onSaveStep1(): void {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }

    const { corporationName } = this.step1Form.getRawValue();
    const { userName, userNickName } = this.step2Form.getRawValue();

    this.auth
      .saveOnboardingCorporationStep({
        corporationName: corporationName.trim(),
        userName: userName.trim() || undefined,
        userNickName: userNickName.trim() || undefined,
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
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }

    const { corporationName } = this.step1Form.getRawValue();
    const { userName, userNickName } = this.step2Form.getRawValue();

    this.auth
      .saveOnboardingCorporationStep({
        corporationName: corporationName.trim(),
        userName: userName.trim(),
        userNickName: userNickName.trim() || undefined,
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
          this.currentStep.set(4);
        },
      });
  }

  protected goToStep(step: 1 | 2 | 3): void {
    if (!this.emailConfirmed()) {
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
