/**
 * Turns an API error into a message in the user's language.
 * Order: the server's machine-readable code → the connection problem
 * (network, timeout, server down) → a generic fallback.
 */
export function apiErrorMessage(t, err, { fallback = 'app.layout.auth.errors.unknown' } = {}) {
  const tryKey = (key) => (key && t(key) !== key ? t(key) : null)
  return (
    tryKey(err?.serverCode && `app.auth.codes.${err.serverCode}`) ||
    tryKey(err?.serverCode && `app.common.codes.${err.serverCode}`) ||
    tryKey(err?.kind && `app.layout.auth.errors.${err.kind}`) ||
    t(fallback)
  )
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
