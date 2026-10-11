<script setup>
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n({ useScope: 'global' })

const emit = defineEmits(['showMetricInfo'])
</script>

<template>
  <!-- 2. Size and Market Metrics -->
  <q-expansion-item
    :content-inset-level="0"
    class="text-blue-5"
    :label="t('education.companyAnalysis.sizeAndMarketMetrics.label')"
    :caption="`${tm(`education.companyAnalysis.sizeAndMarketMetrics.metrics`).length} ${t('metrics')}`"
  >
    <q-btn
      v-for="(m, i) in tm(`education.companyAnalysis.sizeAndMarketMetrics.metrics`)"
      :key="i"
      :label="m.label"
      style="width: 100%"
      class="q-mb-xs"
      @click="emit('showMetricInfo', m.label, m.description, m.formula)"
    />
  </q-expansion-item>
</template>
