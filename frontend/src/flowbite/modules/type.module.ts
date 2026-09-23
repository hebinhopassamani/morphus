import type { MpxCardProps, MpxCardTheme } from '@components/Card/card.props';

declare module 'flowbite-react/types' {
    interface FlowbiteTheme {
        carTheme: MpxCardTheme;
    }

    interface FlowbiteProps {
        cardProps: Partial<WithoutThemingProps<MpxCardProps>>;
    }
}
