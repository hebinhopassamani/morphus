export interface User {
    id?: string;
    name?: string;
    email?: string;
    inactive?: boolean;
    system?: boolean;
    termsConfirmed?: boolean;
    emailConfirmed?: boolean;
    phoneConfirmed?: boolean;
    userStatusId?: string;
    passwordHash?: string;
    nickName?: string;
    phoneNumber?: string;
    picture?: string;
    website?: string;
    gender?: string;
    refreshToken?: string;
    refreshTokenExpiration?: Date;
    birthdate?: Date;
    securityStamp?: string;
    concurrencyStamp?: string;

    userRoles: [];
    userClaims: [];
    businessUsers: [];
}
