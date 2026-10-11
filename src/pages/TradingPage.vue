<script setup>
import TradingFundamentals from 'src/components/trading/TradingFundamentals.vue'
import TradingAnalysis from 'src/components/trading/TradingAnalysis.vue'
import TradingResources from 'src/components/trading/TradingResources.vue'

defineProps({
  route: {
    type: String,
    default: () => 'analysis',
  },
})
</script>

<template>
  <q-page class="q-pa-none">
    <TradingFundamentals v-if="route === 'fundamentals'" />
    <TradingAnalysis v-if="route === 'analysis'" />
    <TradingResources v-if="route === 'resources'" />
  </q-page>
</template>
