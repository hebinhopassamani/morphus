import { SessionContext } from '@morphus/contexts/Session/SessionContext';
import { useContext } from 'react';

export function useSessionContext() {
    return useContext(SessionContext);
}
