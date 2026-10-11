<script setup>
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n({ useScope: 'global' })
const emit = defineEmits(['metricInfo'])
</script>

<template>
  <q-expansion-item
    :content-inset-level="0.2"
    class="text-green-5"
    :label="t('education.companyAnalysis.investclub.label')"
    :caption="`${tm(`education.companyAnalysis.investclub.lect_1.metrics`).length} ${t('metrics')}`"
  >
    <q-expansion-item
      :content-inset-level="0"
      :label="t('education.companyAnalysis.investclub.lect_1.label')"
      :caption="`${tm(`education.companyAnalysis.investclub.lect_1.metrics`).length} ${t('metrics')}`"
    >
      <q-btn
        v-for="(m, i) in tm(`education.companyAnalysis.investclub.lect_1.metrics`)"
        :key="i"
        :label="m.label"
        style="width: 100%"
        class="q-mb-xs"
        @click="emit('metricInfo', m.label, m.description, m.formula)"
      />
    </q-expansion-item>

    <!-- <q-expansion-item
      :content-inset-level="0"
      :label="t('education.companyAnalysis.profitability.returns.label')"
      :caption="`${tm(`education.companyAnalysis.profitability.returns.metrics`).length} ${t('metrics')}`"
    >
      <q-btn
        v-for="(m, i) in tm(`education.companyAnalysis.profitability.returns.metrics`)"
        :key="i"
        :label="m.label"
        style="width: 100%"
        class="q-mb-xs"
        @click="emit('showMetricInfo', m.label, m.description, m.formula)"
      />
    </q-expansion-item> -->
  </q-expansion-item>
</template>
