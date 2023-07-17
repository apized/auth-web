import { Model } from './Base';

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
