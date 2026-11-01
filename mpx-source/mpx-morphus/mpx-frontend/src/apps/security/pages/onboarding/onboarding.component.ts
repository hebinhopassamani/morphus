import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { Auth } from '@core/auth';
import { OnboardingApplicationItem } from '@security/entities/Session';

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
export class OnboardingComponent implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly isLoadingState = signal(true);
  protected readonly currentStep = signal<1 | 2 | 3>(1);

  protected readonly corporationId = signal<string | null>(null);
  protected readonly workspaceId = signal<string | null>(null);
  protected readonly availableApplications = signal<OnboardingApplicationItem[]>([]);
  protected readonly selectedApplicationIds = signal<string[]>([]);

  protected readonly optionalApplications = computed(() =>
    this.availableApplications().filter((a) => !a.system),
  );

  protected readonly coreApplications = computed(() =>
    this.availableApplications().filter((a) => a.system),
  );

  protected readonly workspaceSuggestions = [
    'Matriz',
    'Comercial',
    'Operações',
    'Administrativo',
    'Morphus Workspace',
  ];

  protected readonly step1Form = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.minLength(2)]],
    corporationName: ['', [Validators.required, Validators.minLength(2)]],
  });

  protected readonly step2Form = this.fb.nonNullable.group({
    workspaceName: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit(): void {
    this.auth.clearError();

    const currentUser = this.auth.user();
    if (currentUser?.name) {
      this.step1Form.patchValue({ userName: currentUser.name });
    }

    this.loadSavedState();
  }

  private loadSavedState(): void {
    this.isLoadingState.set(true);

    this.auth.getOnboardingState().subscribe({
      next: (state) => {
        if (state.onboardingCompleted) {
          this.router.navigateByUrl('/admin');
          return;
        }

        if (state.userName) {
          this.step1Form.patchValue({ userName: state.userName });
        }

        if (state.corporationId && state.corporationName) {
          this.corporationId.set(state.corporationId);
          this.step1Form.patchValue({ corporationName: state.corporationName });
        }

        if (state.workspaceId && state.workspaceName) {
          this.workspaceId.set(state.workspaceId);
          this.step2Form.patchValue({ workspaceName: state.workspaceName });
        }

        this.availableApplications.set(state.availableApplications ?? []);
        this.selectedApplicationIds.set(state.selectedApplicationIds ?? []);

        // Retoma exatamente da etapa em que o usuário parou antes de fechar o navegador
        if (!state.corporationId) {
          this.currentStep.set(1);
        } else if (!state.workspaceId) {
          this.currentStep.set(2);
        } else {
          this.currentStep.set(3);
        }

        this.isLoadingState.set(false);
      },
      error: () => {
        this.isLoadingState.set(false);
      },
    });
  }

  protected onSaveStep1(): void {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }

    const { userName, corporationName } = this.step1Form.getRawValue();

    this.auth
      .saveOnboardingCorporationStep({
        userName: userName.trim(),
        corporationName: corporationName.trim(),
      })
      .subscribe({
        next: (session) => {
          if (session.corporation?.id) {
            this.corporationId.set(session.corporation.id);
          }

          if (!this.step2Form.controls.workspaceName.value) {
            this.step2Form.patchValue({ workspaceName: 'Matriz' });
          }

          this.currentStep.set(2);
        },
      });
  }

  protected applyWorkspaceSuggestion(suggestion: string): void {
    this.step2Form.patchValue({ workspaceName: suggestion });
  }

  protected onSaveStep2(): void {
    if (this.step2Form.invalid) {
      this.step2Form.markAllAsTouched();
      return;
    }

    const { workspaceName } = this.step2Form.getRawValue();

    this.auth
      .saveOnboardingWorkspaceStep({
        workspaceName: workspaceName.trim(),
      })
      .subscribe({
        next: (state) => {
          this.workspaceId.set(state.workspaceId ?? null);
          this.availableApplications.set(state.availableApplications ?? []);
          this.selectedApplicationIds.set(state.selectedApplicationIds ?? []);
          this.currentStep.set(3);
        },
      });
  }

  protected goToStep(step: 1 | 2 | 3): void {
    if (step === 2 && !this.corporationId()) {
      return;
    }
    if (step === 3 && !this.workspaceId()) {
      return;
    }
    this.auth.clearError();
    this.currentStep.set(step);
  }

  protected isAppSelected(appId: string): boolean {
    return this.selectedApplicationIds().includes(appId);
  }

  protected toggleApp(app: OnboardingApplicationItem): void {
    if (app.system) {
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
        this.router.navigateByUrl('/admin');
      },
    });
  }
}
