<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { storeToRefs } from 'pinia'
import { useBinanceStore } from 'src/stores/binance'
import { usePortfolioStore } from 'src/stores/portfolio'
import { useUserStore } from 'src/stores/user'
import { addOrder } from 'src/services/storage/crypto'
import DialogForm from 'src/components/DialogForm.vue'
import SetOrderForm from 'src/components/forms/SetWatcherForm.vue'
import CryptoConverter from 'src/components/crypto/CryptoConverter.vue'
import { getEurUsdcPrice } from 'src/services/web/coingecko'
import euroIcon from 'src/assets/icons/euro.png'
import { useLocalized } from 'src/composables/useLocalized'

const $q = useQuasar()
const { t, n } = useLocalized()
const binanceStore = useBinanceStore()
const portfolioStore = usePortfolioStore()
const userStore = useUserStore()
const { portfolio } = storeToRefs(portfolioStore)

const amount = ref(100)
const converterFrom = ref('EUR')
const converterTo = ref('USDC')
const isBuying = ref(false)
const isSelling = ref(false)
const externalEurUsdcRate = ref(null)

const eurToUsdcRate = computed(() => {
  const marketRate = Number(
    Object.entries(binanceStore.tickers).find(([symbol]) => symbol.toUpperCase() === 'EURUSDC')?.[1]
      ?.price,
  )
  return Number.isFinite(marketRate) && marketRate > 0 ? marketRate : externalEurUsdcRate.value
})

const btcUsdcRate = computed(() => {
  const marketRate = Number(
    Object.entries(binanceStore.tickers).find(([symbol]) => symbol.toUpperCase() === 'BTCUSDC')?.[1]
      ?.price ?? 0,
  )
  return Number.isFinite(marketRate) && marketRate > 0 ? marketRate : 0
})

const btcInEurRate = computed(() => {
  if (!btcUsdcRate.value || !eurToUsdcRate.value) return null
  return btcUsdcRate.value / eurToUsdcRate.value
})

const eurUsdRate = computed(() => {
  if (!eurToUsdcRate.value) return null
  return eurToUsdcRate.value
})

const availableUsdc = computed(() => Number(portfolio.value?.stable_amount ?? 0))

const inCryptoUsdc = computed(() =>
  (portfolio.value?.crypto || []).reduce((total, asset) => {
    const symbol = String(asset.curr || '').toUpperCase()
    const amount = Number(asset.amount) || 0
    const price = Number(
      Object.entries(binanceStore.tickers).find(
        ([tickerSymbol]) => tickerSymbol.toUpperCase() === `${symbol}USDC`,
      )?.[1]?.price,
    )

    return total + (Number.isFinite(price) ? amount * price : 0)
  }, 0),
)

const totalUsdc = computed(() => availableUsdc.value + inCryptoUsdc.value)

const availableUsdcEur = computed(() =>
  eurToUsdcRate.value ? availableUsdc.value / eurToUsdcRate.value : 0,
)

const inCryptoEur = computed(() =>
  eurToUsdcRate.value ? inCryptoUsdc.value / eurToUsdcRate.value : 0,
)

const totalEur = computed(() => availableUsdcEur.value + inCryptoEur.value)

const availableEur = computed(() => Number(portfolio.value?.fiat_amount ?? 0))

const totalWithFiatEur = computed(() => totalEur.value + availableEur.value)

const isBuyingUsdc = computed(() => converterFrom.value === 'EUR')

onMounted(async () => {
  await portfolioStore.initializePortfolio()
  externalEurUsdcRate.value = await getEurUsdcPrice()
})

function validateEurAmount() {
  const uid = userStore.user?.uid

  if (!uid) {
    $q.notify({
      type: 'negative',
      message: t('app.layout.wallet.loginToBuyUsdc'),
      position: 'top-left',
    })
    return false
  }

  const eurAmount = Number(amount.value)
  if (!Number.isFinite(eurAmount) || eurAmount <= 0) {
    $q.notify({
      type: 'negative',
      message: t('app.layout.wallet.eurPositive'),
      position: 'top-left',
    })
    return false
  }

  if (eurAmount > availableEur.value) {
    $q.notify({
      type: 'negative',
      message: t('app.layout.wallet.eurExceeds', {
        balance: n(availableEur.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }),
      position: 'top-left',
    })
    return false
  }

  if (!eurToUsdcRate.value || eurToUsdcRate.value <= 0) {
    $q.notify({
      type: 'negative',
      message: t('app.layout.wallet.rateUnavailable'),
      position: 'top-left',
    })
    return false
  }

  return true
}

async function handleOrderConfirmed() {
  if (!validateEurAmount()) return

  isBuying.value = true

  try {
    const uid = userStore.user?.uid
    if (!uid) {
      throw new Error(t('app.layout.wallet.missingUser'))
    }

    const payload = {
      order_type: 'buy',
      is_crypto: false,
      crypto_id: 'USDC',
      curr_price: eurToUsdcRate.value,
      amount: Number(amount.value),
      uid,
    }

    const resp = await addOrder(payload)

    if (resp?.message) {
      $q.notify({
        type: 'positive',
        message: resp.message,
        position: 'top-left',
      })

      await portfolioStore.initializePortfolio()
      amount.value = 100
      return
    }

    throw new Error(t('app.common.notify.noServerMessage'))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message:
        error?.response?.data?.error || error?.message || t('app.layout.wallet.buyUsdcFailed'),
      position: 'top-left',
    })
  } finally {
    isBuying.value = false
  }
}

function openOrderConfirmation() {
  if (!validateEurAmount()) return

  const orderSummary = {
    order_type: 'buy',
    symbol: 'EURUSDC',
    price: eurToUsdcRate.value,
    amount: Number(amount.value),
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
      // User cancelled the EUR purchase.
    })
}

function validateUsdcAmount() {
  const uid = userStore.user?.uid

  if (!uid) {
    $q.notify({
      type: 'negative',
      message: t('app.layout.wallet.loginToBuyEur'),
      position: 'top-left',
    })
    return false
  }

  const usdcAmount = Number(amount.value)
  if (!Number.isFinite(usdcAmount) || usdcAmount <= 0) {
    $q.notify({
      type: 'negative',
      message: t('app.layout.wallet.usdcPositive'),
      position: 'top-left',
    })
    return false
  }

  if (usdcAmount > availableUsdc.value) {
    $q.notify({
      type: 'negative',
      message: t('app.layout.wallet.usdcExceeds', {
        balance: n(availableUsdc.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }),
      position: 'top-left',
    })
    return false
  }

  if (!eurToUsdcRate.value || eurToUsdcRate.value <= 0) {
    $q.notify({
      type: 'negative',
      message: t('app.layout.wallet.rateUnavailable'),
      position: 'top-left',
    })
    return false
  }

  return true
}

async function handleSellConfirmed() {
  if (!validateUsdcAmount()) return

  isSelling.value = true

  try {
    const uid = userStore.user?.uid
    const payload = {
      order_type: 'sell',
      is_crypto: false,
      crypto_id: 'USDC',
      curr_price: 1 / eurToUsdcRate.value,
      amount: Number(amount.value),
      uid,
    }

    const resp = await addOrder(payload)

    if (resp?.message) {
      $q.notify({
        type: 'positive',
        message: resp.message,
        position: 'top-left',
      })
      await portfolioStore.initializePortfolio()
      amount.value = 100
      return
    }

    throw new Error(t('app.common.notify.noServerMessage'))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message:
        error?.response?.data?.error || error?.message || t('app.layout.wallet.buyEurFailed'),
      position: 'top-left',
    })
  } finally {
    isSelling.value = false
  }
}

function openSellConfirmation() {
  if (!validateUsdcAmount()) return

  $q.dialog({
    component: DialogForm,
    componentProps: {
      component: SetOrderForm,
      persistent: true,
      close: true,
      modelValue: {
        order_type: 'sell',
        symbol: 'USDC/EUR',
        displaySymbol: 'USDC / EUR',
        priceSymbol: 'EUR',
        amountSymbol: 'USDC',
        totalSymbol: 'EUR',
        feeSymbol: 'USDC',
        price: 1 / eurToUsdcRate.value,
        amount: Number(amount.value),
        readOnly: true,
      },
      ok: t('app.common.actions.confirm'),
    },
  }).onOk(handleSellConfirmed)
}

function handleConverterSwap({ from, to }) {
  converterFrom.value = from
  converterTo.value = to
}
</script>

<template>
  <div class="text-h5">
    <div class="row text-h5 q-mb-sm" style="width: 100%">
      <div>
        <q-avatar
          class="bg-secondary q-mr-md"
          style="border: 1px solid grey; margin-top: -7px; font-size: 20px"
        >
          <img :src="euroIcon" alt="EUR" />
        </q-avatar>
        <span class="q-mr-sm">{{ 'EUR' }}</span>
        <span style="font-size: 16px">{{ t('app.layout.wallet.euro') }}</span>
      </div>

      <q-space />
      <span>{{ parseFloat(portfolio?.fiat_amount)?.toFixed(4) }}</span>
    </div>
    <br />
    <div class="row" style="width: 100%">
      <div v-if="eurUsdRate !== null" class="text-caption text-blue-4">
        1 EUR = {{ n(eurUsdRate, { maximumFractionDigits: 4 }) }} USDC
      </div>
      <q-space />
      <div v-if="btcInEurRate !== null" class="text-caption text-orange">
        1 BTC = {{ n(btcInEurRate, { maximumFractionDigits: 2 }) }} EUR
      </div>
    </div>
  </div>

  <div class="q-mt-sm">
    <CryptoConverter
      hide-price
      swap-beside
      disable-from
      disable-to
      :from="converterFrom"
      :to="converterTo"
      :amount="amount"
      :amount-from="true"
      @update:amount="amount = $event"
      @swap="handleConverterSwap"
    />

    <q-btn
      style="width: auto; display: block; margin: 0 auto; margin-top: 10px"
      :color="isBuyingUsdc ? 'green' : 'orange'"
      :icon="isBuyingUsdc ? 'trending_up' : 'trending_down'"
      :label="isBuyingUsdc ? t('app.layout.wallet.buyUsdc') : t('app.layout.wallet.buyEur')"
      :loading="isBuying || isSelling"
      :disable="isBuying || isSelling"
      @click="isBuyingUsdc ? openOrderConfirmation() : openSellConfirmation()"
    />
    <br />
    <div class="q-mt-lg q-pa-sm bg-grey-9 rounded-borders">
      <!-- <div class="text-subtitle1 text-secondary q-mb-md">Portfolio balances</div> -->
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6">
          <div class="text-caption text-secondary">{{ t('app.layout.wallet.available') }}</div>
          <div class="row items-baseline no-wrap text-green-5">
            <span class="text-weight-bold text-h6">{{ availableUsdc.toFixed(4) }}</span>
            <span class="text-caption q-ml-xs">USDC</span>
          </div>
          <div class="text-caption text-green-5">{{ availableUsdcEur.toFixed(2) }} EUR</div>
        </div>
        <div class="col-12 col-sm-6">
          <div class="text-caption text-secondary">{{ t('app.layout.wallet.totalInAssets') }}</div>
          <div class="row items-baseline no-wrap text-purple-5">
            <span class="text-weight-bold text-h6">{{ totalUsdc.toFixed(4) }}</span>
            <span class="text-caption q-ml-xs">USDC</span>
          </div>
          <div class="text-caption text-purple-5">{{ totalEur.toFixed(2) }} EUR</div>
        </div>
      </div>
      <q-separator class="q-my-md" dark />
      <div class="row items-center">
        <div class="text-caption text-secondary">{{ t('app.layout.wallet.totalWithFiat') }}</div>
        <q-space />
        <div class="text-secondary text-h5">{{ totalWithFiatEur.toFixed(2) }} EUR</div>
      </div>
    </div>
  </div>
</template>
