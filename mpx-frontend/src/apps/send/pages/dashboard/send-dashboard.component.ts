import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mpx-send-dashboard',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col flex-auto min-w-0 p-6 md:p-10">
      <div class="flex items-center gap-4 mb-6">
        <div class="flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400">
          <mat-icon svgIcon="lucide:send" class="icon-size-6"></mat-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Morphus Send</h1>
          <p class="text-sm text-secondary">send.morphus.me — Motor Transacional de Disparo de E-mails, Domínios e Templates</p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <p class="text-base text-slate-300">
          Bem-vindo ao <strong>Morphus Send</strong>. Gerencie seus domínios verificados (SPF/DKIM), templates HTML e chaves de envio.
        </p>
      </div>
    </div>
  `,
})
export class SendDashboardComponent {}
