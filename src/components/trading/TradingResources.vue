<script setup>
import Resources from 'src/components/ResourcesView.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { tm } = useI18n({ useScope: 'global' })

// books come straight from the active locale's messages,
// so switching language swaps both UI strings and book content
const books = computed(() => {
  const localizedBooks = tm('trading_books')
  return Array.isArray(localizedBooks) ? localizedBooks : []
})
</script>

<template>
  <Resources :books="books" from="Trading" title="Resources" text-color="red-5" />
</template>
