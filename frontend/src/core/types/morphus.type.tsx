export type MpxThemeTypesNames = 'light' | 'dark';
//export type MpxThemeNames = keyof typeof MPX_DB_THEMES;
export type MpxThemeColorsNames = keyof MpxThemeColors;
//export type MpxThemeSubColorsNames = keyof MpxTheme; tailwind
export type MpxSeverityColorsName = keyof MpxSeverityColors;
export type MpxAllColorsNames = keyof MpxAllColors;

export interface MorphusProps {
    children?: React.ReactNode;
    styleClass?: string;
}

export interface MpxTheme {
    colors: MpxThemeColors;
    severityColors: MpxSeverityColors;
    thypography?: MpxThypography;
    shape?: MpxShape;
}

export interface MpxThemeColors extends MpxSeverityColors {
    [key: string]: string;
    primary: string;
    secondary: string;
    tertiary: string;
    surface: string;
    neutrau: string;
}

export interface MpxSeverityColors {
    info: string;
    warning: string;
    success: string;
    error: string;
}

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

export interface MpxThypography {
    fontFamily?: string;
    fontSmall?: string;
    fontMedium?: string;
    fontLarge?: string;
    fontLight?: string;
    fontRegular?: string;
    fontSemibold?: string;
    fontBold?: string;
    labelSmall?: string;
    labelMedium?: string;
    labelLarge?: string;
    titleSmall: string;
    titleMedium?: string;
    titleLarge?: string;
    headlineSmall?: string;
    headlineMedium?: string;
    headlineLarge?: string;
    displaySmall?: string;
    displayMedium?: string;
    displayLarge?: string;
}

export interface MpxShape {
    radiusNone?: string;
    radiusExtraSmall?: string;
    radiusSmall?: string;
    radiusMedium?: string;
    radiusLarge?: string;
    radiusExtraLarge?: string;
    radiusNoneTop?: string;
    radiusExtraSmallTop?: string;
    radiusSmallTop?: string;
    radiusMediumTop?: string;
    radiusLargeTop?: string;
    radiusExtraLargeTop?: string;
    radiusNoneBotton?: string;
    radiusExtraSmallBotton?: string;
    radiusSmallBotton?: string;
    radiusMediumBotton?: string;
    radiusLargeBotton?: string;
    radiusExtraLargeBotton?: string;
}

export interface MpxPositions {
    'bottom-left': string;
    'bottom-right': string;
    'bottom-center': string;
    'top-left': string;
    'top-center': string;
    'top-right': string;
    'center-left': string;
    'center': string;
    'center-right': string;
}

export interface MpxSizes {
    'xs': string;
    'sm': string;
    'md': string;
    'lg': string;
    'xl': string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    '7xl': string;
}
