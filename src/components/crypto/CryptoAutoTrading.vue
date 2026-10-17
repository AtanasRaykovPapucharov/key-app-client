<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useUserStore } from 'src/stores/user'
import { useLocalized } from 'src/composables/useLocalized'

const { t, d: fmtDate } = useLocalized()

const $q = useQuasar()
const userStore = useUserStore()

const cryptoOptions = ['BTC', 'ETH', 'BNB', 'SOL', 'LINK', 'ADA']
const sellAmountTypes = [
  {
    value: 'percent',
    get label() {
      return t('app.crypto.auto.pctHoldings')
    },
  },
  {
    value: 'fixed',
    get label() {
      return t('app.crypto.auto.fixedAmount')
    },
  },
]
const triggerModes = [
  {
    value: 'percent',
    get label() {
      return t('app.crypto.auto.pctThresholds')
    },
  },
  {
    value: 'indicator',
    get label() {
      return t('app.crypto.auto.technical')
    },
  },
]
const indicatorTypes = [
  { value: 'rsi', label: 'RSI' },
  {
    value: 'macd',
    get label() {
      return t('app.crypto.auto.macdCross')
    },
  },
  {
    value: 'sma_cross',
    get label() {
      return t('app.crypto.auto.smaCross')
    },
  },
  {
    value: 'confluence',
    get label() {
      return t('app.crypto.auto.confluence')
    },
  },
]
const indicatorDefaultParams = {
  rsi: { period: 14, oversold: 30, overbought: 70, interval: '1h' },
  macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, interval: '1h' },
  sma_cross: { fastPeriod: 10, slowPeriod: 50, interval: '1h' },
  confluence: { interval: '1h' },
}

const rules = ref([])
const listOpen = ref(false)
const deleteCandidate = ref(null)
const deleteDialogOpen = ref(false)
const saveConfirmOpen = ref(false)
const pendingSavePayload = ref(null)

const defaultForm = () => ({
  id: null,
  crypto_id: 'BTC',
  enabled: true,
  trigger_mode: 'percent',
  sell_enabled: true,
  take_profit_percent: 5,
  sell_amount_type: 'percent',
  sell_amount_value: 25,
  buy_enabled: true,
  buy_drop_percent: 5,
  buy_amount_usdc: 100,
  indicator_type: 'rsi',
  indicator_params: { ...indicatorDefaultParams.rsi },
})

const form = ref(defaultForm())

// Only reset params when the user changes the indicator via the select (not on programmatic load)
const onIndicatorTypeChange = (type) => {
  form.value.indicator_params = { ...indicatorDefaultParams[type] }
}

const loadRules = async () => {
  try {
    const uid = userStore.user?.uid
    if (!uid) {
      rules.value = []
      return
    }

    const { data } = await api.get('/auto-trading', {
      withCredentials: true,
      headers: { 'x-uid': uid },
    })
    rules.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to load auto-trading rules', error)
    rules.value = []
    $q.notify({
      type: 'negative',
      message: t('app.crypto.auto.loadFailed'),
      position: 'top-left',
    })
  }
}

const resetForm = () => {
  form.value = defaultForm()
}

const editRule = (rule) => {
  form.value = {
    id: rule.id,
    crypto_id: rule.crypto_id,
    enabled: rule.enabled,
    trigger_mode: rule.indicator_type ? 'indicator' : 'percent',
    sell_enabled: rule.sell_enabled,
    take_profit_percent: rule.take_profit_percent ?? 5,
    sell_amount_type: rule.sell_amount_type || 'percent',
    sell_amount_value: rule.sell_amount_value ?? 25,
    buy_enabled: rule.buy_enabled,
    buy_drop_percent: rule.buy_drop_percent ?? 5,
    buy_amount_usdc: rule.buy_amount_usdc ?? 100,
    indicator_type: rule.indicator_type || 'rsi',
    indicator_params: rule.indicator_params || {
      ...indicatorDefaultParams[rule.indicator_type || 'rsi'],
    },
  }
  listOpen.value = false
}

const saveRule = (uid, isUpdate, payload) => {
  const request = isUpdate
    ? api.put(`/auto-trading/${form.value.id}`, payload, {
        withCredentials: true,
        headers: { 'x-uid': uid },
      })
    : api.post('/auto-trading', payload, {
        withCredentials: true,
        headers: { 'x-uid': uid },
      })
  return request
}

const requestSave = () => {
  const uid = userStore.user?.uid
  if (!uid) {
    $q.notify({
      type: 'negative',
      message: t('app.crypto.auto.sessionRequired'),
      position: 'top-left',
    })
    return
  }

  if (!form.value.sell_enabled && !form.value.buy_enabled) {
    $q.notify({
      type: 'negative',
      message: t('app.crypto.auto.enableOne'),
      position: 'top-left',
    })
    return
  }

  const payload = {
    crypto_id: form.value.crypto_id,
    enabled: Boolean(form.value.enabled),
    sell_enabled: Boolean(form.value.sell_enabled),
    sell_amount_type: form.value.sell_amount_type,
    sell_amount_value: form.value.sell_enabled ? Number(form.value.sell_amount_value) : null,
    buy_enabled: Boolean(form.value.buy_enabled),
    buy_amount_usdc: form.value.buy_enabled ? Number(form.value.buy_amount_usdc) : null,
    take_profit_percent:
      form.value.trigger_mode === 'percent' && form.value.sell_enabled
        ? Number(form.value.take_profit_percent)
        : null,
    buy_drop_percent:
      form.value.trigger_mode === 'percent' && form.value.buy_enabled
        ? Number(form.value.buy_drop_percent)
        : null,
    indicator_type: form.value.trigger_mode === 'indicator' ? form.value.indicator_type : null,
    indicator_params: form.value.trigger_mode === 'indicator' ? form.value.indicator_params : null,
  }

  pendingSavePayload.value = payload
  saveConfirmOpen.value = true
}

const confirmSave = async () => {
  const uid = userStore.user?.uid
  const payload = pendingSavePayload.value
  saveConfirmOpen.value = false
  if (!uid || !payload) return

  try {
    const isUpdate = Boolean(form.value.id)
    const response = await saveRule(uid, isUpdate, payload)

    const saved = response?.data?.data
    const index = rules.value.findIndex((rule) => rule.id === saved.id)
    if (index >= 0) rules.value.splice(index, 1, saved)
    else rules.value.unshift(saved)

    resetForm()
    $q.notify({
      type: 'positive',
      message: isUpdate ? 'Auto-trading rule updated.' : 'Auto-trading rule created.',
      position: 'top-left',
    })
  } catch (error) {
    console.error('Failed to save auto-trading rule', error)
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.error || 'Unable to save auto-trading rule.',
      position: 'top-left',
    })
  } finally {
    pendingSavePayload.value = null
  }
}

const requestDelete = (rule) => {
  deleteCandidate.value = rule
  deleteDialogOpen.value = true
}

const confirmDelete = async () => {
  const rule = deleteCandidate.value
  deleteDialogOpen.value = false
  deleteCandidate.value = null
  if (!rule) return

  const uid = userStore.user?.uid
  if (!uid) return

  try {
    await api.delete(`/auto-trading/${rule.id}`, {
      withCredentials: true,
      headers: { 'x-uid': uid },
    })
    rules.value = rules.value.filter((entry) => entry.id !== rule.id)
    if (form.value.id === rule.id) resetForm()
  } catch (error) {
    console.error('Failed to delete auto-trading rule', error)
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.error || 'Unable to delete auto-trading rule.',
      position: 'top-left',
    })
  }
}

const activeCount = computed(() => rules.value.filter((rule) => rule.enabled).length)

const describeRule = (rule) => {
  const parts = []
  const sellAmount =
    rule.sell_amount_type === 'percent'
      ? `${rule.sell_amount_value}% of holdings`
      : `${rule.sell_amount_value} ${rule.crypto_id}`

  if (rule.indicator_type) {
    const label = indicatorTypes.find((item) => item.value === rule.indicator_type)?.label
    if (rule.sell_enabled) parts.push(`Sell ${sellAmount} on ${label} sell signal`)
    if (rule.buy_enabled) parts.push(`Buy ${rule.buy_amount_usdc} USDC on ${label} buy signal`)
    return parts.join(' · ') || 'No actions configured'
  }

  if (rule.sell_enabled) {
    parts.push(`Sell ${sellAmount} at +${rule.take_profit_percent}% profit`)
  }
  if (rule.buy_enabled) {
    parts.push(`Buy ${rule.buy_amount_usdc} USDC on -${rule.buy_drop_percent}% drop`)
  }
  return parts.join(' · ') || 'No actions configured'
}

onMounted(() => {
  void loadRules()
})
</script>

<template>
  <div class="auto-trading q-pa-md">
    <div class="auto-trading__intro q-mb-md">
      <div>
        <div class="text-overline text-primary">{{ t('app.crypto.auto.heading') }}</div>
      </div>
      <q-chip
        dense
        clickable
        :color="!listOpen ? 'grey-8' : 'green-6'"
        text-color="grey-3"
        :icon="listOpen ? 'visibility' : 'visibility_off'"
        @click="listOpen = !listOpen"
      >
        {{ activeCount }} {{ t('app.common.labels.activeLower') }}
      </q-chip>
    </div>

    <div class="column q-col-gutter-md">
      <q-card v-if="!listOpen" class="auto-trading-card auto-trading-card--form q-pa-md">
        <div class="row items-center justify-between q-mb-md">
          <div>
            <div class="text-subtitle1 text-weight-bold text-white">
              {{ form.id ? 'Edit rule' : 'New auto-trading rule' }}
            </div>
            <div class="text-caption text-grey-5">
              {{ t('app.crypto.auto.intro') }}
            </div>
          </div>
          <q-icon name="auto_graph" color="primary" size="sm" />
        </div>

        <div class="row q-col-gutter-sm">
          <q-select
            v-model="form.crypto_id"
            :options="cryptoOptions"
            :label="t('app.crypto.auto.asset')"
            dense
            outlined
            dark
            class="col-12 col-md-6"
          />
          <div class="col-12 col-md-6 flex items-center">
            <q-space />
            <q-toggle
              v-model="form.enabled"
              :label="t('app.crypto.auto.ruleEnabled')"
              color="primary"
            />
          </div>
        </div>

        <q-select
          v-model="form.trigger_mode"
          :options="triggerModes"
          emit-value
          map-options
          :label="t('app.crypto.auto.triggerSource')"
          dense
          outlined
          dark
          class="q-mt-sm"
        />

        <div v-if="form.trigger_mode === 'indicator'" class="row q-col-gutter-sm q-mt-xs">
          <q-select
            v-model="form.indicator_type"
            :options="indicatorTypes"
            emit-value
            map-options
            :label="t('app.common.labels.indicator')"
            dense
            outlined
            dark
            :class="`col-12 ${form.indicator_type === 'rsi' ? 'col-md-4' : 'col-md'}`"
            @update:model-value="onIndicatorTypeChange"
          />
          <q-input
            v-if="form.indicator_type === 'rsi'"
            v-model.number="form.indicator_params.period"
            type="number"
            min="2"
            :label="t('app.common.labels.rsiPeriod')"
            dense
            outlined
            dark
            class="col-6 col-md-2"
          />
          <q-input
            v-if="form.indicator_type === 'rsi'"
            v-model.number="form.indicator_params.oversold"
            type="number"
            :label="t('app.crypto.auto.oversold')"
            dense
            outlined
            dark
            class="col-6 col-md-3"
          />
          <q-input
            v-if="form.indicator_type === 'rsi'"
            v-model.number="form.indicator_params.overbought"
            type="number"
            :label="t('app.crypto.auto.overbought')"
            dense
            outlined
            dark
            class="col-6 col-md-3"
          />
          <q-input
            v-if="form.indicator_type === 'macd'"
            v-model.number="form.indicator_params.fastPeriod"
            type="number"
            :label="t('app.common.labels.fastPeriod')"
            dense
            outlined
            dark
            class="col-6 col-md-3"
          />
          <q-input
            v-if="form.indicator_type === 'macd'"
            v-model.number="form.indicator_params.slowPeriod"
            type="number"
            :label="t('app.common.labels.slowPeriod')"
            dense
            outlined
            dark
            class="col-6 col-md-3"
          />
          <q-input
            v-if="form.indicator_type === 'macd'"
            v-model.number="form.indicator_params.signalPeriod"
            type="number"
            :label="t('app.common.labels.signalPeriod')"
            dense
            outlined
            dark
            class="col-6 col-md-3"
          />
          <q-input
            v-if="form.indicator_type === 'sma_cross'"
            v-model.number="form.indicator_params.fastPeriod"
            type="number"
            :label="t('app.crypto.auto.fastSma')"
            dense
            outlined
            dark
            class="col-6 col-md-3"
          />
          <q-input
            v-if="form.indicator_type === 'sma_cross'"
            v-model.number="form.indicator_params.slowPeriod"
            type="number"
            :label="t('app.crypto.auto.slowSma')"
            dense
            outlined
            dark
            class="col-6 col-md-3"
          />
          <q-input
            v-model="form.indicator_params.interval"
            :label="t('app.crypto.auto.candleInterval')"
            hint="e.g. 15m, 1h, 4h"
            dense
            outlined
            dark
            class="col-12 col-md-3"
          />
        </div>

        <q-separator class="q-my-md" color="grey-8" />

        <div class="row items-center justify-between">
          <div class="text-subtitle2 text-white">{{ t('app.crypto.auto.autoSell') }}</div>
          <q-toggle v-model="form.sell_enabled" color="positive" />
        </div>
        <div v-if="form.sell_enabled" class="row q-col-gutter-sm q-mt-xs">
          <q-input
            v-if="form.trigger_mode === 'percent'"
            v-model.number="form.take_profit_percent"
            type="number"
            min="0.1"
            step="0.1"
            :label="t('app.crypto.auto.takeProfitPct')"
            dense
            outlined
            dark
            class="col-12 col-md-4"
          />
          <q-select
            v-model="form.sell_amount_type"
            :options="sellAmountTypes"
            emit-value
            map-options
            :label="t('app.crypto.auto.sellAmountType')"
            dense
            outlined
            dark
            class="col-12 col-md-4"
          />
          <q-input
            v-model.number="form.sell_amount_value"
            type="number"
            min="0"
            step="0.01"
            :label="
              form.sell_amount_type === 'percent'
                ? 'Sell % of holdings'
                : `Sell amount (${form.crypto_id})`
            "
            dense
            outlined
            dark
            class="col-12 col-md-4"
          />
        </div>

        <q-separator class="q-my-md" color="grey-8" />

        <div class="row items-center justify-between">
          <div class="text-subtitle2 text-white">{{ t('app.crypto.auto.autoBuy') }}</div>
          <q-toggle v-model="form.buy_enabled" color="warning" />
        </div>
        <div v-if="form.buy_enabled" class="row q-col-gutter-sm q-mt-xs">
          <q-input
            v-if="form.trigger_mode === 'percent'"
            v-model.number="form.buy_drop_percent"
            type="number"
            min="0.1"
            step="0.1"
            :label="t('app.crypto.auto.buyOnDrop')"
            dense
            outlined
            dark
            class="col-12 col-md-6"
          />
          <q-input
            v-model.number="form.buy_amount_usdc"
            type="number"
            min="1"
            step="1"
            :label="t('app.crypto.auto.buyAmount')"
            dense
            outlined
            dark
            class="col-12 col-md-6"
          />
        </div>

        <div class="row justify-end q-gutter-sm q-mt-md">
          <q-btn flat :label="t('app.common.actions.reset')" color="secondary" @click="resetForm" />
          <q-btn color="primary" :label="form.id ? 'Update' : 'Add rule'" @click="requestSave" />
        </div>
      </q-card>

      <q-card v-else class="auto-trading-card q-pa-md">
        <div class="text-subtitle1 text-weight-bold text-white q-mb-sm">
          {{ t('app.crypto.auto.yourRules') }}
        </div>

        <q-list separator dark>
          <q-item v-for="rule in rules" :key="rule.id">
            <q-item-section>
              <div class="row items-start justify-between q-gutter-sm">
                <div class="col">
                  <div class="row items-center q-gutter-sm">
                    <span class="text-weight-medium text-white">{{ rule.crypto_id }}</span>
                    <q-badge :color="rule.enabled ? 'positive' : 'grey-7'" rounded>
                      {{ rule.enabled ? 'active' : 'paused' }}
                    </q-badge>
                  </div>
                  <div class="text-caption text-grey-5 q-mt-xs">{{ describeRule(rule) }}</div>
                  <div v-if="rule.last_triggered_at" class="text-caption text-blue-3 q-mt-xs">
                    {{ t('app.crypto.auto.lastTriggered') }}
                    {{
                      fmtDate(rule.last_triggered_at, { dateStyle: 'short', timeStyle: 'short' })
                    }}
                  </div>
                </div>
                <div class="row q-gutter-xs">
                  <q-btn flat round dense icon="edit" color="secondary" @click="editRule(rule)" />
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    @click="requestDelete(rule)"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>

          <q-item v-if="!rules.length">
            <q-item-section class="text-grey-5"> {{ t('app.crypto.auto.empty') }} </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <q-dialog
      v-model="saveConfirmOpen"
      persistent
      transition-duration="500"
      @hide="pendingSavePayload = null"
    >
      <q-card class="delete-dialog">
        <q-card-section class="row items-start no-wrap q-gutter-md">
          <q-icon name="rule" color="primary" size="24px" />
          <div class="col">
            <div class="text-h6 text-white text-weight-bold">
              {{ form.id ? 'Update auto-trading rule?' : 'Create auto-trading rule?' }}
            </div>
            <div class="text-body2 text-grey-5 q-mt-xs">
              {{ t('app.crypto.auto.willTrade') }}
            </div>
          </div>
          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </q-card-section>

        <q-card-section v-if="pendingSavePayload" class="q-mx-md q-mb-md delete-dialog__summary">
          <div class="text-weight-medium text-white">{{ pendingSavePayload.crypto_id }}</div>
          <div class="text-caption text-grey-5 q-mt-xs">{{ describeRule(pendingSavePayload) }}</div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md q-gutter-sm">
          <q-btn flat :label="t('app.common.actions.cancel')" color="grey-4" v-close-popup />
          <q-btn
            unelevated
            :label="form.id ? 'Confirm update' : 'Confirm rule'"
            color="primary"
            icon="check"
            @click="confirmSave"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="deleteDialogOpen"
      persistent
      transition-duration="500"
      @hide="deleteCandidate = null"
    >
      <q-card class="delete-dialog">
        <q-card-section class="row items-start no-wrap q-gutter-md">
          <q-icon name="delete_forever" color="negative" size="24px" />
          <div class="col">
            <div class="text-h6 text-white text-weight-bold">
              {{ t('app.crypto.auto.deleteRule') }}
            </div>
            <div class="text-body2 text-grey-5 q-mt-xs">
              {{ t('app.common.confirm.deleteMessage') }}
            </div>
          </div>
          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md q-gutter-sm">
          <q-btn flat :label="t('app.crypto.auto.keepRule')" color="grey-4" v-close-popup />
          <q-btn
            unelevated
            :label="t('app.common.actions.delete')"
            color="negative"
            icon="delete"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.auto-trading {
  min-height: 100%;
  background: radial-gradient(circle at 100% 0%, rgba(179, 0, 0, 0.14), transparent 34%), #1b1d20;
}

.auto-trading__intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.auto-trading-card {
  width: calc(100% - 16px);
  margin: 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(34, 36, 40, 0.94);
  border-radius: 8px;
}

.auto-trading-card--form {
  border-top: 2px solid var(--q-primary, #b30000);
}

.delete-dialog {
  width: min(420px, calc(100vw - 32px));
  border: 1px solid rgba(255, 82, 82, 0.38);
  border-radius: 10px;
  background: #24262a;
}

.delete-dialog__summary {
  padding: 12px;
  border-left: 3px solid var(--q-primary, #b30000);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
}

@media (min-width: 900px) {
  .auto-trading__intro,
  .auto-trading-card {
    width: calc(100% - 32px);
    max-width: 1240px;
    margin-right: auto;
    margin-left: auto;
  }
}
</style>
