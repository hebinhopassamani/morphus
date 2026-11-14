import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MPX_ICON_COLORS, MPX_ICONS } from './mpx-icons.data';
import { MPX_COMPILED_ICONS } from './morphus-compiled-icons';

export const provideMpxIcons = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideAppInitializer(() => {
      const domSanitizer = inject(DomSanitizer);
      const matIconRegistry = inject(MatIconRegistry);

      // 1. Registra os ícones base (Lucide)
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

      // 2. Registra os ícones compilados (Recraft AI / Multi-camadas / Customizados)
      Object.entries(MPX_COMPILED_ICONS).forEach(([name, def]) => {
        matIconRegistry.addSvgIconLiteral(
          name,
          domSanitizer.bypassSecurityTrustHtml(def.svg),
        );

        for (const color of MPX_ICON_COLORS) {
          const coloredSvg = def.svg.replace(
            '<svg',
            `<svg style="--app-accent: ${color.value}; color: ${color.value}"`,
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
