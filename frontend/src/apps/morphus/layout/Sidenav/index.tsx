import type { MorphusProps } from '@core/types/morphus.type';

export type SidenavProps = {} & MorphusProps;

export function Sidenav({ children }: SidenavProps) {
    return <div className='morphus-sidenav'>{children}</div>;
}
