<script setup>
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n({ useScope: 'global' })
const emit = defineEmits(['metricInfo'])
</script>

<template>
  <!-- 17. Core Investor Checklist -->
  <q-expansion-item
    group="company_metrics"
    :content-inset-level="0.2"
    class="text-green-5"
    :label="t('education.companyAnalysis.coreInvestorChecklist.label')"
  >
    <q-expansion-item
      v-for="cat in [
        'business',
        'growth',
        'profitability',
        'balanceSheet',
        'cashFlow',
        'valuation',
        'quality',
      ]"
      :key="cat"
      :content-inset-level="0"
      :label="t(`education.companyAnalysis.coreInvestorChecklist.categories.${cat}.label`)"
      :caption="`${tm(`education.companyAnalysis.coreInvestorChecklist.categories.${cat}.metrics`).length} ${t('metrics')}`"
    >
      <q-btn
        v-for="(m, i) in tm(
          `education.companyAnalysis.coreInvestorChecklist.categories.${cat}.metrics`,
        )"
        :key="i"
        :label="m.label"
        style="width: 100%"
        class="q-mb-xs"
        @click="emit('metricInfo', m.label, m.description, m.formula)"
      />
    </q-expansion-item>
  </q-expansion-item>
</template>
