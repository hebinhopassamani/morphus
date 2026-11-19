import { Injectable } from '@angular/core';
import { MpxFilterService } from '@core/morphus';
import { CorporationReflected } from '../entities/corporation';

@Injectable({
  providedIn: 'root',
})
export class CorporationFilterService extends MpxFilterService<CorporationReflected> {
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
