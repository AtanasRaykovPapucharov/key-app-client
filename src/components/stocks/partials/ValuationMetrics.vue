<script setup>
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n({ useScope: 'global' })
const emit = defineEmits(['mtricInfo'])
</script>

<template>
  <!-- 9. Valuation -->
  <q-expansion-item
    group="company_metrics"
    :content-inset-level="0.2"
    class="text-green-5"
    :label="t('education.companyAnalysis.valuation.label')"
  >
    <q-expansion-item
      :content-inset-level="0"
      :label="t('education.companyAnalysis.valuation.earningsBased.label')"
    >
      <q-btn
        v-for="(m, i) in tm(`education.companyAnalysis.valuation.earningsBased.metrics`)"
        :key="i"
        :label="m.label"
        style="width: 100%"
        class="q-mb-xs"
        @click="emit('metricInfo', m.label, m.description, m.formula)"
      />
    </q-expansion-item>

    <q-expansion-item
      :content-inset-level="0"
      :label="t('education.companyAnalysis.valuation.salesBased.label')"
    >
      <q-btn
        v-for="(m, i) in tm(`education.companyAnalysis.valuation.salesBased.metrics`)"
        :key="i"
        :label="m.label"
        style="width: 100%"
        class="q-mb-xs"
        @click="emit('metricInfo', m.label, m.description, m.formula)"
      />
    </q-expansion-item>

    <q-expansion-item
      :content-inset-level="0"
      :label="t('education.companyAnalysis.valuation.cashflowBased.label')"
    >
      <q-btn
        v-for="(m, i) in tm(`education.companyAnalysis.valuation.cashflowBased.metrics`)"
        :key="i"
        :label="m.label"
        style="width: 100%"
        class="q-mb-xs"
        @click="emit('metricInfo', m.label, m.description, m.formula)"
      />
    </q-expansion-item>

    <q-expansion-item
      :content-inset-level="0"
      :label="t('education.companyAnalysis.valuation.assetBased.label')"
    >
      <q-btn
        v-for="(m, i) in tm(`education.companyAnalysis.valuation.assetBased.metrics`)"
        :key="i"
        :label="m.label"
        style="width: 100%"
        class="q-mb-xs"
        @click="emit('metricInfo', m.label, m.description, m.formula)"
      />
    </q-expansion-item>

    <q-expansion-item
      :content-inset-level="0"
      :label="t('education.companyAnalysis.valuation.enterpriseValueBased.label')"
    >
      <q-btn
        v-for="(m, i) in tm(`education.companyAnalysis.valuation.enterpriseValueBased.metrics`)"
        :key="i"
        :label="m.label"
        style="width: 100%"
        class="q-mb-xs"
        @click="emit('metricInfo', m.label, m.description, m.formula)"
      />
    </q-expansion-item>
  </q-expansion-item>
</template>
