<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useBinanceStore } from 'src/stores/binance'
import { useUserStore } from 'src/stores/user'
import { addOrder } from 'src/services/storage/crypto'
import DialogForm from 'src/components/DialogForm.vue'
import SetOrderForm from 'src/components/forms/SetWatcherForm.vue'
import CryptoConverter from './CryptoConverter.vue'
import CryptoConverterToggle from './CryptoConverterToggle.vue'
import { fee } from 'src/services/storage/calc'
import { useLocalized } from 'src/composables/useLocalized'
import { usePortfolioStore } from 'src/stores/portfolio'
import { sizePosition, maxAffordable } from 'src/helpers/positionSizing'

const { t, n } = useLocalized()

const emit = defineEmits(['newOrder'])

const props = defineProps({
  selectedSymbol: {
    type: String,
    required: true,
  },
  buy: {
    type: Boolean,
    default: true,
  },
})

const $q = useQuasar()
const store = useBinanceStore()
const userStore = useUserStore()
const tab = ref(props.buy ? 'buy' : 'sell')
const amount = ref(1)
const isLoading = ref(false)

const selectedAsset = computed(() => props.selectedSymbol?.replace('USDC', '') || '')
const currentPrice = computed(() => store.tickers[props.selectedSymbol]?.price ?? null)

// ── Size by risk ───────────────────────────────────────────────────────────
const portfolioStore = usePortfolioStore()
const FEE_RATE = 0.0095 / 100 // keep in sync with services/storage/calc.js
const CRYPTO_DECIMALS = 6
const riskPct = ref(1)
const stopPrice = ref(null)

const availableUsdc = computed(() => Number(portfolioStore.portfolio?.stable_amount) || 0)

// Account value = available USDC + crypto holdings at live prices
const accountValue = computed(() => {
  const holdings = Array.isArray(portfolioStore.portfolio?.crypto)
    ? portfolioStore.portfolio.crypto
    : []
  const cryptoValue = holdings.reduce((sum, h) => {
    const price = store.tickers[`${String(h.curr).toUpperCase()}USDC`]?.price
    return sum + (Number(h.amount) || 0) * (Number(price) || 0)
  }, 0)
  return availableUsdc.value + cryptoValue
})

const stopAboveEntry = computed(
  () =>
    stopPrice.value !== null && currentPrice.value && Number(stopPrice.value) >= currentPrice.value,
)

const sizing = computed(() => {
  if (stopAboveEntry.value || !currentPrice.value) return null
  return sizePosition({
    account: accountValue.value,
    riskPct: riskPct.value,
    entry: currentPrice.value,
    stop: stopPrice.value,
    decimals: CRYPTO_DECIMALS,
  })
})

const affordable = computed(() =>
  maxAffordable(availableUsdc.value, currentPrice.value, FEE_RATE, CRYPTO_DECIMALS),
)
const suggestedAmount = computed(() =>
  sizing.value ? Math.min(sizing.value.units, affordable.value) : 0,
)
const isCapped = computed(() => !!sizing.value && sizing.value.units > affordable.value)

/** Default stop 5% below the live price, rounded to a sensible tick. */
function defaultStop() {
  const p = Number(currentPrice.value)
  if (!p) return null
  const raw = p * 0.95
  const decimals = p >= 100 ? 2 : p >= 1 ? 4 : 6
  return Number(raw.toFixed(decimals))
}

function onSizingOpen() {
  if (stopPrice.value === null) stopPrice.value = defaultStop()
}

function useSuggestedAmount() {
  if (suggestedAmount.value > 0) amount.value = suggestedAmount.value
}

const money = (v) =>
  n(v, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
  })

const isFormValid = computed(() => {
  return (
    selectedAsset.value && amount.value > 0 && currentPrice.value !== null && userStore.user?.uid
  )
})

watch(
  () => props.buy,
  (newBuy) => {
    tab.value = newBuy ? 'buy' : 'sell'
    amount.value = 1
  },
)

watch(
  () => props.selectedSymbol,
  (newSymbol) => {
    if (!newSymbol) return
    amount.value = 1
    stopPrice.value = null // a stop only makes sense for the asset it was set on
  },
)

function changeTab(side) {
  tab.value = side.toLowerCase()
}

function validateOrder() {
  if (!selectedAsset.value) {
    $q.notify({
      type: 'negative',
      message: t('app.crypto.order.invalidPair'),
      position: 'top-left',
    })
    return false
  }

  if (!currentPrice.value || currentPrice.value <= 0) {
    $q.notify({
      type: 'negative',
      message: t('app.crypto.order.invalidPrice'),
      position: 'top-left',
    })
    return false
  }

  if (amount.value <= 0) {
    $q.notify({
      type: 'negative',
      message: t('app.common.validation.amountPositive'),
      position: 'top-left',
    })
    return false
  }

  if (!userStore.user?.uid) {
    $q.notify({
      type: 'negative',
      message: t('app.common.notify.sessionInvalid'),
      position: 'top-left',
    })
    return false
  }

  return true
}

function resetForm() {
  amount.value = 1
  isLoading.value = false
}

async function handleOrderConfirmed() {
  if (!validateOrder()) return

  isLoading.value = true

  try {
    // uid should be a UUID string, not a number
    const userId = userStore.user?.uid
    if (!userId) {
      throw new Error(t('app.common.notify.sessionInvalid'))
    }

    const dataView = {
      order_type: tab.value,
      is_crypto: true,
      crypto_id: selectedAsset.value.toLowerCase(),
      curr_price: parseFloat(currentPrice.value),
      amount: parseFloat(amount.value),
      uid: userId, // Pass UUID string directly
    }

    const resp = await addOrder(dataView)
    if (resp?.message) {
      $q.notify({
        type: 'positive',
        message: resp.message,
        position: 'top-left',
      })
      emit('newOrder', resp)
      resetForm()
    } else {
      throw new Error(t('app.common.notify.noServerMessage'))
    }
  } catch (err) {
    console.error('Order submission error:', err)
    const errorMsg =
      err?.response?.data?.error || err?.message || t('app.crypto.order.unknownError')
    $q.notify({
      type: 'negative',
      message: t('app.crypto.order.failed', { error: errorMsg }),
      position: 'top-left',
    })
  } finally {
    isLoading.value = false
  }
}

async function newOrder() {
  if (!validateOrder()) return

  const orderSummary = {
    order_type: tab.value,
    symbol: props.selectedSymbol,
    price: currentPrice.value,
    amount: amount.value,
    fee: fee(Number(currentPrice.value) * Number(amount.value)),
    readOnly: true,
  }

  $q.dialog({
    component: DialogForm,
    componentProps: {
      component: SetOrderForm,
      persistent: true,
      close: true,
      modelValue: orderSummary,
      ok: t('app.common.actions.confirm'),
    },
  })
    .onOk(handleOrderConfirmed)
    .onCancel(() => {
      // User cancelled - form state remains
    })
}
</script>

<template>
  <q-card class="bg-grey-9 q-mb-sm q-pt-sm">
    <q-card-actions>
      <q-btn
        :style="{
          width: '105px',
          borderBottom: `${tab == 'buy' ? '3px solid white' : ''}`,
        }"
        class="q-ml-sm"
        color="green"
        icon="trending_up"
        :label="t('app.common.actions.buy')"
        :disable="isLoading"
        @click="changeTab('buy')"
      />

      <q-btn
        :style="{
          width: '110px',
          borderBottom: `${tab == 'sell' ? '3px solid white' : ''}`,
        }"
        color="red"
        icon="trending_down"
        :label="t('app.common.actions.sell')"
        :disable="isLoading"
        @click="changeTab('sell')"
      />
      <q-space />
      <div class="q-pr-sm q-pt-sm">
        <CryptoConverterToggle />
      </div>
    </q-card-actions>
    <q-tab-panels v-model="tab" animated swipeable>
      <q-tab-panel name="buy" class="bg-grey-9">
        <CryptoConverter
          hide-price
          no-swap
          :from="selectedAsset"
          to="USDC"
          :amount="amount"
          :amount-from="true"
          @update:amount="amount = $event"
          :disable="isLoading"
          disable-from
          disable-to
        />

        <q-expansion-item
          dense
          dense-toggle
          icon="balance"
          :label="t('app.crypto.sizing.title')"
          :caption="t('app.crypto.sizing.caption')"
          header-class="text-teal-3"
          class="q-mt-sm sizing-panel"
          @before-show="onSizingOpen"
        >
          <div class="q-pa-sm">
            <div class="field-row" style="--field-min: 140px">
              <q-input
                v-model.number="riskPct"
                type="number"
                dense
                dark
                filled
                min="0.1"
                max="5"
                step="0.25"
                inputmode="decimal"
                suffix="%"
                :label="t('app.crypto.sizing.riskPct')"
                :hint="t('app.crypto.sizing.riskHint')"
              />
              <q-input
                v-model.number="stopPrice"
                type="number"
                dense
                dark
                filled
                step="any"
                inputmode="decimal"
                prefix="$"
                :label="t('app.crypto.sizing.stop')"
                :error="stopAboveEntry"
                :error-message="t('app.crypto.sizing.stopAboveEntry')"
              />
            </div>

            <div v-if="!accountValue" class="text-caption text-grey-5 q-mt-sm">
              {{ t('app.crypto.sizing.noBalance') }}
            </div>
            <div v-else class="sizing-result q-mt-sm">
              <div>
                <span class="text-grey-5">{{ t('app.crypto.sizing.account') }}</span>
                <span>{{ money(accountValue) }}</span>
              </div>
              <div>
                <span class="text-grey-5">{{ t('app.crypto.sizing.riskAmount') }}</span>
                <span>{{ sizing ? money(sizing.riskAmount) : '—' }}</span>
              </div>
              <div class="text-weight-bold">
                <span class="text-grey-5">{{ t('app.crypto.sizing.size') }}</span>
                <span>
                  {{ suggestedAmount ? n(suggestedAmount, { maximumFractionDigits: 6 }) : '—' }}
                  {{ selectedAsset }}
                  <span v-if="suggestedAmount" class="text-grey-5 text-weight-regular">
                    ≈ {{ money(suggestedAmount * currentPrice) }}
                  </span>
                </span>
              </div>
            </div>
            <div v-if="isCapped" class="text-caption text-orange-4 q-mt-xs">
              {{
                t('app.crypto.sizing.capped', {
                  amount: n(affordable, { maximumFractionDigits: 6 }),
                  asset: selectedAsset,
                })
              }}
            </div>

            <div class="action-row q-mt-sm">
              <q-btn
                dense
                unelevated
                color="teal-7"
                icon="check"
                :label="t('app.crypto.sizing.use')"
                :disable="!suggestedAmount || isLoading"
                @click="useSuggestedAmount"
              />
              <q-btn
                dense
                flat
                no-caps
                color="teal-3"
                icon="open_in_new"
                :label="t('app.crypto.sizing.openCalculator')"
                to="/trading-size-calculator"
              />
            </div>
          </div>
        </q-expansion-item>

        <q-btn
          style="width: auto; display: block; margin: 0 auto; margin-top: 15px"
          color="green"
          icon="trending_up"
          :label="`${t('app.common.actions.buy')} ${selectedAsset}`"
          :disable="!isFormValid || isLoading"
          :loading="isLoading"
          @click="newOrder"
        />
      </q-tab-panel>

      <q-tab-panel name="sell" class="bg-grey-9">
        <CryptoConverter
          hide-price
          no-swap
          :from="selectedAsset"
          to="USDC"
          :amount="amount"
          :amount-from="true"
          @update:amount="amount = $event"
          :disable="isLoading"
          disable-from
          disable-to
        />

        <q-btn
          style="width: auto; display: block; margin: 0 auto; margin-top: 15px"
          color="red"
          icon="trending_down"
          :label="`${t('app.common.actions.sell')} ${selectedAsset}`"
          :disable="!isFormValid || isLoading"
          :loading="isLoading"
          @click="newOrder"
        />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<style scoped>
.sizing-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
}

.sizing-result {
  display: grid;
  gap: 4px;
  font-variant-numeric: tabular-nums;
}

.sizing-result > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
</style>
