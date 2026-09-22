import { SessionContext } from '@security/contexts/Session/SessionContext';
import { useContext } from 'react';

export function useSessionContext() {
    return useContext(SessionContext);
}
