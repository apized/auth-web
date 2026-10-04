import { __test__ } from './Passkeys';

test('base64url values round-trip to and from WebAuthn bytes', () => {
  const bytes = new Uint8Array([ 0, 1, 2, 250, 251, 252 ]);
  const encoded = __test__.uint8ArrayToBase64Url(bytes);
  expect(encoded).toBe('AAEC-vv8');
  expect(Array.from(__test__.base64UrlToUint8Array(encoded))).toEqual(Array.from(bytes));
});

test('decodes WebAuthn options only for binary challenge and credential IDs', () => {
  const result = __test__.decodeOptions({
    challenge: 'AQID',
    user: { id: 'BAUG', name: 'user@example.com' },
    allowCredentials: [ { id: 'BwgJ', type: 'public-key' } ],
    timeout: 30000,
  }) as { challenge: Uint8Array; user: { id: Uint8Array; name: string }; allowCredentials: { id: Uint8Array }[]; timeout: number };
  expect(Array.from(result.challenge)).toEqual([ 1, 2, 3 ]);
  expect(Array.from(result.user.id)).toEqual([ 4, 5, 6 ]);
  expect(Array.from(result.allowCredentials[0].id)).toEqual([ 7, 8, 9 ]);
  expect(result.timeout).toBe(30000);
});
