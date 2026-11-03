import { Injectable } from '@angular/core';
import { MorphusFilterService } from '@core/mpx-filter';
import { ICorporationReflected } from '../entities/corporation';

@Injectable({
  providedIn: 'root',
})
export class CorporationFilterService extends MorphusFilterService<ICorporationReflected> {
  public override configFilter(): void {
    this.addAttribute('name', 'Nome Fantasia', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH')
      .addOperator('START_WITH')
      .addOperator('END_WITH');

    this.addAttribute('fullName', 'Razão Social / Nome Completo', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH')
      .addOperator('START_WITH')
      .addOperator('END_WITH');

    this.addAttribute('cpfCnpj', 'CPF / CNPJ', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH')
      .addOperator('START_WITH');

    this.addAttribute('personType', 'Tipo de Pessoa (PJ/PF)', 'text')
      .addOperator('EQUAL');

    this.addAttribute('key', 'Chave Única (Key)', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH');

    this.addAttribute('email', 'E-mail', 'email')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH');

    this.addAttribute('description', 'Descrição', 'text')
      .addOperator('EQUAL')
      .addOperator('LIKE_WITH');
  }
}
