<script setup>
import Resources from 'src/components/ResourcesView.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { tm } = useI18n({ useScope: 'global' })

// books come straight from the active locale's messages,
// so switching language swaps both UI strings and book content
const books = computed(() => {
  const localizedBooks = tm('investing_books')
  return Array.isArray(localizedBooks) ? localizedBooks : []
})

const links = [
  {
    url: 'finviz.com',
    description: 'Stock screener with heatmaps and market overview tools.',
    rating: 5,
  },
  {
    url: 'gurufocus.com',
    description: 'Value investing metrics and superinvestor portfolios.',
    rating: 4,
  },
  {
    url: 'companiesmarketcap.com',
    description: 'Market cap rankings and comparisons across companies.',
    rating: 4,
  },
  {
    url: 'macrotrends.net',
    description: 'Long-term historical financial and economic charts.',
    rating: 5,
  },
  {
    url: 'dataroma.com',
    description: 'Tracks portfolios of well-known value investors.',
    rating: 4,
  },
  {
    url: 'am.jpmorgan.com',
    description: 'Investment insights and market research from J.P. Morgan.',
    rating: 4,
  },
]
</script>

<template>
  <Resources
    :text-color="'green-5'"
    :books="books"
    :links="links"
    from="Stocks"
    title="Resources"
  />
</template>
