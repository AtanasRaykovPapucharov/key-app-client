<template>
  <q-page class="psc-page flex flex-center bg-grey-10">
    <q-card class="psc-card bg-grey-4" flat bordered>
      <q-card-section class="psc-header">
        <div class="psc-brand">INVESTCLUB TRADING</div>
        <div class="psc-title">
          {{ t('app.trading.calculator.title') }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="psc-section-label">{{ t('app.trading.calculator.inputs') }}</div>

        <div class="psc-field">
          <div class="psc-field-label">{{ t('app.trading.calculator.accountSize') }}</div>
          <q-input
            v-model.number="accountSize"
            type="number"
            dense
            outlined
            suffix="$"
            class="psc-input-blue"
            :min="0"
            step="100"
          />
        </div>

        <div class="psc-field">
          <div class="psc-field-label">{{ t('app.trading.calculator.riskPerTrade') }}</div>
          <q-input
            v-model.number="riskPercentInput"
            type="number"
            dense
            outlined
            suffix="%"
            class="psc-input-blue"
            :min="0"
            :max="100"
            step="0.1"
          />
          <q-slider
            v-model="riskPercentInput"
            :min="0.1"
            :max="3"
            :step="0.05"
            color="primary"
            class="q-mt-sm"
          />
          <div class="psc-hint">{{ t('app.trading.calculator.riskHint') }}</div>
        </div>

        <div class="psc-field">
          <div class="psc-field-label">{{ t('app.trading.calculator.entryPrice') }}</div>
          <q-input
            v-model.number="entryPrice"
            type="number"
            dense
            outlined
            class="psc-input-blue"
            step="0.0001"
          />
        </div>

        <div class="psc-field">
          <div class="psc-field-label">{{ t('app.trading.calculator.stopPrice') }}</div>
          <q-input
            v-model.number="stopPrice"
            type="number"
            dense
            outlined
            class="psc-input-blue"
            step="0.0001"
          />
        </div>

        <div class="psc-field">
          <div class="psc-field-label">{{ t('app.trading.calculator.direction') }}</div>
          <q-btn-toggle
            v-model="direction"
            spread
            no-caps
            unelevated
            toggle-color="primary"
            color="white"
            text-color="primary"
            :options="[
              { label: t('app.trading.calculator.long'), value: 'long' },
              { label: t('app.trading.calculator.short'), value: 'short' },
            ]"
          />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="psc-section-label">{{ t('app.trading.calculator.results') }}</div>

        <div v-if="stopDistance === 0" class="psc-warning">
          {{ t('app.trading.calculator.sameStop') }}
        </div>

        <div class="psc-result-row">
          <div class="psc-result-label">{{ t('app.trading.calculator.riskAmount') }}</div>
          <div class="psc-result-value">{{ formatMoney(riskAmount) }}</div>
        </div>

        <div class="psc-result-row psc-result-main">
          <div class="psc-result-label">{{ t('app.trading.calculator.positionSize') }}</div>
          <div class="psc-result-value">{{ formatNumber(positionSize) }}</div>
        </div>

        <div class="psc-result-row">
          <div class="psc-result-label">{{ t('app.trading.calculator.positionValue') }}</div>
          <div class="psc-result-value">{{ formatMoney(positionValue) }}</div>
        </div>

        <div class="psc-result-row">
          <div class="psc-result-label">{{ t('app.trading.calculator.exposure') }}</div>
          <div class="psc-result-value">{{ formatPercent(exposurePercent) }}</div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="psc-footer">
        <q-icon name="info" size="16px" class="q-mr-xs" />
        {{ t('app.trading.calculator.footer') }}
        <div class="q-mt-sm">
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            :label="t('app.trading.calculator.howTo')"
            icon="help_outline"
            @click="showHelp = true"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showHelp" transition-duration="500">
      <q-card class="psc-help-card">
        <q-card-section>
          <div class="text-h6">{{ t('app.trading.calculator.help.title') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="psc-help-subtitle">{{ t('app.trading.calculator.help.ideaTitle') }}</div>
          <p>{{ t('app.trading.calculator.help.idea') }}</p>

          <div class="psc-help-subtitle">{{ t('app.trading.calculator.help.formulaTitle') }}</div>
          <p class="psc-formula">{{ t('app.trading.calculator.help.formula') }}</p>
          <p>{{ t('app.trading.calculator.help.formulaExplain') }}</p>

          <div class="psc-help-subtitle">{{ t('app.trading.calculator.help.stepsTitle') }}</div>
          <ol class="psc-steps">
            <li>{{ t('app.trading.calculator.help.step1') }}</li>
            <li>{{ t('app.trading.calculator.help.step2') }}</li>
            <li>{{ t('app.trading.calculator.help.step3') }}</li>
            <li>{{ t('app.trading.calculator.help.step4') }}</li>
          </ol>

          <div class="psc-help-subtitle">
            {{ t('app.trading.calculator.help.principlesTitle') }}
          </div>
          <ul class="psc-principles">
            <li>{{ t('app.trading.calculator.help.principle1') }}</li>
            <li>{{ t('app.trading.calculator.help.principle2') }}</li>
            <li>{{ t('app.trading.calculator.help.principle3') }}</li>
          </ul>

          <p class="psc-disclaimer">{{ t('app.trading.calculator.help.disclaimer') }}</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="t('app.common.actions.close')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLocalized } from 'src/composables/useLocalized'

const { t, locale } = useLocalized()

/**
 * Position Sizing Calculator
 * Mirrors the calculator sheet of position_sizing_calculator.xlsx:
 *
 *   Amount at risk        = Account * Risk%
 *   Position size (units) = ROUNDDOWN( (Account*Risk%) / |Entry-Stop|, 0 )
 *   Position value        = ( (Account*Risk%) / |Entry-Stop| ) * Entry
 *   Exposure %            = Position value / Account
 *
 * Direction (Long/Short) does not affect the math in the original sheet;
 * it is kept purely as informational context for the trader.
 */

// ── Inputs (the "blue cells") ──────────────────────────────────────────────
const accountSize = ref(15000) // C6
const riskPercentInput = ref(1) // C7, shown/entered as a plain % number (1 = 1%)
const entryPrice = ref(100) // C8
const stopPrice = ref(83) // C9
const direction = ref('long') // C10 ('long' | 'short')

const riskPercent = computed(() => (Number(riskPercentInput.value) || 0) / 100)

// ── Derived values (the "results") ─────────────────────────────────────────
const stopDistance = computed(() =>
  Math.abs((Number(entryPrice.value) || 0) - (Number(stopPrice.value) || 0)),
)

const riskAmount = computed(() => (Number(accountSize.value) || 0) * riskPercent.value)

const positionSize = computed(() => {
  if (stopDistance.value === 0) return 0
  return Math.floor(riskAmount.value / stopDistance.value)
})

const positionValue = computed(() => {
  if (stopDistance.value === 0) return 0
  return (riskAmount.value / stopDistance.value) * (Number(entryPrice.value) || 0)
})

const exposurePercent = computed(() => {
  const acc = Number(accountSize.value) || 0
  if (acc === 0 || stopDistance.value === 0) return 0
  return positionValue.value / acc
})

// ── Formatting helpers ──────────────────────────────────────────────────────
const formatMoney = (value) =>
  new Intl.NumberFormat(locale.value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)

const formatNumber = (value) =>
  new Intl.NumberFormat(locale.value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0)

const formatPercent = (value) =>
  new Intl.NumberFormat(locale.value, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value || 0)

// ── Help dialog ─────────────────────────────────────────────────────────────
const showHelp = ref(false)
</script>

<style scoped>
.psc-page {
  padding: 24px;
  background: #f4f6fb;
}

.psc-card {
  width: 100%;
  max-width: 480px;
  border-radius: 14px;
}

.psc-header {
  text-align: center;
  padding-bottom: 4px;
}

.psc-brand {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--q-primary, #1976d2);
  margin-bottom: 4px;
}

.psc-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2733;
}

.psc-section-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #8a93a1;
  margin-bottom: 12px;
}

.psc-field {
  margin-bottom: 16px;
}

.psc-field-label {
  font-size: 13px;
  color: #444d5a;
  margin-bottom: 4px;
}

.psc-hint {
  font-size: 11px;
  color: #9aa3b1;
  margin-top: 2px;
}

:deep(.psc-input-blue .q-field__control) {
  background: #eaf2fe;
}

.psc-result-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px dashed #e3e7ee;
}

.psc-result-row:last-child {
  border-bottom: none;
}

.psc-result-label {
  font-size: 13px;
  color: #444d5a;
}

.psc-result-value {
  font-weight: 600;
  color: #1d2733;
}

.psc-result-main .psc-result-value {
  font-size: 20px;
  color: var(--q-primary, #1976d2);
}

.psc-warning {
  background: #fff4e5;
  color: #a15c00;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.psc-footer {
  font-size: 11px;
  color: #9aa3b1;
  text-align: center;
}

.psc-help-card {
  max-width: 560px;
  width: 100%;
}

.psc-help-subtitle {
  font-weight: 700;
  margin-top: 14px;
  margin-bottom: 4px;
  color: #1d2733;
}

.psc-formula {
  font-weight: 600;
  background: #eaf2fe;
  padding: 8px 12px;
  border-radius: 8px;
  display: inline-block;
}

.psc-steps li,
.psc-principles li {
  margin-bottom: 6px;
  font-size: 14px;
}

.psc-disclaimer {
  margin-top: 16px;
  font-size: 12px;
  color: #9aa3b1;
}
</style>
