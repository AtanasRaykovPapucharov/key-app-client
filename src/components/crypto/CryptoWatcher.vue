<script setup>
import { useQuasar } from 'quasar'
import { ref, computed, onMounted, reactive } from 'vue'
// import OrderTrading from 'src/components/crypto/OrderTrading.vue'
// import FormulaView from 'src/components/FormulaView.vue'
import { useLocalized } from 'src/composables/useLocalized'

import { useUserStore } from 'src/stores/user'
import { getLocalUser } from 'src/services/storage/local'
import { getOrdersByCrypto, getWatcherOrders } from 'src/services/storage/crypto'
import { useBinanceStore } from 'src/stores/binance'
// import cryptoMapper from 'src/helpers/crypto-mapper'
import CryptoChart from 'src/components/crypto/CryptoChart.vue'
// import WatcherList from 'src/components/crypto/WatcherList.vue'
import DialogForm from 'src/components/DialogForm.vue'
import ConfirmForm from 'src/components/forms/ConfirmForm.vue'
// import SetStrategyForm from 'src/components/forms/SetStrategyForm.vue'
import SetWatcherForm from 'src/components/forms/SetWatcherForm.vue'
import { addOrder, deleteOrder } from 'src/services/storage/crypto'
// import { evaluateStrategy, STRATEGY_NAMES } from 'src/services/strategySignals'
import CryptoGameRow from './CryptoGameRow.vue'

const binanceStore = useBinanceStore()
const $q = useQuasar()
const { t } = useLocalized()

const userStore = useUserStore()

const selectedSymbol = ref('BTCUSDC')
const openWatcherView = ref(true)
const wanted = ref(['BTCUSDC', 'ETHUSDC', 'SOLUSDC', 'LINKUSDC', 'ADAUSDC'])
const coins = reactive({
  btc: { name: 'Bitcoin', symbol: 'BTC', color: '#f7931a', amount: 0 },
  eth: { name: 'Ethereum', symbol: 'ETH', color: '#3c3c3d', amount: 0 },
  // bnb: { name: 'BNB Chain', symbol: 'BNB', color: '#f3ba2f', amount: 0 },
  sol: { name: 'Solana', symbol: 'SOL', color: '#00ffa3', amount: 0 },
  link: { name: 'Chainlink', symbol: 'LINK', color: '#2a5ada', amount: 0 },
  ada: { name: 'Cardano', symbol: 'ADA', color: '#0033ad', amount: 0 },
})

const from = ref('BTC')
// const view = ref('cells') // cells, table
const splitterModel = ref(55)
const currOrders = ref(null)
const watcherOrders = ref([])
const allWatcherOrders = ref({})
const initialOrders = ref({})
const strategyCandles = ref([])

const selectTop = async (base) => {
  selectedSymbol.value = `${base}USDC`
  currOrders.value = await getOrdersByCrypto(base.toLowerCase())
  initialOrders.value[base.toUpperCase()] = currOrders.value
  await loadWatcherOrders()
}

const selectSymbol = async (symbol) => {
  const nextSymbol = String(symbol || '').toUpperCase()
  if (!nextSymbol) return

  selectedSymbol.value = nextSymbol
  const base = nextSymbol.replace(/(USDC|USDT|BUSD|USD)$/i, '')
  currOrders.value = await getOrdersByCrypto(base.toLowerCase())
  initialOrders.value[base] = currOrders.value
  await loadWatcherOrders()
}

onMounted(async () => {
  const localUser = getLocalUser()
  const isAuthenticated = userStore.user.isAuthenticated || Boolean(localUser?.uid || localUser?.id)

  if (!isAuthenticated) {
    splitterModel.value = 75
    window.dispatchEvent(new CustomEvent('cryptool:open-auth'))
  }

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

const watcherCryptoAmounts = computed(() => {
  const amounts = Object.fromEntries(Object.values(coins).map((coin) => [coin.symbol, 0]))

  Object.values(allWatcherOrders.value)
    .flat()
    .forEach((order) => {
      const symbol = String(order.crypto_id || '').toUpperCase()
      if (symbol in amounts) amounts[symbol] += Number(order.amount) || 0
    })

  return amounts
})

// const watcherCryptoTotal = computed(() =>
//   Object.values(watcherCryptoAmounts.value).reduce((total, amount) => total + amount, 0),
// )

const currPriceNumb = computed(
  () => tickersArray.value?.find((t) => t?.symbol === selectedSymbol.value)?.price,
)

const watcherRows = computed(() =>
  watcherOrders.value.map((data) => ({
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

const addWatcher = () => {
  $q.dialog({
    component: DialogForm,
    componentProps: {
      component: SetWatcherForm,
      persistent: true,
      close: true,
      ok: t('app.common.actions.add'),
      width: '380px',
      modelValue: {
        order_type: 'watch',
        symbol: selectedSymbol.value,
        price: currPriceNumb.value,
        amount: 0,
      },
    },
  }).onOk(async (data) => {
    await addOrder({
      order_type: 'watch',
      is_crypto: true,
      crypto_id: data.symbol.replace('USDC', '').toLowerCase(),
      curr_price: Number(data.price),
      amount: Number(data.amount),
      uid: userStore.user?.uid,
    })
    await loadWatcherOrders()
  })
}

const deleteWatcher = (row) => {
  $q.dialog({
    component: DialogForm,
    componentProps: {
      component: ConfirmForm,
      modelValue: {
        message: t('app.crypto.watcher.deleteFor', {
          pair: selectedSymbol.value.replace('USDC', ' / USDC'),
        }),
      },
      persistent: true,
      close: true,
      cancel: t('app.common.actions.cancel'),
      ok: t('app.common.actions.delete'),
      width: '380px',
    },
  }).onOk(async () => {
    try {
      await deleteOrder({ id: row.id })
      await loadWatcherOrders()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error?.response?.data?.error || error?.message || 'Failed to delete watcher',
      })
    }
  })
}

const totalWatcherField = (field) => {
  const sum = watcherRows.value.reduce((acc, row) => acc + (parseFloat(row[field]) || 0), 0)
  return Math.round(sum * 1e8) / 1e8
}

const watcherTotalUsdc = computed(() =>
  Object.entries(allWatcherOrders.value).reduce((sum, [symbol, orders]) => {
    const price = Number(
      tickersArray.value.find((ticker) => ticker.symbol === `${symbol}USDC`)?.price,
    )

    if (!Number.isFinite(price)) return sum

    return (
      sum +
      orders.reduce((ordersTotal, order) => ordersTotal + Number(order.amount || 0) * price, 0)
    )
  }, 0),
)

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
        <div
          class="q-pa-md"
          :style="{ maxHeight: `${$q.screen.height - 70}px`, overflowY: 'auto' }"
        >
          <CryptoGameRow
            v-if="userStore.user.isAuthenticated"
            :btc-value="watcherCryptoAmounts.BTC"
            :eth-value="watcherCryptoAmounts.ETH"
            :sol-value="watcherCryptoAmounts.SOL"
            :link-value="watcherCryptoAmounts.LINK"
            :ada-value="watcherCryptoAmounts.ADA"
            :selected="selectedSymbol?.replace('USDC', '')"
            @select="selectTop"
          />

          <div
            class="price-watcher row justify-center q-col-gutter-md q-mb-xl"
            :class="{ 'price-watcher--open': openWatcherView }"
          >
            <div
              v-if="userStore.user.isAuthenticated"
              class="price-watcher__panel col-12 q-mt-sm"
              :class="{ 'price-watcher__panel--open': openWatcherView }"
            >
              <q-expansion-item dense v-model="openWatcherView" class="bg-grey-9">
                <template #header>
                  <q-item-section>{{ t('app.crypto.watcher.heading') }}</q-item-section>
                  <q-item-section side>
                    <span>
                      <span class="text-secondary"
                        >{{ t('app.common.labels.totalSumColon') }}
                      </span>
                      <strong class="text-purple-4">
                        {{ watcherTotalUsdc.toFixed(4) }} USDC
                      </strong>
                    </span>
                  </q-item-section>
                </template>
                <div class="bg-grey-10 q-pa-sm">
                  <q-table
                    dark
                    :rows="watcherRows"
                    :columns="watcherColumns"
                    :rows-per-page-options="[0]"
                    class="text-secondary"
                    row-key="id"
                  >
                    <template #header-cell-crud="props">
                      <q-th :props="props">
                        <q-btn
                          dense
                          flat
                          icon="add"
                          :aria-label="t('app.common.labels.addWatcher')"
                          @click="addWatcher"
                        >
                          <q-tooltip>{{ t('app.common.labels.addWatcher') }}</q-tooltip>
                        </q-btn>
                      </q-th>
                    </template>
                    <template #body-cell-crud="props">
                      <q-td :props="props">
                        <q-btn
                          dense
                          flat
                          icon="delete"
                          color="secondary"
                          :aria-label="t('app.common.labels.deleteWatcher')"
                          @click="deleteWatcher(props.row)"
                        >
                          <q-tooltip>{{ t('app.common.labels.deleteWatcher') }}</q-tooltip>
                        </q-btn>
                      </q-td>
                    </template>
                    <template #body-cell-amount="props">
                      <q-td :props="props">
                        {{ parseFloat(props.row.amount).toFixed(4) }}
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
                        <span :class="`text-${props.row.total_diff > 0 ? 'positive' : 'negative'}`">
                          {{ parseFloat(props.row.total_diff).toFixed(4) }}
                        </span>
                      </q-td>
                    </template>
                    <template #body-cell-diff_percent="props">
                      <q-td :props="props">
                        <span :class="`text-${props.row.total_diff > 0 ? 'positive' : 'negative'}`">
                          {{
                            (
                              (parseFloat(props.row.total_diff) /
                                parseFloat(props.row.curr_total)) *
                              100
                            ).toFixed(2)
                          }}
                        </span>
                      </q-td>
                    </template>
                    <template #body-cell-dt_insert="props">
                      <q-td :props="props">
                        {{ new Date(props.row.dt_insert).toLocaleString() }}
                      </q-td>
                    </template>
                    <template #bottom-row>
                      <q-tr class="bg-grey-10">
                        <q-td
                          v-for="col in watcherColumns"
                          :key="col.name"
                          class="text-right text-bold text-secondary"
                        >
                          <template v-if="col.name === 'amount'">
                            {{ t('app.common.labels.sumColon') }}
                            {{ totalWatcherField('amount').toFixed(4) }}
                          </template>
                          <template v-else-if="col.name === 'watched'">
                            {{ t('app.common.labels.totalColon') }}
                            {{ totalWatcherField('curr_total').toFixed(4) }}
                          </template>
                          <template v-else-if="col.name === 'current'">
                            {{ t('app.common.labels.totalColon') }}
                            {{ totalWatcherField('total_now').toFixed(4) }}
                          </template>
                        </q-td>
                      </q-tr>
                    </template>
                  </q-table>
                </div>
              </q-expansion-item>
            </div>

            <div
              v-for="(ticker, symbol) in binanceStore.tickers"
              :key="symbol"
              class="crypto-boxes col-12 col-sm-6 col-md-3"
              style="min-width: 234px"
              @click="selectSymbol(symbol)"
            >
              <q-card
                v-if="!symbol.includes('EUR')"
                dark
                bordered
                :class="`crypto-card ${symbol !== selectedSymbol ? 'bg-dark' : 'bg-grey-9'}`"
                :style="{ cursor: 'pointer' }"
              >
                <q-card-section>
                  <div class="row items-center justify-between">
                    <div class="text-subtitle1 text-weight-bold text-grey-3">
                      {{ symbol?.replace('USDC', '') }}
                    </div>
                    <q-badge
                      :color="ticker.change >= 0 ? 'positive' : 'negative'"
                      :label="`${ticker.change >= 0 ? '+' : ''}${ticker.change.toFixed(2)}%`"
                    />
                  </div>

                  <div
                    class="text-h5 text-weight-bold q-mt-sm"
                    :class="ticker.change >= 0 ? 'text-positive' : 'text-negative'"
                  >
                    ${{ ticker.price.toLocaleString('en-US', { minimumFractionDigits: 4 }) }}
                  </div>

                  <div class="row q-mt-md text-caption text-grey-5">
                    <div class="col">
                      <div>{{ t('app.common.labels.high24') }}</div>
                      <div class="text-positive">
                        ${{ ticker.high.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                      </div>
                    </div>
                    <div class="col">
                      <div>{{ t('app.common.labels.low24') }}</div>
                      <div class="text-negative">
                        ${{ ticker.low.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                      </div>
                    </div>
                    <div class="col">
                      <div>{{ t('app.common.labels.volume') }}</div>
                      <div class="text-grey-3">${{ (ticker.volume / 1_000_000).toFixed(1) }}M</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
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

.crypto-card:hover {
  opacity: 0.8;
  background-color: black;
}

.price-watcher {
  position: relative;
}

.price-watcher--open {
  padding-top: 56px;
}

.price-watcher__panel--open {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
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
  border-color: #22b8a7;
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
  color: #4de0cc;
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
