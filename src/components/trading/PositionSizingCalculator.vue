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

    <!-- ── Help dialog ─────────────────────────────────────────────────────── -->
    <q-dialog
      v-model="showHelp"
      transition-show="scale"
      transition-hide="fade"
      :transition-duration="250"
      :maximized="$q.screen.lt.sm"
    >
      <q-card class="psc-help-card" :class="{ 'psc-help-card--full': $q.screen.lt.sm }">
        <!-- Header: always visible -->
        <div class="psc-help-header">
          <q-icon name="calculate" size="26px" class="psc-help-header-icon" />
          <div class="psc-help-title">{{ t('app.trading.calculator.help.title') }}</div>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="psc-help-close"
            :aria-label="t('app.common.actions.close')"
            v-close-popup
          />
        </div>

        <!-- Scrollable body -->
        <div class="psc-help-body">
          <section class="psc-help-block">
            <div class="psc-help-subtitle">
              <q-icon name="lightbulb_outline" size="18px" />
              {{ t('app.trading.calculator.help.ideaTitle') }}
            </div>
            <p class="psc-help-lead">{{ t('app.trading.calculator.help.idea') }}</p>
          </section>

          <section class="psc-help-block">
            <div class="psc-help-subtitle">
              <q-icon name="functions" size="18px" />
              {{ t('app.trading.calculator.help.formulaTitle') }}
            </div>
            <div class="psc-formula">{{ t('app.trading.calculator.help.formula') }}</div>
            <p class="psc-help-text">{{ t('app.trading.calculator.help.formulaExplain') }}</p>
          </section>

          <section class="psc-help-block">
            <div class="psc-help-subtitle">
              <q-icon name="format_list_numbered" size="18px" />
              {{ t('app.trading.calculator.help.stepsTitle') }}
            </div>
            <ol class="psc-steps">
              <li v-for="n in 4" :key="n" class="psc-step">
                <span class="psc-step-num">{{ n }}</span>
                <span class="psc-step-text">{{ t(`app.trading.calculator.help.step${n}`) }}</span>
              </li>
            </ol>
          </section>

          <section class="psc-help-block">
            <div class="psc-help-subtitle">
              <q-icon name="verified_user" size="18px" />
              {{ t('app.trading.calculator.help.principlesTitle') }}
            </div>
            <ul class="psc-principles">
              <li v-for="n in 3" :key="n" class="psc-principle">
                <q-icon name="check_circle" size="18px" class="psc-principle-icon" />
                <span>{{ t(`app.trading.calculator.help.principle${n}`) }}</span>
              </li>
            </ul>
          </section>

          <div class="psc-disclaimer">
            <q-icon name="warning_amber" size="18px" class="psc-disclaimer-icon" />
            <span>{{ t('app.trading.calculator.help.disclaimer') }}</span>
          </div>
        </div>

        <!-- Footer: always visible -->
        <div class="psc-help-actions">
          <q-btn
            unelevated
            no-caps
            color="primary"
            class="psc-help-ok"
            :label="t('app.common.actions.close')"
            v-close-popup
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useLocalized } from 'src/composables/useLocalized'

const { t, locale } = useLocalized()
const $q = useQuasar()

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

/* ── Help dialog ──────────────────────────────────────────────────────────
   Colours are set explicitly (not inherited) so the dialog stays readable
   even when Quasar Dark mode is on or the page background is dark.        */
.psc-help-card {
  --help-bg: #ffffff;
  --help-text: #2b3440;
  --help-muted: #5f6b7a;
  --help-heading: #14202e;
  --help-accent: var(--q-primary, #1976d2);
  --help-accent-soft: #e8f1fd;
  --help-border: #e3e8ef;

  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  border-radius: 16px;
  background: var(--help-bg) !important;
  color: var(--help-text) !important;
  overflow: hidden;
}

.psc-help-card--full {
  max-height: 100%;
  border-radius: 0;
}

.psc-help-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 12px 16px 20px;
  background: var(--help-accent-soft);
  border-bottom: 1px solid var(--help-border);
  flex-shrink: 0;
}

.psc-help-header-icon {
  color: var(--help-accent);
}

.psc-help-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--help-heading);
}

.psc-help-close {
  color: var(--help-muted);
}

.psc-help-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 20px 20px;
  -webkit-overflow-scrolling: touch;
}

.psc-help-block {
  padding: 14px 0;
  border-bottom: 1px solid var(--help-border);
}

.psc-help-block:last-of-type {
  border-bottom: none;
}

.psc-help-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--help-heading);
  margin-bottom: 8px;
}

.psc-help-subtitle .q-icon {
  color: var(--help-accent);
}

.psc-help-lead,
.psc-help-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--help-text);
}

.psc-formula {
  font-family: 'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--help-heading);
  background: var(--help-accent-soft);
  border-left: 4px solid var(--help-accent);
  padding: 10px 14px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 10px;
  overflow-x: auto;
}

.psc-steps,
.psc-principles {
  list-style: none;
  margin: 0;
  padding: 0;
}

.psc-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.psc-step:last-child {
  margin-bottom: 0;
}

.psc-step-num {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--help-accent);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
}

.psc-step-text {
  font-size: 14px;
  line-height: 1.55;
  padding-top: 2px;
  color: var(--help-text);
}

.psc-principle {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--help-text);
}

.psc-principle:last-child {
  margin-bottom: 0;
}

.psc-principle-icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: #2e9e5b;
}

.psc-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff6e6;
  color: #7a4a00;
  font-size: 12.5px;
  line-height: 1.5;
}

.psc-disclaimer-icon {
  flex-shrink: 0;
  color: #c27c00;
}

.psc-help-actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  border-top: 1px solid var(--help-border);
  background: var(--help-bg);
  flex-shrink: 0;
}

.psc-help-ok {
  min-width: 120px;
  border-radius: 8px;
}

@media (max-width: 599px) {
  .psc-help-ok {
    width: 100%;
  }
}
</style>
