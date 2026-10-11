<script setup>
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n({ useScope: 'global' })
const localeOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'bg-BG', label: 'Български' },
]
</script>

<template>
  <q-select
    v-model="locale"
    :options="localeOptions"
    :label="t('common.language')"
    dense
    borderless
    emit-value
    map-options
    options-dense
    style="max-width: 240px; min-width: 90px"
  />
</template>
