import { Model } from './Base';

export enum OauthProvider {
  Google = "Google",
  Apple = "Apple",
  Microsoft = "Microsoft",
  Facebook = "Facebook",
  GitHub = "GitHub",
  Slack = "Slack",
  LinkedIn = "LinkedIn"
}

type Permissionable = {
  description?: string;
  permissions?: string[];
  users?: AuthUser | string[];
}

export type AuthUser = Permissionable & {
  name?: string;
  username?: string;
  password?: string;
  verified?: boolean;
  emailVerificationCode?: string;
  passwordResetCode?: string;
  roles?: AuthRole[] | string[];
} & Model;

export type AuthRole = Permissionable & {
  name?: string;
} & Model;

export type LoginRequest = {
  username: string;
  password: string;
} & Model;

export type AuthOauth = {
  name?: string;
  slug?: string;
  provider?: OauthProvider;
  clientId?: string;
  clientSecret?: string;
  loginUrl?: string;
} & Model;

export type AuthToken = {
  jwt?: string;
} & Model