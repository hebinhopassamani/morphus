export const PRIMARY_COLORS: { name: string; value: string }[] = [
  { name: 'Crimson', value: '#E93D82' },
  { name: 'Plum', value: '#AB4ABA' },
  { name: 'Violet', value: '#6E56CF' },
  { name: 'Indigo', value: '#3E63DD' },
  { name: 'Cyan', value: '#00A2C7' },
  { name: 'Jade', value: '#29A383' },
  { name: 'Amber', value: '#FFC53D' },
  { name: 'Brown', value: '#AD7F58' },
];

export const NEUTRAL_COLORS: {
  name: string;
  value: string;
  chipClass: string;
}[] = [
  { name: 'Gray', value: '#8D8D8D', chipClass: 'border-gray-a6 bg-gray-a3' },
  { name: 'Mauve', value: '#8E8C99', chipClass: 'border-mauve-a6 bg-mauve-a3' },
  { name: 'Slate', value: '#8B8D98', chipClass: 'border-slate-a6 bg-slate-a3' },
  { name: 'Sage', value: '#868E8B', chipClass: 'border-sage-a6 bg-sage-a3' },
  { name: 'Olive', value: '#898E87', chipClass: 'border-olive-a6 bg-olive-a3' },
  { name: 'Sand', value: '#8D8D86', chipClass: 'border-sand-a6 bg-sand-a3' },
];

export const THEME_PRESETS: {
  primary: { name: string; value: string };
  neutral: (typeof NEUTRAL_COLORS)[number];
}[] = [
  { primary: PRIMARY_COLORS[0], neutral: NEUTRAL_COLORS[1] },
  { primary: PRIMARY_COLORS[1], neutral: NEUTRAL_COLORS[1] },
  { primary: PRIMARY_COLORS[2], neutral: NEUTRAL_COLORS[1] },
  { primary: PRIMARY_COLORS[3], neutral: NEUTRAL_COLORS[2] },
  { primary: PRIMARY_COLORS[4], neutral: NEUTRAL_COLORS[2] },
  { primary: PRIMARY_COLORS[5], neutral: NEUTRAL_COLORS[3] },
  { primary: PRIMARY_COLORS[6], neutral: NEUTRAL_COLORS[5] },
  { primary: PRIMARY_COLORS[7], neutral: NEUTRAL_COLORS[5] },
];
