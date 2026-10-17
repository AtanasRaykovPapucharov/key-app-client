/**
 * Runtime configuration resolved at build time.
 *
 * Set QCLI_SERVER_URL to the public server origin, e.g. https://api.example.com
 * (no trailing slash, no /api). It can come from a .env file or from the
 * hosting provider's environment variables (forwarded in quasar.config.js).
 * QCLI_API_URL is accepted as a legacy alias.
 */
const DEV_FALLBACK = 'http://localhost:3000'

const configured = (
  import.meta.env.QCLI_SERVER_URL ||
  import.meta.env.QCLI_API_URL ||
  process.env.SERVER_URL ||
  ''
).trim()

// localhost only makes sense on the developer's own machine
const raw = configured || (import.meta.env.DEV ? DEV_FALLBACK : '')

export const SERVER_URL = raw.replace(/\/+$/, '').replace(/\/api$/, '')
export const API_URL = SERVER_URL ? `${SERVER_URL}/api` : ''
export const WS_URL = SERVER_URL.replace(/^http/, 'ws')
export const isServerConfigured = Boolean(SERVER_URL)

if (import.meta.env.PROD && typeof window !== 'undefined') {
  if (!configured) {
    console.error(
      '[config] QCLI_SERVER_URL is not set. The app cannot reach the API. ' +
        'Set it in your hosting environment variables and rebuild.',
    )
  } else if (
    window.location.protocol === 'https:' &&
    SERVER_URL.startsWith('http://') &&
    !/^http:\/\/(localhost|127\.0\.0\.1)/.test(SERVER_URL)
  ) {
    console.error(
      '[config] The API uses http:// but the app is served over https://. ' +
        'Browsers block these requests (mixed content). Use an https:// API URL.',
    )
  }
}
