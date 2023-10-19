import { ApizedAuditEntry, ApizedDefinition, Service } from './Api';
import { AuthOauth, AuthRole, AuthToken, AuthUser, LoginRequest } from "./models/Auth";
import { Model } from "./models/Base";

export const Apis = {
  Auth: {
    AuditInstance: {
      path: '/audit/[entity]/[target]',
      service: Service.Auth,
    } as ApizedDefinition<ApizedAuditEntry>,
    Me: {
      path: '/tokens',
      service: Service.Auth,
    } as ApizedDefinition<AuthUser>,
    User: {
      path: '/users',
      service: Service.Auth,
    } as ApizedDefinition<AuthUser>,
    NonExpiringToken: {
      path: '/tokens/[user]?expiring=false',
      service: Service.Auth,
    } as ApizedDefinition<AuthToken>,
    ExpiringToken: {
      path: '/tokens/[user]?expiring=true',
      service: Service.Auth,
    } as ApizedDefinition<AuthToken>,
    Role: {
      path: '/roles',
      service: Service.Auth,
    } as ApizedDefinition<AuthRole>,
    Login: {
      path: '/tokens',
      service: Service.Auth,
    } as ApizedDefinition<LoginRequest>,
    OauthLogin: {
      path: '/tokens/oauth',
      service: Service.Auth,
    } as ApizedDefinition<Model>,
    Oauth: {
      path: '/oauths',
      service: Service.Auth,
    } as ApizedDefinition<AuthOauth>
  },
};
