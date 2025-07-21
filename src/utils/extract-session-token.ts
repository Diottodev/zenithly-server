import { env } from '../env.ts';

/**
 * Extracts the session token from a given cookie header string.
 *
 * @param param0 - An object containing the `cookie` string, which may be undefined.
 * @returns The extracted session token if found, otherwise `undefined`.
 
 */
export function extractSessionToken({
  cookie,
}: {
  cookie: string | undefined;
}): string | undefined {
  if (!cookie) {
    return;
  }
  const cookies = cookie.split(';').reduce(
    (acc, item) => {
      const [key, value] = item.trim().split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    },
    {} as Record<string, string>
  );
  if (env.NODE_ENV === 'development') {
    if ('better-auth.session_token' in cookies) {
      return `better-auth.session_token=${cookies['better-auth.session_token']}`;
    }
    return;
  }
  if ('__Secure-better-auth.session_token' in cookies) {
    return `__Secure-better-auth.session_token=${cookies['__Secure-better-auth.session_token']}`;
  }
  return;
}
