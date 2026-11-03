import { Component, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CustomIconName } from '@core/mpx-types';
import { MPX_ICONS } from './mpx-icons.data';

@Component({
  selector: 'mpx-icon',
  templateUrl: './mpx-icon.component.html',
  styleUrl: './mpx-icon.component.css',
  standalone: true,
})
export class MorphusIconsComponent {
  private readonly sanitizer = inject(DomSanitizer);
  public readonly icon = input<CustomIconName>();
  public readonly fIcon = input<CustomIconName>();
  public readonly gIcon = input<CustomIconName>();

  protected getSafeIconHtml(): SafeHtml {
    const key = this.icon() ?? this.fIcon() ?? this.gIcon() ?? 'default-icon';
    const iconSvg = MPX_ICONS[key];
    return this.sanitizer.bypassSecurityTrustHtml(iconSvg);
  }
}
