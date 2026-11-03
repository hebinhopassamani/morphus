import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MPX_ICON_COLORS, MPX_ICONS } from './mpx-icons.data';

export const provideMpxIcons = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideAppInitializer(() => {
      const domSanitizer = inject(DomSanitizer);
      const matIconRegistry = inject(MatIconRegistry);

      Object.entries(MPX_ICONS).forEach(([name, svg]) => {
        matIconRegistry.addSvgIconLiteral(
          name,
          domSanitizer.bypassSecurityTrustHtml(svg),
        );

        for (const color of MPX_ICON_COLORS) {
          const coloredSvg = svg
            .replace('stroke="currentColor"', `stroke="${color.value}"`)
            .replace(
              '<svg',
              `<svg style="color: ${color.value} !important; stroke: ${color.value} !important"`,
            );
          matIconRegistry.addSvgIconLiteral(
            `${name}${color.value}`,
            domSanitizer.bypassSecurityTrustHtml(coloredSvg),
          );
        }
      });
    }),
  ]);

export { provideMpxIcons as provideIcons };
