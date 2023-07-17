import { ApizedAuditEntry, ApizedDefinition, Service } from './Api';
import { AuthRole, AuthUser, LoginRequest } from "./models/Auth";

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
    Role: {
      path: '/roles',
      service: Service.Auth,
    } as ApizedDefinition<AuthRole>,
    Login: {
      path: '/tokens',
      service: Service.Auth,
    } as ApizedDefinition<LoginRequest>
  },
};
