import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mpx-flow-dashboard',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col flex-auto min-w-0 p-6 md:p-10">
      <div class="flex items-center gap-4 mb-6">
        <div class="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400">
          <mat-icon svgIcon="workflow" class="size-6"></mat-icon>
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Morphus Flow</h1>
          <p class="text-sm text-secondary">flow.morphus.one — Estúdio Visual de Workflows, Estações, SLAs e Comitês</p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <p class="text-base text-slate-300">
          Bem-vindo ao <strong>Morphus Flow</strong>. Aqui você desenha e monitora todos os fluxos de trabalho da corporação.
        </p>
      </div>
    </div>
  `,
})
export class FlowDashboardComponent {}
