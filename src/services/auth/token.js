/**
 * Auth token storage, kept separate from the user profile object so that
 * restoring or updating the user never overwrites the token.
 *
 * Legacy servers don't issue a token; in that case requests fall back to
 * sending the user id (the previous behaviour) until the server is updated.
 */
const TOKEN_KEY = 'keyapp:token'
const LEGACY_KEY = 'token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function clearToken() {
  setToken(null)
}

/** Pick the token from a login/register response, whatever the server calls it. */
export function extractToken(data) {
  return data?.token || data?.accessToken || data?.access_token || data?.user?.token || null
}

/**
 * The server returns two ids: `uid` (UUID, used by most API routes) and
 * `id` (numeric database id, used by /user/:id and the WebSocket).
 */
export const userIdOf = (user) => user?.uid ?? null
export const numericIdOf = (user) => user?.id ?? null
