<script setup>
import { useLocalized } from 'src/composables/useLocalized'

defineProps({
  /** 'toggle' = compact EN/BG segmented control, 'select' = dropdown with full names */
  variant: { type: String, default: 'toggle' },
})

const { t, locale, locales, setLocale } = useLocalized()
const options = locales.map((l) => ({ value: l.code, label: l.label, abbr: l.abbr }))
</script>

<template>
  <q-btn-toggle
    v-if="variant === 'toggle'"
    :model-value="locale"
    :options="
      options.map((o) => ({
        value: o.value,
        label: o.abbr,
        attrs: { 'aria-label': o.label, lang: o.value },
      }))
    "
    class="language-toggle"
    toggle-color="primary"
    color="transparent"
    text-color="grey-5"
    dense
    unelevated
    no-caps
    rounded
    :aria-label="t('app.layout.header.language')"
    @update:model-value="setLocale"
  />
  <q-select
    v-else
    :model-value="locale"
    :options="options"
    :label="t('app.layout.header.language')"
    dense
    borderless
    emit-value
    map-options
    options-dense
    class="language-select"
    @update:model-value="setLocale"
  />
</template>

<style scoped>
.language-toggle {
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.language-toggle :deep(.q-btn) {
  min-height: 26px;
  min-width: 34px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 700;
}

.language-select {
  min-width: 110px;
  max-width: 240px;
}
</style>
