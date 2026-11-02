import { Component, Input, input, OnChanges, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import {
  andOrOptions,
  AndOrCondicionalType,
  DefaultFilterColumn,
  DefaultFilterOperator,
  DefaultFilterRow,
  FilterColumn,
  FilterOperator,
  FilterRow,
  OptionSelectEvent,
} from '@core/mpx-filter';

@Component({
  selector: 'mpx-filter-attribute',
  exportAs: 'mpxFilterAttribute',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatSelect,
    MatOption,
    MatSlideToggle,
    MatTooltip,
  ],
  styleUrl: './filter-attribute.component.css',
  templateUrl: './filter-attribute.component.html',
})
export class MpxFilterAttributeComponent implements OnInit, OnChanges {
  public readonly columns = input<FilterColumn[]>([]);

  @Input({ required: true })
  public filterRow: FilterRow = {
    ...DefaultFilterRow,
    column: { ...DefaultFilterColumn },
    operator: { ...DefaultFilterOperator },
  };

  public readonly onNewFilterRow = output<FilterRow>();
  public readonly onDeleteFilterRow = output<FilterRow>();
  public readonly onOptionListSelected = output<OptionSelectEvent>();

  protected readonly andOrOptions = andOrOptions;
  protected readonly rowInvalid = signal<boolean>(true);
  protected selectedOptionItem: Record<string, unknown> | null = null;

  ngOnInit(): void {
    this.syncRowState();
  }

  ngOnChanges(): void {
    this.syncRowState();
  }

  protected readonly compareColumns = (a?: FilterColumn, b?: FilterColumn): boolean =>
    a?.name === b?.name;

  protected readonly compareOperators = (a?: FilterOperator, b?: FilterOperator): boolean =>
    a?.key === b?.key && a?.label === b?.label;

  protected readonly compareOptions = (
    a?: Record<string, unknown> | null,
    b?: Record<string, unknown> | null,
  ): boolean => {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    const valueKey = this.filterRow?.column?.optionsValue ?? 'id';
    if (a[valueKey] !== undefined && b[valueKey] !== undefined) {
      return a[valueKey] === b[valueKey];
    }
    return false;
  };

  protected onColumnSelected(column: FilterColumn): void {
    this.filterRow.column = column;
    this.filterRow.operator = { ...DefaultFilterOperator };
    this.selectedOptionItem = (column?.optionsDefault as Record<string, unknown>) ?? null;
    this.filterRow.value = column?.dataType === 'boolean' ? false : undefined;
    this.validateRow();
  }

  protected onOperatorSelected(operator: FilterOperator): void {
    this.filterRow.operator = operator;
    this.validateRow();
  }

  protected onValueChange(newValue: unknown): void {
    this.filterRow.value = newValue;
    this.validateRow();
  }

  protected onOptionSelect(selectedItem: Record<string, unknown> | null): void {
    this.selectedOptionItem = selectedItem;
    const col = this.filterRow.column;
    const valueKey = col.optionsValue ?? 'id';
    this.filterRow.value = selectedItem ? selectedItem[valueKey] : undefined;

    const relatedColumn = col.optionsRelatedColumn
      ? this.columns().find((f) => f.name === col.optionsRelatedColumn)
      : undefined;

    this.validateRow();
    this.onOptionListSelected.emit({
      value: selectedItem,
      column: relatedColumn,
    });
  }

  protected onAndOrSelected(andOrValue: AndOrCondicionalType | undefined): void {
    this.filterRow.andOr = andOrValue;
    if (andOrValue && !this.rowInvalid()) {
      this.onNewFilterRow.emit(this.filterRow);
    } else if (!andOrValue) {
      this.onDeleteFilterRow.emit(this.filterRow);
    }
  }

  protected toggleOpenParenthesis(): void {
    this.filterRow.openParenthesis = !this.filterRow.openParenthesis;
  }

  protected toggleCloseParenthesis(): void {
    this.filterRow.closeParenthesis = !this.filterRow.closeParenthesis;
  }

  protected deleteRowClick(): void {
    this.onDeleteFilterRow.emit(this.filterRow);
  }

  protected getOptionLabel(item: Record<string, unknown>): string {
    const labelKey = this.filterRow.column?.optionsLabel ?? 'name';
    return String(item?.[labelKey] ?? '');
  }

  private syncRowState(): void {
    if (this.filterRow?.column?.dataType === 'select_list') {
      const valueKey = this.filterRow.column.optionsValue ?? 'id';
      const list = this.filterRow.column.optionsList ?? [];
      const found = list.find((item) => item?.[valueKey] === this.filterRow.value);
      this.selectedOptionItem =
        found ?? (this.filterRow.column.optionsDefault as Record<string, unknown>) ?? null;
    }
    this.validateRow();
  }

  private validateRow(): void {
    const isInvalid =
      !this.filterRow.column?.name ||
      !this.filterRow.operator?.value ||
      this.filterRow.value === '' ||
      this.filterRow.value === undefined ||
      this.filterRow.value === null;

    this.rowInvalid.set(isInvalid);
  }
}
