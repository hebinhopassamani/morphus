import type { MorphusProps } from '@core/types/morphus.type';

export type MpxSidenavProps = {} & MorphusProps;

export function MpxSidenav({ children }: MpxSidenavProps) {
    return <div className='morphus-sidenav'>{children}</div>;
}
