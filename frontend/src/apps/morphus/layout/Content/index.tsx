import type { MorphusProps } from '@core/types/morphus.type';

export type MpxContentProps = {} & MorphusProps;

export function MpxContent({ children }: MpxContentProps) {
    return <div className='morphus-content'>{children}</div>;
}
