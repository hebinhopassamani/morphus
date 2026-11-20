import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mpx-kalupa-dashboard',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col flex-auto min-w-0 p-6 md:p-10">
      <div class="flex items-center gap-4 mb-6">
        <div class="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400">
          <mat-icon svgIcon="sparkles" class="size-6"></mat-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Kalupa</h1>
          <p class="text-sm text-secondary">kalupa.morphus.one — Motor Inteligente de Estruturação de Conhecimento &amp; Sync</p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <p class="text-base text-slate-300">
          Bem-vindo ao <strong>Kalupa</strong>. Configure seus modelos, propriedades, tags transversais e sincronização local.
        </p>
      </div>
    </div>
  `,
})
export class KalupaDashboardComponent {}
