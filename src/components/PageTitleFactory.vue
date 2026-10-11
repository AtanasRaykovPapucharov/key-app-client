<script setup>
import { useI18n } from 'vue-i18n'
import ICON from 'src/helpers/icons'

const props = defineProps({
  from: { type: String, required: true },
  title: { type: String, required: true },
})

const textColor = () => {
  switch (props.from.toLowerCase()) {
    case 'stocks':
      return 'green-5'
    case 'mechanics':
      return 'green-5'
    case 'chess':
      return 'green-5'
    case 'bonds':
      return 'red-5'
    case 'math':
      return 'grey-5'
    case 'crypto':
      return 'orange-5'
    case 'realestate':
      return 'blue-5'
    case 'electrodynamics':
      return 'blue-5'
    case 'trading':
      return 'purple-4'
    case 'termodynamics':
      return 'red-5'
    case 'mindset':
      return 'purple-5'
    case 'atom':
      return 'purple-5'

    default:
      return 'green-5'
  }
}

const { t } = useI18n({ useScope: 'global' })
</script>

<template>
  <div class="q-px-md">
    <q-item-label :class="`text-h6 text-weight-bold text-${textColor()}`">
      <span>{{ t(`pageTitles.subjects.${from.toLowerCase()}`) }}</span>
      <q-space />
      <q-icon :name="ICON[title.toUpperCase()]" size="20px" class="q-mr-sm q-mb-xs" />
      <span style="font-size: 20px">{{ t(`pageTitles.sections.${title.toLowerCase()}`) }}</span>
    </q-item-label>
  </div>
</template>
