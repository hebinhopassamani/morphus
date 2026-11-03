import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'mpx-not-found',
  standalone: true,
  imports: [MatButton, MatIcon, RouterLink],
  template: `
    <div class="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[#0D061A] p-6 text-center text-white">
      <img
        src="/brand/bg-dark-watermark.jpg"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div class="relative z-10 flex max-w-4xl flex-col items-center gap-y-6">
        <img
          src="/brand/404-not-found.jpg"
          alt="404 Page Not Found - Morphus"
          class="w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl"
        />
        <div class="flex flex-wrap items-center justify-center gap-4">
          <a
            matButton
            class="primary large font-semibold tracking-wider uppercase"
            routerLink="/"
          >
            <mat-icon svgIcon="arrow-left" />
            Voltar ao Início
          </a>
          <a
            matButton
            class="tertiary large border border-white/20 bg-white/10 font-semibold tracking-wider uppercase text-white! hover:bg-white/20"
            routerLink="/admin"
          >
            Ir para o Painel
          </a>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
