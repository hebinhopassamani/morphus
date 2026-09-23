import type { MorphusProps } from '@core/types/morphus.type';

export type SecContentProps = {} & MorphusProps;

export function SecContent({ children }: SecContentProps) {
    return <div className='website-content'>{children}</div>;
}
