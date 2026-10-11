<script setup>
import MathFundamentals from 'src/components/math/MathFundamentals.vue'
import MathAnalysis from 'src/components/math/MathAnalysis.vue'
import MathResources from 'src/components/math/MathResources.vue'
import MathExamer from 'src/components/math/quiz/QuizApp.vue'

defineProps({
  route: {
    type: String,
    default: () => 'analysis',
  },
})
</script>

<template>
  <q-page class="q-pa-none bg-dark">
    <MathFundamentals v-if="route === 'fundamentals'" />
    <MathAnalysis v-if="route === 'analysis'" />
    <MathResources v-if="route === 'resources'" />
    <MathExamer v-if="route === 'examer'" />
  </q-page>
</template>
