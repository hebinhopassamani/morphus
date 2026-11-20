import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'web-privacy',
  imports: [RouterLink],
  host: { class: 'flex flex-col gap-y-4 py-6 text-neutral-12 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ms-6 [&_li]:list-disc' },
  templateUrl: './privacy.component.html',
})
export class PrivacyComponent {}
