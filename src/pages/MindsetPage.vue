<script setup>
import MindsetFundamentals from 'src/components/mindset/MindsetFundamentals.vue'
import MindsetAnalysis from 'src/components/mindset/MindsetAnalysis.vue'
import MindsetResources from 'src/components/mindset/MindsetResources.vue'

defineProps({
  route: {
    type: String,
    default: () => 'analysis',
  },
})
</script>

<template>
  <q-page class="q-pa-none">
    <MindsetFundamentals v-if="route === 'fundamentals'" />
    <MindsetAnalysis v-if="route === 'analysis'" />
    <MindsetResources v-if="route === 'resources'" />
  </q-page>
</template>
