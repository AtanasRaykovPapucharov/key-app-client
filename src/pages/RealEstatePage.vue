<script setup>
import RealEstateFundamentals from 'src/components/real-estate/RealEstateFundamentals.vue'
import RealEstateAnalysis from 'src/components/real-estate/RealEstateAnalysis.vue'
import RealEstateResources from 'src/components/real-estate/RealEstateResources.vue'

defineProps({
  route: {
    type: String,
    default: () => 'analysis',
  },
})
</script>

<template>
  <q-page class="q-pa-none bg-dark">
    <RealEstateFundamentals v-if="route === 'fundamentals'" />
    <RealEstateAnalysis v-if="route === 'analysis'" />
    <RealEstateResources v-if="route === 'resources'" />
  </q-page>
</template>
