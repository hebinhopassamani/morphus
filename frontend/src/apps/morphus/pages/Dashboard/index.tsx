import { useParams } from 'react-router';
import styles from './styles.module.css';
import type { MorphusProps } from '@core/types/morphus.type';

interface MpxDashboardPageProps extends MorphusProps {}

export function MpxDashboardPage({ children }: MpxDashboardPageProps) {
    const params = useParams();
    return <div className={styles.dashboard}>{`${children} ${params.id}`}</div>;
}
