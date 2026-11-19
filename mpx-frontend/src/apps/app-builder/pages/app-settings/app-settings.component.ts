import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MpxSecurity } from '@core/morphus';
import { MpxMessageService } from '@core/morphus';
import {
  ApplicationDomainPreviewResponse,
  MpxApplication,
  MpxApplicationSettingRef,
  MpxCorporationDomainRef,
} from '@morphus/entities/application';
import { ApplicationService } from '@morphus/services/application.service';
import { MpxContextService } from '@morphus/services/morphus-context.service';

@Component({
  selector: 'mpx-app-settings-page',
  standalone: true,
  imports: [FormsModule, MatButton, MatIconButton, MatIcon, MatTabGroup, MatTab],
  host: {
    class: 'flex flex-auto flex-col p-6 lg:p-8',
  },
  templateUrl: './app-settings.component.html',
})
export class AppSettingsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(MpxSecurity);
  private readonly messageService = inject(MpxMessageService);
  private readonly applicationService = inject(ApplicationService);
  protected readonly context = inject(MpxContextService);

  private readonly parentParamMap = toSignal(this.route.parent?.paramMap ?? this.route.paramMap);

  protected readonly activeTab = signal<'general' | 'env'>('general');
  protected readonly isLoading = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly fetchedApp = signal<MpxApplication | null>(null);

  protected readonly appNameDraft = signal<string>('');
  protected readonly domainModeDraft = signal<
    'MorphusShared' | 'CustomerOwned' | 'PurchasedWithMorphus'
  >('MorphusShared');
  protected readonly subdomainDraft = signal<string>('');
  protected readonly customMorphusPrefixOpen = signal<boolean>(false);
  protected readonly customMorphusPrefixDraft = signal<string>('');
  protected readonly selectedCorpDomainId = signal<string>('');

  protected readonly newOwnDomainInput = signal<string>('');
  protected readonly newPurchaseDomainInput = signal<string>('');
  protected readonly isSavingCorpDomain = signal<boolean>(false);

  protected readonly corporationDomains = signal<MpxCorporationDomainRef[]>([]);
  protected readonly domainPreview = signal<ApplicationDomainPreviewResponse | null>(null);
  protected readonly isCheckingDomain = signal<boolean>(false);

  // Variáveis / Settings da Aplicação
  protected readonly customSettings = signal<MpxApplicationSettingRef[]>([]);
  protected readonly newSettingLabel = signal<string>('');
  protected readonly newSettingKey = signal<string>('');
  protected readonly newSettingType = signal<
    'boolean' | 'currency' | 'string' | 'number' | 'endpoint'
  >('boolean');
  protected readonly newSettingValue = signal<string>('true');
  protected readonly newSettingEndpointUrl = signal<string>('');
  protected readonly newSettingRefreshPolicy = signal<'manual' | 'realtime' | 'daily'>('manual');
  protected readonly isSavingSetting = signal<boolean>(false);
  protected readonly highlightedSettingKey = signal<string>('');

  protected readonly appKey = computed<string>(() => {
    return (
      this.parentParamMap()?.get('appKey') ||
      this.route.parent?.snapshot.paramMap.get('appKey') ||
      this.route.snapshot.paramMap.get('appKey') ||
      ''
    );
  });

  protected readonly activeApp = computed<MpxApplication | null>(() => {
    const fetched = this.fetchedApp();
    if (fetched) {
      return fetched;
    }
    return this.context.activeRuntimeApplication();
  });

  protected readonly isNativeMorphusApp = computed<boolean>(() =>
    this.context.isNativeMorphusApp(this.activeApp()),
  );

  protected readonly nativeMorphusDomain = computed<string>(() => {
    const app = this.activeApp();
    const firstWord = ((app?.name || 'kalupa').trim().split(/\s+/)[0] || 'kalupa')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    return `${firstWord || 'kalupa'}.morphus.me`;
  });

  protected readonly appPrefixLower = computed<string>(() => {
    const p = (this.activeApp()?.prefix || 'app').trim().toLowerCase();
    return p || 'app';
  });

  protected readonly appNamespaceLower = computed<string>(() => {
    const app = this.activeApp();
    const firstWord = ((app?.name || app?.prefix || 'app').trim().split(/\s+/)[0] || 'app')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '');
    return firstWord || 'app';
  });

  protected formatEnvReference(rawKey?: string | null): string {
    const ns = this.appNamespaceLower();
    const clean = (rawKey || 'variavel')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.+|\.+$/g, '');
    if (clean.startsWith(`${ns}.`)) {
      return clean;
    }
    return `${ns}.${clean || 'variavel'}`;
  }

  protected readonly selectedCorporationDomain = computed<MpxCorporationDomainRef | null>(() => {
    const id = this.selectedCorpDomainId();
    return this.corporationDomains().find((d) => d.id === id) ?? null;
  });

  protected readonly systemLockedSettings = computed<MpxApplicationSettingRef[]>(() => {
    const app = this.activeApp();
    const corpId = app?.corporationId || this.auth.corporation()?.id || '';
    const fullDomain = this.isNativeMorphusApp()
      ? this.nativeMorphusDomain()
      : app?.fullDomain || `${this.subdomainDraft() || 'app'}.${this.appPrefixLower()}.morphus.me`;
    return [
      {
        settingKey: 'APP_NAME',
        label: 'Nome da aplicação',
        valueType: 'string',
        value: app?.name || '—',
        refreshPolicy: 'manual',
        isLockedSystem: true,
      },
      {
        settingKey: 'APP_ID',
        label: 'ID da aplicação',
        valueType: 'string',
        value: app?.id || '—',
        refreshPolicy: 'manual',
        isLockedSystem: true,
      },
      {
        settingKey: 'APP_KEY',
        label: 'Chave da aplicação',
        valueType: 'string',
        value: app?.key || '—',
        refreshPolicy: 'manual',
        isLockedSystem: true,
      },
      {
        settingKey: 'APP_PREFIX',
        label: 'Sigla da aplicação',
        valueType: 'string',
        value: (app?.prefix || '—').toUpperCase(),
        refreshPolicy: 'manual',
        isLockedSystem: true,
      },
      {
        settingKey: 'APP_DOMAIN',
        label: 'Domínio de acesso',
        valueType: 'string',
        value: fullDomain,
        refreshPolicy: 'realtime',
        isLockedSystem: true,
      },
      {
        settingKey: 'CORPORATION_ID',
        label: 'ID da corporação',
        valueType: 'string',
        value: corpId || '—',
        refreshPolicy: 'manual',
        isLockedSystem: true,
      },
    ];
  });

  constructor() {
    effect(() => {
      const key = this.appKey().trim();
      if (!key) {
        return;
      }
      untracked(() => {
        void this.loadAllData(key);
      });
    });
  }

  protected async loadAllData(key: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const [app, domains] = await Promise.all([
        firstValueFrom(this.applicationService.getByKey(key)),
        firstValueFrom(this.applicationService.getCorporationDomains()),
      ]);
      this.fetchedApp.set(app ?? null);
      this.corporationDomains.set(domains ?? []);

      if (app) {
        this.appNameDraft.set(app.name || '');
        const mode = (app.domainMode || 'MorphusShared') as
          | 'MorphusShared'
          | 'CustomerOwned'
          | 'PurchasedWithMorphus';
        this.domainModeDraft.set(mode);
        this.subdomainDraft.set(app.subdomain || '');
        this.customMorphusPrefixDraft.set(app.subdomain || '');
        if (app.corporationDomainId) {
          this.selectedCorpDomainId.set(app.corporationDomainId);
        } else if (domains && domains.length > 0) {
          this.selectedCorpDomainId.set(domains[0].id || '');
        }

        if (app.id) {
          const settings = await firstValueFrom(
            this.applicationService.getApplicationSettings(app.id),
          );
          this.customSettings.set(settings ?? []);
        }
        await this.refreshDomainPreview();
      }
    } catch {
      // Fallback silencioso
    } finally {
      this.isLoading.set(false);
    }
  }

  protected openAppEditor(): void {
    const app = this.activeApp();
    if (app?.id) {
      void this.router.navigate(['/morphus/application', app.id], {
        queryParams: { tab: 'editor' },
      });
      return;
    }
    void this.router.navigateByUrl('/morphus/application');
  }

  protected onAppNameChange(name: string): void {
    this.appNameDraft.set(name);
    void this.refreshDomainPreview();
  }

  protected selectDomainMode(
    mode: 'MorphusShared' | 'CustomerOwned' | 'PurchasedWithMorphus',
  ): void {
    this.domainModeDraft.set(mode);
    if (mode !== 'MorphusShared' && !this.selectedCorpDomainId() && this.corporationDomains().length > 0) {
      this.selectedCorpDomainId.set(this.corporationDomains()[0].id || '');
    }
    void this.refreshDomainPreview();
  }

  protected async refreshDomainPreview(): Promise<void> {
    const app = this.activeApp();
    if (!app) {
      return;
    }
    this.isCheckingDomain.set(true);
    try {
      const customSub = this.customMorphusPrefixOpen()
        ? this.customMorphusPrefixDraft().trim()
        : this.subdomainDraft().trim();
      const preview = await firstValueFrom(
        this.applicationService.previewDomain({
          name: this.appNameDraft().trim() || app.name,
          prefix: app.prefix || 'APP',
          domainMode: this.domainModeDraft(),
          customSubdomain: customSub || undefined,
          corporationDomainId:
            this.domainModeDraft() === 'MorphusShared'
              ? null
              : this.selectedCorpDomainId() || null,
          excludeApplicationId: app.id || null,
        }),
      );
      this.domainPreview.set(preview);
      if (!this.subdomainDraft() && preview.suggestedAvailableSubdomain) {
        this.subdomainDraft.set(preview.suggestedAvailableSubdomain);
      }
    } catch {
      // ignore preview errors
    } finally {
      this.isCheckingDomain.set(false);
    }
  }

  protected applySuggestedSubdomain(subdomain: string): void {
    this.subdomainDraft.set(subdomain);
    this.customMorphusPrefixDraft.set(subdomain);
    this.customMorphusPrefixOpen.set(false);
    void this.refreshDomainPreview();
  }

  protected toggleCustomMorphusPrefix(): void {
    const next = !this.customMorphusPrefixOpen();
    this.customMorphusPrefixOpen.set(next);
    if (next && !this.customMorphusPrefixDraft()) {
      this.customMorphusPrefixDraft.set(
        this.subdomainDraft() ||
          this.domainPreview()?.suggestedAvailableSubdomain ||
          this.domainPreview()?.firstAttemptSubdomain ||
          '',
      );
    }
  }

  protected onCustomMorphusPrefixInput(val: string): void {
    const clean = (val || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    this.customMorphusPrefixDraft.set(clean);
    this.subdomainDraft.set(clean);
    void this.refreshDomainPreview();
  }

  protected async registerOwnDomain(): Promise<void> {
    const raw = this.newOwnDomainInput().trim().toLowerCase();
    if (!raw) {
      return;
    }
    this.isSavingCorpDomain.set(true);
    try {
      const saved = await firstValueFrom(
        this.applicationService.saveCorporationDomain({
          domainName: raw,
          originType: 'CustomerOwned',
          verificationStatus: 'PendingVerification',
        }),
      );
      const list = await firstValueFrom(this.applicationService.getCorporationDomains());
      this.corporationDomains.set(list ?? []);
      if (saved?.id) {
        this.selectedCorpDomainId.set(saved.id);
      }
      this.newOwnDomainInput.set('');
      this.messageService.showSuccess(
        `Domínio "${saved.domainName}" cadastrado em verificação!`,
      );
      await this.refreshDomainPreview();
    } catch (err: any) {
      this.messageService.showError(
        err?.error?.message || 'Não foi possível cadastrar o domínio.',
      );
    } finally {
      this.isSavingCorpDomain.set(false);
    }
  }

  protected async purchaseDomainWithMorphus(): Promise<void> {
    const raw = this.newPurchaseDomainInput().trim().toLowerCase();
    if (!raw) {
      return;
    }
    this.isSavingCorpDomain.set(true);
    try {
      const saved = await firstValueFrom(
        this.applicationService.saveCorporationDomain({
          domainName: raw,
          originType: 'PurchasedWithMorphus',
          verificationStatus: 'Verified',
        }),
      );
      const list = await firstValueFrom(this.applicationService.getCorporationDomains());
      this.corporationDomains.set(list ?? []);
      if (saved?.id) {
        this.selectedCorpDomainId.set(saved.id);
      }
      this.newPurchaseDomainInput.set('');
      this.messageService.showSuccess(
        `Domínio "${saved.domainName}" registrado e verificado na sua corporação!`,
      );
      await this.refreshDomainPreview();
    } catch (err: any) {
      this.messageService.showError(
        err?.error?.message || 'Não foi possível registrar o domínio.',
      );
    } finally {
      this.isSavingCorpDomain.set(false);
    }
  }

  protected async saveGeneralSettings(): Promise<void> {
    const app = this.activeApp();
    if (!app?.id) {
      return;
    }
    const name = this.appNameDraft().trim();
    if (name.length < 2) {
      this.messageService.showWarn('Informe um nome válido para a aplicação.');
      return;
    }

    const mode = this.domainModeDraft();
    const chosenSub = this.customMorphusPrefixOpen()
      ? this.customMorphusPrefixDraft().trim()
      : this.subdomainDraft().trim() ||
        this.domainPreview()?.suggestedAvailableSubdomain ||
        this.domainPreview()?.firstAttemptSubdomain ||
        '';

    this.isSaving.set(true);
    try {
      const updated = await firstValueFrom(
        this.applicationService.updateBasicSettings(app.id, {
          name,
          domainMode: mode,
          subdomain: chosenSub,
          corporationDomainId: mode === 'MorphusShared' ? null : this.selectedCorpDomainId() || null,
        }),
      );
      this.fetchedApp.set(updated);
      this.subdomainDraft.set(updated.subdomain || chosenSub);
      this.context.loadWorkspaces();
      this.context.loadCatalogApplications();
      await this.refreshDomainPreview();
      this.messageService.showSuccess(
        `Opções da aplicação salvas! Domínio ativo: ${updated.fullDomain}`,
      );
    } catch (err: any) {
      this.messageService.showError(
        err?.error?.message || 'Não foi possível salvar as opções da aplicação.',
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  protected onNewSettingLabelChange(label: string): void {
    this.newSettingLabel.set(label);
    const autoKey = (label || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9._]+/g, '.')
      .replace(/\.+/g, '.')
      .replace(/^\.+|\.+$/g, '');
    this.newSettingKey.set(autoKey);
  }

  protected onNewSettingTypeChange(
    t: 'boolean' | 'currency' | 'string' | 'number' | 'endpoint',
  ): void {
    this.newSettingType.set(t);
    if (t === 'boolean') {
      this.newSettingValue.set('true');
    } else if (t === 'currency') {
      this.newSettingValue.set('USD');
    } else {
      this.newSettingValue.set('');
    }
  }

  protected async addCustomSetting(): Promise<void> {
    const app = this.activeApp();
    if (!app?.id) {
      return;
    }
    const label = this.newSettingLabel().trim();
    const settingKey = this.newSettingKey().trim();
    if (!label || !settingKey) {
      this.messageService.showWarn('Informe o nome da opção/variável.');
      return;
    }

    this.isSavingSetting.set(true);
    try {
      const saved = await firstValueFrom(
        this.applicationService.saveApplicationSetting(app.id, {
          label,
          settingKey,
          valueType: this.newSettingType(),
          value: this.newSettingValue(),
          endpointUrl:
            this.newSettingType() === 'endpoint' ? this.newSettingEndpointUrl().trim() : null,
          refreshPolicy: this.newSettingRefreshPolicy(),
          isLockedSystem: false,
        }),
      );
      const others = this.customSettings().filter(
        (item) => item.id !== saved.id && item.settingKey !== saved.settingKey,
      );
      this.customSettings.set([saved, ...others]);
      this.highlightedSettingKey.set(saved.settingKey);
      setTimeout(() => {
        if (this.highlightedSettingKey() === saved.settingKey) {
          this.highlightedSettingKey.set('');
        }
      }, 2200);

      this.newSettingLabel.set('');
      this.newSettingKey.set('');
      this.newSettingValue.set('');
      this.newSettingEndpointUrl.set('');
    } catch (err: any) {
      this.messageService.showError(
        err?.error?.message || 'Não foi possível salvar a opção.',
      );
    } finally {
      this.isSavingSetting.set(false);
    }
  }

  protected async removeCustomSetting(setting: MpxApplicationSettingRef): Promise<void> {
    const app = this.activeApp();
    if (!app?.id || !setting.id) {
      return;
    }
    await firstValueFrom(this.applicationService.deleteApplicationSetting(setting.id));
    const reloaded = await firstValueFrom(
      this.applicationService.getApplicationSettings(app.id),
    );
    this.customSettings.set(reloaded ?? []);
  }
}
