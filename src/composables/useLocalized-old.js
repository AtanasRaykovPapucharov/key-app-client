import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALES, toShort } from 'src/i18n/locales'

/**
 * Shared localisation helper for components.
 *
 * - `t`        vue-i18n translate for UI strings (src/i18n/<locale>/app.js)
 * - `lang`     'en' | 'bg' — key used by bilingual content data
 * - `isBg`     convenience flag
 * - `tx(v)`    resolve bilingual data: { en, bg } objects, or plain strings
 * - `field(o, 'label')` resolve `label` / `labelBg` style pairs on data rows
 * - `n(v, opts)` / `d(v, opts)` locale-aware number / date formatting
 */
export function useLocalized() {
  const { t, te, locale } = useI18n({ useScope: 'global' })
  const lang = computed(() => toShort(locale.value))
  const isBg = computed(() => lang.value === 'bg')

  const tx = (value) => {
    if (value == null) return ''
    if (typeof value !== 'object') return value
    return value[lang.value] ?? value.en ?? value.bg ?? ''
  }

  const field = (obj, key) => {
    if (!obj) return ''
    if (isBg.value) {
      const bg = obj[`${key}Bg`] ?? obj[`${key}_bg`]
      if (bg != null && bg !== '') return bg
    }
    return tx(obj[key])
  }

  const n = (value, opts = {}) => {
    const num = Number(value)
    if (!Number.isFinite(num)) return '—'
    return new Intl.NumberFormat(locale.value, opts).format(num)
  }

  const d = (value, opts = {}) => {
    if (value == null || value === '') return '—'
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat(locale.value, opts).format(date)
  }

  const setLocale = (code) => {
    if (LOCALES.some((l) => l.code === code)) locale.value = code
  }

  return { t, te, locale, lang, isBg, tx, field, n, d, setLocale, locales: LOCALES }
}
