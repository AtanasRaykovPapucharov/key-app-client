<script setup>
import ElectrodynamicsFundamentals from 'src/components/electrodynamics/ElectrodynamicsFundamentals.vue'
import ElectrodynamicsAnalysis from 'src/components/electrodynamics/ElectrodynamicsAnalysis.vue'
import ElectrodynamicsResources from 'src/components/electrodynamics/ElectrodynamicsResources.vue'

defineProps({
  route: {
    type: String,
    default: () => 'analysis',
  },
})
</script>

<template>
  <q-page class="q-pa-none">
    <ElectrodynamicsFundamentals v-if="route === 'fundamentals'" />
    <ElectrodynamicsAnalysis v-if="route === 'analysis'" />
    <ElectrodynamicsResources v-if="route === 'resources'" />
  </q-page>
</template>
