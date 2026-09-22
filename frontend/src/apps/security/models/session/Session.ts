import type { User } from '@security/entities/user/User';

export interface MorphusSession {
    user?: User;
}

export const sessionInitialState: MorphusSession = {
    user: {
        businessUsers: [],
        userClaims: [],
        userRoles: [],
    },
};
