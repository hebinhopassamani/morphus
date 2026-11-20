import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MpxSecurity } from '@core/morphus';
import { MpxContextService } from '@morphus/services/morphus-context.service';
import { environment } from '@src/environments/environment';

export interface StudioTriggerType {
  id: string;
  code: number;
  name: string;
  label: string;
  requiresRoute: boolean;
  requiresSchedule: boolean;
  icon?: string;
  color?: string;
  description?: string;
}

export interface StudioStationType {
  id: string;
  code: number;
  name: string;
  label: string;
  isInputPort: boolean;
  isOutputPort: boolean;
  isIsolatedErrorCatcher: boolean;
  hasLayout: boolean;
  icon?: string;
  color?: string;
  order: number;
  description?: string;
}

export interface StudioRoute {
  id: string;
  name: string;
  label: string;
  path: string;
  isPublic: boolean;
  icon?: string;
  color?: string;
  description?: string;
}

export interface StudioErrorSeverity {
  id: string;
  code: number;
  label: string;
  involvesEntireWorkspace: boolean;
  involvesEntireCorporation: boolean;
  color?: string;
}

export interface StudioErrorCode {
  id: string;
  code: string;
  name: string;
  friendlyMessage: string;
  sla: number;
  severityId: string;
  color?: string;
  severity?: StudioErrorSeverity;
}

export interface StudioMpxError {
  id: string;
  errorCodeId: string;
  errorStateId: string;
  workflowTypeId?: string;
  originConfigId?: string;
  message: string;
  userMessage: string;
  method: string;
  userSnapshot?: string;
  contextSnapshot?: string;
  createdAt?: string;
  errorCode?: StudioErrorCode;
  errorState?: { id: string; label: string; color?: string };
}

export interface StudioEntityDefinition {
  id: string;
  name: string;
  tableName: string;
  label: string;
  moduleName: string;
  icon?: string;
  properties: { id: string; name: string; label: string; dataType: string }[];
}

export interface StudioStation {
  id: string;
  code: string;
  name: string;
  stationTypeId?: string;
  hasLayout: boolean;
  icon?: string;
  color?: string;
  description?: string;
  stationType?: StudioStationType;
}

export interface StudioWorkflowContext {
  id: string;
  workflowTypeId: string;
  entityDefinitionId: string;
  alias: string;
  isRootEntity: boolean;
  isCollection: boolean;
  entityDefinition?: StudioEntityDefinition;
}

export interface StudioWorkflowAction {
  id: string;
  workflowTypeConfigId: string;
  nextWorkflowTypeConfigId?: string;
  name: string;
  label: string;
  controlType: string;
  executeWhen: string;
  isAutomatic: boolean;
  color?: string;
}

export interface StudioWorkflowCondition {
  id: string;
  workflowTypeConfigId: string;
  conditionType: string;
  propertyName: string;
  operator: string;
  value?: string;
  nextWorkflowTypeConfigId: string;
  elseNextWorkflowTypeConfigId?: string;
  description?: string;
}

export interface StudioWorkflowConfig {
  id: string;
  workflowTypeId: string;
  stationId: string;
  name: string;
  order: number;
  positionX: number;
  positionY: number;
  hasLayout: boolean;
  targetSubWorkflowTypeId?: string;
  returnInputConfigId?: string;
  targetRouteId?: string;
  slaMinutes?: number;
  isIsolatedErrorCatcher: boolean;
  icon?: string;
  color?: string;
  description?: string;
  station?: StudioStation;
  actions: StudioWorkflowAction[];
  conditions: StudioWorkflowCondition[];
}

export interface StudioWorkflowType {
  id: string;
  key: string;
  name: string;
  entityName?: string;
  rootEntityDefinitionId?: string;
  triggerTypeId?: string;
  triggerRouteId?: string;
  triggerType: string;
  triggerEvent?: string;
  icon?: string;
  color?: string;
  description?: string;
  triggerTypeDefinition?: StudioTriggerType;
  triggerRoute?: StudioRoute;
  contexts: StudioWorkflowContext[];
  configs: StudioWorkflowConfig[];
}

@Component({
  selector: 'mpx-flow-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardFooter,
    MatButton,
    MatIcon,
  ],
  host: {
    class:
      'mx-auto flex w-full max-w-[1720px] flex-auto flex-col gap-4 p-4 sm:gap-6 lg:p-6 text-neutral-12',
  },
  template: `
    <!-- Header -->
    <div
      class="flex flex-col justify-between gap-4 border-b border-neutral-a6 pb-4 sm:flex-row sm:items-center"
    >
      <div class="flex items-center gap-4">
        <div
          class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
        >
          <img
            src="/logos/morphus_flow_logo.png?v=5"
            alt="Morphus Workflow"
            class="size-full object-contain drop-shadow-sm"
          />
        </div>
        <div class="flex flex-col gap-y-0.5">
          <div class="flex flex-wrap items-center gap-2.5">
            <h1 class="text-xl font-bold tracking-tight">Morphus Workflow</h1>
            @if (auth.corporation(); as corp) {
              <span
                class="inline-flex items-center gap-1.5 rounded-full bg-primary-a3 px-3 py-0.5 text-xs font-semibold text-primary-a11"
              >
                <mat-icon class="size-3.5!" svgIcon="building-2" />
                {{ corp.name }}
              </span>
            }
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              <span class="size-1.5 rounded-full bg-emerald-500"></span>
              {{ workflowTypes().length }} Fluxos Ativos · {{ routes().length }} Rotas (MpxRoute)
            </span>
          </div>
          <p class="text-xs text-neutral-a11">
            Gatilho Único (Play Central), Estação Error Isolada (MpxError + MpxErrorCode), Contexto / Grupo de Dados (.Reflected) e 18 WkfStationType.
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        @if (activeView() === 'studio') {
          <button
            type="button"
            matButton
            class="secondary border border-neutral-a6"
            (click)="setView('dashboard')"
          >
            <mat-icon svgIcon="layout-grid" />
            Visão Geral
          </button>
        } @else {
          <button
            type="button"
            matButton
            class="primary filled"
            (click)="setView('studio')"
          >
            <mat-icon svgIcon="workflow" />
            Abrir Estúdio Visual (Canvas)
          </button>
        }
      </div>
    </div>

    @if (activeView() === 'studio') {
      <!-- STUDIO TOP BAR: Seletor de Fluxo, Novo Fluxo, Contexto (.Reflected) e Simulador de Erro -->
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-a5 bg-neutral-a2 p-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-neutral-a10">
            Tipo de Fluxo (WkfType):
          </span>
          @for (wf of workflowTypes(); track wf.id) {
            <button
              type="button"
              (click)="selectWorkflow(wf.id)"
              class="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all"
              [class.border-primary-a8]="selectedWorkflowId() === wf.id"
              [class.bg-primary-a3]="selectedWorkflowId() === wf.id"
              [class.text-primary-a11]="selectedWorkflowId() === wf.id"
              [class.border-neutral-a5]="selectedWorkflowId() !== wf.id"
              [class.bg-neutral-a1]="selectedWorkflowId() !== wf.id"
              [class.ring-2]="justCreatedWorkflowId() === wf.id"
              [class.ring-emerald-500]="justCreatedWorkflowId() === wf.id"
            >
              <span class="size-2 rounded-full" [style.background]="wf.color || '#3b82f6'"></span>
              {{ wf.name }}
              <span class="rounded bg-neutral-a3 px-1.5 py-0.5 text-[10px] font-normal text-neutral-a11">
                {{ wf.triggerType }}
              </span>
            </button>
          }

          <!-- Criar Novo Fluxo Inline (Sem popup na cara! Regra UX #4) -->
          <div class="flex items-center gap-1.5 pl-2">
            <input
              type="text"
              [(ngModel)]="newWorkflowName"
              (keyup.enter)="createNewWorkflow()"
              placeholder="Nome do novo fluxo..."
              class="h-8 rounded-lg border border-neutral-a6 bg-neutral-a1 px-2.5 text-xs text-neutral-12 focus:border-primary-a8 focus:outline-none"
            />
            <button
              type="button"
              (click)="createNewWorkflow()"
              class="inline-flex h-8 items-center gap-1 rounded-lg bg-primary-9 px-3 text-xs font-semibold text-white hover:bg-primary-10"
            >
              + Criar Fluxo
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="activeDrawer.set(activeDrawer() === 'context' ? null : 'context')"
            class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-a6 bg-neutral-a1 px-3 py-1.5 text-xs font-semibold hover:border-primary-a8"
          >
            <mat-icon class="size-4! text-primary-a11" svgIcon="database" />
            Contexto / Grupo de Dados
            <span class="rounded-full bg-primary-a3 px-2 py-0.5 text-[10px] font-bold text-primary-a11">
              {{ selectedWorkflow()?.contexts?.length || 0 }}
            </span>
          </button>

          <button
            type="button"
            (click)="activeDrawer.set(activeDrawer() === 'routes' ? null : 'routes')"
            class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-a6 bg-neutral-a1 px-3 py-1.5 text-xs font-semibold hover:border-primary-a8"
          >
            <mat-icon class="size-4! text-emerald-500" svgIcon="compass" />
            MpxRoutes ({{ routes().length }})
          </button>

          <button
            type="button"
            (click)="simulateErrorInFlow()"
            class="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20"
          >
            <mat-icon class="size-4!" svgIcon="shield-alert" />
            Simular Erro ➔ Caixinha Error
          </button>
        </div>
      </div>

      <!-- GAVETA DE CONTEXTO / GRUPO DE DADOS (WkfTypeContext via .Reflected) -->
      @if (activeDrawer() === 'context' && selectedWorkflow(); as wf) {
        <div class="rounded-xl border border-primary-a6 bg-neutral-a2 p-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-a5 pb-3">
            <div>
              <h3 class="text-sm font-bold">
                Contexto / Grupo de Dados do Fluxo "{{ wf.name }}" (WkfTypeContext)
              </h3>
              <p class="text-xs text-neutral-a11">
                Entidades do catálogo <code>.Reflected</code> que trafegam dentro deste fluxo e alimentam telas, condições e diretivas (Utils).
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <select
                [(ngModel)]="selectedEntityDefId"
                class="h-8 rounded-lg border border-neutral-a6 bg-neutral-a1 px-2.5 text-xs text-neutral-12"
              >
                <option value="">Selecione uma entidade (.Reflected)...</option>
                @for (ed of entityDefinitions(); track ed.id) {
                  <option [value]="ed.id">[{{ ed.moduleName }}] {{ ed.name }} ({{ ed.tableName }})</option>
                }
              </select>
              <input
                type="text"
                [(ngModel)]="newContextAlias"
                placeholder="Alias (ex.: CurrentUser)"
                class="h-8 w-44 rounded-lg border border-neutral-a6 bg-neutral-a1 px-2.5 text-xs text-neutral-12"
              />
              <label class="inline-flex items-center gap-1 text-xs">
                <input type="checkbox" [(ngModel)]="newContextIsCollection" />
                Coleção (Lista)
              </label>
              <button
                type="button"
                (click)="addEntityToContext()"
                class="h-8 rounded-lg bg-primary-9 px-3 text-xs font-semibold text-white"
              >
                + Adicionar ao Contexto
              </button>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            @for (ctx of wf.contexts; track ctx.id) {
              <div class="flex items-center justify-between rounded-lg border border-neutral-a5 bg-neutral-a1 p-2.5">
                <div class="flex flex-col">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-primary-a11">{{ ctx.alias }}</span>
                    @if (ctx.isRootEntity) {
                      <span class="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500">Raiz</span>
                    }
                    @if (ctx.isCollection) {
                      <span class="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">Lista[]</span>
                    }
                  </div>
                  <span class="text-[11px] text-neutral-a10">
                    Entidade: {{ ctx.entityDefinition?.name || 'SecUser' }} ({{ ctx.entityDefinition?.tableName || 'sec_users' }})
                  </span>
                </div>
                <button
                  type="button"
                  (click)="removeContextEntity(ctx.id)"
                  class="text-xs text-neutral-a10 hover:text-red-500"
                  title="Remover do contexto"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- GAVETA DE ROTAS CADASTRADAS (MpxRoute) -->
      @if (activeDrawer() === 'routes') {
        <div class="rounded-xl border border-emerald-500/40 bg-neutral-a2 p-4">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold">Catálogo Completo de Rotas do Sistema (MpxRoute — {{ routes().length }} rotas semeadas)</h3>
              <p class="text-xs text-neutral-a11">
                Usadas pelo gatilho <code>HtmlAction (OnScreenLoad)</code>, pela estação <code>Redirect</code> e pelos Menus.
              </p>
            </div>
            <button type="button" (click)="activeDrawer.set(null)" class="text-xs text-neutral-a10">Fechar ✕</button>
          </div>
          <div class="grid max-h-60 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            @for (rt of routes(); track rt.id) {
              <div class="flex items-center justify-between rounded-lg border border-neutral-a5 bg-neutral-a1 px-2.5 py-1.5 text-xs">
                <div class="flex flex-col truncate">
                  <span class="font-semibold text-neutral-12">{{ rt.label }}</span>
                  <code class="text-[11px] text-primary-a11">{{ rt.path }}</code>
                </div>
                <span
                  class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  [class.bg-emerald-500/15]="rt.isPublic"
                  [class.text-emerald-500]="rt.isPublic"
                  [class.bg-amber-500/15]="!rt.isPublic"
                  [class.text-amber-500]="!rt.isPublic"
                >
                  {{ rt.isPublic ? 'Pública' : 'Protegida' }}
                </span>
              </div>
            }
          </div>
        </div>
      }

      <!-- STUDIO BODY: PALETA DE 18 ESTAÇÕES (ESQUERDA) + CANVAS VISUAL (CENTRO) + INSPETOR (DIREITA) -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <!-- PALETA LATERAL: OS 18 TIPOS DE ESTAÇÃO SIMPLIFICADOS (WkfStationType - Wkf333) -->
        <div class="flex flex-col gap-2 rounded-xl border border-neutral-a5 bg-neutral-a2 p-3 lg:col-span-2">
          <div class="border-b border-neutral-a5 pb-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-12">
              18 Tipos de Estação
            </h3>
            <p class="text-[11px] text-neutral-a10">
              Clique em um tipo para adicionar ao Canvas no fluxo atual:
            </p>
          </div>

          <div class="flex max-h-[640px] flex-col gap-1.5 overflow-y-auto pr-1">
            @for (st of stations(); track st.id) {
              @if (st.code !== 'Error') {
                <button
                  type="button"
                  (click)="addStationToCanvas(st)"
                  class="flex items-center gap-2.5 rounded-lg border border-neutral-a5 bg-neutral-a1 p-2 text-left transition-all hover:border-primary-a8 hover:bg-primary-a2"
                  [title]="st.description || st.name"
                >
                  <span
                    class="flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                    [style.background]="st.color || '#3b82f6'"
                  >
                    {{ st.code.slice(0, 2).toUpperCase() }}
                  </span>
                  <div class="flex flex-col overflow-hidden">
                    <span class="truncate text-xs font-semibold text-neutral-12">
                      {{ st.code }}
                    </span>
                    <span class="truncate text-[10px] text-neutral-a10">
                      {{ st.name }}
                    </span>
                  </div>
                </button>
              }
            }
          </div>
        </div>

        <!-- CANVAS VISUAL INTERATIVO -->
        <div
          class="relative min-h-[680px] overflow-auto rounded-xl border border-neutral-a6 bg-neutral-a1 lg:col-span-7"
          style="background-image: radial-gradient(rgba(148, 163, 184, 0.22) 1px, transparent 1px); background-size: 22px 22px;"
          (mousemove)="onCanvasMouseMove($event)"
          (mouseup)="onCanvasMouseUp()"
        >
          @if (selectedWorkflow(); as wf) {
            <div class="relative min-h-[680px] min-w-[1820px] p-6">
              <!-- CAMADA SVG: LINHAS DE CONEXÃO (PLAY -> INPUT, ACTIONS E CONDITIONS) -->
              <svg class="pointer-events-none absolute inset-0 size-full">
                <defs>
                  <marker
                    id="arrow-primary"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
                  </marker>
                  <marker
                    id="arrow-condition"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                </defs>

                <!-- Seta do Play Central para a primeira estação Input -->
                @if (firstInputConfig(); as firstIn) {
                  <path
                    [attr.d]="buildCurvePath(250, 305, firstIn.positionX, firstIn.positionY + 42)"
                    fill="none"
                    stroke="#10b981"
                    stroke-width="2.5"
                    stroke-dasharray="5,4"
                    marker-end="url(#arrow-primary)"
                  />
                }

                <!-- Setas das Actions (WkfTypeConfigAction) -->
                @for (edge of actionEdges(); track edge.id) {
                  <path
                    [attr.d]="edge.path"
                    fill="none"
                    [attr.stroke]="edge.color"
                    stroke-width="2.2"
                    marker-end="url(#arrow-primary)"
                  />
                  <text
                    [attr.x]="edge.midX"
                    [attr.y]="edge.midY - 6"
                    text-anchor="middle"
                    fill="#94a3b8"
                    font-size="10"
                    font-weight="600"
                  >
                    {{ edge.label }}
                  </text>
                }

                <!-- Setas das Conditions (WkfTypeConfigCondition) -->
                @for (cedge of conditionEdges(); track cedge.id) {
                  <path
                    [attr.d]="cedge.path"
                    fill="none"
                    stroke="#f59e0b"
                    stroke-width="2"
                    stroke-dasharray="6,4"
                    marker-end="url(#arrow-condition)"
                  />
                  <text
                    [attr.x]="cedge.midX"
                    [attr.y]="cedge.midY - 6"
                    text-anchor="middle"
                    fill="#f59e0b"
                    font-size="10"
                    font-weight="600"
                  >
                    {{ cedge.label }}
                  </text>
                }
              </svg>

              <!-- 1. SETINHA DE PLAY OBRIGATÓRIA NO CENTRO-ESQUERDA DO FLUXO -->
              <div
                (click)="selectInspector('trigger', null)"
                class="absolute cursor-pointer rounded-2xl border-2 border-emerald-500 bg-neutral-a1 p-3.5 shadow-lg transition-transform hover:scale-[1.02]"
                style="left: 30px; top: 245px; width: 220px;"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md"
                  >
                    ▶
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                      Gatilho Único (Play)
                    </span>
                    <span class="text-xs font-bold leading-snug text-neutral-12">
                      Clique aqui e diga como esse fluxo começa
                    </span>
                  </div>
                </div>
                <div class="mt-2.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px]">
                  <div class="font-semibold text-emerald-600 dark:text-emerald-400">
                    {{ wf.triggerType }} · {{ wf.triggerEvent || 'OnScreenLoad' }}
                  </div>
                  @if (wf.triggerRoute) {
                    <div class="truncate font-mono text-[10px] text-neutral-a11">
                      Rota: {{ wf.triggerRoute.path }}
                    </div>
                  }
                </div>
              </div>

              <!-- 2. CAIXINHA ERROR OBRIGATÓRIA E ISOLADA LÁ NO CANTO (SEM NINGUÉM PRECISAR LIGAR SETA NELA!) -->
              @if (isolatedErrorConfig(); as errCfg) {
                <div
                  (click)="selectInspector('error', errCfg)"
                  class="absolute cursor-pointer rounded-2xl border-2 border-dashed border-red-500 bg-red-500/5 p-3.5 shadow-lg transition-all hover:bg-red-500/10"
                  [style.left.px]="errCfg.positionX"
                  [style.top.px]="errCfg.positionY"
                  style="width: 280px;"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="flex size-8 items-center justify-center rounded-lg bg-red-500 text-xs font-bold text-white">
                        !
                      </span>
                      <div>
                        <div class="text-xs font-bold text-red-500">
                          ESTAÇÃO ERROR (Isolada)
                        </div>
                        <div class="text-[10px] font-semibold text-neutral-a11">
                          SLA Exclusiva: MpxErrorCode.Sla
                        </div>
                      </div>
                    </div>
                    <span class="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {{ currentWorkflowErrors().length }} erros
                    </span>
                  </div>
                  <p class="mt-2 text-[11px] leading-relaxed text-neutral-a11">
                    Se alguma etapa do fluxo apresentar algum erro ele vai ser jogado para este local, e aqui dentro você saberá exatamente de onde veio e o motivo do fluxo ter vindo para cá.
                  </p>
                </div>
              }

              <!-- 3. DEMAIS ESTAÇÕES DO FLUXO (ARRASTÁVEIS NO CANVAS!) -->
              @for (cfg of normalConfigs(); track cfg.id) {
                <div
                  (mousedown)="startDragConfig($event, cfg)"
                  (click)="selectInspector('config', cfg)"
                  class="absolute cursor-grab select-none rounded-xl border bg-neutral-a1 p-3 shadow-md transition-shadow active:cursor-grabbing"
                  [class.border-primary-a9]="selectedConfig()?.id === cfg.id"
                  [class.ring-2]="selectedConfig()?.id === cfg.id"
                  [class.ring-primary-a6]="selectedConfig()?.id === cfg.id"
                  [class.border-neutral-a6]="selectedConfig()?.id !== cfg.id"
                  [style.left.px]="cfg.positionX"
                  [style.top.px]="cfg.positionY"
                  style="width: 220px;"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span
                      class="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white"
                      [style.background]="cfg.color || cfg.station?.color || '#3b82f6'"
                    >
                      {{ cfg.station?.code || 'Station' }}
                    </span>
                    <span class="font-mono text-[10px] text-neutral-a10">
                      #{{ cfg.order }}
                    </span>
                  </div>

                  <div class="mt-1.5 text-xs font-bold text-neutral-12">
                    {{ cfg.name }}
                  </div>
                  <div class="mt-0.5 line-clamp-2 text-[10px] text-neutral-a10">
                    {{ cfg.description }}
                  </div>

                  <!-- Se for Output chamando Subfluxo (OnSubWorkflow) -->
                  @if (cfg.targetSubWorkflowTypeId) {
                    <div class="mt-2 rounded bg-purple-500/15 px-2 py-1 text-[10px] font-semibold text-purple-400">
                      ↳ Subfluxo: {{ getWorkflowName(cfg.targetSubWorkflowTypeId) }}
                      @if (cfg.returnInputConfigId) {
                        <div class="text-[9px] text-neutral-a11">
                          ↩ Volta em: {{ getConfigName(cfg.returnInputConfigId) }}
                        </div>
                      }
                    </div>
                  }

                  <!-- Se for Redirect apontando para MpxRoute -->
                  @if (cfg.targetRouteId) {
                    <div class="mt-2 rounded bg-emerald-500/15 px-2 py-1 font-mono text-[10px] font-semibold text-emerald-500">
                      ➔ {{ getRoutePath(cfg.targetRouteId) }}
                    </div>
                  }

                  <!-- Resumo de Ações e Condições de saída -->
                  <div class="mt-2 flex flex-wrap items-center gap-1 border-t border-neutral-a4 pt-1.5">
                    @for (act of cfg.actions; track act.id) {
                      <span class="rounded bg-neutral-a3 px-1.5 py-0.5 text-[9px] font-medium text-neutral-a11">
                        {{ act.label }} ➔
                      </span>
                    }
                    @for (cond of cfg.conditions; track cond.id) {
                      <span class="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-500">
                        If {{ cond.propertyName }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- INSPETOR LATERAL DIREITO: CONFIGURA O PLAY (GATILHO), A CAIXINHA ERROR OU A ESTAÇÃO SELECIONADA -->
        <div class="flex flex-col gap-3 rounded-xl border border-neutral-a5 bg-neutral-a2 p-4 lg:col-span-3">
          @if (inspectorMode() === 'trigger' && selectedWorkflow(); as wf) {
            <div class="border-b border-neutral-a5 pb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                Configuração do Gatilho Único (Play)
              </span>
              <h3 class="text-sm font-bold">Como o fluxo "{{ wf.name }}" começa?</h3>
            </div>

            <div class="flex flex-col gap-2.5 text-xs">
              <label class="flex flex-col gap-1">
                <span class="font-semibold">Tipo de Gatilho (1 único por fluxo):</span>
                <select
                  [(ngModel)]="editTriggerTypeId"
                  class="h-9 rounded-lg border border-neutral-a6 bg-neutral-a1 px-2.5 text-xs"
                >
                  @for (tt of triggerTypes(); track tt.id) {
                    <option [value]="tt.id">{{ tt.name }} — {{ tt.label }}</option>
                  }
                </select>
              </label>

              <label class="flex flex-col gap-1">
                <span class="font-semibold">Evento do Gatilho:</span>
                <select
                  [(ngModel)]="editTriggerEvent"
                  class="h-9 rounded-lg border border-neutral-a6 bg-neutral-a1 px-2.5 text-xs"
                >
                  <option value="OnScreenLoad">OnScreenLoad (Abriu uma MpxRoute)</option>
                  <option value="OnClick">OnClick (Clique em botão/link)</option>
                  <option value="OnSubmit">OnSubmit (Envio de formulário)</option>
                  <option value="OnChange">OnChange / OnCheck / OnSelect</option>
                  <option value="OnSubWorkflow">OnSubWorkflow (Chamado por outro fluxo)</option>
                  <option value="OnSchedule">OnSchedule (Cron Mpx.Jarbass)</option>
                  <option value="OnWebhook">OnWebhook (HTTP + Front-end Live)</option>
                  <option value="OnChatMessage">OnChatMessage (Agente IA / Kalupa)</option>
                  <option value="OnEmailImap">OnEmailImap (Caixa IMAP Jarbass)</option>
                  <option value="OnError">OnError (Disparo automático de erro)</option>
                  <option value="OnMorphusEvent">OnMorphusEvent (.Reflected / Jarbass)</option>
                  <option value="OnSseEvent">OnSseEvent (Server-Sent Events)</option>
                </select>
              </label>

              <label class="flex flex-col gap-1">
                <span class="font-semibold">Rota Vinculada (MpxRoute):</span>
                <select
                  [(ngModel)]="editTriggerRouteId"
                  class="h-9 rounded-lg border border-neutral-a6 bg-neutral-a1 px-2.5 text-xs"
                >
                  <option value="">(Nenhuma rota específica)</option>
                  @for (rt of routes(); track rt.id) {
                    <option [value]="rt.id">{{ rt.path }} — {{ rt.label }}</option>
                  }
                </select>
              </label>

              <button
                type="button"
                (click)="saveTriggerConfig()"
                class="mt-2 h-9 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Salvar Gatilho Inicial (Play)
              </button>
            </div>
          } @else if (inspectorMode() === 'error') {
            <div class="border-b border-red-500/30 pb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-red-500">
                Inspeção da Caixinha Isolada Error
              </span>
              <h3 class="text-sm font-bold">MpxError + UserSnapshot + ContextSnapshot</h3>
              <p class="mt-0.5 text-[11px] text-neutral-a11">
                Todo erro de qualquer estação cai aqui automaticamente com a SLA exclusiva do <code>MpxErrorCode</code>.
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <div class="text-xs font-semibold">Catálogo MpxErrorCode (SLA Exclusiva & Severidade 0..4):</div>
              <div class="flex max-h-36 flex-col gap-1.5 overflow-y-auto">
                @for (ec of errorCodes(); track ec.id) {
                  <div class="rounded-lg border border-neutral-a5 bg-neutral-a1 p-2 text-[11px]">
                    <div class="flex items-center justify-between font-bold">
                      <span class="text-red-500">[{{ ec.code }}] {{ ec.name }}</span>
                      <span class="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] text-red-400">
                        SLA: {{ ec.sla }} min
                      </span>
                    </div>
                    <div class="mt-0.5 text-neutral-a11">{{ ec.friendlyMessage }}</div>
                    <div class="mt-1 text-[10px] font-semibold text-amber-500">
                      Severidade: {{ ec.severity?.label }}
                    </div>
                  </div>
                }
              </div>

              <div class="mt-2 text-xs font-semibold">
                Instâncias Capturadas nesta Caixinha ({{ currentWorkflowErrors().length }}):
              </div>
              @if (currentWorkflowErrors().length === 0) {
                <div class="rounded-lg border border-dashed border-neutral-a6 p-3 text-center text-xs text-neutral-a10">
                  Nenhum erro ocorreu ainda neste fluxo. Clique em <strong>"Simular Erro ➔ Caixinha Error"</strong> no topo para testar!
                </div>
              } @else {
                <div class="flex max-h-80 flex-col gap-2 overflow-y-auto">
                  @for (err of currentWorkflowErrors(); track err.id) {
                    <div class="rounded-lg border border-red-500/40 bg-neutral-a1 p-2.5 text-[11px]">
                      <div class="flex items-center justify-between font-bold text-red-400">
                        <span>[{{ err.errorCode?.code }}] Origem: {{ getConfigName(err.originConfigId) }}</span>
                        <span>{{ err.errorState?.label || 'Aberto' }}</span>
                      </div>
                      <div class="mt-1 font-semibold text-neutral-12">
                        Mensagem ao Usuário: "{{ err.userMessage }}"
                      </div>
                      <div class="mt-0.5 font-mono text-[10px] text-neutral-a10">
                        Método: {{ err.method }}
                      </div>
                      <details class="mt-1.5">
                        <summary class="cursor-pointer text-[10px] font-bold text-primary-a11">
                          Ver UserSnapshot (Permissões no momento do erro) & ContextSnapshot
                        </summary>
                        <pre class="mt-1 max-h-32 overflow-auto rounded bg-neutral-a3 p-1.5 text-[9px]">{{ err.userSnapshot }}</pre>
                        <pre class="mt-1 max-h-32 overflow-auto rounded bg-neutral-a3 p-1.5 text-[9px]">{{ err.contextSnapshot }}</pre>
                      </details>
                    </div>
                  }
                </div>
              }
            </div>
          } @else if (selectedConfig(); as cfg) {
            <div class="flex items-center justify-between border-b border-neutral-a5 pb-2">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-primary-a11">
                  Estação #{{ cfg.order }} · {{ cfg.station?.code }}
                </span>
                <h3 class="text-sm font-bold">{{ cfg.name }}</h3>
              </div>
              <button
                type="button"
                (click)="deleteConfig(cfg)"
                class="rounded bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-500/20"
              >
                Excluir
              </button>
            </div>

            <p class="text-xs text-neutral-a11">{{ cfg.description }}</p>

            <!-- Ligar seta (Nova Action) para outra estação -->
            <div class="mt-2 rounded-lg border border-neutral-a5 bg-neutral-a1 p-3 text-xs">
              <div class="mb-2 font-bold">Ligar Seta / Ação para Próxima Estação:</div>
              <div class="flex flex-col gap-2">
                <input
                  type="text"
                  [(ngModel)]="newActionLabel"
                  placeholder="Rótulo da ação (ex.: Entrar, Aprovar)"
                  class="h-8 rounded border border-neutral-a6 bg-neutral-a2 px-2 text-xs"
                />
                <select
                  [(ngModel)]="newActionTargetConfigId"
                  class="h-8 rounded border border-neutral-a6 bg-neutral-a2 px-2 text-xs"
                >
                  <option value="">Selecione a estação destino...</option>
                  @for (target of normalConfigs(); track target.id) {
                    @if (target.id !== cfg.id) {
                      <option [value]="target.id">#{{ target.order }} — {{ target.name }}</option>
                    }
                  }
                </select>
                <button
                  type="button"
                  (click)="addActionConnection(cfg)"
                  class="h-8 rounded bg-primary-9 px-3 text-xs font-semibold text-white"
                >
                  + Conectar Estação
                </button>
              </div>
            </div>

            <!-- Lista de conexões atuais da estação -->
            <div class="mt-2 flex flex-col gap-1.5 text-xs">
              <span class="font-bold">Saídas desta Estação ({{ cfg.actions.length }}):</span>
              @for (act of cfg.actions; track act.id) {
                <div class="flex items-center justify-between rounded border border-neutral-a5 bg-neutral-a1 px-2.5 py-1.5">
                  <span class="font-semibold">{{ act.label }}</span>
                  <span class="text-primary-a11">➔ {{ getConfigName(act.nextWorkflowTypeConfigId) }}</span>
                </div>
              }
            </div>
          } @else {
            <div class="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-neutral-a10">
              Clique na <strong>Setinha de Play</strong> no centro, em qualquer <strong>Estação</strong> do fluxo ou na caixinha isolada <strong>Error</strong> no canto para inspecionar e configurar.
            </div>
          }
        </div>
      </div>
    } @else {
      <!-- DASHBOARD VIEW -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        @for (stat of stats(); track stat.title) {
          <mat-card class="flex flex-col justify-between p-5">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-neutral-a11">
                {{ stat.title }}
              </span>
              <div
                class="flex size-9 items-center justify-center rounded-lg bg-primary-a3 text-primary-a11"
              >
                <mat-icon class="size-5!" [svgIcon]="stat.icon" />
              </div>
            </div>

            <div class="my-3 flex items-baseline gap-2">
              <span class="text-2xl font-bold tracking-tight">
                {{ stat.value }}
              </span>
              <span
                class="rounded-md bg-neutral-a3 px-2 py-0.5 text-xs font-medium text-neutral-a11"
              >
                {{ stat.badge }}
              </span>
            </div>

            <div class="text-xs text-neutral-a10">
              {{ stat.subtitle }}
            </div>
          </mat-card>
        }
      </div>

      <!-- Flow Modules Grid -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        @for (mod of flowModules; track mod.title) {
          <mat-card class="flex flex-col justify-between">
            <mat-card-header class="flex items-start justify-between gap-3 pb-2">
              <div class="flex items-center gap-3">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-a3 text-primary-a11"
                >
                  <mat-icon class="size-5!" [svgIcon]="mod.icon" />
                </div>
                <div class="flex flex-col">
                  <span class="text-base font-semibold leading-snug">
                    {{ mod.title }}
                  </span>
                  <span class="text-xs text-neutral-a10">
                    {{ mod.badge }}
                  </span>
                </div>
              </div>
            </mat-card-header>

            <mat-card-content class="py-3">
              <p class="text-sm leading-relaxed text-neutral-a11">
                {{ mod.description }}
              </p>
            </mat-card-content>

            <mat-card-footer
              class="mt-auto flex items-center justify-between border-t border-neutral-a4 px-4 py-3"
            >
              <span class="text-xs text-neutral-a10">
                {{ mod.footerHint }}
              </span>
              <button
                type="button"
                matButton
                class="primary small"
                (click)="setView('studio')"
              >
                {{ mod.actionLabel }}
                <mat-icon class="size-4!" svgIcon="arrow-right" />
              </button>
            </mat-card-footer>
          </mat-card>
        }
      </div>
    }
  `,
})
export class FlowDashboardComponent implements OnInit {
  protected readonly auth = inject(MpxSecurity);
  protected readonly context = inject(MpxContextService);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiBase = `${environment.apiUrl}/workflow`;

  protected readonly activeView = signal<'dashboard' | 'studio'>('studio');
  protected readonly activeDrawer = signal<'context' | 'routes' | null>(null);
  protected readonly inspectorMode = signal<'trigger' | 'error' | 'config'>('trigger');

  protected readonly triggerTypes = signal<StudioTriggerType[]>([]);
  protected readonly stationTypes = signal<StudioStationType[]>([]);
  protected readonly routes = signal<StudioRoute[]>([]);
  protected readonly errorCodes = signal<StudioErrorCode[]>([]);
  protected readonly errors = signal<StudioMpxError[]>([]);
  protected readonly entityDefinitions = signal<StudioEntityDefinition[]>([]);
  protected readonly stations = signal<StudioStation[]>([]);
  protected readonly workflowTypes = signal<StudioWorkflowType[]>([]);

  protected readonly selectedWorkflowId = signal<string>('');
  protected readonly selectedConfig = signal<StudioWorkflowConfig | null>(null);
  protected readonly justCreatedWorkflowId = signal<string | null>(null);

  protected newWorkflowName = '';
  protected selectedEntityDefId = '';
  protected newContextAlias = '';
  protected newContextIsCollection = false;

  protected editTriggerTypeId = '';
  protected editTriggerRouteId = '';
  protected editTriggerEvent = 'OnScreenLoad';

  protected newActionLabel = '';
  protected newActionTargetConfigId = '';

  private draggingConfig: StudioWorkflowConfig | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  protected readonly selectedWorkflow = computed(() =>
    this.workflowTypes().find((w) => w.id === this.selectedWorkflowId()) ?? null
  );

  protected readonly isolatedErrorConfig = computed(() =>
    this.selectedWorkflow()?.configs.find((c) => c.isIsolatedErrorCatcher || c.station?.code === 'Error') ?? null
  );

  protected readonly normalConfigs = computed(() =>
    (this.selectedWorkflow()?.configs ?? []).filter((c) => !c.isIsolatedErrorCatcher && c.station?.code !== 'Error')
  );

  protected readonly firstInputConfig = computed(() =>
    this.normalConfigs().find((c) => c.station?.code === 'Input') ?? this.normalConfigs()[0] ?? null
  );

  protected readonly currentWorkflowErrors = computed(() =>
    this.errors().filter((e) => e.workflowTypeId === this.selectedWorkflowId())
  );

  protected readonly actionEdges = computed(() => {
    const configs = this.normalConfigs();
    const byId = new Map(configs.map((c) => [c.id, c]));
    const edges: { id: string; path: string; midX: number; midY: number; label: string; color: string }[] = [];

    for (const cfg of configs) {
      for (const act of cfg.actions ?? []) {
        if (!act.nextWorkflowTypeConfigId) continue;
        const target = byId.get(act.nextWorkflowTypeConfigId);
        if (!target) continue;
        const x1 = cfg.positionX + 220;
        const y1 = cfg.positionY + 45;
        const x2 = target.positionX;
        const y2 = target.positionY + 45;
        edges.push({
          id: act.id,
          path: this.buildCurvePath(x1, y1, x2, y2),
          midX: (x1 + x2) / 2,
          midY: (y1 + y2) / 2,
          label: act.label,
          color: act.color || '#3b82f6',
        });
      }
    }
    return edges;
  });

  protected readonly conditionEdges = computed(() => {
    const configs = this.normalConfigs();
    const byId = new Map(configs.map((c) => [c.id, c]));
    const edges: { id: string; path: string; midX: number; midY: number; label: string }[] = [];

    for (const cfg of configs) {
      for (const cond of cfg.conditions ?? []) {
        const target = byId.get(cond.nextWorkflowTypeConfigId);
        if (!target) continue;
        const x1 = cfg.positionX + 220;
        const y1 = cfg.positionY + 65;
        const x2 = target.positionX;
        const y2 = target.positionY + 45;
        edges.push({
          id: cond.id,
          path: this.buildCurvePath(x1, y1, x2, y2),
          midX: (x1 + x2) / 2,
          midY: (y1 + y2) / 2,
          label: `${cond.propertyName} ${cond.operator} ${cond.value ?? ''}`,
        });
      }
    }
    return edges;
  });

  constructor() {
    effect(() => {
      const wf = this.selectedWorkflow();
      if (wf) {
        this.editTriggerTypeId = wf.triggerTypeId ?? this.triggerTypes()[0]?.id ?? '';
        this.editTriggerRouteId = wf.triggerRouteId ?? '';
        this.editTriggerEvent = wf.triggerEvent ?? 'OnScreenLoad';
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const view = params.get('view');
      if (view === 'dashboard') {
        this.activeView.set('dashboard');
      } else {
        this.activeView.set('studio');
      }
    });
    this.loadStudioBootstrap();
  }

  protected setView(view: 'dashboard' | 'studio'): void {
    this.activeView.set(view);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
    });
  }

  protected loadStudioBootstrap(preferredWorkflowId?: string): void {
    this.http.get<any>(`${this.apiBase}/studio`).subscribe({
      next: (res) => {
        this.triggerTypes.set(res.triggerTypes ?? []);
        this.stationTypes.set(res.stationTypes ?? []);
        this.routes.set(res.routes ?? []);
        this.errorCodes.set(res.errorCodes ?? []);
        this.errors.set(res.errors ?? []);
        this.entityDefinitions.set(res.entityDefinitions ?? []);
        this.stations.set(res.stations ?? []);
        const wfs: StudioWorkflowType[] = res.workflowTypes ?? [];
        this.workflowTypes.set(wfs);

        if (preferredWorkflowId && wfs.some((w) => w.id === preferredWorkflowId)) {
          this.selectedWorkflowId.set(preferredWorkflowId);
        } else if (!this.selectedWorkflowId() && wfs.length > 0) {
          this.selectedWorkflowId.set(wfs[0].id);
        }
      },
    });
  }

  protected selectWorkflow(id: string): void {
    this.selectedWorkflowId.set(id);
    this.selectedConfig.set(null);
    this.inspectorMode.set('trigger');
  }

  protected createNewWorkflow(): void {
    const name = this.newWorkflowName.trim();
    if (!name) return;

    this.http
      .post<{ id: string; name: string }>(`${this.apiBase}/types`, {
        name,
        triggerTypeId: this.triggerTypes()[0]?.id,
        triggerEvent: 'OnScreenLoad',
      })
      .subscribe({
        next: (created) => {
          this.newWorkflowName = '';
          this.justCreatedWorkflowId.set(created.id);
          this.loadStudioBootstrap(created.id);
          setTimeout(() => this.justCreatedWorkflowId.set(null), 2200);
        },
      });
  }

  protected saveTriggerConfig(): void {
    const wf = this.selectedWorkflow();
    if (!wf) return;

    this.http
      .put(`${this.apiBase}/types/${wf.id}/trigger`, {
        triggerTypeId: this.editTriggerTypeId,
        triggerRouteId: this.editTriggerRouteId || null,
        triggerEvent: this.editTriggerEvent,
      })
      .subscribe({
        next: () => this.loadStudioBootstrap(wf.id),
      });
  }

  protected addEntityToContext(): void {
    const wf = this.selectedWorkflow();
    if (!wf || !this.selectedEntityDefId) return;

    this.http
      .post(`${this.apiBase}/types/${wf.id}/contexts`, {
        entityDefinitionId: this.selectedEntityDefId,
        alias: this.newContextAlias,
        isCollection: this.newContextIsCollection,
        isRootEntity: wf.contexts.length === 0,
      })
      .subscribe({
        next: () => {
          this.newContextAlias = '';
          this.newContextIsCollection = false;
          this.loadStudioBootstrap(wf.id);
        },
      });
  }

  protected removeContextEntity(contextId: string): void {
    const wf = this.selectedWorkflow();
    if (!wf) return;

    this.http.delete(`${this.apiBase}/contexts/${contextId}`).subscribe({
      next: () => this.loadStudioBootstrap(wf.id),
    });
  }

  protected addStationToCanvas(station: StudioStation): void {
    const wf = this.selectedWorkflow();
    if (!wf) return;

    const existingCount = this.normalConfigs().length;
    const posX = 340 + (existingCount % 4) * 290;
    const posY = 180 + Math.floor(existingCount / 4) * 160;

    this.http
      .post<StudioWorkflowConfig>(`${this.apiBase}/types/${wf.id}/configs`, {
        stationId: station.id,
        name: `${station.code} #${existingCount + 1}`,
        positionX: posX,
        positionY: posY,
        description: station.description,
      })
      .subscribe({
        next: (cfg) => {
          this.loadStudioBootstrap(wf.id);
          this.selectInspector('config', cfg);
        },
      });
  }

  protected deleteConfig(cfg: StudioWorkflowConfig): void {
    const wf = this.selectedWorkflow();
    if (!wf) return;

    this.http.delete(`${this.apiBase}/configs/${cfg.id}`).subscribe({
      next: () => {
        this.selectedConfig.set(null);
        this.inspectorMode.set('trigger');
        this.loadStudioBootstrap(wf.id);
      },
    });
  }

  protected addActionConnection(cfg: StudioWorkflowConfig): void {
    const wf = this.selectedWorkflow();
    if (!wf || !this.newActionTargetConfigId) return;

    this.http
      .post(`${this.apiBase}/configs/${cfg.id}/actions`, {
        name: this.newActionLabel || 'Avançar',
        label: this.newActionLabel || 'Avançar',
        controlType: 'Button',
        executeWhen: 'OnClick',
        nextWorkflowTypeConfigId: this.newActionTargetConfigId,
        isAutomatic: false,
      })
      .subscribe({
        next: () => {
          this.newActionLabel = '';
          this.newActionTargetConfigId = '';
          this.loadStudioBootstrap(wf.id);
        },
      });
  }

  protected simulateErrorInFlow(): void {
    const wf = this.selectedWorkflow();
    if (!wf) return;

    const origin = this.selectedConfig() ?? this.normalConfigs()[0];
    const errCode = this.errorCodes()[0];
    if (!origin || !errCode) return;

    this.http
      .post(`${this.apiBase}/types/${wf.id}/simulate-error`, {
        originConfigId: origin.id,
        errorCodeId: errCode.id,
      })
      .subscribe({
        next: () => {
          this.inspectorMode.set('error');
          this.loadStudioBootstrap(wf.id);
        },
      });
  }

  protected selectInspector(mode: 'trigger' | 'error' | 'config', cfg: StudioWorkflowConfig | null): void {
    this.inspectorMode.set(mode);
    this.selectedConfig.set(cfg);
  }

  protected startDragConfig(event: MouseEvent, cfg: StudioWorkflowConfig): void {
    event.stopPropagation();
    this.draggingConfig = cfg;
    this.dragOffsetX = event.clientX - cfg.positionX;
    this.dragOffsetY = event.clientY - cfg.positionY;
    this.selectInspector('config', cfg);
  }

  protected onCanvasMouseMove(event: MouseEvent): void {
    if (!this.draggingConfig) return;
    this.draggingConfig.positionX = Math.max(20, Math.round(event.clientX - this.dragOffsetX));
    this.draggingConfig.positionY = Math.max(20, Math.round(event.clientY - this.dragOffsetY));
  }

  protected onCanvasMouseUp(): void {
    if (!this.draggingConfig) return;
    const cfg = this.draggingConfig;
    this.draggingConfig = null;

    this.http
      .put(`${this.apiBase}/configs/${cfg.id}/position`, {
        positionX: cfg.positionX,
        positionY: cfg.positionY,
      })
      .subscribe();
  }

  protected buildCurvePath(x1: number, y1: number, x2: number, y2: number): string {
    const dx = Math.max(60, Math.abs(x2 - x1) * 0.45);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }

  protected getWorkflowName(id?: string): string {
    if (!id) return '';
    return this.workflowTypes().find((w) => w.id === id)?.name ?? 'Subfluxo';
  }

  protected getConfigName(id?: string): string {
    if (!id) return '';
    return this.selectedWorkflow()?.configs.find((c) => c.id === id)?.name ?? 'Estação';
  }

  protected getRoutePath(id?: string): string {
    if (!id) return '';
    return this.routes().find((r) => r.id === id)?.path ?? '/';
  }

  protected readonly stats = computed(() => [
    {
      title: 'Fluxos Semeados',
      icon: 'workflow' as const,
      value: `${this.workflowTypes().length} Fluxos`,
      subtitle: 'SignIn + Subfluxos SignUp e ForgotPassword',
      badge: 'WkfType',
    },
    {
      title: 'Tipos de Estação (Wkf333)',
      icon: 'git-branch' as const,
      value: '18 Tipos',
      subtitle: 'Input, Output, Screen, Process, Aggregate, Error...',
      badge: 'WkfStationType',
    },
    {
      title: 'Catálogo de Rotas',
      icon: 'compass' as const,
      value: `${this.routes().length} Rotas`,
      subtitle: 'Todas as rotas do ecossistema cadastradas',
      badge: 'MpxRoute',
    },
    {
      title: 'Motor de Erros & SLA',
      icon: 'clock' as const,
      value: `${this.errorCodes().length} Códigos`,
      subtitle: 'MpxErrorCode com Severidade 0..4 e UserSnapshot',
      badge: 'MpxError',
    },
  ]);

  protected readonly flowModules = [
    {
      title: 'Estúdio Visual de Fluxos (Canvas)',
      icon: 'workflow' as const,
      badge: 'Play Central & Error Isolado',
      description:
        'Desenhe modelos de workflow com Play obrigatório no centro, estação Error isolada no canto, Contexto (.Reflected) e 18 tipos de estação.',
      actionLabel: 'Abrir Estúdio',
      footerHint: 'Canvas drag-and-drop',
    },
    {
      title: 'Fluxo SignIn + Subfluxos SignUp & ForgotPassword',
      icon: 'log-in' as const,
      badge: 'Autenticação Governada por Wkf*',
      description:
        'Veja o fluxo de Login completo chamando SignUp e ForgotPassword via Output (OnSubWorkflow) e retornando na porta Input do Login.',
      actionLabel: 'Ver no Canvas',
      footerHint: 'wkf_workflow_types',
    },
    {
      title: 'Central Isolada de Erros (MpxError)',
      icon: 'shield-alert' as const,
      badge: 'UserSnapshot & SLA Exclusiva',
      description:
        'Inspecione erros capturados em qualquer estação com fotografia das permissões do usuário no momento do erro vs. momento da análise.',
      actionLabel: 'Testar Erro',
      footerHint: 'mpx_errors & mpx_error_codes',
    },
  ];
}
