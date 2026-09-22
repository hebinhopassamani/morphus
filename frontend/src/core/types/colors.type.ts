import type { MorphusKeyOf } from '@core/types/types.type';

export type ThemeTypes = 'light' | 'dark';

export type MpxThemeColrosGroupNames = MorphusKeyOf<MpxThemeGroupColors>;
export type ThemeColorsNames = MorphusKeyOf<MpxThemeColors>;
export type MpxPaletteColorsNames = keyof MpxAllColors;

export interface MpxAllColors {
    blue: string;
    cyan: string;
    dark: string;
    gray: string;
    green: string;
    indigo: string;
    light: string;
    lime: string;
    pink: string;
    purple: string;
    red: string;
    teal: string;
    yellow: string;
    zinc: string;
    stone: string;
    mauve: string;
    olive: string;
    mist: string;
    taupe: string;
    orange: string;
    amber: string;
    emerald: string;
    violet: string;
    sky: string;
    fuchsia: string;
    rose: string;
    neutrau: string;
}

export interface MpxThemeGroupColors {
    primary?: MpxThemeColors;
    secondary?: MpxThemeColors;
    tertiary?: MpxThemeColors;
    surface?: MpxThemeColors;
    neutral?: MpxThemeColors;
    alternative?: MpxThemeColors;
    info?: MpxThemeColors;
    warn?: MpxThemeColors;
    success?: MpxThemeColors;
    error?: MpxThemeColors;
}

export interface MpxThemeColors {
    baseColor?: MpxPaletteColorsNames;
    backGroundLow?: string;
    backGround?: string;
    backGroundHight?: string;
    backGroundInverse?: string;
    textOnbackGround?: string;
    textOnbackGroundHight?: string;
    borderOnbackGround?: string;
    borderOnbackGroundHight?: string;
}

export interface MorphusTheme {
    colors: MpxThemeGroupColors;
}
