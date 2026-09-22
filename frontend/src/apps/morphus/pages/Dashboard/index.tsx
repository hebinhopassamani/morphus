import type { MorphusProps } from '@core/types/morphus.type';
import { useParams } from 'react-router';
import styles from './Styles.module.css';

type DashboardPageProps = {} & MorphusProps;

export function DashboardPage({ children }: DashboardPageProps) {
    const params = useParams();
    return <div className={styles.dashboard}>{`${children} ${params.id}`}</div>;
}
