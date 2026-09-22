import type { MorphusProps } from '@core/types/morphus.type';

export type NavbarProps = {} & MorphusProps;

export function Navbar({ children }: NavbarProps) {
    return <div className='morphus-navbar'>{children}</div>;
}
