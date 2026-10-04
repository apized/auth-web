import { Model } from './models/Base';

const authServer = window._env_?.AUTH_SERVER_URL || 'https://auth-server.local.mooglest.com';

export type Passkey = {
  credentialId?: string;
  signCount?: number;
  aaguid?: string;
  transports?: string[];
} & Model;

type ChallengeResponse<T> = { challengeId: string; options: T };
type PublicKeyOptions = Record<string, unknown>;

type CredentialResponse = {
  id: string;
  rawId: string;
  type: string;
  response: Record<string, unknown>;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  authenticatorAttachment: string | null;
};

const binaryOptionFields = new Set([ 'challenge', 'id' ]);

const base64UrlToUint8Array = (value: string): Uint8Array => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = window.atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const uint8ArrayToBase64Url = (value: ArrayBuffer | ArrayBufferView): string => {
  const bytes = value instanceof ArrayBuffer
    ? new Uint8Array(value)
    : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const isBinary = (value: unknown): value is ArrayBuffer | ArrayBufferView => {
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
};

const decodeOptions = (value: unknown, field?: string): unknown => {
  if (typeof value === 'string' && field && binaryOptionFields.has(field)) {
    return base64UrlToUint8Array(value);
  }
  if (Array.isArray(value)) return value.map((item) => decodeOptions(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([ key, item ]) => [ key, decodeOptions(item, key) ]));
  }
  return value;
};

const serialize = (value: unknown): unknown => {
  if (isBinary(value)) return uint8ArrayToBase64Url(value);
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([ key, item ]) => [ key, serialize(item) ]));
  }
  return value;
};

const serializeCredential = (credential: PublicKeyCredential): CredentialResponse => {
  const response = credential.response;
  const responseFields = response instanceof AuthenticatorAttestationResponse
    ? {
      clientDataJSON: response.clientDataJSON,
      attestationObject: response.attestationObject,
      transports: typeof response.getTransports === 'function' ? response.getTransports() : undefined,
    }
    : {
      clientDataJSON: response.clientDataJSON,
      authenticatorData: (response as AuthenticatorAssertionResponse).authenticatorData,
      signature: (response as AuthenticatorAssertionResponse).signature,
      userHandle: (response as AuthenticatorAssertionResponse).userHandle,
    };
  return {
    id: credential.id,
    rawId: uint8ArrayToBase64Url(credential.rawId),
    type: credential.type,
    response: serialize(responseFields) as Record<string, unknown>,
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: credential.authenticatorAttachment,
  };
};

const request = async <T>(path: string, method: 'GET' | 'POST' | 'DELETE', body?: unknown): Promise<T> => {
  const response = await fetch(`${authServer}${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    method,
  });
  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.errors?.map((error: { message: string }) => error.message).join(', ')
      || payload?.message || 'Passkey request failed';
    throw new Error(message);
  }
  return payload as T;
};

export const isPasskeySupported = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.PublicKeyCredential && navigator.credentials);
};

export const authenticateWithPasskey = async (username?: string): Promise<void> => {
  const challenge = await request<ChallengeResponse<PublicKeyOptions>>(
    '/passkeys/challenges/authentication', 'POST', username ? { username } : undefined,
  );
  const credential = await navigator.credentials.get({
    publicKey: decodeOptions(challenge.options) as PublicKeyCredentialRequestOptions,
  });
  if (!credential) throw new Error('No passkey was selected');
  await request('/passkeys/authentication', 'POST', {
    challengeId: challenge.challengeId,
    credential: serializeCredential(credential as PublicKeyCredential),
  });
};

export const registerPasskey = async (): Promise<Passkey> => {
  const challenge = await request<ChallengeResponse<PublicKeyOptions>>('/passkeys/challenges/register', 'POST');
  const credential = await navigator.credentials.create({
    publicKey: decodeOptions(challenge.options) as PublicKeyCredentialCreationOptions,
  });
  if (!credential) throw new Error('Passkey registration was cancelled');
  return request<Passkey>('/passkeys/register', 'POST', {
    challengeId: challenge.challengeId,
    credential: serializeCredential(credential as PublicKeyCredential),
  });
};

export const listPasskeys = (): Promise<Passkey[]> => request('/passkeys', 'GET');
export const deletePasskey = (id: string): Promise<Passkey> => request(`/passkeys/${id}`, 'DELETE');

export const __test__ = { base64UrlToUint8Array, decodeOptions, serialize, uint8ArrayToBase64Url };
