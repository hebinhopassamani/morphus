import { Injectable, signal } from '@angular/core';
import { IMorphusEntity, IMorphusRelatedEntity } from '@core/mpx-entities';
import { DefaultFilterColumn } from './filter-column.default';
import { FilterColumn } from './filter-column.interface';
import {
  AndOrCondicionalType,
  DataBaseType,
  FilterColumnType,
  MFILTER_OPERATOR_TYPE,
} from '@core/mpx-types';
import { FilterParameter } from './filter-parameter.interface';
import { FilterRow } from './filter-row.interface';
import { MorphusFilterBuilder } from './morphus-filter.builder';
import { MorphusFilter } from './morphus.filter';

@Injectable({
  providedIn: 'root',
})
export class MorphusFilterService<
  T extends IMorphusEntity | IMorphusRelatedEntity | object = IMorphusEntity,
> {
  private readonly manualFilterRows = signal<FilterRow[]>([]);

  public readonly filterColumns = signal<FilterColumn[]>([{ ...DefaultFilterColumn }]);
  public readonly filterRows = signal<FilterRow[]>([
    MorphusFilterBuilder.createNewFilterRow(),
  ]);
  public readonly filterOpened = signal<boolean>(false);
  public readonly filter = signal<MorphusFilter>({
    whereClause: '',
    parameters: [],
  });

  public readonly hasFilter = signal<boolean>(false);

  constructor() {
    this.configFilter();
  }

  public configFilter(): void {}

  public clearFilter(): void {
    this.filterRows.set([MorphusFilterBuilder.createNewFilterRow()]);
    this.filter.set({ whereClause: '', parameters: [] });
    this.hasFilter.set(false);
  }

  public addFilterRow(): void {
    this.filterRows.update((rows) => [
      ...rows,
      MorphusFilterBuilder.createNewFilterRow(),
    ]);
  }

  public removeFilterRow(rowToRemove: FilterRow): boolean {
    const current = this.filterRows();
    if (current.length <= 1) {
      return false;
    }
    const updated = current.filter((r) => r.id !== rowToRemove.id);
    if (updated.length > 0) {
      const lastIdx = updated.length - 1;
      updated[lastIdx] = {
        ...updated[lastIdx],
        andOr: undefined,
      };
    }
    this.filterRows.set(updated);
    return true;
  }

  public addAFilterColumn(filterColumn: FilterColumn): MorphusFilterBuilder {
    const existing = this.filterColumns().find((f) => f.name === filterColumn.name);
    if (!existing) {
      this.filterColumns.update((cols) => [...cols, filterColumn]);
    }
    return new MorphusFilterBuilder(filterColumn);
  }

  public addAttribute(
    name: keyof T & string,
    label: string,
    dataType: FilterColumnType,
  ): MorphusFilterBuilder {
    const newColumn: FilterColumn = {
      name: String(name),
      label,
      dataType,
    };

    const existing = this.filterColumns().find((f) => f.name === String(name));
    if (!existing) {
      this.filterColumns.update((cols) => [...cols, newColumn]);
    }

    return new MorphusFilterBuilder(newColumn);
  }

  public addFilter(
    name: keyof T & string,
    operator: MFILTER_OPERATOR_TYPE,
    value: unknown,
    dataType: FilterColumnType,
    andOr: AndOrCondicionalType = 'And',
  ): void {
    const currentManual = [...this.manualFilterRows()];
    const existing = currentManual.find((f) => f.column.name === String(name));

    if (!existing) {
      const newRow: FilterRow = {
        id: MorphusFilterBuilder.createNewFilterRow().id,
        openParenthesis: true,
        column: {
          name: String(name),
          label: String(name),
          dataType,
        },
        value,
        operator: MorphusFilterBuilder.getOperatorByOperatorType(operator),
        closeParenthesis: true,
        andOr,
      };
      currentManual.push(newRow);
    } else {
      existing.value = value;
    }

    this.manualFilterRows.set(currentManual);
    this.buildFilter();
  }

  public setFilterValue(name: keyof T & string, value: unknown): boolean {
    const currentManual = [...this.manualFilterRows()];
    const existing = currentManual.find((f) => f.column.name === String(name));

    if (existing) {
      existing.value = value;
      this.manualFilterRows.set(currentManual);
      this.buildFilter();
    }
    return true;
  }

  public buildFilter(): void {
    let where = '';
    const parameters: FilterParameter[] = [];

    const validRows = [...this.filterRows(), ...this.manualFilterRows()].filter(
      (f) =>
        f.value !== undefined &&
        f.value !== '' &&
        f.column?.name !== undefined &&
        f.operator?.value !== undefined,
    );

    validRows.forEach((row, idx) => {
      const colName = row.column.name!;
      const nextParam = this.nextParameter(colName, parameters);
      const dbType = this.getDatabaseType(row.column);

      switch (row.operator.key) {
        case 'LIKE_WITH':
          parameters.push({
            label: nextParam,
            value: `%${row.value}%`,
            dataType: dbType,
          });
          break;
        case 'START_WITH':
          parameters.push({
            label: nextParam,
            value: `${row.value}%`,
            dataType: dbType,
          });
          break;
        case 'END_WITH':
          parameters.push({
            label: nextParam,
            value: `%${row.value}`,
            dataType: dbType,
          });
          break;
        default:
          parameters.push({
            label: nextParam,
            value: row.value,
            dataType: dbType,
          });
          break;
      }

      const openP = row.openParenthesis ? '(' : '';
      const closeP = row.closeParenthesis ? ')' : '';
      const quotedCol = `"${colName.charAt(0).toUpperCase()}${colName.slice(1)}"`;
      const condition = `${openP}${quotedCol} ${row.operator.value} @${nextParam}${closeP}`;

      if (idx >= validRows.length - 1) {
        where += condition;
      } else {
        where += `${condition} ${row.andOr ?? 'And'} `;
      }
    });

    this.filter.set({
      whereClause: where,
      parameters,
    });
    this.hasFilter.set(parameters.length > 0);
  }

  public openFilter(): void {
    this.filterOpened.set(true);
  }

  public closeFilter(): void {
    this.filterOpened.set(false);
  }

  private nextParameter(name: string, parameters: FilterParameter[]): string {
    let count = 1;
    let candidate = `${name}${count}`;
    while (parameters.some((p) => p.label === candidate)) {
      count += 1;
      candidate = `${name}${count}`;
    }
    return candidate;
  }

  private getDatabaseType(column: FilterColumn): DataBaseType {
    switch (column.dataType) {
      case 'guid':
        return 'guid';
      case 'int':
        return 'int';
      case 'boolean':
        return 'boolean';
      case 'decimal':
        return 'decimal';
      case 'date':
        return 'date';
      case 'datetime':
        return 'datetime';
      case 'select_list':
        return column.optionsDataBaseType ?? 'text';
      case 'text':
      case 'email':
      case 'cpf':
      case 'cnpj':
      default:
        return 'text';
    }
  }
}
