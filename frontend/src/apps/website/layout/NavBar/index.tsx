import type { MorphusProps } from '@core/types/morphus.type';

type NavbarProps = {} & MorphusProps;

export function Navbar({ children }: NavbarProps) {
    return <div className='website-navbar'>{children}</div>;
}
