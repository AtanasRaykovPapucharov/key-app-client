<script setup>
import { useQuasar } from 'quasar'
import { ref, computed, onBeforeMount, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import OrderTrading from 'src/components/crypto/OrderTrading.vue'
// import FormulaView from 'src/components/FormulaView.vue'
import { useLocalized } from 'src/composables/useLocalized'

import { useUserStore } from 'src/stores/user'
import { useBankStore } from 'src/stores/bank'
import { usePortfolioStore } from 'src/stores/portfolio'
import { getOrdersByCrypto, getWatcherOrders } from 'src/services/storage/crypto'
import { useBinanceStore } from 'src/stores/binance'
// import cryptoMapper from 'src/helpers/crypto-mapper'
import CryptoChart from 'src/components/crypto/CryptoChart.vue'
// import WatcherList from 'src/components/crypto/WatcherList.vue'
import CryptoGameRow from 'src/components/crypto/CryptoGameRow.vue'
import CryptoScheduler from 'src/components/crypto/CryptoScheduler.vue'
import CryptoAutoTrading from 'src/components/crypto/CryptoAutoTrading.vue'
import CryptoNotes from 'src/components/crypto/CryptoNotes.vue'
import { getLocalUser } from 'src/services/storage/local'
import { getEurUsdcPrice } from 'src/services/web/coingecko'
// import SetStrategyForm from 'src/components/forms/SetStrategyForm.vue'
// import { evaluateStrategy, STRATEGY_NAMES } from 'src/services/strategySignals'

const binanceStore = useBinanceStore()
const $q = useQuasar()
const $router = useRouter()
const { t } = useLocalized()

const portfolioStore = usePortfolioStore()
const userStore = useUserStore()
const bankStore = useBankStore()

const selectedSymbol = ref('BTCUSDC')
const openOrderView = ref(true)
const openHistoryView = ref(true)
const openWatcherView = ref(true)
const wanted = ref([
  'BTCUSDC',
  'ETHUSDC',
  'BNBUSDC',
  'SOLUSDC',
  'ADAUSDC',
  'LINKUSDC',
  'AAVEUSDC',
  'SUIUSDC',
  'UNIUSDC',
  'ZECUSDC',
])
const coins = reactive({
  btc: { name: 'Bitcoin', symbol: 'BTC', color: '#f7931a', amount: 0 },
  eth: { name: 'Ethereum', symbol: 'ETH', color: '#3c3c3d', amount: 0 },
  bnb: { name: 'BNB Chain', symbol: 'BNB', color: '#f3ba2f', amount: 0 },
  sol: { name: 'Solana', symbol: 'SOL', color: '#00ffa3', amount: 0 },
  link: { name: 'Chainlink', symbol: 'LINK', color: '#2a5ada', amount: 0 },
  ada: { name: 'Cardano', symbol: 'ADA', color: '#0033ad', amount: 0 },
  aave: { name: 'Aave', symbol: 'AAVE', color: '#b6509e', amount: 0 },
  sui: { name: 'Sui', symbol: 'SUI', color: '#4da2ff', amount: 0 },
  uni: { name: 'Uniswap', symbol: 'UNI', color: '#ff007a', amount: 0 },
  zec: { name: 'Zcash', symbol: 'ZEC', color: '#ecb244', amount: 0 },
})

const from = ref('BTC')
const buy = ref(true)
const tab = ref('trader')
// const view = ref('cells') // cells, table
const splitterModel = ref(55)
const currOrders = ref(null)
const watcherOrders = ref([])
const allWatcherOrders = ref({})
const initialOrders = ref({})
const strategyCandles = ref([])
const externalEurUsdcRate = ref(null)
// const strategySettings = ref({
//   strategy: 'moving_average',
//   fastPeriod: 9,
//   slowPeriod: 21,
//   rsiPeriod: 14,
//   oversold: 30,
//   overbought: 70,
//   macdFast: 12,
//   macdSlow: 26,
//   macdSignal: 9,
//   bollingerPeriod: 20,
//   standardDeviation: 2,
// })

onBeforeMount(() => {
  const localUser = getLocalUser()
  const isAuthenticated = userStore.user.isAuthenticated || Boolean(localUser?.uid || localUser?.id)

  if (!isAuthenticated) {
    void $router.replace('/crypto-watcher').then(() => {
      window.dispatchEvent(new CustomEvent('cryptool:open-auth'))
    })
  }
})

const selectTop = async (base) => {
  selectedSymbol.value = `${base}USDC`
  openOrderView.value = true
  openHistoryView.value = true
  openWatcherView.value = true
  currOrders.value = await getOrdersByCrypto(base.toLowerCase())
  initialOrders.value[base.toUpperCase()] = currOrders.value
  await loadWatcherOrders()
}

onMounted(async () => {
  await portfolioStore.initializePortfolio()

  externalEurUsdcRate.value = await getEurUsdcPrice()

  const orderEntries = await Promise.all(
    Object.values(coins).map(async (coin) => [
      coin.symbol,
      await getOrdersByCrypto(coin.symbol.toLowerCase()),
    ]),
  )

  initialOrders.value = Object.fromEntries(orderEntries)
  currOrders.value = initialOrders.value[from.value]
  await loadWatcherOrders()
})

const tickersArray = computed(() =>
  Object.entries(binanceStore.tickers).map(([symbol, info]) => ({
    symbol,
    ...info,
  })),
)

const loadWatcherOrders = async () => {
  const entries = await Promise.all(
    Object.values(coins).map(async (coin) => [
      coin.symbol,
      await getWatcherOrders(coin.symbol.toLowerCase(), userStore.user?.uid),
    ]),
  )

  allWatcherOrders.value = Object.fromEntries(entries)
  watcherOrders.value = allWatcherOrders.value[selectedSymbol.value.replace('USDC', '')] || []
}

const cryptoUsdcAmounts = computed(() =>
  Object.fromEntries(
    Object.values(coins).map((coin) => {
      const price = Number(
        tickersArray.value.find((ticker) => ticker.symbol === `${coin.symbol}USDC`)?.price,
      )
      return [coin.symbol, Number.isFinite(price) ? cryptoAmounts.value[coin.symbol] * price : 0]
    }),
  ),
)

const availableUsdc = computed(() => Number(portfolioStore.portfolio.stable_amount) || 0)

const eurUsdcRate = computed(() => {
  const marketRate = Number(
    tickersArray.value.find((ticker) => ticker.symbol.toUpperCase() === 'EURUSDC')?.price,
  )
  return Number.isFinite(marketRate) && marketRate > 0 ? marketRate : externalEurUsdcRate.value
})

const availableEur = computed(() =>
  eurUsdcRate.value ? availableUsdc.value / eurUsdcRate.value : 0,
)

const inCryptoUsdc = computed(() =>
  Object.values(cryptoUsdcAmounts.value).reduce((total, amount) => total + amount, 0),
)

const inCryptoEur = computed(() => (eurUsdcRate.value ? inCryptoUsdc.value / eurUsdcRate.value : 0))

const totalEur = computed(() => availableEur.value + inCryptoEur.value)

// const totalWithFiatEur = computed(
//   () => totalEur.value + (Number(portfolioStore.portfolio.fiat_amount) || 0),
// )

const cryptoAmounts = computed(() => {
  const amounts = Object.fromEntries(
    (portfolioStore.portfolio.crypto || []).map((asset) => [
      String(asset.curr).toUpperCase(),
      Number(asset.amount) || 0,
    ]),
  )

  return Object.fromEntries(
    Object.values(coins).map((coin) => [coin.symbol, amounts[coin.symbol] || 0]),
  )
})

const currPriceNumb = computed(
  () => tickersArray.value?.find((t) => t?.symbol === selectedSymbol.value)?.price,
)

const avgPriceNumb = computed(() => {
  const avgPrice = parseFloat(currOrders.value?.[0]?.avg_price)
  return Number.isNaN(avgPrice) ? 0 : avgPrice
})

// const currPrice = computed(
//   () =>
//     `$${tickersArray.value?.find((t) => t?.symbol === selectedSymbol.value)?.price.toLocaleString('en-US', { minimumFractionDigits: 4 })}`,
// )

const avgPrice = computed(() => {
  const avgPrice = parseFloat(currOrders.value?.[0]?.avg_price)
  return `${(Number.isNaN(avgPrice) ? 0 : avgPrice)?.toFixed(2)}`
})
const sumAmount = computed(() => {
  const sum = parseFloat(currOrders.value?.[0]?.sum_amount)
  return Number.isNaN(sum) ? 0 : sum
})

const sumTotal = computed(() => {
  const sum = parseFloat(currOrders.value?.[0]?.sum_total)
  return Number.isNaN(sum) ? 0 : sum.toFixed(2)
})

const isBull = computed(() => currPriceNumb.value > avgPriceNumb.value)

// const strategySignal = computed(() =>
//   evaluateStrategy(strategyCandles.value, strategySettings.value),
// )

// const strategyName = computed(
//   () => STRATEGY_NAMES[strategySettings.value.strategy] || 'Custom Strategy',
// )

const orderRows = computed(() =>
  currOrders.value?.map((data) => ({
    ...data,
    curr_total: parseFloat(data.amount) * parseFloat(data.curr_price),
    price_now: currPriceNumb.value,
    total_now: parseFloat(data.amount) * currPriceNumb.value,
    price_diff: (currPriceNumb.value - parseFloat(data.curr_price)).toFixed(4),
    total_diff: (
      parseFloat(data.amount) * currPriceNumb.value -
      parseFloat(data.amount) * parseFloat(data.curr_price)
    ).toFixed(4),
  })),
)

// const watcherRows = computed(() =>
//   watcherOrders.value.map((data) => ({
//     ...data,
//     curr_total: parseFloat(data.amount) * parseFloat(data.curr_price),
//     price_now: currPriceNumb.value,
//     total_now: parseFloat(data.amount) * currPriceNumb.value,
//     price_diff: (currPriceNumb.value - parseFloat(data.curr_price)).toFixed(4),
//     total_diff: (
//       parseFloat(data.amount) * currPriceNumb.value -
//       parseFloat(data.amount) * parseFloat(data.curr_price)
//     ).toFixed(4),
//   })),
// )

//TODO: WATCHERS & NOTIFICATIONS
const watcherColumns = [
  {
    name: 'crud',
    label: '',
    align: 'left',
  },
  // {
  //   name: 'desc',
  //   label: 'Dessert (100g serving)',
  //   field: 'name',
  //   required: true,
  //   align: 'left',
  //   sortable: true,
  //   sort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10),
  //   rawSort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10),
  //   sortOrder: 'ad',
  //   format: (val, row) => `${val}%`,
  //   style: 'width: 500px',
  //   classes: 'my-special-class',
  //   headerStyle: 'width: 500px',
  //   headerClasses: 'my-special-class',
  // },
  // {
  //   name: 'crud',
  //   align: 'left',
  //   type: null,
  // },
  {
    name: 'dt_insert',
    get label() {
      return t('app.common.labels.openedOn')
    },
  },
  {
    name: 'order_type',
    label: '',
    field: 'order_type',
    format: (val) => val.toUpperCase(),
  },
  {
    name: 'amount',
    get label() {
      return t('app.common.labels.amount')
    },
    field: 'amount',
    type: 'number',
  },
  {
    name: 'current',
    get label() {
      return t('app.common.labels.currentUsd')
    },
  },
  {
    name: 'watched',
    get label() {
      return t('app.common.labels.orderUsd')
    },
  },
  {
    name: 'diff',
    get label() {
      return t('app.common.labels.diffUsd')
    },
  },
  {
    name: 'diff_percent',
    get label() {
      return t('app.common.labels.diffPct')
    },
  },
  // {
  //   name: 'curr_price',
  //   label: 'Watched Price',
  //   field: 'curr_price',
  //   format: (val) => `$${parseFloat(val).toFixed(4)}`,
  // },
  // {
  //   name: 'curr_total',
  //   label: 'Watched Total',
  //   field: 'curr_total',
  //   format: (val) => `$${parseFloat(val).toFixed(4)}`,
  // },
  // {
  //   name: 'price_now',
  //   label: 'Current Price',
  //   field: 'price_now',
  //   format: (val) => `$${parseFloat(val).toFixed(4)}`,
  // },
  // {
  //   name: 'total_now',
  //   label: 'Current Total',
  //   field: 'total_now',
  //   format: (val) => `$${parseFloat(val).toFixed(4)}`,
  // },
]

const historyColumns = watcherColumns.filter((column) => column.name !== 'crud')

// const addWatcher = () => {
//   $q.dialog({
//     component: DialogForm,
//     componentProps: {
//       component: SetWatcherForm,
//       persistent: true,
//       close: true,
//       ok: 'Add',
//       width: '380px',
//       modelValue: {
//         order_type: 'watch',
//         symbol: selectedSymbol.value,
//         price: currPriceNumb.value,
//         amount: 0,
//       },
//     },
//   }).onOk(async (data) => {
//     await addOrder({
//       order_type: 'watch',
//       is_crypto: true,
//       crypto_id: data.symbol.replace('USDC', '').toLowerCase(),
//       curr_price: Number(data.price),
//       amount: Number(data.amount),
//       uid: userStore.user?.uid,
//     })
//     await loadWatcherOrders()
//   })
// }

// const deleteWatcher = (row) => {
//   $q.dialog({
//     component: DialogForm,
//     componentProps: {
//       component: ConfirmForm,
//       modelValue: {
//         message: `Delete watcher for ${selectedSymbol.value.replace('USDC', ' / USDC')}?`,
//       },
//       persistent: true,
//       close: true,
//       cancel: 'Cancel',
//       ok: 'Delete',
//       width: '380px',
//     },
//   }).onOk(async () => {
//     try {
//       await deleteOrder({ id: row.id })
//       await loadWatcherOrders()
//     } catch (error) {
//       $q.notify({
//         type: 'negative',
//         message: error?.response?.data?.error || error?.message || 'Failed to delete watcher',
//       })
//     }
//   })
// }

// const totalField = (field) => {
//   const sum = orderRows.value.reduce((acc, row) => acc + (parseFloat(row[field]) || 0), 0)
//   // Round to avoid floating-point noise; adjust decimals as needed
//   return Math.round(sum * 1e8) / 1e8
// }

const totalField = (field) => {
  if (!orderRows.value || orderRows.value.length === 0) return 0
  const sum = orderRows.value.reduce((acc, row) => {
    const value = parseFloat(row[field]) || 0
    // For amount: BUY adds to holdings, SELL subtracts
    if (field === 'amount') {
      return acc + (row.order_type === 'buy' ? value : -value)
    }
    // For other fields: sum them directly (they already have sign)
    return acc + value
  }, 0)
  // Round to avoid floating-point noise
  return Math.round(sum * 1e8) / 1e8
}

// const totalWatcherField = (field) => {
//   const sum = watcherRows.value.reduce((acc, row) => acc + (parseFloat(row[field]) || 0), 0)
//   return Math.round(sum * 1e8) / 1e8
// }

// const watcherTotalUsdc = computed(() =>
//   Object.entries(allWatcherOrders.value).reduce((sum, [symbol, orders]) => {
//     const price = Number(
//       tickersArray.value.find((ticker) => ticker.symbol === `${symbol}USDC`)?.price,
//     )

//     if (!Number.isFinite(price)) return sum

//     return (
//       sum +
//       orders.reduce((ordersTotal, order) => ordersTotal + Number(order.amount || 0) * price, 0)
//     )
//   }, 0),
// )

const lastNotifiedSignal = ref('')

const onSignal = (signal) => {
  if (!signal) return
  if (signal.label === 'HOLD') {
    lastNotifiedSignal.value = ''
    return
  }

  const notificationKey = `${selectedSymbol.value}:${signal.label}`
  if (notificationKey === lastNotifiedSignal.value) return

  lastNotifiedSignal.value = notificationKey
  $q.notify({
    type: signal.label === 'BUY' ? 'positive' : 'negative',
    message: t('app.crypto.signals.notifyTitle', {
      signal: t(`app.crypto.signals.${String(signal.label).toLowerCase()}`),
      symbol: selectedSymbol.value,
    }),
    caption: t('app.crypto.signals.notifyCaption', {
      buys: signal.buys,
      sells: signal.sells,
      total: signal.total,
    }),
    timeout: 6000,
    position: 'top-left',
  })
}

const newOrder = async (orderData) => {
  console.log('New Order Event Received:', orderData)
  const confirmedOrder = orderData?.data
  if (confirmedOrder?.order_type === 'buy' || confirmedOrder?.order_type === 'sell') {
    portfolioStore.applyTrade(confirmedOrder)
  }

  // Refresh current orders to reflect the new trade
  const selectedCrypto = selectedSymbol.value.replace('USDC', '')
  currOrders.value = await getOrdersByCrypto(selectedCrypto.toLowerCase())
  initialOrders.value[selectedCrypto] = currOrders.value
  await portfolioStore.initializePortfolio()
  await loadWatcherOrders()
  await bankStore.refresh()
  // Collapse order form and show history after successful trade
  openOrderView.value = false
  openHistoryView.value = true
}

// const openStrategyDialog = () => {
//   $q.dialog({
//     component: DialogForm,
//     componentProps: {
//       component: SetStrategyForm,
//       modelValue: strategySettings.value,
//       persistent: true,
//       close: true,
//       ok: 'Apply strategy',
//       width: '420px',
//     },
//   }).onOk((settings) => {
//     strategySettings.value = settings
//     $q.notify({
//       type: 'positive',
//       message: `Strategy ${settings.strategy} applied to ${selectedSymbol.value}`,
//       position: 'top-left',
//     })
//   })
// }

const updateStrategyCandles = (candles) => {
  strategyCandles.value = candles
}
</script>

<template>
  <div class="bg-grey-10">
    <q-splitter v-model="splitterModel" :horizontal="$q.screen.lt.sm" :limits="[43, 75]">
      <template #before>
        <div>
          <q-card class="col-12 bg-grey-9">
            <crypto-chart
              v-model:symbol="selectedSymbol"
              :wanted="wanted"
              controls
              @update:signal="onSignal"
              @update:candles="updateStrategyCandles"
            />
          </q-card>
        </div>
      </template>

      <template #after>
        <div class="bg-grey-10">
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab icon="currency_exchange" name="trader" :label="t('app.common.labels.trader')" />
            <q-tab name="auto-trading" icon="smart_toy" :label="t('app.crypto.auto.heading')" />
            <q-tab name="scheduler" icon="schedule" :label="t('app.crypto.scheduler.tab')" />
            <q-tab name="notes" icon="book" :label="t('app.common.labels.notes')" />
          </q-tabs>

          <q-separator />

          <q-tab-panels
            v-model="tab"
            class="bg-grey-10"
            animated
            swipeable
            transition-prev="jump-up"
            transition-next="jump-up"
          >
            <q-tab-panel name="trader" class="q-pa-none">
              <div
                class="q-pa-md"
                :style="{ maxHeight: `${$q.screen.height - 70}px`, overflowY: 'auto' }"
              >
                <div class="row q-mb-md">
                  <div class="col q-pa-xs text-white">
                    <div class="text-green-5">
                      {{ t('app.common.labels.availableColon') }}
                      <strong>{{ availableUsdc.toFixed(4) }}</strong>
                      USDC
                    </div>
                    <div class="text-caption text-green-5" style="padding-left: 64px">
                      {{ availableEur.toFixed(2) }} EUR
                    </div>
                  </div>
                  <div class="col q-pa-xs text-white">
                    <div class="text-red-5">
                      {{ t('app.common.labels.inCryptoColon') }}
                      <strong>{{ inCryptoUsdc.toFixed(4) }}</strong>
                      USDC
                    </div>
                    <div class="text-caption text-red-5" style="padding-left: 62px">
                      {{ inCryptoEur.toFixed(2) }} EUR
                    </div>
                  </div>
                  <div class="col q-pa-xs text-white">
                    <div class="text-purple-5">
                      {{ t('app.common.labels.totalColon') }}
                      <strong>{{ (inCryptoUsdc + availableUsdc).toFixed(4) }}</strong>
                      USDC
                    </div>
                    <div class="text-caption text-purple-5" style="padding-left: 39px">
                      {{ totalEur.toFixed(2) }} EUR
                    </div>
                    <!-- <div class="text-caption text-purple-5">
                      Total incl. fiat: {{ totalWithFiatEur.toFixed(2) }} EUR
                    </div> -->
                  </div>
                </div>

                <div class="row q-col-gutter-md q-mb-xl">
                  <div class="col-12">
                    <div
                      v-if="sumAmount"
                      class="trade-summary row items-center text-h5 q-pl-md q-pt-xs bg-grey-10"
                    >
                      {{ selectedSymbol?.replace('USDC', '') }}
                      <q-field
                        :label="t('app.crypto.trader.traded')"
                        borderless
                        dark
                        stack-label
                        class="q-ml-sm"
                        style="margin-top: -16px"
                      >
                        <template #control>
                          <div class="self-center full-width no-outline" style="font-size: 24px">
                            {{ sumAmount.toFixed(4) }}
                          </div>
                        </template>
                      </q-field>

                      <div
                        class="trade-summary__usdc q-ml-lg row items-end no-wrap"
                        style="gap: 6px"
                      >
                        <span>USDC </span>
                        <span
                          class="text-caption"
                          style="
                            display: inline-flex;
                            flex-direction: column;
                            min-width: 110px;
                            line-height: 1.25;
                          "
                        >
                          <strong
                            class="text-secondary"
                            style="
                              font-variant-numeric: tabular-nums;
                              display: block;
                              text-align: left;
                            "
                          >
                            {{ t('app.crypto.trader.curPrice') }} {{ currPriceNumb?.toFixed(2) }}
                          </strong>
                          <strong
                            class="text-secondary"
                            style="
                              font-variant-numeric: tabular-nums;
                              display: block;
                              text-align: left;
                            "
                          >
                            {{ t('app.crypto.trader.avgPrice') }} {{ avgPrice }}
                          </strong>
                        </span>

                        <span
                          class="text-caption"
                          style="
                            display: inline-flex;
                            flex-direction: column;
                            min-width: 110px;
                            line-height: 1.25;
                          "
                        >
                          <strong
                            class="text-secondary"
                            style="
                              font-variant-numeric: tabular-nums;
                              display: block;
                              text-align: left;
                            "
                          >
                            {{ t('app.crypto.trader.curAmount') }}
                            {{ (sumAmount * currPriceNumb).toFixed(2) }}
                          </strong>
                          <strong
                            class="text-secondary"
                            style="
                              font-variant-numeric: tabular-nums;
                              display: block;
                              text-align: left;
                            "
                          >
                            {{ t('app.crypto.trader.avgAmount') }} {{ sumTotal }}
                          </strong>
                        </span>
                      </div>
                      <q-space />
                      <span :class="`trade-summary__diff text-${isBull ? 'green' : 'red'}`">
                        {{
                          `${(((currPriceNumb - avgPriceNumb) / avgPriceNumb) * 100).toFixed(2)} %`
                        }}
                      </span>
                    </div>
                    <br />
                    <CryptoGameRow
                      v-if="userStore.user.isAuthenticated"
                      :usdc-value="availableUsdc"
                      :btc-value="cryptoAmounts.BTC"
                      :eth-value="cryptoAmounts.ETH"
                      :bnb-value="cryptoAmounts.BNB"
                      :sol-value="cryptoAmounts.SOL"
                      :link-value="cryptoAmounts.LINK"
                      :ada-value="cryptoAmounts.ADA"
                      :aave-value="cryptoAmounts.AAVE"
                      :sui-value="cryptoAmounts.SUI"
                      :uni-value="cryptoAmounts.UNI"
                      :zec-value="cryptoAmounts.ZEC"
                      :btc-usdc-amount="cryptoUsdcAmounts.BTC"
                      :eth-usdc-amount="cryptoUsdcAmounts.ETH"
                      :bnb-usdc-amount="cryptoUsdcAmounts.BNB"
                      :sol-usdc-amount="cryptoUsdcAmounts.SOL"
                      :link-usdc-amount="cryptoUsdcAmounts.LINK"
                      :ada-usdc-amount="cryptoUsdcAmounts.ADA"
                      :aave-usdc-amount="cryptoUsdcAmounts.AAVE"
                      :sui-usdc-amount="cryptoUsdcAmounts.SUI"
                      :uni-usdc-amount="cryptoUsdcAmounts.UNI"
                      :zec-usdc-amount="cryptoUsdcAmounts.ZEC"
                      :selected="selectedSymbol?.replace('USDC', '')"
                      @select="selectTop"
                    />

                    <q-expansion-item
                      v-if="userStore.user.isAuthenticated"
                      dense
                      v-model="openOrderView"
                      class="bg-grey-9"
                    >
                      <template #header>
                        <q-item-section>{{ t('app.common.labels.order') }}</q-item-section>
                        <q-item-section side>
                          <span>
                            <span class="text-secondary"
                              >{{ t('app.common.labels.availableColon') }}
                            </span>
                            <strong class="text-green-5">
                              {{ availableUsdc.toFixed(4) }} USDC
                            </strong>
                          </span>
                        </q-item-section>
                        <!-- <q-item-section side>
                    <q-btn
                      dense
                      flat
                      color="amber"
                      icon="tune"
                      label="SET STRATEGY"
                      @click.stop="openStrategyDialog"
                    />
                  </q-item-section> -->
                      </template>
                      <OrderTrading
                        class="q-mt-xs"
                        :buy="buy"
                        :selected-symbol="selectedSymbol"
                        @new-order="newOrder"
                      />
                    </q-expansion-item>

                    <div v-if="currOrders?.length > 0">
                      <q-expansion-item dense v-model="openHistoryView" class="bg-grey-9">
                        <template #header>
                          <q-item-section>{{ t('app.common.labels.history') }}</q-item-section>
                          <q-item-section side>
                            <span>
                              <span class="text-secondary"
                                >{{ t('app.common.labels.inCryptoColon') }}
                              </span>
                              <strong class="text-red-5">
                                {{ inCryptoUsdc.toFixed(4) }} USDC
                              </strong>
                            </span>
                          </q-item-section>
                        </template>
                        <div class="bg-grey-10 q-pa-sm">
                          <q-table
                            dark
                            :rows="orderRows"
                            :columns="historyColumns"
                            :rows-per-page-options="[0]"
                            class="text-secondary"
                            row-key="id"
                          >
                            <template #body-cell-amount="props">
                              <q-td :props="props">
                                <div>
                                  <span
                                    :class="`text-${props.row.order_type == 'buy' ? 'positive' : 'negative'}`"
                                  >
                                    {{ parseFloat(props.row.amount).toFixed(4) }}
                                  </span>
                                </div>
                              </q-td>
                            </template>
                            <template #body-cell-watched="props">
                              <q-td :props="props">
                                <div>
                                  {{ t('app.common.labels.priceColon') }}
                                  <span class="text-blue-4">{{
                                    parseFloat(props.row.curr_price).toFixed(4)
                                  }}</span>
                                </div>
                                <div>
                                  {{ t('app.common.labels.totalColon') }}
                                  <span class="text-blue-4">{{
                                    parseFloat(props.row.curr_total).toFixed(4)
                                  }}</span>
                                </div>
                              </q-td>
                            </template>
                            <template #body-cell-current="props">
                              <q-td :props="props">
                                <div>
                                  {{ t('app.common.labels.priceColon') }}
                                  <span class="text-purple-4">{{
                                    parseFloat(props.row.price_now).toFixed(4)
                                  }}</span>
                                </div>
                                <div>
                                  {{ t('app.common.labels.totalColon') }}
                                  <span class="text-purple-4">{{
                                    parseFloat(props.row.total_now).toFixed(4)
                                  }}</span>
                                </div>
                              </q-td>
                            </template>
                            <template #body-cell-diff="props">
                              <q-td :props="props">
                                <div v-if="props.row.order_type == 'buy'">
                                  {{ t('app.common.labels.priceColon') }}
                                  <span
                                    :class="`text-${props.row.price_diff > 0 ? 'positive' : 'negative'}`"
                                  >
                                    {{ parseFloat(props.row.price_diff).toFixed(4) }}
                                  </span>
                                </div>

                                <div v-if="props.row.order_type == 'buy'">
                                  {{ t('app.common.labels.totalColon') }}
                                  <span
                                    :class="`text-${props.row.total_diff > 0 ? 'positive' : 'negative'}`"
                                  >
                                    {{ parseFloat(props.row.total_diff).toFixed(4) }}
                                  </span>
                                </div>
                              </q-td>
                            </template>
                            <template #body-cell-diff_percent="props">
                              <q-td :props="props">
                                <div v-if="props.row.order_type == 'buy'">
                                  <span
                                    :class="`text-${props.row.total_diff > 0 ? 'positive' : 'negative'}`"
                                  >
                                    {{
                                      (
                                        (parseFloat(props.row.total_diff) /
                                          parseFloat(props.row.curr_total)) *
                                        100
                                      ).toFixed(2)
                                    }}
                                  </span>
                                </div>
                              </q-td>
                            </template>
                            <template #body-cell-dt_insert="props">
                              <q-td :props="props">
                                <div>
                                  <span class="text-secondary">
                                    {{
                                      new Date(props.row.dt_insert)
                                        .toLocaleString()
                                        .split(',')[0]
                                        .trim()
                                    }}
                                  </span>
                                  <br />
                                  <span class="text-secondary">
                                    {{
                                      new Date(props.row.dt_insert)
                                        .toLocaleString()
                                        .split(',')[1]
                                        .trim()
                                    }}
                                  </span>
                                </div>
                              </q-td>
                            </template>

                            <template #bottom-row>
                              <q-tr class="bg-grey-10">
                                <q-td
                                  v-for="col in historyColumns"
                                  :key="col.name"
                                  class="text-right text-bold text-secondary"
                                >
                                  <template v-if="col.name === 'watched'">
                                    <div>
                                      {{ t('app.common.labels.totalColon') }}
                                      <span class="text-blue-4">{{
                                        parseFloat(totalField('curr_total')).toFixed(4)
                                      }}</span>
                                    </div>
                                  </template>
                                  <template v-else-if="col.name === 'current'">
                                    <div>
                                      {{ t('app.common.labels.totalColon') }}
                                      <span class="text-purple-4">{{
                                        parseFloat(totalField('total_now')).toFixed(4)
                                      }}</span>
                                    </div>
                                  </template>
                                  <template v-else-if="col.name === 'diff'">
                                    <div>
                                      {{ t('app.common.labels.totalColon') }}
                                      <span
                                        :class="`text-${totalField('total_diff') > 0 ? 'positive' : 'negative'}`"
                                      >
                                        {{ totalField('total_diff') }}
                                      </span>
                                    </div>
                                  </template>
                                  <template v-else-if="col.name === 'diff_percent'">
                                    <div>
                                      <span
                                        :class="`text-${totalField('total_diff') > 0 ? 'positive' : 'negative'}`"
                                      >
                                        {{
                                          (
                                            (totalField('total_diff') / totalField('curr_total')) *
                                            100
                                          ).toFixed(2)
                                        }}
                                      </span>
                                    </div>
                                  </template>
                                  <template v-else-if="col.name === 'amount'">
                                    <!-- <q-icon size="xs" name="functions" color="secondary" /> -->
                                    Sum:
                                    <span class="text-positive">
                                      {{ parseFloat(totalField('amount')).toFixed(4) }}
                                    </span>
                                  </template>
                                  <template v-else>
                                    <!-- crud / symbol: leave empty -->
                                  </template>
                                </q-td>
                              </q-tr>
                            </template>
                          </q-table>
                        </div>
                      </q-expansion-item>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="scheduler" class="q-pa-none">
              <CryptoScheduler />
            </q-tab-panel>

            <q-tab-panel name="auto-trading" class="q-pa-none">
              <CryptoAutoTrading />
            </q-tab-panel>

            <q-tab-panel name="notes" class="q-pa-none">
              <CryptoNotes />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </template>
    </q-splitter>
  </div>
</template>

<style scoped lang="scss">
.text-green {
  color: #21ba45 !important;
}
.text-red {
  color: #c10015 !important;
}

.trade-summary {
  position: relative;
  container-type: inline-size;
}

.trade-summary__usdc {
  min-width: 0;
}

.trade-summary__diff {
  position: absolute;
  top: 4px;
  right: 16px;
  white-space: nowrap;
}

@container (max-width: 600px) {
  .trade-summary__usdc {
    flex-basis: 100%;
    margin-left: 0 !important;
  }
}

.crypto-card:hover {
  opacity: 0.8;
  background-color: black;
}

:deep(.crypto-table tbody tr:nth-child(odd)) {
  opacity: 0.7;
  background-color: rgb(40, 39, 39);
}

.game-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.game-launcher {
  container-type: inline-size;
}

.game-card {
  max-width: 248px;
  overflow: hidden;
  border: 1px solid transparent;
  background: #202124;
  padding-bottom: 10px;
}

.game-card :deep(.q-card__actions) {
  justify-content: center;
}

.game-card--crypto {
  border-color: #d96b27;
  background: linear-gradient(145deg, #33251f, #202124 58%);
}

.game-card--money {
  border-color: #e5b518;
  background: linear-gradient(145deg, #193431, #202124 58%);
}

.game-card__image {
  height: 72px;
  padding: 10px;
}

.game-card__image :deep(img) {
  max-height: 52px;
}

.game-card__icons {
  display: flex;
  justify-content: center;
  gap: 12px;
  height: 72px;
  padding: 10px 28px;
}

.game-card__icons .q-img {
  width: 30px;
}

.game-card__start {
  color: #d8d8d8;
  font-size: 12px;
  line-height: 1.35;
}

.game-card__title {
  text-align: center;
}

.game-card__aim,
.game-card__start {
  text-align: center;
}

.game-card--crypto .game-card__title,
.game-card--crypto .game-card__label {
  color: #ff9d4d;
}

.game-card--money .game-card__title,
.game-card--money .game-card__label {
  color: #e0ac4d;
}

.game-card__label {
  font-weight: 700;
}

@media (max-width: 700px) {
  .game-cards {
    grid-template-columns: 1fr;
  }
}

@container (max-width: 580px) {
  .game-cards {
    grid-template-columns: 1fr;
  }

  .game-card {
    width: 100%;
  }
}
</style>
