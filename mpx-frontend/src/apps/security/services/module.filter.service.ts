import { Injectable } from '@angular/core';
import { MorphusFilterService } from '@core/mpx-filter';
import { IModuleReflected } from '../entities/module';

@Injectable({
  providedIn: 'root',
})
export class ModuleFilterService extends MorphusFilterService<IModuleReflected> {
  public override configFilter(): void {
    this.addAttribute('name', 'Nome', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH')
      .addOperator('START_WITH')
      .addOperator('END_WITH');

    this.addAttribute('key', 'Chave única', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH');

    this.addAttribute('description', 'Descrição', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH');

    this.addAttribute('system', 'Sistema', 'boolean')
      .addOperator('EQUAL');
  }
}
