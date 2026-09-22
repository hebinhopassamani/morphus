import { mpxCardTheme } from '@components/Card/theme';
import type { MorphusTheme, MpxThemeColrosGroupNames } from '@core/types/colors.type';
import { useThemeProvider } from 'flowbite-react';
import { get } from 'flowbite-react/helpers/get';
import { resolveProps } from 'flowbite-react/helpers/resolve-props';
import { useResolveTheme } from 'flowbite-react/helpers/resolve-theme';
import type { ThemingProps } from 'flowbite-react/types';
import { forwardRef, type ComponentProps } from 'react';

export interface MpxCardTheme extends MorphusTheme {
    base: string;
    color: MpxThemeColrosGroupNames;
}

export interface MpxCardProps extends ComponentProps<'div'>, ThemingProps<MpxCardTheme> {
    color?: keyof MpxThemeColrosGroupNames;
}

export const MpxCard = forwardRef<HTMLDivElement, MpxCardProps>((props, ref) => {
    const provider = useThemeProvider();

    const theme = useResolveTheme(
        [mpxCardTheme, provider.theme?.cardTheme, props.theme],
        [get(provider.clearTheme, 'card'), props.clearTheme],
        [get(provider.applyTheme, 'card'), props.applyTheme]
    );

    const { children, color, className, ...restProps } = resolveProps(props, provider.props?.cardProps);

    return (
        <div ref={ref} className={twMerge(theme.base, theme.color[color], className)} {...restProps}>
            {children}
        </div>
    );
});
