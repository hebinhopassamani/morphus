import { Component, HostBinding, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MpxCustomIconName } from '@core/morphus';
import { MPX_COMPILED_ICONS, MpxCompiledIconDefinition } from './compiled-icons';
import { MPX_ICONS } from './icons.data';

@Component({
  selector: 'mpx-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
  standalone: true,
})
export class MpxIconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  public readonly icon = input<MpxCustomIconName>();
  public readonly name = input<MpxCustomIconName>();
  public readonly fIcon = input<MpxCustomIconName>();
  public readonly gIcon = input<MpxCustomIconName>();
  public readonly accentColor = input<string | null>(null);

  @HostBinding('style.--app-accent')
  protected get hostAccentColor(): string | null {
    return this.accentColor() || null;
  }

  protected getCompiledIcon(): { def: MpxCompiledIconDefinition; safeContent: SafeHtml } | null {
    const key = this.icon() ?? this.name() ?? this.fIcon() ?? this.gIcon();
    if (!key) return null;
    const def = MPX_COMPILED_ICONS[key];
    if (!def) return null;
    return {
      def,
      safeContent: this.sanitizer.bypassSecurityTrustHtml(def.content),
    };
  }

  protected getSafeIconHtml(): SafeHtml {
    const key = (this.icon() ?? this.name() ?? this.fIcon() ?? this.gIcon() ?? 'default-icon') as keyof typeof MPX_ICONS;
    const iconSvg = MPX_ICONS[key] ?? MPX_ICONS['default-icon'];
    return this.sanitizer.bypassSecurityTrustHtml(iconSvg);
  }
}
