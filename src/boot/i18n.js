import { defineBoot } from '#q-app'
import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import { Lang } from 'quasar'
import messages from 'src/i18n'
import { DEFAULT_LOCALE, LOCALES, LOCALE_STORAGE_KEY, detectInitialLocale } from 'src/i18n/locales'

const quasarLangLoaders = {
  'en-US': () => import('quasar/lang/en-US.js'),
  bg: () => import('quasar/lang/bg.js'),
}

async function applyQuasarLang(code) {
  const entry = LOCALES.find((l) => l.code === code)
  if (!entry) return
  const loader = quasarLangLoaders[entry.quasar]
  if (!loader) return
  try {
    const mod = await loader()
    Lang.set(mod.default)
  } catch {
    /* keep the current Quasar pack */
  }
}

function applyDocumentLang(code) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('lang', code.split('-')[0])
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  missingWarn: false,
  fallbackWarn: false,
  messages,
})

export default defineBoot(({ app }) => {
  app.use(i18n)

  const locale = i18n.global.locale
  const sync = (code) => {
    applyDocumentLang(code)
    applyQuasarLang(code)
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, code)
    } catch {
      /* storage unavailable */
    }
  }
  sync(locale.value)
  watch(locale, sync)
})
