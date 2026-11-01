import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'web-terms',
  imports: [RouterLink],
  host: {
    class:
      'mx-auto flex w-full max-w-4xl flex-auto flex-col gap-y-4 py-8 text-neutral-12 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:ps-6 [&_li]:mt-1.5 [&_p]:text-neutral-a11 [&_li]:text-neutral-a11',
  },
  templateUrl: './terms.component.html',
})
export class TermsComponent {}
