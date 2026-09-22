import type { MpxCardProps, MpxCardTheme } from '@components/Card';

declare module 'flowbite-react/types' {
    interface FlowbiteTheme {
        cardTheme: MpxCardTheme;
    }

    interface FlowbiteProps {
        cardProps: Partial<WithoutThemingProps<MpxCardProps>>;
    }
}
