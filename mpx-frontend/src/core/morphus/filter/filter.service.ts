import { Injectable, signal } from '@angular/core';
import { MpxDefaultFilterColumn } from '../default/filter-column.default';
import { MpxEntity, MpxRelatedEntity } from '@core/morphus';
import {
  MpxAndOrCondicionalType,
  MpxDataBaseType,
  MpxFilterColumnType,
  MpxFilterOperatorType,
} from '@core/morphus';
import { MpxFilter } from './filter.model';
import { MpxFilterBuilder } from './filter.builder';
import { MpxFilterColumn } from './filter-column.model';
import { MpxFilterParameter } from './filter-parameter.model';
import { MpxFilterRow } from './filter-row.model';

@Injectable({
  providedIn: 'root',
})
export class MpxFilterService<
  T extends MpxEntity | MpxRelatedEntity | object = MpxEntity,
> {
  private readonly manualFilterRows = signal<MpxFilterRow[]>([]);

  public readonly filterColumns = signal<MpxFilterColumn[]>([{ ...MpxDefaultFilterColumn }]);
  public readonly filterRows = signal<MpxFilterRow[]>([
    MpxFilterBuilder.createNewFilterRow(),
  ]);
  public readonly filterOpened = signal<boolean>(false);
  public readonly filter = signal<MpxFilter>({
    whereClause: '',
    parameters: [],
  });

  public readonly hasFilter = signal<boolean>(false);

  constructor() {
    this.configFilter();
  }

  public configFilter(): void {}

  public clearFilter(): void {
    this.filterRows.set([MpxFilterBuilder.createNewFilterRow()]);
    this.filter.set({ whereClause: '', parameters: [] });
    this.hasFilter.set(false);
  }

  public addFilterRow(): void {
    this.filterRows.update((rows) => [
      ...rows,
      MpxFilterBuilder.createNewFilterRow(),
    ]);
  }

  public removeFilterRow(rowToRemove: MpxFilterRow): boolean {
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

  public addAFilterColumn(filterColumn: MpxFilterColumn): MpxFilterBuilder {
    const existing = this.filterColumns().find((f) => f.name === filterColumn.name);
    if (!existing) {
      this.filterColumns.update((cols) => [...cols, filterColumn]);
    }
    return new MpxFilterBuilder(filterColumn);
  }

  public addAttribute(
    name: keyof T & string,
    label: string,
    dataType: MpxFilterColumnType,
  ): MpxFilterBuilder {
    const newColumn: MpxFilterColumn = {
      name: String(name),
      label,
      dataType,
    };

    const existing = this.filterColumns().find((f) => f.name === String(name));
    if (!existing) {
      this.filterColumns.update((cols) => [...cols, newColumn]);
    }

    return new MpxFilterBuilder(newColumn);
  }

  public addFilter(
    name: keyof T & string,
    operator: MpxFilterOperatorType,
    value: unknown,
    dataType: MpxFilterColumnType,
    andOr: MpxAndOrCondicionalType = 'And',
  ): void {
    const currentManual = [...this.manualFilterRows()];
    const existing = currentManual.find((f) => f.column.name === String(name));

    if (!existing) {
      const newRow: MpxFilterRow = {
        id: MpxFilterBuilder.createNewFilterRow().id,
        openParenthesis: true,
        column: {
          name: String(name),
          label: String(name),
          dataType,
        },
        value,
        operator: MpxFilterBuilder.getOperatorByOperatorType(operator),
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
    const parameters: MpxFilterParameter[] = [];

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

  private nextParameter(name: string, parameters: MpxFilterParameter[]): string {
    let count = 1;
    let candidate = `${name}${count}`;
    while (parameters.some((p) => p.label === candidate)) {
      count += 1;
      candidate = `${name}${count}`;
    }
    return candidate;
  }

  private getDatabaseType(column: MpxFilterColumn): MpxDataBaseType {
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
