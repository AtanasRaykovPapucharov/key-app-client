/**
 * Aggregates the UI-string namespaces under `app.*`.
 * Each area lives in src/i18n/<locale>/app/<area>.json and both locales
 * must keep the same key structure.
 */
const enModules = import.meta.glob('./en-US/app/*.json', { eager: true, import: 'default' })
const bgModules = import.meta.glob('./bg-BG/app/*.json', { eager: true, import: 'default' })

const toTree = (modules) =>
  Object.fromEntries(
    Object.entries(modules).map(([path, mod]) => [path.split('/').pop().replace('.json', ''), mod]),
  )

export const appEn = toTree(enModules)
export const appBg = toTree(bgModules)
