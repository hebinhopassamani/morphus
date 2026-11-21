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

export interface StudioParameterScope {
  id: string;
  code: number;
  name: string;
  label: string;
  isSystemSovereign: boolean;
  isExportableToJarbass: boolean;
  icon?: string;
  color?: string;
  order: number;
  description?: string;
}

export interface StudioMpxParameter {
  id: string;
  scopeId: string;
  scopeCode: number;
  workspaceId?: string;
  applicationId?: string;
  userId?: string;
  machineKey?: string;
  namespace: string;
  name: string;
  settingsJson: string;
  isLockedBySovereign: boolean;
  isExportable: boolean;
  description?: string;
  scope?: StudioParameterScope;
}

export interface StudioComponentType {
  id: string;
  code: number;
  tagName: string;
  name: string;
  label: string;
  isContainerWrapper: boolean;
  supportsWorkflowAction: boolean;
  supportsReflectedField: boolean;
  defaultParametersJson: string;
  icon?: string;
  color?: string;
  order: number;
  description?: string;
}

export interface StudioScreenComponent {
  id: string;
  componentTypeId: string;
  parentComponentId?: string;
  routeId?: string;
  workflowTypeId?: string;
  stationId?: string;
  workflowConfigId?: string;
  workflowActionId?: string;
  entityPropertyId?: string;
  componentCode: string;
  label: string;
  triggerEvent: string;
  embeddedConfigJson: string;
  order: number;
  description?: string;
  componentType?: StudioComponentType;
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
        <button
          type="button"
          (click)="setView('dashboard')"
          class="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all"
          [class.border-primary-a8]="activeView() === 'dashboard'"
          [class.bg-primary-a3]="activeView() === 'dashboard'"
          [class.text-primary-a11]="activeView() === 'dashboard'"
          [class.border-neutral-a6]="activeView() !== 'dashboard'"
          [class.bg-neutral-a1]="activeView() !== 'dashboard'"
        >
          <mat-icon class="size-4!" svgIcon="layout-grid" />
          Visão Geral
        </button>

        <button
          type="button"
          (click)="setView('studio')"
          class="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all"
          [class.border-primary-a8]="activeView() === 'studio'"
          [class.bg-primary-a3]="activeView() === 'studio'"
          [class.text-primary-a11]="activeView() === 'studio'"
          [class.border-neutral-a6]="activeView() !== 'studio'"
          [class.bg-neutral-a1]="activeView() !== 'studio'"
        >
          <mat-icon class="size-4!" svgIcon="workflow" />
          Estúdio Visual de Fluxos (Canvas)
        </button>

        <button
          type="button"
          (click)="setView('lego')"
          class="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-all"
          [class.border-amber-500]="activeView() === 'lego'"
          [class.bg-amber-500/15]="activeView() === 'lego'"
          [class.text-amber-400]="activeView() === 'lego'"
          [class.border-neutral-a6]="activeView() !== 'lego'"
          [class.bg-neutral-a1]="activeView() !== 'lego'"
        >
          <mat-icon class="size-4! text-amber-500" svgIcon="sparkles" />
          MpxParameter (0..5) & Lego Mpx* (Draggable / Button)
        </button>
      </div>
    </div>

    @if (activeView() === 'lego') {
      <!-- MORPHUS STUDIO PLAYGROUND: CASCATA MPX_PARAMETERS (0..5) + LEGO MPX* (MpxDraggable / MpxDroppable / MpxButton) + JARBASS PORTABLE JSON -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <!-- COLUNA 1 (4 cols): CASCATA MPX_PARAMETER (0..5) + SOBERANIA JARBASS + EXPORT/IMPORT PORTÁTIL -->
        <div class="flex flex-col gap-3 rounded-xl border border-neutral-a5 bg-neutral-a2 p-4 lg:col-span-4">
          <div class="flex items-center justify-between border-b border-neutral-a5 pb-2.5">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                Cascata Hierárquica 0..5 · GPU CSS Variables
              </span>
              <h2 class="text-sm font-bold">MpxParameter + MpxParameterScope</h2>
              <p class="text-[11px] text-neutral-a11">
                SystemDefault (0) ➔ Corporation (1) ➔ Workspace (2) ➔ App (3) ➔ User (4) ➔ Machine (5)
              </p>
            </div>
          </div>

          <!-- Régua das 6 Camadas da Cascata (0..5) -->
          <div class="flex flex-col gap-1.5">
            @for (p of parameters(); track p.id) {
              <button
                type="button"
                (click)="selectParameterLayer(p)"
                class="flex items-center justify-between rounded-lg border p-2.5 text-left transition-all"
                [class.border-amber-500]="selectedParameter()?.id === p.id"
                [class.bg-amber-500/10]="selectedParameter()?.id === p.id"
                [class.border-neutral-a5]="selectedParameter()?.id !== p.id"
                [class.bg-neutral-a1]="selectedParameter()?.id !== p.id"
              >
                <div class="flex items-center gap-2.5">
                  <span
                    class="flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                    [style.background]="p.scope?.color || (p.scopeCode <= 1 ? '#dc2626' : '#10b981')"
                  >
                    {{ p.scopeCode }}
                  </span>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-neutral-12">
                      {{ p.scope?.name || 'Layer ' + p.scopeCode }} · {{ p.name }}
                    </span>
                    <span class="font-mono text-[10px] text-neutral-a10">
                      {{ p.namespace }}{{ p.machineKey ? ' · ' + p.machineKey : '' }}
                    </span>
                  </div>
                </div>
                <span
                  class="rounded px-2 py-0.5 text-[10px] font-bold"
                  [class.bg-red-500/15]="p.scopeCode <= 1"
                  [class.text-red-400]="p.scopeCode <= 1"
                  [class.bg-emerald-500/15]="p.scopeCode >= 2"
                  [class.text-emerald-400]="p.scopeCode >= 2"
                >
                  {{ p.scopeCode <= 1 ? '🔒 Soberano' : '📦 Portátil' }}
                </span>
              </button>
            }
          </div>

          <!-- Sliders Ao Vivo de Física do MpxDraggable / MpxDroppable / MpxButton (Muda em 0,01ms na GPU!) -->
          <div class="rounded-xl border border-amber-500/30 bg-neutral-a1 p-3">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs font-bold text-amber-400">
                ⚡ Ajuste Ao Vivo na GPU (Muda 1 linha no JSON ➔ Reflete na Hora!)
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2.5 text-xs">
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-semibold">GrabPadding ({{ liveGrabPaddingPx() }}px):</span>
                <input
                  type="range"
                  min="2"
                  max="24"
                  [ngModel]="liveGrabPaddingPx()"
                  (ngModelChange)="updateLiveParameter('mpx.draggable.grabPadding', $event + 'px')"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-semibold">ElevationTilt ({{ liveElevationTiltDeg() }}deg):</span>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.5"
                  [ngModel]="liveElevationTiltDeg()"
                  (ngModelChange)="updateLiveParameter('mpx.draggable.elevationTilt', $event + 'deg')"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-semibold">BorderRadius ({{ liveBorderRadiusPx() }}px):</span>
                <input
                  type="range"
                  min="2"
                  max="24"
                  [ngModel]="liveBorderRadiusPx()"
                  (ngModelChange)="updateLiveParameter('mpx.theme.borderRadius', $event + 'px')"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-semibold">Cor Ímã MpxDroppable:</span>
                <select
                  [ngModel]="effectiveParamValue('mpx.droppable.magneticGlowColor', '#3b82f6')"
                  (ngModelChange)="updateLiveParameter('mpx.droppable.magneticGlowColor', $event)"
                  class="h-7 rounded border border-neutral-a6 bg-neutral-a2 px-2 text-xs"
                >
                  <option value="#3b82f6">Azul Morphus (#3b82f6)</option>
                  <option value="#10b981">Verde Esmeralda (#10b981)</option>
                  <option value="#f59e0b">Âmbar Fogo (#f59e0b)</option>
                  <option value="#8b5cf6">Roxo Kalupa (#8b5cf6)</option>
                </select>
              </label>
            </div>

            <div class="mt-2.5 flex flex-wrap items-center gap-3 border-t border-neutral-a4 pt-2 text-[11px]">
              <label class="inline-flex items-center gap-1.5 font-semibold">
                <input
                  type="checkbox"
                  [ngModel]="effectiveParamBool('mpx.button.showSpinner', true)"
                  (ngModelChange)="updateLiveParameter('mpx.button.showSpinner', $event)"
                />
                MpxButton: Spinner Automático
              </label>
              <label class="inline-flex items-center gap-1.5 font-semibold">
                <input
                  type="checkbox"
                  [ngModel]="effectiveParamBool('mpx.button.disableOnClick', true)"
                  (ngModelChange)="updateLiveParameter('mpx.button.disableOnClick', $event)"
                />
                MpxButton: Disable no Clique
              </label>
            </div>
          </div>

          <!-- Editor JSON da Camada Selecionada -->
          @if (selectedParameter(); as selP) {
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold">
                  JSON da Camada {{ selP.scopeCode }} ({{ selP.scope?.name }}):
                </span>
                <button
                  type="button"
                  (click)="saveParameterLayer()"
                  class="rounded bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-neutral-950 hover:bg-amber-400"
                >
                  Salvar JSON da Camada {{ selP.scopeCode }}
                </button>
              </div>
              <textarea
                [(ngModel)]="editParameterJsonText"
                rows="8"
                class="w-full rounded-lg border border-neutral-a6 bg-neutral-a1 p-2.5 font-mono text-[11px] text-emerald-400 focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>
          }

          <!-- Exportar / Importar Pacote Portátil pro Jarbass (.mpxenv.json) -->
          <div class="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
            <div class="text-xs font-bold text-emerald-400">
              🤖 Mpx.Jarbass — Perfil Portátil (.mpxenv.json)
            </div>
            <p class="mt-0.5 text-[11px] text-neutral-a11">
              Exporta apenas as camadas portáteis <strong>2..5 (Workspace, App, User, Machine)</strong>. As camadas <strong>0 (SystemDefault) e 1 (Corporation / Régua Jarbass 0..5)</strong> ficam blindadas e nunca vazam!
            </p>
            <div class="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                (click)="exportPortableJarbassJson()"
                class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
              >
                📤 Exportar .mpxenv.json (Níveis 2..5)
              </button>
              <button
                type="button"
                (click)="importPortableJarbassJson()"
                class="rounded-lg border border-emerald-500/50 bg-neutral-a1 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/15"
              >
                📥 "Jarbass, importa essas configs pra mim!"
              </button>
            </div>
            @if (jarbassStatusMessage()) {
              <div class="mt-2 rounded bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300">
                {{ jarbassStatusMessage() }}
              </div>
            }
          </div>
        </div>

        <!-- COLUNA 2 (5 cols): TABULEIRO LEGO MPX* (MpxDraggable ➔ MpxDroppable + MpxButton com Configs Embarcadas em 0,01ms!) -->
        <div class="flex flex-col gap-3 rounded-xl border border-neutral-a5 bg-neutral-a2 p-4 lg:col-span-5">
          <div class="flex items-center justify-between border-b border-neutral-a5 pb-2.5">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-primary-a11">
                Só o MpxDraggable se mexe · 100% Width & Height · Zero Código Front-end
              </span>
              <h2 class="text-sm font-bold">
                Tabuleiro Auto-Encaixável: <code class="text-amber-400">&lt;MpxDraggable&gt;</code> ⇄ <code class="text-primary-a11">&lt;MpxDroppable&gt;</code>
              </h2>
            </div>
            <span class="rounded-full bg-primary-a3 px-2.5 py-1 text-[10px] font-bold text-primary-a11">
              {{ screenComponents().length }} Objetos com ID
            </span>
          </div>

          <!-- PALETA DE PEÇAS <MpxDraggable> PARA ARRASTAR E ENCAIXAR NO <MpxDroppable> -->
          <div class="rounded-xl border border-neutral-a5 bg-neutral-a1 p-3">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs font-bold">
                1. Segure e Arraste uma Peça <code class="text-amber-400">&lt;MpxDraggable&gt;</code> (Veja o GrabPadding={{ effectiveParamValue('mpx.draggable.grabPadding', '8px') }} ao segurar!):
              </span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              @for (ct of paletteComponentTypes(); track ct.id) {
                <!-- ENVELOPE <MpxDraggable>: Só ELE se mexe e aplica o GrabPadding e ElevationTilt! Quem está dentro ocupa 100% width e 100% height! -->
                <div
                  draggable="true"
                  (dragstart)="onMpxDraggableStart($event, ct)"
                  (dragend)="onMpxDraggableEnd()"
                  class="cursor-grab select-none rounded-lg border transition-all duration-150 active:cursor-grabbing"
                  [style.padding]="draggingComponentType()?.id === ct.id ? effectiveParamValue('mpx.draggable.grabPadding', '8px') : '0px'"
                  [style.transform]="draggingComponentType()?.id === ct.id ? 'rotate(' + effectiveParamValue('mpx.draggable.elevationTilt', '1.5deg') + ') scale(1.03)' : 'none'"
                  [style.opacity]="draggingComponentType()?.id === ct.id ? effectiveParamValue('mpx.draggable.originGhostOpacity', '0.65') : '1'"
                  [style.border-color]="draggingComponentType()?.id === ct.id ? '#f59e0b' : 'rgba(148,163,184,0.25)'"
                  [style.box-shadow]="draggingComponentType()?.id === ct.id ? '0 14px 28px rgba(0,0,0,0.45)' : 'none'"
                >
                  <!-- Componente passageiro lá dentro: 100% width e 100% height sem saber que está sendo arrastado! -->
                  <div
                    class="flex size-full items-center gap-2 rounded-md bg-neutral-a2 px-2.5 py-2"
                    [style.border-radius]="effectiveParamValue('mpx.theme.borderRadius', '10px')"
                  >
                    <span
                      class="flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                      [style.background]="ct.color || '#3b82f6'"
                    >
                      {{ ct.name.replace('Mpx', '').slice(0, 2).toUpperCase() }}
                    </span>
                    <div class="flex flex-col overflow-hidden">
                      <span class="truncate text-xs font-bold text-neutral-12">{{ ct.name }}</span>
                      <span class="truncate font-mono text-[9px] text-neutral-a10">&lt;{{ ct.tagName }}&gt;</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- BERÇO MAGNÉTICO <MpxDroppable>: Tela de Login (/security/signin -> WkfType SignIn) -->
          <div
            (dragover)="onMpxDroppableOver($event)"
            (dragleave)="onMpxDroppableLeave()"
            (drop)="onMpxDroppableDrop($event)"
            class="relative flex flex-col gap-3 rounded-2xl border-2 p-4 transition-all duration-200"
            [style.border-color]="isDroppableMagneticActive() ? effectiveParamValue('mpx.droppable.magneticGlowColor', '#3b82f6') : 'rgba(148,163,184,0.3)'"
            [style.box-shadow]="isDroppableMagneticActive() ? '0 0 28px ' + effectiveParamValue('mpx.droppable.magneticGlowColor', '#3b82f6') + '55' : 'none'"
            [style.background]="isDroppableMagneticActive() ? 'rgba(59,130,246,0.06)' : 'rgba(15,23,42,0.35)'"
          >
            <div class="flex items-center justify-between border-b border-neutral-a5 pb-2">
              <div class="flex items-center gap-2">
                <span class="rounded bg-primary-9 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                  &lt;MpxDroppable&gt;
                </span>
                <span class="text-xs font-bold">
                  Tela de Login (/security/signin) ⇄ Fluxo: SignIn
                </span>
              </div>
              <span class="font-mono text-[10px] text-emerald-400">
                {{ isDroppableMagneticActive() ? '🧲 ÍMÃ ATIVO: Solte para Auto-Encaixar (100% W/H)!' : 'Berço Pronto' }}
              </span>
            </div>

            <!-- Lista de Objetos MpxScreenComponent Encaixados (Renderizados já com ID e Configurações Embarcadas!) -->
            <div class="flex flex-col gap-2.5">
              @for (sc of childScreenComponents(); track sc.id) {
                <!-- Cada componente dentro do tabuleiro está envelopado por um <MpxDraggable> -->
                <div
                  draggable="true"
                  (dragstart)="onExistingComponentDragStart(sc)"
                  (dragend)="onExistingComponentDragEnd()"
                  (click)="inspectScreenComponent(sc)"
                  class="cursor-pointer rounded-xl border transition-all duration-150"
                  [class.ring-2]="justLandedComponentId() === sc.id || selectedScreenComponent()?.id === sc.id"
                  [class.ring-emerald-400]="justLandedComponentId() === sc.id"
                  [class.ring-amber-400]="selectedScreenComponent()?.id === sc.id && justLandedComponentId() !== sc.id"
                  [style.padding]="activeDraggedScreenCompId() === sc.id ? effectiveParamValue('mpx.draggable.grabPadding', '8px') : '4px'"
                  [style.transform]="activeDraggedScreenCompId() === sc.id ? 'rotate(' + effectiveParamValue('mpx.draggable.elevationTilt', '1.5deg') + ')' : 'none'"
                  [style.border-color]="selectedScreenComponent()?.id === sc.id ? '#f59e0b' : 'rgba(148,163,184,0.22)'"
                >
                  <!-- Cabeçalho da Moldura MpxDraggable mostrando o ID único e o vínculo embarcado -->
                  <div class="mb-1 flex items-center justify-between px-1.5 text-[10px] text-neutral-a10">
                    <span class="font-mono font-bold text-amber-400">
                      &lt;MpxDraggable&gt; ➔ &lt;{{ sc.componentType?.tagName || 'mpx-component' }}&gt; · ID: {{ sc.componentCode }}
                    </span>
                    <span class="rounded bg-neutral-a3 px-1.5 py-0.5 font-mono text-[9px] text-emerald-400">
                      Embarcado: {{ sc.triggerEvent }} ({{ sc.id.slice(0, 8) }})
                    </span>
                  </div>

                  <!-- Renderização Real 100% Width / 100% Height do Componente Mpx* lá dentro! -->
                  @if (sc.componentType?.name === 'MpxInput') {
                    <div
                      class="flex w-full flex-col gap-1 bg-neutral-a1 p-2.5"
                      [style.border-radius]="effectiveParamValue('mpx.theme.borderRadius', '10px')"
                    >
                      <label class="text-xs font-semibold text-neutral-12">
                        {{ sc.label }}
                        <span class="font-mono text-[10px] text-primary-a11">(.Reflected)</span>
                      </label>
                      @if (sc.componentCode.includes('EMAIL')) {
                        <input
                          type="email"
                          [(ngModel)]="previewLoginEmail"
                          placeholder="arquiteto@morphus.one"
                          class="h-9 w-full border bg-neutral-a2 px-3 text-xs text-neutral-12 focus:outline-none"
                          [style.border-radius]="effectiveParamValue('mpx.theme.borderRadius', '10px')"
                          [class.border-red-500]="invalidFieldCode() === sc.componentCode"
                          [class.border-neutral-a6]="invalidFieldCode() !== sc.componentCode"
                        />
                      } @else {
                        <input
                          type="password"
                          [(ngModel)]="previewLoginPassword"
                          placeholder="••••••••"
                          class="h-9 w-full border bg-neutral-a2 px-3 text-xs text-neutral-12 focus:outline-none"
                          [style.border-radius]="effectiveParamValue('mpx.theme.borderRadius', '10px')"
                          [class.border-red-500]="invalidFieldCode() === sc.componentCode"
                          [class.border-neutral-a6]="invalidFieldCode() !== sc.componentCode"
                        />
                      }
                    </div>
                  } @else if (sc.componentType?.name === 'MpxButton') {
                    <!-- <MpxButton>: Já nasce renderizado com todas as configurações do WkfType embarcadas! -->
                    <button
                      type="button"
                      [disabled]="runningButtonId() === sc.id && effectiveParamBool('mpx.button.disableOnClick', true)"
                      (click)="dispatchEmbeddedMpxButton($event, sc)"
                      class="flex h-10 w-full items-center justify-center gap-2 px-4 text-xs font-bold text-white shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60"
                      [style.border-radius]="effectiveParamValue('mpx.theme.borderRadius', '10px')"
                      [style.background]="sc.componentCode.includes('SIGNUP') ? '#10b981' : sc.componentCode.includes('FORGOT') ? '#f59e0b' : effectiveParamValue('mpx.theme.primaryColor', '#3b82f6')"
                    >
                      @if (runningButtonId() === sc.id && effectiveParamBool('mpx.button.showSpinner', true)) {
                        <span class="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        <span>Executando WkfType Embarcado ({{ sc.componentCode }})...</span>
                      } @else {
                        <span>⚡ {{ sc.label }}</span>
                        <span class="rounded bg-black/25 px-1.5 py-0.5 font-mono text-[10px]">
                          0,01ms RAM
                        </span>
                      }
                    </button>
                  } @else {
                    <div
                      class="flex w-full items-center justify-between bg-neutral-a1 p-3 text-xs"
                      [style.border-radius]="effectiveParamValue('mpx.theme.borderRadius', '10px')"
                    >
                      <span class="font-bold">{{ sc.label }}</span>
                      <span class="font-mono text-[10px] text-primary-a11">{{ sc.componentType?.name }} (100% W/H)</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Log de Execução Instantânea (0,01 ms na Memória RAM sem ir ao banco descobrir quem é o botão!) -->
          @if (lastDispatchTrace()) {
            <div class="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs">
              <div class="flex items-center justify-between font-bold text-emerald-400">
                <span>🚀 Despacho Instantâneo via Configuração Embarcada (0,01 ms RAM)</span>
                <span class="font-mono text-[10px]">ZERO consulta extra ao banco!</span>
              </div>
              <pre class="mt-1.5 max-h-36 overflow-auto rounded bg-neutral-950/80 p-2 font-mono text-[10px] text-emerald-300">{{ lastDispatchTrace() }}</pre>
            </div>
          }
        </div>

        <!-- COLUNA 3 (3 cols): INSPETOR DO OBJETO MPX* EMBARCADO & JSON RESOLVIDO DA CASCATA (0..5) -->
        <div class="flex flex-col gap-3 rounded-xl border border-neutral-a5 bg-neutral-a2 p-4 lg:col-span-3">
          @if (selectedScreenComponent(); as selComp) {
            <div class="border-b border-neutral-a5 pb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Objeto Registrado na Tela (MpxScreenComponent)
              </span>
              <h3 class="text-sm font-bold">{{ selComp.label }}</h3>
              <div class="mt-1 font-mono text-[10px] text-primary-a11">
                ID Banco: {{ selComp.id }}
              </div>
            </div>

            <div class="flex flex-col gap-1.5 text-xs">
              <div class="rounded-lg border border-neutral-a5 bg-neutral-a1 p-2.5">
                <div class="text-[11px] font-bold text-emerald-400">
                  🎒 Mochila Embarcada na Renderização (EmbeddedConfigJson):
                </div>
                <p class="mt-0.5 text-[10px] text-neutral-a11">
                  Quando este <code>&lt;{{ selComp.componentType?.tagName }}&gt;</code> é renderizado, ele já traz este JSON completo embarcado. No clique, o TypeScript lê direto daqui em 0,01ms:
                </p>
                <pre class="mt-2 max-h-60 overflow-auto rounded bg-neutral-950 p-2 font-mono text-[10px] text-amber-300">{{ selComp.embeddedConfigJson }}</pre>
              </div>
            </div>
          }

          <div class="border-t border-neutral-a5 pt-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Resultado Final da Cascata 0 ➔ 5
            </span>
            <h3 class="text-xs font-bold">
              JSON Efetivo Resolvido na Memória (EffectiveParameters)
            </h3>
            <p class="text-[10px] text-neutral-a11">
              Alimenta tanto os componentes visuais <code>Mpx*</code> quanto os 5 níveis de segurança do <code>Mpx.Jarbass</code>:
            </p>
            <pre class="mt-2 max-h-72 overflow-auto rounded-lg border border-neutral-a6 bg-neutral-950 p-2.5 font-mono text-[10px] text-emerald-400">{{ effectiveParametersPrettyJson() }}</pre>
          </div>

          @if (exportedJarbassJsonText()) {
            <div class="border-t border-neutral-a5 pt-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Arquivo Portátil Gerado (.mpxenv.json)
              </span>
              <pre class="mt-1 max-h-56 overflow-auto rounded-lg border border-amber-500/40 bg-neutral-950 p-2 font-mono text-[9px] text-amber-300">{{ exportedJarbassJsonText() }}</pre>
            </div>
          }
        </div>
      </div>
    } @else if (activeView() === 'studio') {
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

  protected readonly activeView = signal<'dashboard' | 'studio' | 'lego'>('studio');
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

  protected readonly parameterScopes = signal<StudioParameterScope[]>([]);
  protected readonly parameters = signal<StudioMpxParameter[]>([]);
  protected readonly effectiveParameters = signal<Record<string, any>>({});
  protected readonly componentTypes = signal<StudioComponentType[]>([]);
  protected readonly screenComponents = signal<StudioScreenComponent[]>([]);

  protected readonly selectedParameter = signal<StudioMpxParameter | null>(null);
  protected readonly selectedScreenComponent = signal<StudioScreenComponent | null>(null);
  protected readonly draggingComponentType = signal<StudioComponentType | null>(null);
  protected readonly activeDraggedScreenCompId = signal<string | null>(null);
  protected readonly isDroppableMagneticActive = signal<boolean>(false);
  protected readonly justLandedComponentId = signal<string | null>(null);
  protected readonly runningButtonId = signal<string | null>(null);
  protected readonly invalidFieldCode = signal<string | null>(null);
  protected readonly lastDispatchTrace = signal<string>('');
  protected readonly exportedJarbassJsonText = signal<string>('');
  protected readonly jarbassStatusMessage = signal<string>('');

  protected editParameterJsonText = '';
  protected previewLoginEmail = 'arquiteto@morphus.one';
  protected previewLoginPassword = '••••••••';

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

  protected readonly paletteComponentTypes = computed(() =>
    this.componentTypes().filter((c) => c.name !== 'MpxDraggable' && c.name !== 'MpxDroppable')
  );

  protected readonly childScreenComponents = computed(() =>
    this.screenComponents().filter((sc) => sc.componentType?.name !== 'MpxDroppable')
  );

  protected readonly effectiveParametersPrettyJson = computed(() =>
    JSON.stringify(this.effectiveParameters(), null, 2)
  );

  protected readonly liveGrabPaddingPx = computed(() => {
    const val = String(this.effectiveParameters()['mpx.draggable.grabPadding'] ?? '8px');
    return parseInt(val.replace('px', ''), 10) || 8;
  });

  protected readonly liveElevationTiltDeg = computed(() => {
    const val = String(this.effectiveParameters()['mpx.draggable.elevationTilt'] ?? '1.5deg');
    return parseFloat(val.replace('deg', '')) || 1.5;
  });

  protected readonly liveBorderRadiusPx = computed(() => {
    const val = String(this.effectiveParameters()['mpx.theme.borderRadius'] ?? '10px');
    return parseInt(val.replace('px', ''), 10) || 10;
  });

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
      } else if (view === 'lego') {
        this.activeView.set('lego');
      } else {
        this.activeView.set('studio');
      }
    });
    this.loadStudioBootstrap();
  }

  protected setView(view: 'dashboard' | 'studio' | 'lego'): void {
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

        this.parameterScopes.set(res.parameterScopes ?? []);
        const paramsList: StudioMpxParameter[] = res.parameters ?? [];
        this.parameters.set(paramsList);
        this.effectiveParameters.set(res.effectiveParameters ?? {});
        this.applyEffectiveParametersToGpuCssVariables(res.effectiveParameters ?? {});
        this.componentTypes.set(res.componentTypes ?? []);
        const comps: StudioScreenComponent[] = res.screenComponents ?? [];
        this.screenComponents.set(comps);

        if (!this.selectedParameter() && paramsList.length > 0) {
          const userParam = paramsList.find((p) => p.scopeCode === 4) ?? paramsList[0];
          this.selectParameterLayer(userParam);
        }

        if (!this.selectedScreenComponent() && comps.length > 0) {
          const submitBtn = comps.find((c) => c.componentCode === 'BTN_SIGNIN_SUBMIT') ?? comps[0];
          this.selectedScreenComponent.set(submitBtn);
        }

        if (preferredWorkflowId && wfs.some((w) => w.id === preferredWorkflowId)) {
          this.selectedWorkflowId.set(preferredWorkflowId);
        } else if (!this.selectedWorkflowId() && wfs.length > 0) {
          this.selectedWorkflowId.set(wfs[0].id);
        }
      },
    });
  }

  private applyEffectiveParametersToGpuCssVariables(eff: Record<string, any>): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--mpx-grab-padding', String(eff['mpx.draggable.grabPadding'] ?? '8px'));
    root.style.setProperty('--mpx-elevation-tilt', String(eff['mpx.draggable.elevationTilt'] ?? '1.5deg'));
    root.style.setProperty('--mpx-magnetic-glow', String(eff['mpx.droppable.magneticGlowColor'] ?? '#3b82f6'));
    root.style.setProperty('--mpx-border-radius', String(eff['mpx.theme.borderRadius'] ?? '10px'));
  }

  protected effectiveParamValue(key: string, fallback: string): string {
    const val = this.effectiveParameters()[key];
    return val !== undefined && val !== null ? String(val) : fallback;
  }

  protected effectiveParamBool(key: string, fallback: boolean): boolean {
    const val = this.effectiveParameters()[key];
    return typeof val === 'boolean' ? val : fallback;
  }

  protected selectParameterLayer(param: StudioMpxParameter): void {
    this.selectedParameter.set(param);
    this.editParameterJsonText = param.settingsJson;
  }

  protected updateLiveParameter(key: string, value: any): void {
    const currentEff = { ...this.effectiveParameters(), [key]: value };
    this.effectiveParameters.set(currentEff);
    this.applyEffectiveParametersToGpuCssVariables(currentEff);

    const sel = this.selectedParameter();
    if (sel) {
      try {
        const parsed = JSON.parse(this.editParameterJsonText || '{}');
        parsed[key] = value;
        this.editParameterJsonText = JSON.stringify(parsed, null, 2);
      } catch {
        // Mantém texto atual se estiver em edição parcial
      }
    }
  }

  protected saveParameterLayer(): void {
    const sel = this.selectedParameter();
    if (!sel) return;

    this.http
      .put<any>(`${this.apiBase}/parameters/${sel.id}`, {
        settingsJson: this.editParameterJsonText,
        name: sel.name,
        description: sel.description,
      })
      .subscribe({
        next: (res) => {
          if (res.effectiveParameters) {
            this.effectiveParameters.set(res.effectiveParameters);
            this.applyEffectiveParametersToGpuCssVariables(res.effectiveParameters);
          }
          this.jarbassStatusMessage.set(
            `Camada ${sel.scopeCode} (${sel.scope?.name}) salva e cascata 0..5 recalculada na GPU!`
          );
          this.loadStudioBootstrap(this.selectedWorkflowId());
        },
      });
  }

  protected exportPortableJarbassJson(): void {
    this.http.get<any>(`${this.apiBase}/parameters/export-jarbass`).subscribe({
      next: (envelope) => {
        this.exportedJarbassJsonText.set(JSON.stringify(envelope, null, 2));
        this.jarbassStatusMessage.set(
          'Pacote portátil .mpxenv.json exportado (Camadas 0 e 1 blindadas e excluídas pelo Mpx.Jarbass)!'
        );
      },
    });
  }

  protected importPortableJarbassJson(): void {
    const raw = this.exportedJarbassJsonText();
    let portableLayers: any[] = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        portableLayers = parsed.portableLayers ?? [];
      } catch {
        portableLayers = [];
      }
    }

    if (portableLayers.length === 0) {
      portableLayers = this.parameters()
        .filter((p) => p.scopeCode >= 2)
        .map((p) => ({
          scopeCode: p.scopeCode,
          namespace: p.namespace,
          name: p.name,
          machineKey: p.machineKey ?? 'MPX-HOME-WORKSTATION-NVME',
          settings: JSON.parse(p.settingsJson || '{}'),
        }));
    }

    this.http
      .post<any>(`${this.apiBase}/parameters/import-jarbass`, { portableLayers })
      .subscribe({
        next: (res) => {
          this.jarbassStatusMessage.set(
            res.message ?? 'Mpx.Jarbass importou seu ambiente portátil (2..5) com sucesso!'
          );
          if (res.effectiveParameters) {
            this.effectiveParameters.set(res.effectiveParameters);
            this.applyEffectiveParametersToGpuCssVariables(res.effectiveParameters);
          }
          this.loadStudioBootstrap(this.selectedWorkflowId());
        },
      });
  }

  protected onMpxDraggableStart(event: DragEvent, ct: StudioComponentType): void {
    this.draggingComponentType.set(ct);
    this.isDroppableMagneticActive.set(true);
    event.dataTransfer?.setData('text/plain', ct.id);
  }

  protected onMpxDraggableEnd(): void {
    this.draggingComponentType.set(null);
    this.isDroppableMagneticActive.set(false);
  }

  protected onExistingComponentDragStart(sc: StudioScreenComponent): void {
    this.activeDraggedScreenCompId.set(sc.id);
    this.isDroppableMagneticActive.set(true);
  }

  protected onExistingComponentDragEnd(): void {
    this.activeDraggedScreenCompId.set(null);
    this.isDroppableMagneticActive.set(false);
  }

  protected onMpxDroppableOver(event: DragEvent): void {
    event.preventDefault();
    this.isDroppableMagneticActive.set(true);
  }

  protected onMpxDroppableLeave(): void {
    this.isDroppableMagneticActive.set(false);
  }

  protected onMpxDroppableDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDroppableMagneticActive.set(false);

    const ct = this.draggingComponentType();
    this.draggingComponentType.set(null);
    if (!ct) return;

    const wf = this.selectedWorkflow() ?? this.workflowTypes()[0];
    const screenCfg = wf?.configs.find((c) => c.station?.code === 'Screen') ?? wf?.configs[0];
    const parentDrop = this.screenComponents().find((sc) => sc.componentType?.name === 'MpxDroppable');

    this.http
      .post<StudioScreenComponent>(`${this.apiBase}/screen-components`, {
        componentTypeId: ct.id,
        parentComponentId: parentDrop?.id ?? null,
        routeId: wf?.triggerRouteId ?? null,
        workflowTypeId: wf?.id ?? null,
        workflowConfigId: screenCfg?.id ?? null,
        workflowActionId: screenCfg?.actions?.[0]?.id ?? null,
        label: `${ct.label} #${this.screenComponents().length + 1}`,
        triggerEvent: ct.supportsWorkflowAction ? 'OnClick' : 'OnInput',
      })
      .subscribe({
        next: (created) => {
          // Lei de UX #4: Item novo aparece dando a piscadinha suave (LandingPulse) sem popup na cara!
          this.screenComponents.update((list) => [created, ...list]);
          this.selectedScreenComponent.set(created);
          this.justLandedComponentId.set(created.id);
          const pulseMs = Number(this.effectiveParameters()['mpx.ux.inlineCreateBlinkDurationMs'] ?? 1200);
          setTimeout(() => this.justLandedComponentId.set(null), pulseMs);
        },
      });
  }

  protected inspectScreenComponent(sc: StudioScreenComponent): void {
    this.selectedScreenComponent.set(sc);
  }

  protected dispatchEmbeddedMpxButton(event: MouseEvent, sc: StudioScreenComponent): void {
    event.stopPropagation();
    this.selectedScreenComponent.set(sc);
    this.invalidFieldCode.set(null);

    const t0 = performance.now();
    let embedded: any = {};
    try {
      embedded = JSON.parse(sc.embeddedConfigJson || '{}');
    } catch {
      embedded = {};
    }

    // 1. Validação local em 0,05ms lendo o EmbeddedConfigJson na memória RAM (ZERO consulta ao banco!)
    const reqFields: string[] = embedded.requiredContextFields ?? [];
    if (reqFields.includes('CurrentUser.Email') && !this.previewLoginEmail.trim()) {
      this.invalidFieldCode.set('INP_SIGNIN_EMAIL');
      this.lastDispatchTrace.set(
        `[0,04 ms RAM] Validação Embarcada bloqueou envio: CurrentUser.Email é obrigatório (ZERO ida ao banco!).`
      );
      return;
    }
    if (reqFields.includes('CurrentUser.Password') && this.previewLoginPassword.trim().length < 6) {
      this.invalidFieldCode.set('INP_SIGNIN_PASSWORD');
      this.lastDispatchTrace.set(
        `[0,05 ms RAM] Validação Embarcada bloqueou envio: CurrentUser.Password exige minLength=6 (ZERO ida ao banco!).`
      );
      return;
    }

    const elapsedRamMs = (performance.now() - t0).toFixed(3);
    this.runningButtonId.set(sc.id);

    const traceObj = {
      dispatchedInRamMs: `${elapsedRamMs} ms`,
      componentId: sc.id,
      componentCode: sc.componentCode,
      workflowType: embedded.workflowType ?? 'SignIn',
      actionCode: embedded.actionCode ?? 'SubmitSignIn',
      nextStation: embedded.nextStationName ?? 'SecurityHandler.Login (Process)',
      buttonBehaviorFromMpxParameter: {
        disableOnClick: this.effectiveParamBool('mpx.button.disableOnClick', true),
        showSpinner: this.effectiveParamBool('mpx.button.showSpinner', true),
      },
      contextPayloadSent: {
        'CurrentUser.Email': this.previewLoginEmail,
        'CurrentUser.Password': '*** (Sealed)',
      },
    };

    this.lastDispatchTrace.set(JSON.stringify(traceObj, null, 2));

    setTimeout(() => {
      this.runningButtonId.set(null);
    }, 900);
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
