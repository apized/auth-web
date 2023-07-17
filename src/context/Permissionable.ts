export class Permissionable {
  public readonly id: string;

  private permissions: string[];

  public readonly name: string;

  constructor(
    obj: {
      id?: string;
      name?: string;
      permissions?: string[];
    } | undefined,
  ) {
    this.id = obj?.id || '';
    this.name = obj?.name || '';
    this.permissions = (obj?.permissions || []).map((p) => p || '');
  }

  isAllowed(perm: string): boolean {
    return this.permissions.some((perm_to_check: string) => {
      const perm_to_check_regex = perm_to_check.replace(/\*/g, '[^\\.]+');
      return perm.match(
        new RegExp(`^(${perm_to_check_regex})|(${perm_to_check_regex}\\..*)$`),
      );
    });
  }
}
