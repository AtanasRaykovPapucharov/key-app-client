import { reactive } from 'vue'
import { fetchConfig } from 'src/services/auth/account'

/**
 * Server settings the UI adapts to (shared, loaded once).
 * Until the server answers, email features are treated as OFF, so the UI
 * never offers something (like "Forgot password?") the server can't do.
 */
const config = reactive({ loaded: false, emailEnabled: false, emailVerificationRequired: false })
let pending = null

export function loadServerConfig() {
  if (!pending) {
    pending = fetchConfig()
      .then((c) => {
        config.emailEnabled = Boolean(c?.emailEnabled)
        config.emailVerificationRequired = Boolean(c?.emailVerificationRequired)
      })
      .catch(() => {
        // Older server without /config, or offline: keep email features off
        pending = null
      })
      .finally(() => {
        config.loaded = true
      })
  }
  return pending
}

export function useServerConfig() {
  loadServerConfig()
  return config
}
