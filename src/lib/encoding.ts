import { UserPayload } from '@/types/audit';

export function encodePayload(payload: UserPayload): string {
  const jsonStr = JSON.stringify(payload);
  if (typeof window !== 'undefined') {
    try {
      // Safe UTF-8 base64 encoding in browser
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      const len = utf8Bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const base64 = btoa(binary);
      return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } catch (e) {
      console.error('Browser encoding error:', e);
    }
  }
  // Node.js fallback (or Server side)
  return Buffer.from(jsonStr).toString('base64url');
}

export function decodePayload(encoded: string): UserPayload | null {
  try {
    // Standardize URL-safe base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    if (typeof window !== 'undefined') {
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      return JSON.parse(jsonStr) as UserPayload;
    } else {
      const jsonStr = Buffer.from(base64, 'base64').toString('utf8');
      return JSON.parse(jsonStr) as UserPayload;
    }
  } catch (e) {
    console.error('Error decoding payload:', e);
    return null;
  }
}
