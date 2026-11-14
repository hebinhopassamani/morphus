import { Component, HostBinding, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CustomIconName } from '@core/mpx-types';
import { MPX_ICONS } from './mpx-icons.data';
import { MPX_COMPILED_ICONS, MpxCompiledIconDefinition } from './morphus-compiled-icons';

@Component({
  selector: 'mpx-icon',
  templateUrl: './mpx-icon.component.html',
  styleUrl: './mpx-icon.component.css',
  standalone: true,
})
export class MorphusIconsComponent {
  private readonly sanitizer = inject(DomSanitizer);

  public readonly icon = input<CustomIconName>();
  public readonly name = input<CustomIconName>();
  public readonly fIcon = input<CustomIconName>();
  public readonly gIcon = input<CustomIconName>();
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
