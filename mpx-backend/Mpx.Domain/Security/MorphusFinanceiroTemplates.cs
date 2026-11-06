namespace Mpx.Domain.Security;

public static class MorphusFinanceiroTemplates
{
  public static (string RoutePattern, bool IsDefault, string Html) ResolveForSubModule(string name, string? label, string? description)
  {
    var cleanName = (name ?? label ?? string.Empty).Trim();
    var lower = cleanName.ToLowerInvariant();

    if (lower.Contains("dashboard") || lower.Contains("visão geral") || lower.Contains("visao geral"))
    {
      return ("dashboard", true, DashboardHtml);
    }

    if (lower.Contains("xml") || lower.Contains("importa"))
    {
      return ("importacao-de-xml", false, ImportacaoXmlHtml);
    }

    if (lower.Contains("natureza") || lower.Contains("tributo"))
    {
      return ("natureza-de-operacao-e-tributos", false, NaturezaTributosHtml);
    }

    if (lower.Contains("título") || lower.Contains("titulo") || lower.Contains("parcela"))
    {
      return ("titulos-e-parcelas", false, TitulosParcelasHtml);
    }

    if (lower.Contains("aprova"))
    {
      return ("aprovacao-de-pagamentos", false, AprovacaoPagamentosHtml);
    }

    if (lower.Contains("baixa") && (lower.Contains("juro") || lower.Contains("multa")))
    {
      return ("baixas-juros-e-multas", false, BaixasJurosMultasHtml);
    }

    if (lower.Contains("faturamento") || lower.Contains("cobran"))
    {
      return ("faturamento-e-cobrancas", false, FaturamentoCobrancasHtml);
    }

    if (lower.Contains("recebimento"))
    {
      return ("recebimentos-e-baixas", false, RecebimentosBaixasHtml);
    }

    if (lower.Contains("cnab") || lower.Contains("remessa"))
    {
      return ("remessa-e-retorno-cnab", false, RemessaRetornoCnabHtml);
    }

    if (lower.Contains("fluxo") || lower.Contains("caixa"))
    {
      return ("fluxo-de-caixa", false, FluxoCaixaHtml);
    }

    var fallbackSlug = cleanName
        .ToLowerInvariant()
        .Replace("á", "a").Replace("à", "a").Replace("ã", "a").Replace("â", "a")
        .Replace("é", "e").Replace("ê", "e")
        .Replace("í", "i")
        .Replace("ó", "o").Replace("ô", "o").Replace("õ", "o")
        .Replace("ú", "u").Replace("ç", "c")
        .Replace(",", "")
        .Replace(" ", "-");

    return (
      string.IsNullOrWhiteSpace(fallbackSlug) ? "pagina" : fallbackSlug,
      false,
      $"<div class=\"rounded-3xl border border-neutral-a4 bg-neutral-1 p-8 shadow-sm\"><h1 class=\"text-xl font-bold text-neutral-12\">{label ?? cleanName}</h1><p class=\"mt-2 text-sm text-neutral-a11\">{description}</p></div>"
    );
  }

  public const string DashboardHtml = """
<div class="flex flex-col gap-6">
  <!-- Cabeçalho Operacional do Morphus Financeiro -->
  <div class="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-jade-a5 bg-gradient-to-r from-jade-a2 via-neutral-1 to-neutral-1 p-6 shadow-xs">
    <div>
      <div class="inline-flex items-center gap-2 rounded-full border border-jade-a5 bg-jade-a3 px-3 py-1 text-xs font-semibold text-jade-a11">
        <span class="size-2 rounded-full bg-jade-9"></span>
        Robô SEFAZ DFe Ativo · Certificado A1 Válido · Último NSU #000000000148920
      </div>
      <h1 class="mt-3 text-2xl font-bold tracking-tight text-neutral-12">
        Visão Geral — Morphus Financeiro &amp; Fiscal
      </h1>
      <p class="mt-1 text-sm text-neutral-a11">
        Acompanhamento em tempo real da captura automática de NF-e na SEFAZ, entrada de notas e compromissos do Contas a Pagar.
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2.5">
      <a href="/app/FIN/importacao-de-xml" class="inline-flex items-center gap-2 rounded-xl border border-neutral-a5 bg-neutral-1 px-4 py-2.5 text-xs font-semibold text-neutral-12 shadow-2xs transition hover:bg-neutral-a3">
        Sincronizar SEFAZ / Importar XML
      </a>
      <a href="/app/FIN/titulos-e-parcelas" class="inline-flex items-center gap-2 rounded-xl bg-primary-9 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-primary-10">
        Ver Contas a Pagar
      </a>
    </div>
  </div>

  <!-- 4 KPIs Executivos -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5 shadow-2xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-neutral-a10">Total a Pagar (Mês)</span>
        <span class="rounded-md bg-amber-a3 px-2 py-0.5 text-[11px] font-semibold text-amber-a11">28 títulos</span>
      </div>
      <div class="mt-3 text-2xl font-bold text-neutral-12">R$ 184.920,00</div>
      <p class="mt-1 text-xs text-neutral-a11">R$ 62.400,00 já liquidados neste mês</p>
    </div>

    <div class="rounded-2xl border border-red-a5 bg-red-a2/30 p-5 shadow-2xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-red-a11">Vencendo Hoje</span>
        <span class="rounded-md bg-red-a3 px-2 py-0.5 text-[11px] font-semibold text-red-a11">Prioridade</span>
      </div>
      <div class="mt-3 text-2xl font-bold text-neutral-12">R$ 14.350,00</div>
      <p class="mt-1 text-xs text-neutral-a11">4 boletos/PIX aguardando baixa hoje</p>
    </div>

    <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5 shadow-2xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-neutral-a10">NF-e Capturadas (SEFAZ)</span>
        <span class="rounded-md bg-jade-a3 px-2 py-0.5 text-[11px] font-semibold text-jade-a11">Automático</span>
      </div>
      <div class="mt-3 text-2xl font-bold text-neutral-12">38 Notas</div>
      <p class="mt-1 text-xs text-neutral-a11">3 notas novas aguardando classificação</p>
    </div>

    <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5 shadow-2xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-neutral-a10">Saldo Consolidado</span>
        <span class="rounded-md bg-primary-a3 px-2 py-0.5 text-[11px] font-semibold text-primary-a11">3 Bancos</span>
      </div>
      <div class="mt-3 text-2xl font-bold text-jade-a11">R$ 642.180,50</div>
      <p class="mt-1 text-xs text-neutral-a11">Itaú · Bradesco Corporate · BB</p>
    </div>
  </div>

  <!-- Duas Colunas Operacionais: Últimas Notas da SEFAZ + Próximos Vencimentos -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
    <!-- Últimas Notas Fiscais Capturadas da Receita/SEFAZ -->
    <div class="flex flex-col rounded-2xl border border-neutral-a4 bg-neutral-1 lg:col-span-7">
      <div class="flex items-center justify-between border-b border-neutral-a4 px-5 py-4">
        <div>
          <h2 class="text-base font-bold text-neutral-12">Últimas NF-e Recebidas (SEFAZ DFe / XML)</h2>
          <p class="text-xs text-neutral-a11">Notas emitidas contra o CNPJ da corporação capturadas automaticamente</p>
        </div>
        <span class="rounded-lg bg-jade-a3 px-2.5 py-1 text-xs font-semibold text-jade-a11">DFe Online</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11">
            <tr>
              <th class="px-4 py-3">NF-e / Série</th>
              <th class="px-4 py-3">Fornecedor (Emitente)</th>
              <th class="px-4 py-3">Parcelas XML</th>
              <th class="px-4 py-3">Valor Total</th>
              <th class="px-4 py-3">Situação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-a3">
            <tr>
              <td class="px-4 py-3 font-mono text-xs font-semibold text-neutral-12">#000.418.920 / 1</td>
              <td class="px-4 py-3">
                <div class="font-medium text-neutral-12">Amazon AWS Serviços Brasil Ltda</div>
                <div class="text-xs text-neutral-a10">CNPJ: 23.412.247/0001-10</div>
              </td>
              <td class="px-4 py-3 text-xs text-neutral-11">1x (Boleto)</td>
              <td class="px-4 py-3 font-semibold text-neutral-12">R$ 8.420,00</td>
              <td class="px-4 py-3">
                <span class="rounded-md bg-amber-a3 px-2 py-0.5 text-xs font-semibold text-amber-a11">Classificar</span>
              </td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono text-xs font-semibold text-neutral-12">#000.109.442 / 2</td>
              <td class="px-4 py-3">
                <div class="font-medium text-neutral-12">Dell Computadores do Brasil Ltda</div>
                <div class="text-xs text-neutral-a10">CNPJ: 72.381.189/0001-10</div>
              </td>
              <td class="px-4 py-3 text-xs text-neutral-11">3x (30/60/90d)</td>
              <td class="px-4 py-3 font-semibold text-neutral-12">R$ 24.900,00</td>
              <td class="px-4 py-3">
                <span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">No Contas a Pagar</span>
              </td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-mono text-xs font-semibold text-neutral-12">#000.088.315 / 1</td>
              <td class="px-4 py-3">
                <div class="font-medium text-neutral-12">Kalunga SA Comércio e Indústria</div>
                <div class="text-xs text-neutral-a10">CNPJ: 43.283.811/0001-50</div>
              </td>
              <td class="px-4 py-3 text-xs text-neutral-11">2x (28/56d)</td>
              <td class="px-4 py-3 font-semibold text-neutral-12">R$ 3.180,00</td>
              <td class="px-4 py-3">
                <span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">No Contas a Pagar</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Próximos Compromissos do Contas a Pagar -->
    <div class="flex flex-col rounded-2xl border border-neutral-a4 bg-neutral-1 lg:col-span-5">
      <div class="flex items-center justify-between border-b border-neutral-a4 px-5 py-4">
        <div>
          <h2 class="text-base font-bold text-neutral-12">Agenda de Pagamentos da Semana</h2>
          <p class="text-xs text-neutral-a11">Títulos gerados a partir das Notas Fiscais</p>
        </div>
        <span class="rounded-lg bg-primary-a3 px-2.5 py-1 text-xs font-semibold text-primary-a11">Contas a Pagar</span>
      </div>

      <div class="flex flex-col divide-y divide-neutral-a3 p-4">
        <div class="flex items-center justify-between py-3">
          <div>
            <div class="text-sm font-semibold text-neutral-12">Dell Computadores · Parcela 1/3</div>
            <div class="text-xs text-neutral-a10">NF-e #000.109.442 · Centro de Custo: TI &amp; Infra</div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold text-red-a11">R$ 8.300,00</div>
            <div class="text-[11px] font-medium text-red-a11">Vence Hoje</div>
          </div>
        </div>

        <div class="flex items-center justify-between py-3">
          <div>
            <div class="text-sm font-semibold text-neutral-12">Energisa / CPFL Energia Matriz</div>
            <div class="text-xs text-neutral-a10">Fatura #99201 · Centro de Custo: Administrativo</div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold text-red-a11">R$ 6.050,00</div>
            <div class="text-[11px] font-medium text-red-a11">Vence Hoje</div>
          </div>
        </div>

        <div class="flex items-center justify-between py-3">
          <div>
            <div class="text-sm font-semibold text-neutral-12">Kalunga SA · Parcela 1/2</div>
            <div class="text-xs text-neutral-a10">NF-e #000.088.315 · Centro de Custo: Operações</div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold text-neutral-12">R$ 1.590,00</div>
            <div class="text-[11px] text-neutral-a10">Vence em 3 dias</div>
          </div>
        </div>

        <div class="flex items-center justify-between py-3">
          <div>
            <div class="text-sm font-semibold text-neutral-12">TOTVS Cloud / Licenciamento</div>
            <div class="text-xs text-neutral-a10">NFS-e #4412 · Retenção IRRF/CSRF aplicada</div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold text-neutral-12">R$ 4.890,00</div>
            <div class="text-[11px] text-neutral-a10">Vence em 5 dias</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
""";

  public const string ImportacaoXmlHtml = """
<div class="flex flex-col gap-6">
  <!-- Barra de Status do Robô SEFAZ DFe + Certificado Digital A1 -->
  <div class="rounded-3xl border border-jade-a5 bg-neutral-1 p-6 shadow-xs">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 rounded-full bg-jade-a3 px-3 py-1 text-xs font-semibold text-jade-a11">
          <span class="size-2 rounded-full bg-jade-9"></span>
          Sincronização Automática SEFAZ Nacional (NFeDistribuicaoDFe)
        </div>
        <h1 class="mt-3 text-2xl font-bold text-neutral-12">
          Entrada de Notas Fiscais — Captura SEFAZ &amp; Importação de XML
        </h1>
        <p class="mt-1 text-sm text-neutral-a11">
          O Morphus consulta automaticamente a SEFAZ com o Certificado Digital A1 da corporação, registra a Ciência da Operação (210210) e baixa o XML completo com duplicatas.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="rounded-xl border border-neutral-a5 bg-neutral-2 px-4 py-2 text-xs font-semibold text-neutral-12 transition hover:bg-neutral-a3">
          Certificado Digital A1 (.pfx)
        </button>
        <button type="button" class="rounded-xl bg-jade-9 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-jade-10">
          Sincronizar SEFAZ Agora
        </button>
      </div>
    </div>

    <div class="mt-5 grid grid-cols-1 gap-4 border-t border-neutral-a4 pt-4 sm:grid-cols-4">
      <div>
        <span class="text-[11px] font-semibold uppercase text-neutral-a10">Certificado A1 Vinculado</span>
        <div class="mt-0.5 text-sm font-bold text-neutral-12">ICP-Brasil · Válido até 10/2027</div>
      </div>
      <div>
        <span class="text-[11px] font-semibold uppercase text-neutral-a10">Último NSU Processado</span>
        <div class="mt-0.5 font-mono text-sm font-bold text-primary-a11">000000000148920</div>
      </div>
      <div>
        <span class="text-[11px] font-semibold uppercase text-neutral-a10">Manifestação Automática</span>
        <div class="mt-0.5 text-sm font-bold text-jade-a11">210210 · Ciência da Operação</div>
      </div>
      <div>
        <span class="text-[11px] font-semibold uppercase text-neutral-a10">Próxima Consulta Background</span>
        <div class="mt-0.5 text-sm font-bold text-neutral-12">Automática (a cada 60 min)</div>
      </div>
    </div>
  </div>

  <!-- Área de Upload Manual de XML ou Consulta por Chave de 44 Dígitos -->
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
    <div class="flex flex-col justify-between rounded-2xl border-2 border-dashed border-primary-a6 bg-primary-a2/20 p-6 lg:col-span-5">
      <div>
        <span class="rounded-lg bg-primary-a3 px-2.5 py-1 text-xs font-semibold text-primary-a11">Upload Direto de NF-e / NFS-e</span>
        <h3 class="mt-3 text-base font-bold text-neutral-12">Arraste arquivos .XML aqui ou selecione do computador</h3>
        <p class="mt-1 text-xs text-neutral-a11">
          O parser lê instantaneamente as tags &lt;emit&gt;, &lt;ide&gt;, &lt;det&gt;, impostos e as parcelas em &lt;cobr&gt;&lt;dup&gt;.
        </p>
      </div>

      <div class="mt-5 flex flex-col gap-3">
        <label class="flex cursor-pointer items-center justify-center rounded-xl bg-primary-9 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-primary-10">
          Selecionar Arquivo(s) .XML
          <input type="file" accept=".xml" multiple class="hidden" />
        </label>
        <div class="flex gap-2">
          <input
            type="text"
            placeholder="Ou cole a Chave de Acesso (44 dígitos)..."
            class="w-full rounded-xl border border-neutral-a5 bg-neutral-1 px-3 py-2 font-mono text-xs text-neutral-12"
          />
          <button type="button" class="shrink-0 rounded-xl border border-neutral-a5 bg-neutral-1 px-3.5 py-2 text-xs font-semibold text-neutral-12">
            Buscar Chave
          </button>
        </div>
      </div>
    </div>

    <!-- Resumo da Extração Automática do XML Selecionado -->
    <div class="flex flex-col justify-between rounded-2xl border border-neutral-a4 bg-neutral-1 p-6 lg:col-span-7">
      <div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-neutral-a10">Inspeção de Envelope XML (NF-e #000.418.920)</span>
          <span class="rounded-md bg-amber-a3 px-2.5 py-0.5 text-xs font-semibold text-amber-a11">Aguardando Vínculo no Contas a Pagar</span>
        </div>
        <h3 class="mt-2 text-lg font-bold text-neutral-12">Amazon AWS Serviços Brasil Ltda (23.412.247/0001-10)</h3>
        <p class="font-mono text-xs text-neutral-a10">Chave: 3526 1123 4122 4700 0110 5500 1000 4189 2010 0492 8114</p>
      </div>

      <div class="my-4 grid grid-cols-1 gap-3 rounded-xl border border-neutral-a4 bg-neutral-a2/50 p-4 sm:grid-cols-3">
        <div>
          <span class="text-[11px] text-neutral-a10">Natureza Sugerida (IA/CFOP)</span>
          <div class="text-xs font-bold text-neutral-12">2.102 · Serviços de Cloud &amp; TI</div>
        </div>
        <div>
          <span class="text-[11px] text-neutral-a10">Centro de Custo</span>
          <div class="text-xs font-bold text-neutral-12">Tecnologia &amp; Infraestrutura</div>
        </div>
        <div>
          <span class="text-[11px] text-neutral-a10">Duplicatas Extraídas (&lt;dup&gt;)</span>
          <div class="text-xs font-bold text-jade-a11">1x de R$ 8.420,00 (Venc. 20/11)</div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2">
        <button type="button" class="rounded-xl border border-neutral-a5 px-3.5 py-2 text-xs font-semibold text-neutral-12">
          Visualizar DANFE / XML
        </button>
        <button type="button" class="rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">
          Aprovar Entrada e Lançar no Contas a Pagar (1 Clique)
        </button>
      </div>
    </div>
  </div>

  <!-- Fila Completa de Notas Fiscais de Entrada -->
  <div class="overflow-hidden rounded-2xl border border-neutral-a4 bg-neutral-1">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-a4 px-5 py-4">
      <div>
        <h2 class="text-base font-bold text-neutral-12">Fila de Notas Fiscais de Entrada (SEFAZ DFe + Upload XML)</h2>
        <p class="text-xs text-neutral-a11">Todas as notas capturadas pelo certificado digital ou importadas por XML</p>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11">
          <tr>
            <th class="px-4 py-3">NF-e / Emissão</th>
            <th class="px-4 py-3">Emitente / CNPJ</th>
            <th class="px-4 py-3">Origem</th>
            <th class="px-4 py-3">Manifestação Destinatário</th>
            <th class="px-4 py-3">Parcelas (&lt;dup&gt;)</th>
            <th class="px-4 py-3">Valor Total</th>
            <th class="px-4 py-3">Contas a Pagar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-a3">
          <tr>
            <td class="px-4 py-3">
              <div class="font-mono text-xs font-bold text-neutral-12">#000.418.920</div>
              <div class="text-[11px] text-neutral-a10">05/11/2026</div>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-neutral-12">Amazon AWS Serviços Brasil Ltda</div>
              <div class="font-mono text-xs text-neutral-a10">23.412.247/0001-10</div>
            </td>
            <td class="px-4 py-3"><span class="rounded-md bg-primary-a3 px-2 py-0.5 text-xs font-semibold text-primary-a11">SEFAZ DFe</span></td>
            <td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">210210 · Ciência</span></td>
            <td class="px-4 py-3 text-xs">1x R$ 8.420,00</td>
            <td class="px-4 py-3 font-bold text-neutral-12">R$ 8.420,00</td>
            <td class="px-4 py-3">
              <span class="rounded-md bg-amber-a3 px-2.5 py-1 text-xs font-semibold text-amber-a11">Pendente Geração</span>
            </td>
          </tr>
          <tr>
            <td class="px-4 py-3">
              <div class="font-mono text-xs font-bold text-neutral-12">#000.109.442</div>
              <div class="text-[11px] text-neutral-a10">03/11/2026</div>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-neutral-12">Dell Computadores do Brasil Ltda</div>
              <div class="font-mono text-xs text-neutral-a10">72.381.189/0001-10</div>
            </td>
            <td class="px-4 py-3"><span class="rounded-md bg-primary-a3 px-2 py-0.5 text-xs font-semibold text-primary-a11">SEFAZ DFe</span></td>
            <td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">210200 · Confirmada</span></td>
            <td class="px-4 py-3 text-xs">3x R$ 8.300,00</td>
            <td class="px-4 py-3 font-bold text-neutral-12">R$ 24.900,00</td>
            <td class="px-4 py-3">
              <span class="rounded-md bg-jade-a3 px-2.5 py-1 text-xs font-semibold text-jade-a11">3 Títulos Gerados</span>
            </td>
          </tr>
          <tr>
            <td class="px-4 py-3">
              <div class="font-mono text-xs font-bold text-neutral-12">#000.088.315</div>
              <div class="text-[11px] text-neutral-a10">01/11/2026</div>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-neutral-12">Kalunga SA Comércio e Indústria</div>
              <div class="font-mono text-xs text-neutral-a10">43.283.811/0001-50</div>
            </td>
            <td class="px-4 py-3"><span class="rounded-md bg-neutral-a3 px-2 py-0.5 text-xs font-semibold text-neutral-12">Upload XML</span></td>
            <td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">210200 · Confirmada</span></td>
            <td class="px-4 py-3 text-xs">2x R$ 1.590,00</td>
            <td class="px-4 py-3 font-bold text-neutral-12">R$ 3.180,00</td>
            <td class="px-4 py-3">
              <span class="rounded-md bg-jade-a3 px-2.5 py-1 text-xs font-semibold text-jade-a11">2 Títulos Gerados</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
""";

  public const string NaturezaTributosHtml = """
<div class="flex flex-col gap-6">
  <div class="rounded-3xl border border-neutral-a4 bg-neutral-1 p-6 shadow-xs">
    <span class="rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11">Motor Fiscal &amp; Retenções na Fonte</span>
    <h1 class="mt-3 text-2xl font-bold text-neutral-12">Natureza de Operação, CFOP e Retenções Tributárias</h1>
    <p class="mt-1 text-sm text-neutral-a11">
      Configure como cada tipo de Nota Fiscal (Mercadoria ou Serviço) calcula impostos retidos (IRRF, CSRF 4,65%, ISS, INSS) antes de gerar o valor líquido das parcelas no Contas a Pagar.
    </p>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
    <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
      <span class="text-xs font-semibold text-neutral-a10">IRRF Retido (1,5% / 1,0%)</span>
      <div class="mt-2 text-xl font-bold text-neutral-12">Automático por Serviço</div>
      <p class="mt-1 text-xs text-neutral-a11">Gera DARF Cód. 1708 vinculado</p>
    </div>
    <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
      <span class="text-xs font-semibold text-neutral-a10">CSRF (PIS/COFINS/CSLL)</span>
      <div class="mt-2 text-xl font-bold text-neutral-12">Alíquota 4,65%</div>
      <p class="mt-1 text-xs text-neutral-a11">0,65% PIS + 3% COFINS + 1% CSLL</p>
    </div>
    <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
      <span class="text-xs font-semibold text-neutral-a10">ISS Retido na Fonte</span>
      <div class="mt-2 text-xl font-bold text-neutral-12">2,0% a 5,0%</div>
      <p class="mt-1 text-xs text-neutral-a11">Conforme município do prestador</p>
    </div>
    <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
      <span class="text-xs font-semibold text-neutral-a10">INSS Retenção (Cessão M.O.)</span>
      <div class="mt-2 text-xl font-bold text-neutral-12">11,0% Reinf R-2010</div>
      <p class="mt-1 text-xs text-neutral-a11">Abate automático na duplicata</p>
    </div>
  </div>

  <div class="overflow-hidden rounded-2xl border border-neutral-a4 bg-neutral-1">
    <div class="border-b border-neutral-a4 px-5 py-4">
      <h2 class="text-base font-bold text-neutral-12">Regras de Classificação Automática (De/Para CFOP &amp; Plano de Contas)</h2>
    </div>
    <table class="w-full text-left text-sm">
      <thead class="border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11">
        <tr>
          <th class="px-4 py-3">Código / CFOP</th>
          <th class="px-4 py-3">Natureza Financeira (Plano de Contas)</th>
          <th class="px-4 py-3">Centro de Custo Padrão</th>
          <th class="px-4 py-3">Retenções Aplicadas</th>
          <th class="px-4 py-3">Gera Contas a Pagar</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-neutral-a3">
        <tr>
          <td class="px-4 py-3 font-mono text-xs font-bold">1.556 / 2.556</td>
          <td class="px-4 py-3 font-medium text-neutral-12">Compra de Material de Uso e Consumo</td>
          <td class="px-4 py-3 text-xs">Administrativo / Geral</td>
          <td class="px-4 py-3 text-xs text-neutral-a11">Sem retenção na fonte</td>
          <td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">Sim · Integral</span></td>
        </tr>
        <tr>
          <td class="px-4 py-3 font-mono text-xs font-bold">1.551 / 2.551</td>
          <td class="px-4 py-3 font-medium text-neutral-12">Aquisição de Ativo Imobilizado (Equipamentos/TI)</td>
          <td class="px-4 py-3 text-xs">TI &amp; Infraestrutura</td>
          <td class="px-4 py-3 text-xs text-neutral-a11">ICMS Diferencial de Alíquota</td>
          <td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">Sim · Com Alçada</span></td>
        </tr>
        <tr>
          <td class="px-4 py-3 font-mono text-xs font-bold">NFS-e / LC 116</td>
          <td class="px-4 py-3 font-medium text-neutral-12">Serviços de Tecnologia, SaaS e Consultoria</td>
          <td class="px-4 py-3 text-xs">TI &amp; Infraestrutura</td>
          <td class="px-4 py-3 text-xs font-semibold text-amber-a11">IRRF 1,5% + CSRF 4,65%</td>
          <td class="px-4 py-3"><span class="rounded-md bg-jade-a3 px-2 py-0.5 text-xs font-semibold text-jade-a11">Sim · Valor Líquido</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
""";

  public const string TitulosParcelasHtml = """
<div class="flex flex-col gap-6">
  <!-- Cabeçalho do Contas a Pagar -->
  <div class="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-neutral-a4 bg-neutral-1 p-6 shadow-xs">
    <div>
      <span class="rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11">Gestão de Compromissos &amp; Desembolso</span>
      <h1 class="mt-3 text-2xl font-bold text-neutral-12">Contas a Pagar — Títulos e Parcelas</h1>
      <p class="mt-1 text-sm text-neutral-a11">
        Títulos gerados automaticamente pela entrada de Notas Fiscais (NF-e / NFS-e) e contratos recorrentes da corporação.
      </p>
    </div>

    <div class="flex items-center gap-2">
      <button type="button" class="rounded-xl border border-neutral-a5 bg-neutral-2 px-4 py-2 text-xs font-semibold text-neutral-12">
        Exportar Remessa CNAB
      </button>
      <button type="button" class="rounded-xl bg-primary-9 px-4 py-2 text-xs font-semibold text-white">
        + Novo Título Avulso
      </button>
    </div>
  </div>

  <!-- 4 Cards de Situação das Parcelas -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
    <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-4">
      <span class="text-xs font-semibold text-neutral-a10">Vencidos / Em Atraso</span>
      <div class="mt-1.5 text-xl font-bold text-neutral-12">R$ 0,00</div>
      <span class="text-[11px] text-jade-a11">0 títulos em atraso</span>
    </div>
    <div class="rounded-2xl border border-red-a5 bg-red-a2/30 p-4">
      <span class="text-xs font-semibold text-red-a11">Vencendo Hoje</span>
      <div class="mt-1.5 text-xl font-bold text-red-a11">R$ 14.350,00</div>
      <span class="text-[11px] text-red-a11">4 títulos para liquidar hoje</span>
    </div>
    <div class="rounded-2xl border border-neutral-a4 bg-neutral-1 p-4">
      <span class="text-xs font-semibold text-neutral-a10">A Vencer (Próximos 30 dias)</span>
      <div class="mt-1.5 text-xl font-bold text-neutral-12">R$ 108.170,00</div>
      <span class="text-[11px] text-neutral-a11">16 parcelas programadas</span>
    </div>
    <div class="rounded-2xl border border-jade-a5 bg-jade-a2/20 p-4">
      <span class="text-xs font-semibold text-jade-a11">Pagos no Mês</span>
      <div class="mt-1.5 text-xl font-bold text-jade-a11">R$ 62.400,00</div>
      <span class="text-[11px] text-jade-a11">8 títulos baixados com comprovante</span>
    </div>
  </div>

  <!-- Tabela Principal de Títulos e Parcelas -->
  <div class="overflow-hidden rounded-2xl border border-neutral-a4 bg-neutral-1">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-a4 px-5 py-4">
      <h2 class="text-base font-bold text-neutral-12">Relação de Títulos e Parcelas do Período</h2>
      <div class="flex items-center gap-2">
        <input type="text" placeholder="Filtrar fornecedor, CNPJ ou NF-e..." class="rounded-xl border border-neutral-a5 bg-transparent px-3 py-1.5 text-xs text-neutral-12" />
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-neutral-a4 bg-neutral-a2 text-xs uppercase text-neutral-a11">
          <tr>
            <th class="px-4 py-3">Vencimento</th>
            <th class="px-4 py-3">Documento / Parcela</th>
            <th class="px-4 py-3">Fornecedor</th>
            <th class="px-4 py-3">Centro de Custo</th>
            <th class="px-4 py-3">Valor Bruto</th>
            <th class="px-4 py-3">Retenções</th>
            <th class="px-4 py-3">Valor Líquido</th>
            <th class="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-a3">
          <tr>
            <td class="px-4 py-3 font-semibold text-red-a11">Hoje · 05/11/2026</td>
            <td class="px-4 py-3">
              <div class="font-mono text-xs font-bold text-neutral-12">NF-e #000.109.442</div>
              <div class="text-[11px] text-neutral-a10">Parcela 1/3 · Boleto Itaú</div>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-neutral-12">Dell Computadores do Brasil Ltda</div>
              <div class="font-mono text-xs text-neutral-a10">72.381.189/0001-10</div>
            </td>
            <td class="px-4 py-3 text-xs">TI &amp; Infraestrutura</td>
            <td class="px-4 py-3 text-xs">R$ 8.300,00</td>
            <td class="px-4 py-3 text-xs text-neutral-a10">R$ 0,00</td>
            <td class="px-4 py-3 font-bold text-neutral-12">R$ 8.300,00</td>
            <td class="px-4 py-3"><span class="rounded-md bg-red-a3 px-2 py-0.5 text-xs font-semibold text-red-a11">Vence Hoje</span></td>
          </tr>
          <tr>
            <td class="px-4 py-3 font-semibold text-red-a11">Hoje · 05/11/2026</td>
            <td class="px-4 py-3">
              <div class="font-mono text-xs font-bold text-neutral-12">FAT #99201</div>
              <div class="text-[11px] text-neutral-a10">Parcela 1/1 · Débito/PIX</div>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-neutral-12">CPFL Energia / Concessionária</div>
              <div class="font-mono text-xs text-neutral-a10">02.998.611/0001-04</div>
            </td>
            <td class="px-4 py-3 text-xs">Administrativo</td>
            <td class="px-4 py-3 text-xs">R$ 6.050,00</td>
            <td class="px-4 py-3 text-xs text-neutral-a10">R$ 0,00</td>
            <td class="px-4 py-3 font-bold text-neutral-12">R$ 6.050,00</td>
            <td class="px-4 py-3"><span class="rounded-md bg-red-a3 px-2 py-0.5 text-xs font-semibold text-red-a11">Vence Hoje</span></td>
          </tr>
          <tr>
            <td class="px-4 py-3 text-neutral-12">10/11/2026</td>
            <td class="px-4 py-3">
              <div class="font-mono text-xs font-bold text-neutral-12">NFS-e #004.412</div>
              <div class="text-[11px] text-neutral-a10">Parcela 1/1 · PIX CNPJ</div>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-neutral-12">TOTVS S.A. · Licenciamento Corporativo</div>
              <div class="font-mono text-xs text-neutral-a10">53.113.791/0001-22</div>
            </td>
            <td class="px-4 py-3 text-xs">TI &amp; Infraestrutura</td>
            <td class="px-4 py-3 text-xs">R$ 5.210,44</td>
            <td class="px-4 py-3 text-xs text-amber-a11">- R$ 320,44 (6,15%)</td>
            <td class="px-4 py-3 font-bold text-neutral-12">R$ 4.890,00</td>
            <td class="px-4 py-3"><span class="rounded-md bg-primary-a3 px-2 py-0.5 text-xs font-semibold text-primary-a11">Aprovado</span></td>
          </tr>
          <tr>
            <td class="px-4 py-3 text-neutral-12">03/12/2026</td>
            <td class="px-4 py-3">
              <div class="font-mono text-xs font-bold text-neutral-12">NF-e #000.109.442</div>
              <div class="text-[11px] text-neutral-a10">Parcela 2/3 · Boleto Itaú</div>
            </td>
            <td class="px-4 py-3">
              <div class="font-medium text-neutral-12">Dell Computadores do Brasil Ltda</div>
              <div class="font-mono text-xs text-neutral-a10">72.381.189/0001-10</div>
            </td>
            <td class="px-4 py-3 text-xs">TI &amp; Infraestrutura</td>
            <td class="px-4 py-3 text-xs">R$ 8.300,00</td>
            <td class="px-4 py-3 text-xs text-neutral-a10">R$ 0,00</td>
            <td class="px-4 py-3 font-bold text-neutral-12">R$ 8.300,00</td>
            <td class="px-4 py-3"><span class="rounded-md bg-neutral-a3 px-2 py-0.5 text-xs font-semibold text-neutral-12">A Vencer</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
""";

  public const string AprovacaoPagamentosHtml = """
<div class="flex flex-col gap-6">
  <div class="rounded-3xl border border-neutral-a4 bg-neutral-1 p-6 shadow-xs">
    <span class="rounded-full bg-amber-a3 px-3 py-1 text-xs font-semibold text-amber-a11">Governança &amp; Alçadas</span>
    <h1 class="mt-3 text-2xl font-bold text-neutral-12">Aprovação de Pagamentos por Alçada</h1>
    <p class="mt-1 text-sm text-neutral-a11">
      Notas fiscais e títulos acima do limite automático aguardando liberação da Gerência ou Diretoria Financeira.
    </p>
  </div>

  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-amber-a3 px-2 py-0.5 text-xs font-semibold text-amber-a11">Alçada Diretoria (&gt; R$ 20.000)</span>
          <span class="font-mono text-xs text-neutral-a10">NF-e #000.109.442 · Dell Computadores</span>
        </div>
        <h3 class="mt-2 text-base font-bold text-neutral-12">Aquisição de 5 Notebooks Latitude — Centro de Custo: TI</h3>
        <p class="text-xs text-neutral-a11">3 parcelas de R$ 8.300,00 · Total: R$ 24.900,00 · XML validado na SEFAZ</p>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="rounded-xl border border-red-a5 px-3.5 py-2 text-xs font-semibold text-red-a11">Rejeitar</button>
        <button type="button" class="rounded-xl bg-jade-9 px-4 py-2 text-xs font-semibold text-white">Aprovar Lote de Parcelas</button>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-5">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-primary-a3 px-2 py-0.5 text-xs font-semibold text-primary-a11">Alçada Gerencial</span>
          <span class="font-mono text-xs text-neutral-a10">NF-e #000.418.920 · Amazon AWS</span>
        </div>
        <h3 class="mt-2 text-base font-bold text-neutral-12">Consumo Mensal de Infraestrutura Cloud — Produção</h3>
        <p class="text-xs text-neutral-a11">Parcela única de R$ 8.420,00 · Vencimento 20/11/2026</p>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="rounded-xl border border-red-a5 px-3.5 py-2 text-xs font-semibold text-red-a11">Rejeitar</button>
        <button type="button" class="rounded-xl bg-jade-9 px-4 py-2 text-xs font-semibold text-white">Aprovar Pagamento</button>
      </div>
    </div>
  </div>
</div>
""";

  public const string BaixasJurosMultasHtml = """
<div class="flex flex-col gap-6">
  <div class="rounded-3xl border border-neutral-a4 bg-neutral-1 p-6 shadow-xs">
    <span class="rounded-full bg-jade-a3 px-3 py-1 text-xs font-semibold text-jade-a11">Liquidação Financeira</span>
    <h1 class="mt-3 text-2xl font-bold text-neutral-12">Baixas, Juros, Multas e Comprovantes</h1>
    <p class="mt-1 text-sm text-neutral-a11">
      Registre a liquidação individual ou em lote de títulos do Contas a Pagar, calculando encargos ou descontos e vinculando a conta bancária pagadora.
    </p>
  </div>

  <form class="flex flex-col gap-4 rounded-2xl border border-neutral-a4 bg-neutral-1 p-6">
    <h2 class="text-base font-bold text-neutral-12">Simulador / Registro de Baixa de Título</h2>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
      <label class="flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
        Título Selecionado
        <input type="text" value="NF-e #000.109.442 (Parc. 1/3 - Dell)" readonly class="rounded-xl border border-neutral-a5 bg-neutral-a2 px-3 py-2 text-xs text-neutral-12" />
      </label>
      <label class="flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
        Conta Bancária de Saída
        <input type="text" value="Itaú Empresas · Ag 0412 CC 99410-2" readonly class="rounded-xl border border-neutral-a5 bg-transparent px-3 py-2 text-xs text-neutral-12" />
      </label>
      <label class="flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
        Juros / Multa (+)
        <input type="text" value="R$ 0,00" class="rounded-xl border border-neutral-a5 bg-transparent px-3 py-2 text-xs text-neutral-12" />
      </label>
      <label class="flex flex-col gap-1 text-xs font-semibold text-neutral-a11">
        Valor Final Liquidado (=)
        <input type="text" value="R$ 8.300,00" class="rounded-xl border border-jade-a6 bg-jade-a2/30 px-3 py-2 text-xs font-bold text-jade-a11" />
      </label>
    </div>
    <div class="flex justify-end">
      <button type="button" class="rounded-xl bg-primary-9 px-5 py-2.5 text-xs font-semibold text-white">
        Confirmar Baixa e Anexar Comprovante
      </button>
    </div>
  </form>
</div>
""";

  public const string FaturamentoCobrancasHtml = """
<div class="flex flex-col gap-6">
  <div class="rounded-3xl border border-neutral-a4 bg-neutral-1 p-6 shadow-xs">
    <span class="rounded-full bg-indigo-a3 px-3 py-1 text-xs font-semibold text-indigo-a11">Contas a Receber</span>
    <h1 class="mt-3 text-2xl font-bold text-neutral-12">Faturamento, Boletos e PIX Cobrança</h1>
    <p class="mt-1 text-sm text-neutral-a11">
      Controle de faturas emitidas para clientes, régua de cobrança automática e carteira de recebíveis.
    </p>
  </div>
</div>
""";

  public const string RecebimentosBaixasHtml = """
<div class="flex flex-col gap-6">
  <div class="rounded-3xl border border-neutral-a4 bg-neutral-1 p-6 shadow-xs">
    <span class="rounded-full bg-jade-a3 px-3 py-1 text-xs font-semibold text-jade-a11">Entradas &amp; Liquidação</span>
    <h1 class="mt-3 text-2xl font-bold text-neutral-12">Recebimentos e Baixas de Clientes</h1>
    <p class="mt-1 text-sm text-neutral-a11">
      Confirmação automática de créditos via retorno bancário CNAB e Webhook PIX.
    </p>
  </div>
</div>
""";

  public const string RemessaRetornoCnabHtml = """
<div class="flex flex-col gap-6">
  <div class="rounded-3xl border border-neutral-a4 bg-neutral-1 p-6 shadow-xs">
    <span class="rounded-full bg-primary-a3 px-3 py-1 text-xs font-semibold text-primary-a11">Integração Bancária EDI</span>
    <h1 class="mt-3 text-2xl font-bold text-neutral-12">Remessa de Pagamentos e Retorno CNAB 240/400</h1>
    <p class="mt-1 text-sm text-neutral-a11">
      Gere remessas bancárias em lote para pagamento de fornecedores e processe arquivos de retorno e extratos OFX.
    </p>
  </div>
</div>
""";

  public const string FluxoCaixaHtml = """
<div class="flex flex-col gap-6">
  <div class="rounded-3xl border border-neutral-a4 bg-neutral-1 p-6 shadow-xs">
    <span class="rounded-full bg-jade-a3 px-3 py-1 text-xs font-semibold text-jade-a11">Tesouraria &amp; Projeção</span>
    <h1 class="mt-3 text-2xl font-bold text-neutral-12">Fluxo de Caixa — Previsto vs. Realizado</h1>
    <p class="mt-1 text-sm text-neutral-a11">
      Visão diária e mensal do saldo projetado considerando Notas Fiscais recebidas, Contas a Pagar e Contas a Receber.
    </p>
  </div>
</div>
""";
}
