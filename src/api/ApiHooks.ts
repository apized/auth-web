/* eslint-disable @typescript-eslint/no-floating-promises */
// noinspection JSIgnoredPromiseFromCall

import { useEffect, useState } from 'react';

import apiFor, {
  ApizedContext,
  ApizedDefinition,
  CreateParams,
  GetParams,
  ListParams,
  Page,
  RemoveParams,
  UpdateParams,
} from './Api';
import { Model } from './models/Base';

const enum ApiOperation {
  Create = 'create',
  Delete = 'delete',
  Get = 'get',
  List = 'list',
  Update = 'update',
}

const useApi = <T extends Model>(
  type: ApizedDefinition<T>,
  context: ApizedContext,
  params:
    | ListParams<T>
    | GetParams<T>
    | CreateParams<T>
    | UpdateParams<T>
    | RemoveParams<T>,
  operation: ApiOperation,
) => {
  const [requests, setRequests] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | Page<T> | undefined>(undefined);
  const [error, setError] = useState<unknown>(undefined);

  const contextStr = JSON.stringify(context);
  const paramsStr = JSON.stringify(params);

  useEffect(() => {
    const api = apiFor(type, context);
    const fetchData = async () => {
      setLoading(true);

      try {
        switch (operation) {
          case ApiOperation.List:
            setData(await api.list(params as ListParams<T>));
            break;
          case ApiOperation.Get:
            setData(await api.get(params as GetParams<T>));
            break;
          case ApiOperation.Create:
            setData(await api.create(params as CreateParams<T>));
            break;
          case ApiOperation.Update:
            setData(await api.update(params as UpdateParams<T>));
            break;
          case ApiOperation.Delete:
            await api.remove(params as RemoveParams<T>);
            break;
          default:
            throw Error(`Unknown operation ${operation as string}`);
        }
      } catch (e) {
        setError(e);
      }

      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, contextStr, paramsStr, type]);

  const refetch = () => {
    setLoading(true);
    setData(undefined);
    setRequests(requests + 1);
  };

  return { data, error, loading, refetch };
};

export const useApiList = <T extends Model>(
  type: ApizedDefinition<T>,
  context: ApizedContext,
  params: ListParams<T>,
) => {
  const hook = useApi(type, context, params, ApiOperation.List);
  return {
    data: hook.data as Page<T>,
    error: hook.error,
    loading: hook.loading,
    refetch: hook.refetch,
  };
};

export const useApiGet = <T extends Model>(
  type: ApizedDefinition<T>,
  context: ApizedContext,
  params: GetParams<T>,
) => {
  const hook = useApi(type, context, params, ApiOperation.Get);
  return {
    data: hook.data as T,
    error: hook.error,
    loading: hook.loading,
    refetch: hook.refetch,
  };
};

export const useApiCreate = <T extends Model>(
  type: ApizedDefinition<T>,
  context: ApizedContext,
  params: CreateParams<T>,
) => {
  const hook = useApi(type, context, params, ApiOperation.Create);
  return { data: hook.data as T, error: hook.error, loading: hook.loading };
};

export const useApiUpdate = <T extends Model>(
  type: ApizedDefinition<T>,
  context: ApizedContext,
  params: UpdateParams<T>,
) => {
  const hook = useApi(type, context, params, ApiOperation.Update);
  return { data: hook.data as T, error: hook.error, loading: hook.loading };
};

export const useApiDelete = <T extends Model>(
  type: ApizedDefinition<T>,
  context: ApizedContext,
  params: RemoveParams<T>,
) => {
  const hook = useApi(type, context, params, ApiOperation.Delete);
  return { error: hook.error, loading: hook.loading };
};
