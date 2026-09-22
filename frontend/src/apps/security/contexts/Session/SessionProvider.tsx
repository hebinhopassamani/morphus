import { type MorphusProps } from '@core/types/morphus.type';
import { SessionContext } from '@security/contexts/Session/SessionContext';
import { sessionInitialState } from '@security/models/session/Session';

import { useState } from 'react';

type ProviderProps = {} & MorphusProps;

export function SessionProvider({ children }: ProviderProps) {
    const [session, setSession] = useState(sessionInitialState);

    return <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>;
}
