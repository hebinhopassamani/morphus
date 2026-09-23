import type { MorphusProps } from '@core/types/morphus.type';

export type MpxNavbarProps = {} & MorphusProps;

export function MpxNavbar({ children }: MpxNavbarProps) {
    return <div className='morphus-navbar'>{children}</div>;
}
