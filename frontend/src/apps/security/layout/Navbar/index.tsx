import type { MorphusProps } from '@core/types/morphus.type';

export type SidenavProps = {} & MorphusProps;

export function Sidenav({ children }: SidenavProps) {
    return <div className='security-sidenav shadow-lg shadow-black/50 border-b border-b-gray-300'>{children}</div>;
}
