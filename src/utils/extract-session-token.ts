/**
 * Extracts the session token from a given cookie header string.
 *
 * @param param0 - An object containing the `cookie` string, which may be undefined.
 * @returns The extracted session token if found, otherwise `undefined`.
 *
 * @remarks
 * The function decodes the cookie header and attempts to match it against
 * the `SESSION_TOKEN_REGEX` regular expression. If a match is found, the session
 * token is returned; otherwise, `undefined` is returned.
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
  return (
    cookies['__Secure-better-auth.session_token'] ||
    cookies['better-auth.session_token'] ||
    undefined
  );
}
