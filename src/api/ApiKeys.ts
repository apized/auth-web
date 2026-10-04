import { Page, serviceRegistry } from './Api';
import { Model } from './models/Base';

export type ApiKey = { name: string } & Model;

export type CreatedApiKey = ApiKey & { key: string };

const request = async <T>(path: string, method: 'GET' | 'POST' | 'DELETE', body?: unknown): Promise<T> => {
  const response = await fetch(`${serviceRegistry.auth}${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    method,
  });
  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.errors?.map((error: { message: string }) => error.message).join(', ')
      || payload?.message || 'API key request failed';
    throw new Error(message);
  }
  return payload as T;
};

export const listApiKeys = (): Promise<Page<ApiKey>> => request('/apiKeys', 'GET');

export const createApiKey = (name: string): Promise<CreatedApiKey> => request('/apiKeys', 'POST', { name });

export const revokeApiKey = (id: string): Promise<ApiKey> => request(`/apiKeys/${id}`, 'DELETE');
