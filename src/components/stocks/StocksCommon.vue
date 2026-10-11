<script setup>
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

import BussinessBasics from './partials/BussinessBasics.vue'
import SizeAndMarket from './partials/SizeAndMarket.vue'
import RevenueAndGrowth from './partials/RevenueAndGrowth.vue'
import ProfitabilityMetrics from './partials/ProfitabilityMetrics.vue'
import LiquidityMetrics from './partials/LiquidityMetrics.vue'
import SolvencyAndDebt from './partials/SolvencyAndDebt.vue'
import EfficiencyMetrics from './partials/EfficiencyMetrics.vue'
import CashFlow from './partials/CashFlow.vue'
import ValuationMetrics from './partials/ValuationMetrics.vue'
import DividendsMetrics from './partials/DividendsMetrics.vue'
import ShareholderReturns from './partials/ShareholderReturns.vue'
import EarningsQuality from './partials/EarningsQuality.vue'
import GrowthQuality from './partials/GrowthQuality.vue'
import EconomicMoat from './partials/EconomicMoat.vue'
import RiskAnalysis from './partials/RiskAnalysis.vue'
import AdvancedMetrics from './partials/AdvancedMetrics.vue'
import CoreInvestorChecklist from './partials/CoreInvestorChecklist.vue'

const $q = useQuasar()
const { t } = useI18n({ useScope: 'global' })

const metricInfo = (label, description, formula) => {
  const hasFormula = formula?.trim()

  $q.dialog({
    html: true,
    dark: true,
    ok: {
      get label() {
        return t('app.common.actions.ok')
      },
      color: 'negative', // red button
    },
    message: `
      <div>
        <div class="text-green-5 text-h6 q-mb-md">
          ${label}
        </div>

        <div class="text-grey-3 q-mb-md">
          ${description}
        </div>

        ${
          hasFormula
            ? `
              <div>
                <span class="text-blue-5 text-weight-medium">
                  ${capitalize(t('formula'))}:
                </span>
                <br />
                <code class="text-warning">
                  ${formula}
                </code>
              </div>
            `
            : ''
        }
      </div>
    `,
  })
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<template>
  <div class="stocks-common__row row">
    <div class="stocks-common__column col-12 col-md">
      <bussiness-basics @metric-info="metricInfo" />
      <size-and-market @metric-info="metricInfo" />
      <revenue-and-growth @metric-info="metricInfo" />
      <profitability-metrics @metric-info="metricInfo" />
    </div>
    <div class="stocks-common__column col-12 col-md">
      <liquidity-metrics @metric-info="metricInfo" />
      <solvency-and-debt @metric-info="metricInfo" />
      <efficiency-metrics @metric-info="metricInfo" />
      <cash-flow @metric-info="metricInfo" />
    </div>
    <div class="stocks-common__column col-12 col-md">
      <valuation-metrics @metric-info="metricInfo" />
      <dividends-metrics @metric-info="metricInfo" />
      <shareholder-returns @metric-info="metricInfo" />
      <earnings-quality @metric-info="metricInfo" />
    </div>
    <div class="stocks-common__column col-12 col-md">
      <growth-quality @metric-info="metricInfo" />
      <economic-moat @metric-info="metricInfo" />
      <risk-analysis @metric-info="metricInfo" />
      <advanced-metrics @metric-info="metricInfo" />
      <core-investor-checklist @metric-info="metricInfo" />
    </div>
  </div>
</template>

<style scoped>
.stocks-common__row {
  justify-content: center;
}

.stocks-common__column {
  /* max-width: 230px; */
  margin: 0 auto;
}

.stocks-common__column :deep(.q-expansion-item) {
  margin-bottom: 4px;
  width: 100%;
}

.stocks-common__column :deep(.q-expansion-item .q-item) {
  min-height: 36px;
  padding-top: 6px;
  padding-bottom: 6px;
}

.stocks-common__column :deep(.q-expansion-item .q-item__section--main) {
  font-size: 0.92rem;
}

.stocks-common__column :deep(.q-expansion-item .q-item__label) {
  line-height: 1.2;
}
</style>
