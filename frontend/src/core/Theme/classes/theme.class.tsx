import { BLUE_SKY_THEME } from '@core/Theme/theme-blue-sky.theme';
import { MPX_THEMES, type MpxThemeNames } from '@core/Theme/theme.data';
import type { MpxTheme } from '@core/Theme/theme.interface';

export class MorphusTheme {
    public theme: MpxTheme;
    public defaultTheme: MpxTheme = BLUE_SKY_THEME;

    constructor(theme: MpxTheme = this.defaultTheme) {
        this.theme = this.getTheme(theme);
    }

    private getTheme(theme?: MpxTheme | MpxThemeNames): MpxTheme {
        if (!theme) {
            this.theme = MPX_THEMES['blue-sky'];
        } else if (typeof theme === 'string' && theme in MPX_THEMES) {
            this.theme = MPX_THEMES[theme as MpxThemeNames];
        } else {
            this.theme = theme as MpxTheme;
        }

        return { ...this.theme };
    }

    public setTheme(theme: MpxTheme): MpxTheme {
        return { ...theme };
    }

    public updateTheme(theme: Partial<MpxTheme>): MpxTheme {
        return {
            ...this.theme,
            ...theme,
        };
    }

    resetTheme(): MpxTheme {
        return {
            ...this.defaultTheme,
        };
    }
    public static DefaultTheme(): MpxTheme {
        return { ...BLUE_SKY_THEME };
    }
}
