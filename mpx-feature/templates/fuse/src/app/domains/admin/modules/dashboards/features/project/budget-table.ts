import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { afterNextRender, Component, inject, viewChild } from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  BudgetItem,
  ProjectDashboardService,
} from '@/app/domains/admin/modules/dashboards/data/project';

@Component({
  selector: 'project-budget-table',
  imports: [MatTableModule, MatSortModule, CurrencyPipe, DecimalPipe],
  template: `
    <div class="flex flex-col">
      <div class="relative isolate overflow-x-visible overflow-y-hidden">
        <table
          class="-mt-px whitespace-nowrap [--table-cell-padding-x:calc(var(--spacing)*3)]"
          mat-table
          [dataSource]="dataSource"
          [trackBy]="trackBy"
          matSort
          matSortActive="total"
          matSortDirection="desc"
        >
          <!-- Type column -->
          <ng-container matColumnDef="type">
            <th
              class="w-3/10"
              mat-header-cell
              *matHeaderCellDef
              mat-sort-header
            >
              Type
            </th>
            <td
              mat-cell
              *matCellDef="let row"
            >
              {{ row.type }}
            </td>
          </ng-container>

          <!-- Total column -->
          <ng-container matColumnDef="total">
            <th
              mat-header-cell
              *matHeaderCellDef
              mat-sort-header
            >
              Total
            </th>
            <td
              mat-cell
              *matCellDef="let row"
            >
              <span class="tabular-nums">
                {{ row.total | currency: 'USD' : 'symbol' : '1.0-0' }}
              </span>
            </td>
          </ng-container>

          <!-- Expenses amount column -->
          <ng-container matColumnDef="expensesAmount">
            <th
              mat-header-cell
              *matHeaderCellDef
              mat-sort-header
            >
              Expenses ($)
            </th>
            <td
              mat-cell
              *matCellDef="let row"
            >
              <span class="tabular-nums">
                {{ row.expensesAmount | currency: 'USD' : 'symbol' : '1.0-0' }}
              </span>
            </td>
          </ng-container>

          <!-- Expenses percentage column -->
          <ng-container matColumnDef="expensesPercentage">
            <th
              mat-header-cell
              *matHeaderCellDef
              mat-sort-header
            >
              Expenses (%)
            </th>
            <td
              mat-cell
              *matCellDef="let row"
            >
              <span class="tabular-nums">
                {{ row.expensesPercentage | number: '1.1-1' }}%
              </span>
            </td>
          </ng-container>

          <!-- Remaining amount column -->
          <ng-container matColumnDef="remainingAmount">
            <th
              mat-header-cell
              *matHeaderCellDef
              mat-sort-header
            >
              Remaining ($)
            </th>
            <td
              mat-cell
              *matCellDef="let row"
            >
              <span class="tabular-nums">
                {{ row.remainingAmount | currency: 'USD' : 'symbol' : '1.0-0' }}
              </span>
            </td>
          </ng-container>

          <!-- Remaining percentage column -->
          <ng-container matColumnDef="remainingPercentage">
            <th
              mat-header-cell
              *matHeaderCellDef
              mat-sort-header
            >
              Remaining (%)
            </th>
            <td
              mat-cell
              *matCellDef="let row"
            >
              <span class="tabular-nums">
                {{ row.remainingPercentage | number: '1.1-1' }}%
              </span>
            </td>
          </ng-container>

          <!-- Header row definition -->
          <tr
            mat-header-row
            *matHeaderRowDef="[
              'type',
              'total',
              'expensesAmount',
              'expensesPercentage',
              'remainingAmount',
              'remainingPercentage',
            ]"
          ></tr>

          <!-- Row definition -->
          <tr
            class="group relative hover:bg-neutral-a2"
            mat-row
            *matRowDef="
              let row;
              columns: [
                'type',
                'total',
                'expensesAmount',
                'expensesPercentage',
                'remainingAmount',
                'remainingPercentage',
              ]
            "
          ></tr>
        </table>
      </div>
    </div>
  `,
})
export class ProjectBudgetTable {
  // Dependencies
  private projectDashboardService = inject(ProjectDashboardService);

  // Queries
  readonly sort = viewChild(MatSort);

  // State
  private data = this.projectDashboardService.data;
  private dataSource = new MatTableDataSource(this.data.budget);

  constructor() {
    afterNextRender(() => {
      this.dataSource.sort = this.sort() ?? null;
    });
  }

  private trackBy(_: number, item: BudgetItem) {
    return item.id;
  }
}
