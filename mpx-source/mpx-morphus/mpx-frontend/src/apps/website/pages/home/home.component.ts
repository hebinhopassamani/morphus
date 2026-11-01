import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'web-home',
  imports: [MatButton, RouterLink],
  host: { class: 'flex flex-auto flex-col gap-y-12 py-10 text-neutral-12 [&_h2]:text-2xl [&_h2]:font-semibold' },
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly features = [
    { title: 'Acessos e permissões', description: 'Usuários, perfis e permissões definidos por organização e filial.' },
    { title: 'Cadastros', description: 'Categorias de produtos, produtos, contas bancárias, contas caixa e naturezas de operação.' },
    { title: 'Entrada de notas fiscais', description: 'Lançamento manual ou importação automática das notas de compra.' },
    { title: 'Contas a pagar e a receber', description: 'Controle de vencimentos, pagamentos e recebimentos.' },
    { title: 'Integração bancária', description: 'Troca de arquivos CNAB de remessa e retorno com os bancos.' },
    { title: 'Fluxo de caixa', description: 'Visão clara das entradas e saídas, realizadas e previstas.' },
    { title: 'Frotas', description: 'Controle dos veículos da empresa e da sua depreciação.' },
    { title: 'Patrimônio', description: 'Registro dos bens da organização e cálculo da depreciação.' },
  ];
}
