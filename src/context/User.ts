import { Permissionable } from './Permissionable';
import { Role } from './Role';
import { AuthRole, AuthUser } from "../api/models/Auth";

export class User extends Permissionable {
  public readonly username: string;

  public readonly roles: Role[];

  constructor(authUser: AuthUser | undefined) {
    super(authUser);
    this.username = authUser?.username || '';
    this.roles = (authUser?.roles as AuthRole[] || []).map((r) => new Role(r));
  }

  isAllowed(perm: string): boolean {
    if (super.isAllowed(perm)) {
      return true;
    }

    return this.roles.some((r) => r.isAllowed(perm));
  }
}
