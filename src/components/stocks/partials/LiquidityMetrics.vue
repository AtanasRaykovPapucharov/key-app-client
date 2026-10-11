<script setup>
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n({ useScope: 'global' })
const emit = defineEmits(['metricInfo'])
</script>

<template>
  <!-- 5. Liquidity -->
  <q-expansion-item
    group="company_metrics"
    :content-inset-level="0"
    class="text-green-5"
    :label="t('education.companyAnalysis.liquidity.label')"
  >
    <q-btn
      v-for="(m, i) in tm(`education.companyAnalysis.liquidity.metrics`)"
      :key="i"
      :label="m.label"
      style="width: 100%"
      class="q-mb-xs"
      @click="emit('metricInfo', m.label, m.description, m.formula)"
    />
  </q-expansion-item>
</template>
