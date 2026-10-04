import { serviceRegistry } from './Api';
import { Model } from './models/Base';

export type ApiKey = {
  name: string;
  permissions: string[];
  expiresAt?: string;
  revokedAt?: string;
} & Model;

export type CreatedApiKey = { id: string; name: string; key: string } & Model;

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

export const listApiKeys = (): Promise<ApiKey[]> => request('/api-keys', 'GET');

export const createApiKey = (name: string, permissions: string[]): Promise<CreatedApiKey> => {
  return request('/api-keys', 'POST', { name, permissions });
};

export const revokeApiKey = (id: string): Promise<ApiKey> => request(`/api-keys/${id}`, 'DELETE');
