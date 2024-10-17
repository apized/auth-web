export enum Operation {
  Equals = '=',
  GreaterThan = '>',
  GreaterThanEquals = '>=',
  LessThan = '<',
  LessThanEquals = '<=',
  Like = '~=',
  NotEquals = '!=',
}

export type SearchTerm = {
  id?: string;
  display?: string;
  field?: string;
  op?: Operation;
  value?: any;
};

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type SortTerm = {
  direction?: SortDirection;
  display?: string;
  field?: string;
};
