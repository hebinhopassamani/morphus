import { Component, inject, input, output } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogClose,
  BuiDialogContent,
  BuiDialogDescription,
  BuiDialogFooter,
  BuiDialogHeader,
  BuiDialogPortal,
  BuiDialogTitle,
} from '@builder-kit/dialog';
import { IMorphusEntity, IMorphusRelatedEntity } from '@core/mpx-entities';
import {
  FilterRow,
  MorphusFilterService,
  OptionSelectEvent,
} from '@core/mpx-filter';
import { MorphusMessageService } from '@core/mpx-message';
import { MpxFilterAttributeComponent } from './filter-attribute/filter-attribute.component';

@Component({
  selector: 'mpx-filter',
  exportAs: 'mpxFilter',
  standalone: true,
  imports: [
    MatButton,
    MatIconButton,
    MatDivider,
    MatIcon,
    MatTooltip,
    BuiDialog,
    BuiDialogBackdrop,
    BuiDialogBody,
    BuiDialogClose,
    BuiDialogContent,
    BuiDialogDescription,
    BuiDialogFooter,
    BuiDialogHeader,
    BuiDialogPortal,
    BuiDialogTitle,
    MpxFilterAttributeComponent,
  ],
  styleUrl: './filter.component.css',
  templateUrl: './filter.component.html',
})
export class MpxFilterComponent<
  T extends IMorphusEntity | IMorphusRelatedEntity | object = IMorphusEntity,
> {
  private readonly messageService = inject(MorphusMessageService);

  /** Instância do serviço de filtro da entidade */
  public readonly filterService = input.required<MorphusFilterService<T>>();

  /** Título do modal de filtro */
  public readonly title = input<string>('Filtro');

  /** Subtítulo explicativo do modal */
  public readonly subtitle = input<string>(
    'Monte as condições abaixo para filtrar os registros.',
  );

  public readonly onFilter = output<void>();
  public readonly onFilterClose = output<void>();
  public readonly onFilterClean = output<void>();
  public readonly onOptionSelected = output<OptionSelectEvent>();

  protected onNewFilterRow(row: FilterRow): void {
    const service = this.filterService();
    const rows = service.filterRows();
    const idx = rows.indexOf(row);

    if (idx === rows.length - 1) {
      service.addFilterRow();
    }
  }

  protected onDeleteFilterRow(row: FilterRow): void {
    const service = this.filterService();
    const removed = service.removeFilterRow(row);
    if (!removed) {
      this.messageService.showWarn(
        'Você não pode excluir a única linha do filtro.',
        'Impossível excluir a linha',
      );
    }
  }

  protected optionSelected(optionEvent: OptionSelectEvent): void {
    this.onOptionSelected.emit(optionEvent);
  }

  protected closeClick(): void {
    const service = this.filterService();
    service.buildFilter();
    this.onFilterClose.emit();
    service.closeFilter();
  }

  protected cleanClick(): void {
    const service = this.filterService();
    service.clearFilter();
    this.onFilterClean.emit();
    service.closeFilter();
  }

  protected filterClick(): void {
    const service = this.filterService();
    service.buildFilter();
    this.onFilter.emit();
    service.closeFilter();
  }
}
