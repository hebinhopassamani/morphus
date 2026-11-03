import { Injectable } from '@angular/core';
import { MorphusFilterService } from '@core/mpx-filter';
import { IWorkspaceReflected } from '@morphus/entities/workspace';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceFilterService extends MorphusFilterService<IWorkspaceReflected> {
  public override configFilter(): void {
    this.addAttribute('name', 'Nome do Workspace', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH')
      .addOperator('START_WITH')
      .addOperator('END_WITH');

    this.addAttribute('key', 'Chave Única (Key)', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH');

    this.addAttribute('description', 'Descrição', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH');
  }
}
