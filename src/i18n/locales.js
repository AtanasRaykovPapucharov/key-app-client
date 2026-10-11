/**
 * Single source of truth for the languages the app supports.
 * `code` is the vue-i18n locale, `short` is the key used by the
 * bilingual content data files ({ en, bg }).
 */
export const LOCALES = [
  { code: 'en-US', short: 'en', label: 'English', abbr: 'EN', quasar: 'en-US' },
  { code: 'bg-BG', short: 'bg', label: 'Български', abbr: 'BG', quasar: 'bg' },
]

export const DEFAULT_LOCALE = 'en-US'
export const LOCALE_STORAGE_KEY = 'keyapp:locale'

export const isSupportedLocale = (code) => LOCALES.some((l) => l.code === code)

export const toShort = (code) => (code || DEFAULT_LOCALE).split('-')[0]

/** Saved choice → browser language → default. */
export function detectInitialLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isSupportedLocale(saved)) return saved
  } catch {
    /* storage unavailable (private mode) */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : []
  for (const lang of nav) {
    const match = LOCALES.find((l) => lang && lang.toLowerCase().startsWith(l.short))
    if (match) return match.code
  }
  return DEFAULT_LOCALE
}
