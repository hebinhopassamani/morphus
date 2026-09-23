import { type SetStateType } from '@core/types/React.types';
import { sessionInitialState, type MorphusSession } from '@morphus/models/session/Session';

import { createContext } from 'react';

type SessionContextProps = {
    session: MorphusSession;
    setSession: SetStateType<MorphusSession>;
};

const initialValue = {
    session: sessionInitialState,
    setSession: () => {},
};

export const SessionContext = createContext<SessionContextProps>(initialValue);
