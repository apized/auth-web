import { Model } from './Base';

export enum OauthProvider {
  Google = "Google",
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