import { Corporation } from '@security/entities/Corporations';
import { User } from '@security/entities/Users';

export interface AccessTokenInfo {
  creationDate: string;
  expirationDate: string;
  expirationTime: number;
  value: string;
}

export interface RefreshTokenInfo {
  creationDate: string;
  expirationDate: string;
  expirationTime: number;
  value: string;
}

export interface CorporationSummary {
  id: string;
  name: string;
  key: string;
  icon?: string;
  description?: string;
  parentCorporationId?: string;
  isOwner: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  corporationId?: string;
}

export interface GoogleLoginRequest {
  accessToken?: string;
  idToken?: string;
  corporationId?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  corporationId?: string;
}

export interface SwitchCorporationRequest {
  corporationId: string;
}

export interface CreateAccountRequest {
  corporationName: string;
  corporationFullName?: string;
  corporationIcon?: string;
  corporationEmail: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  phoneNumber?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface MorphusSession {
  user?: User;
  corporation?: Corporation;
  accessToken?: AccessTokenInfo;
  refreshToken?: RefreshTokenInfo;
  availableCorporations?: CorporationSummary[];
}
