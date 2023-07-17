/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthUser } from './models/Auth';
import { Model, UUID } from './models/Base';
import { SearchTerm, SortTerm } from './Search';
import { EventBus } from "../lib/bus/EventBus";

const eventBus = new EventBus();

export const serviceRegistry: { [key: string]: string } = {
  auth: 'http://auth.lvh.me:8081',
};

export enum Service {
  Auth = 'auth',
}

export type ApizedAuditEntry = {
  action?: string;
  by?: AuthUser | UUID;
  payload: { [key: string]: unknown };
  reason?: string;
  target?: UUID;
  timestamp?: number;
  transactionId?: UUID;
  type?: string;
} & Model;

export type ApizedDefinition<T extends Model> = {
  path: string;
  service: Service;
};

export type Page<T extends Model> = {
  content: T[];
  total: number;
  totalPages: number;
};

export type ApiError = {
  errors: { message: string }[];
};

export type RequestParams<T extends Model> = {
  fields?: string[];
  headers?: Record<string, string>;
  onError?: (error: string) => void;
};

export type CreateParams<T extends Model> = {
  obj: T;
} & RequestParams<T>;

export type GetParams<T extends Model> = {
  id?: string;
  path?: string;
} & RequestParams<T>;

export type ListParams<T extends Model> = {
  page?: number;
  pageSize?: number;
  search?: SearchTerm[];
  sort?: SortTerm[];
} & RequestParams<T>;

export type UpdateParams<T extends Model> = {
  id: string;
  obj: T;
} & RequestParams<T>;

export type RemoveParams<T extends Model> = {
  id: string;
} & RequestParams<T>;

interface Api<T extends Model> {
  create(params: CreateParams<T>): Promise<T>;

  get(params: GetParams<T>): Promise<T>;

  list(params: ListParams<T>): Promise<Page<T>>;

  remove(params: RemoveParams<T>): Promise<void>;

  update(params: UpdateParams<T>): Promise<T>;
}

export type ApizedContext = {
  [key: string]: Model | string | undefined;
} & {
  token?: string;
};

const responseHandler = async <T extends Model | Page<Model>>(
  response: Response,
  onSuccess?: (obj: T) => void,
  onError?: (error: ApiError) => void,
) => {
  const json = await response.json();

  if (Math.floor(response.status / 100) === 2) {
    if (onSuccess) {
      onSuccess(json);
    }
    return json;
  }

  const hasNotAllowedError = (json as ApiError).errors?.some((e) => {
    return (
      e.message.indexOf('Not allowed') !== -1 ||
      e.message.indexOf('Unauthorized') !== -1
    );
  });
  if (hasNotAllowedError) {
    eventBus.dispatch('user-refetch');
  }

  if (onError) {
    onError(json);
  }

  return null;
};

const errorHandler = (
  reject: (error: any) => void,
  onError?: (error: string) => void,
) => {
  return onError
    ? (error: any): void => {
      let msg;
      if (error?.message) {
        // Micronaut error
        msg = error.message;
      } else if ((error as ApiError)?.errors) {
        // Apized error
        msg = (error as ApiError).errors?.[0].message;
      } else {
        // Unnkown error
        msg = error;
      }
      onError(msg);
      reject(error);
    }
    : reject;
};

const apiFor = <T extends Model>(
  type: ApizedDefinition<T>,
  context: ApizedContext,
): Api<T> => {
  const server = serviceRegistry[type.service.valueOf()];

  const endpoint = ({
    fields,
    id,
    sort,
    search,
    page,
    pageSize,
    path,
  }: {
    fields?: string[];
    id?: string;
    page?: number;
    pageSize?: number;
    path?: string;
    search?: SearchTerm[];
    sort?: SortTerm[];
  }): string => {
    let result = server;
    const params: { [key: string]: string } = {};
    // while (type.scope) {}
    result = `${result}${path || type.path}`;

    result?.match(/(?<=\[).*?(?=])/g)?.forEach((p) => {
      const model = context[p] as Model;
      if (model && model.id) {
        result = result.replace(new RegExp(`\\[${p}\\]`), model.id);
      } else if (context[p]) {
        result = result.replace(new RegExp(`\\[${p}\\]`), context[p] as string);
      }
    });

    if (id) {
      result = `${result}/${id}`;
    }

    if (page) {
      params.page = `${page}`;
    }

    if (pageSize) {
      params.pageSize = `${pageSize}`;
    }

    if (fields) {
      params.fields = fields.join(',');
    }

    if (search) {
      params.search = search
        .map(
          (t) =>
            `${t.field?.trim()}${t.op}${t.value === undefined ? '' : t.value}`,
        )
        .join(',');
    }

    if (sort) {
      params.sort = encodeURIComponent(JSON.stringify(sort));
    }

    if (Object.keys(params).length) {
      result = `${result}?${Object.keys(params)
        .map((k) => `${k}=${params[k]}`)
        .join('&')}`;
    }

    return result;
  };

  let defaultHeaders: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (context.token) {
    defaultHeaders = {
      ...defaultHeaders,
      Authorization: `Bearer ${context.token}`,
    };
  }

  const create = async ({
    fields,
    headers = {},
    obj,
    onError
  }: CreateParams<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      fetch(endpoint({ fields }), {
        body: JSON.stringify(obj),
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        method: 'POST',
      })
        .then((r) =>
          responseHandler<T>(r, resolve, errorHandler(reject, onError)),
        )
        .catch(errorHandler(reject, onError));
    });
  };

  const list = async ({
    page = 0,
    pageSize = 10,
    search,
    sort,
    fields,
    headers = {},
    onError,
  }: ListParams<T>): Promise<Page<T>> => {
    return new Promise<Page<T>>((resolve, reject) => {
      fetch(`${endpoint({ fields, page, pageSize, search, sort })}`, {
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        method: 'GET',
      })
        .then((r) =>
          responseHandler<Page<T>>(r, resolve, errorHandler(reject, onError)),
        )
        .catch(errorHandler(reject, onError));
    });
  };

  const get = ({
    path,
    id,
    fields,
    headers = {},
    onError,
  }: GetParams<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      fetch(endpoint({ fields, id, path }), {
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        method: 'GET',
      })
        .then((r) =>
          responseHandler<T>(r, resolve, errorHandler(reject, onError)),
        )
        .catch(errorHandler(reject, onError));
    });
  };

  const update = ({
    id,
    obj,
    fields,
    headers = {},
    onError,
  }: UpdateParams<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      fetch(endpoint({ fields, id }), {
        body: JSON.stringify(obj),
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        method: 'PUT',
      })
        .then((r) =>
          responseHandler<T>(r, resolve, errorHandler(reject, onError)),
        )
        .catch(errorHandler(reject, onError));
    });
  };

  const remove = ({
    id,
    headers = {},
    onError,
  }: RemoveParams<T>): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      fetch(endpoint({ id }), {
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        method: 'DELETE',
      })
        .then((r) =>
          responseHandler<T>(r, () => resolve(), errorHandler(reject, onError)),
        )
        .catch(errorHandler(reject, onError));
    });
  };

  return { create, get, list, remove, update };
};
export default apiFor;
