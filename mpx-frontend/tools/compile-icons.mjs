import fs from 'node:fs';
import path from 'node:path';
import { optimize } from 'svgo';

const RAW_ICONS_DIR = path.resolve('src/assets/raw-icons');
const OUTPUT_SPRITE = path.resolve('public/assets/morphus-sprite.svg');
const OUTPUT_TS = path.resolve('src/core/mpx-icons/morphus-compiled-icons.ts');

// Mapa de conversão automática: HEX gerado no Recraft AI -> Token CSS do Morphus
const COLOR_TOKEN_MAP = {
  '#6d28d9': 'var(--morphus-icon-primary)',   // Roxo Principal -> Destaque Ativo
  '#a78bfa': 'var(--morphus-icon-primary)',   // Roxo Claro -> Destaque Ativo
  '#ede9fe': 'var(--morphus-icon-secondary)', // Lilás Pastel -> Camada Secundária
  '#ddd6fe': 'var(--morphus-icon-secondary)', // Lilás Médio -> Camada Secundária
  '#bebc99': 'var(--morphus-icon-neutral)',   // Cinza Neutro -> Detalhes Estruturais
};

/**
 * Calcula a luminância relativa percebida (0..255) de uma cor hexadecimal (#RRGGBB ou #RGB).
 */
function hexLuminance(hex) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Converte automaticamente qualquer conjunto de cores HEX (inclusive dentro de <linearGradient> / stop-color)
 * de ícones gerados no Recraft para as 3 camadas dinâmicas de cor do Morphus (--morphus-icon-dark, --morphus-icon-primary, --morphus-icon-light),
 * preservando o efeito 3D/degradê enquanto obedece à cor do Card / Tema!
 */
function mapDynamicHexShades(svgContent, iconId) {
  // Ícones fluent-* mantêm suas cores fixas originais da Microsoft
  if (iconId.startsWith('fluent-')) {
    return svgContent;
  }

  const hexMatches = [...svgContent.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((m) =>
    m[0].toLowerCase(),
  );
  const uniqueHexes = [...new Set(hexMatches)].filter(
    (h) => !(h in COLOR_TOKEN_MAP) && h !== '#ffffff' && h !== '#000000',
  );

  if (uniqueHexes.length === 0) {
    return svgContent;
  }

  const sorted = uniqueHexes
    .map((hex) => ({ hex, lum: hexLuminance(hex) }))
    .sort((a, b) => a.lum - b.lum);

  const minLum = sorted[0].lum;
  const maxLum = sorted[sorted.length - 1].lum;
  const spread = maxLum - minLum;

  let updated = svgContent;
  for (const { hex, lum } of sorted) {
    let token = 'var(--morphus-icon-primary)';
    if (sorted.length >= 2 && spread > 18) {
      const ratio = (lum - minLum) / spread;
      if (ratio <= 0.34) {
        token = 'var(--morphus-icon-dark)';
      } else if (ratio >= 0.68) {
        token = 'var(--morphus-icon-light)';
      } else {
        token = 'var(--morphus-icon-primary)';
      }
    }
    const regex = new RegExp(hex, 'gi');
    updated = updated.replace(regex, token);
  }

  return updated;
}

fs.mkdirSync(RAW_ICONS_DIR, { recursive: true });
fs.mkdirSync(path.dirname(OUTPUT_SPRITE), { recursive: true });
fs.mkdirSync(path.dirname(OUTPUT_TS), { recursive: true });

const files = fs
  .readdirSync(RAW_ICONS_DIR)
  .filter((file) => file.toLowerCase().endsWith('.svg'))
  .sort();

const symbols = [];
const iconEntries = [];

for (const file of files) {
  let rawSvg = fs.readFileSync(path.join(RAW_ICONS_DIR, file), 'utf8');
  const iconId = path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-');

  // 0. Remove o retângulo de fundo branco/chapado 1024x1024 gerado pelo Recraft AI (quando não exportado com fundo transparente)
  rawSvg = rawSvg.replace(
    /<path\s+fill="[^"]+"\s+d="M0[\s,]+0L1024[\s,]+0[^"]*1024[\s,]+1024L0[\s,]+1024[^"]*Z"\s*\/>/gi,
    '',
  );

  // 1. Substitui os códigos HEX da paleta Recraft pelas variáveis CSS do Morphus
  for (const [hex, cssVar] of Object.entries(COLOR_TOKEN_MAP)) {
    const regex = new RegExp(hex, 'gi');
    rawSvg = rawSvg.replace(regex, cssVar);
  }
  rawSvg = mapDynamicHexShades(rawSvg, iconId);

  // 2. Otimiza com SVGO mantendo o viewBox intacto e prefixando IDs internos
  const { data: cleanSvg } = optimize(rawSvg, {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            inlineStyles: {
              onlyMatchedOnce: false,
            },
            convertColors: false,
          },
        },
      },
      {
        name: 'prefixIds',
        params: {
          prefix: iconId,
        },
      },
      'removeDimensions', // Remove width="..." e height="..." fixos
      'removeXMLNS',
    ],
  });

  // 3. Reaplica o mapeamento caso o SVGO tenha convertido style="fill:#..." para fill="#..."
  let finalSvg = cleanSvg;
  for (const [hex, cssVar] of Object.entries(COLOR_TOKEN_MAP)) {
    const regex = new RegExp(hex, 'gi');
    finalSvg = finalSvg.replace(regex, cssVar);
  }
  finalSvg = mapDynamicHexShades(finalSvg, iconId);

  // 3b. Converte automaticamente camadas Duotone do Solar / Phosphor (fill="currentColor" + opacity=".5"/".4"/".2")
  // para os tokens dinâmicos --morphus-icon-secondary e --morphus-icon-primary
  finalSvg = finalSvg.replace(
    /<(path|rect|circle|ellipse|polygon|g)\b([^>]*?)(?<![-\w])opacity="(?:0?\.[23456]\d*)"([^>]*?)>/gi,
    (match, tag, before, after) => {
      const attrs = `${before}${after}`.replace(
        /fill="currentColor"/gi,
        'fill="var(--morphus-icon-secondary, currentColor)"',
      );
      return `<${tag}${attrs}>`;
    },
  );
  finalSvg = finalSvg.replace(
    /fill="currentColor"/gi,
    'fill="var(--morphus-icon-primary, currentColor)"',
  );
  finalSvg = finalSvg.replace(
    /stroke="currentColor"/gi,
    'stroke="var(--morphus-icon-primary, currentColor)"',
  );

  // 3c. Suporte a Google Material Icons (viewBox="0 -960 960 960" ou paths sem fill/stroke explícito)
  finalSvg = finalSvg.replace(
    /<path\b(?![^>]*\bfill=)(?![^>]*\bstroke=)([^>]*)>/gi,
    '<path fill="var(--morphus-icon-primary, currentColor)"$1>',
  );

  // 4. Extrai o viewBox individual
  const viewBoxMatch = finalSvg.match(/viewBox="([^"]+)"/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  // 5. Extrai apenas o conteúdo interno da tag <svg>...</svg>
  const innerContent = finalSvg
    .replace(/<svg[^>]*>/i, '')
    .replace(/<\/svg>/i, '')
    .trim();

  symbols.push(
    `  <symbol id="mpx-${iconId}" viewBox="${viewBox}">\n    ${innerContent}\n  </symbol>`,
  );

  iconEntries.push({
    id: iconId,
    viewBox,
    content: innerContent,
    fullSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="none" data-mpx-duotone="true">${innerContent}</svg>`,
  });
}

// Gera o arquivo final do Sprite SVG
const spriteContent = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n${symbols.join('\n')}\n</svg>\n`;
fs.writeFileSync(OUTPUT_SPRITE, spriteContent, 'utf8');

// Gera o arquivo TypeScript tipado para o Angular (mpx-icon + MatIconRegistry)
const unionType =
  iconEntries.length > 0
    ? iconEntries.map((entry) => `  | '${entry.id}'`).join('\n')
    : '  | never';

const dictionaryEntries = iconEntries
  .map(
    (entry) =>
      `  '${entry.id}': {\n    viewBox: '${entry.viewBox}',\n    content: ${JSON.stringify(entry.content)},\n    svg: ${JSON.stringify(entry.fullSvg)},\n  },`,
  )
  .join('\n');

const tsContent = `// Arquivo gerado automaticamente via "npm run icons:build" (tools/compile-icons.mjs)
// NAO edite manualmente: adicione seus arquivos .svg em src/assets/raw-icons/ e rode npm run icons:build

export interface MpxCompiledIconDefinition {
  viewBox: string;
  content: string;
  svg: string;
}

export type MorphusCompiledIconName =
${unionType};

export const MPX_COMPILED_ICONS: Record<string, MpxCompiledIconDefinition> = {
${dictionaryEntries}
};
`;

fs.writeFileSync(OUTPUT_TS, tsContent, 'utf8');

console.log(
  `✅ [Morphus Icons] ${iconEntries.length} ícone(s) compilado(s) com sucesso!\n   -> Sprite: ${OUTPUT_SPRITE}\n   -> Types : ${OUTPUT_TS}`,
);
