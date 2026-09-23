import type { MorphusProps } from '@core/types/morphus.type';

type SecNavbarProps = {} & MorphusProps;

export function SecNavbar({ children }: SecNavbarProps) {
    return <div className='website-navbar'>{children}</div>;
}
