import type { MorphusProps } from '@core/types/morphus.type';

export type ContentProps = {} & MorphusProps;

export function Content({ children }: ContentProps) {
    return <div className='website-content'>{children}</div>;
}
