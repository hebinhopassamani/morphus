import type { MpxGroupColrosNames } from '@core/types/colors.type';
import type { ThemingProps } from 'flowbite-react/types';
import type { ComponentProps } from 'react';

export interface MpxCardTheme {
    base: string;
}

export interface MpxCardProps extends ComponentProps<'div'>, ThemingProps<MpxCardTheme> {
    color: MpxGroupColrosNames;
}
