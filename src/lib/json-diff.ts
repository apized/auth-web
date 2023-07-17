/* eslint-disable no-prototype-builtins,@typescript-eslint/no-use-before-define */
export const isObject = (value: any): boolean =>
  !!value && typeof value === 'object' && value !== null;

export const isNotNull = (value: any): boolean =>
  value !== null && value !== undefined;

export const isArray = (value: any): boolean =>
  !!value && typeof value === 'object' && Array.isArray(value);

export const getChangesBetweenObjects = (a: any, b: any): any => {
  let changes: any = {};

  if (!isObject(a) || !isObject(b)) {
    if (a !== b) {
      changes = 'changed';
    }
    return changes;
  }

  Object.keys(b).forEach((prop) => {
    if (a.hasOwnProperty(prop)) {
      if (a[prop] !== b[prop]) {
        if (isObject(a[prop]) && isObject(b[prop])) {
          let subChanges;
          if (isArray(a[prop]) && isArray(b[prop])) {
            subChanges = getChangesBetweenArrays(a[prop], b[prop]);
          } else {
            subChanges = getChangesBetweenObjects(a[prop], b[prop]);
          }
          if (Object.keys(subChanges).length > 0) {
            changes[prop] = subChanges;
          }
        } else {
          changes[prop] = 'changed';
        }
      }
    } else {
      changes[prop] = 'added';
    }
  });

  Object.keys(a).forEach((prop) => {
    if (a.hasOwnProperty(prop) && !b.hasOwnProperty(prop)) {
      changes[prop] = 'removed';
    }
  });

  return changes;
};

export const getChangesBetweenArrays = (a: any[], b: any[]): any => {
  const changes: { [key: string]: any } = {};
  a.forEach((elA, idx) => {
    if (!b[idx]) {
      changes[idx] = 'removed';
    } else {
      const subChanges = getChangesBetweenObjects(elA, b[idx]);
      if (
        typeof subChanges !== 'object' ||
        Object.keys(subChanges).length > 0
      ) {
        changes[idx] = subChanges;
      }
    }
  });

  b.forEach((val, idx) => {
    if (!a[idx]) {
      changes[idx] = 'added';
    }
  });

  return changes;
};

export const diff = (a: any, b: any): { [key: string]: any } => {
  const changes: any = isArray(a) && isArray(b) ? getChangesBetweenArrays(a, b) : getChangesBetweenObjects(a, b);
  let result: any = {};

  Object.keys(a).forEach((prop) => {
    if (!isObject(changes[prop])) {
      if (changes[prop]) {
        result[prop] = {
          ___leftValue: a[prop],
          ___rightValue: b[prop],
          ___type: changes[prop],
        };
        result.___type = 'innerChange';
      } else {
        if (!isObject(a)) {
          result = a;
        }
        result[prop] = a[prop];
      }
    } else {
      result[prop] = diff(a[prop], b[prop]);
      if (result[prop].___type) {
        result.___type = 'innerChange';
      }
    }
  });

  Object.keys(changes).forEach((prop) => {
    if (changes.hasOwnProperty(prop) && !isObject(changes[prop])) {
      result[prop] = {
        ___leftValue: a[prop],
        ___rightValue: b[prop],
        ___type: changes[prop],
      };
      result.___type = 'innerChange';
    }
  });

  return result;
};
