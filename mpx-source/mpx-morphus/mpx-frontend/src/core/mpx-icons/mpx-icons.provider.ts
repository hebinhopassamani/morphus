import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { lucideIcons } from './mpx.lucide';

export const provideMpxIcons = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideAppInitializer(() => {
      const domSanitizer = inject(DomSanitizer);
      const matIconRegistry = inject(MatIconRegistry);

      // Lucide icons
      matIconRegistry.addSvgIconSetLiteral(
        domSanitizer.bypassSecurityTrustHtml(lucideIcons),
        { viewBox: '0 0 24 24' }
      );
    }),
  ]);

export { provideMpxIcons as provideIcons };
