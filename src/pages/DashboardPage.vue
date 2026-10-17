<script setup>
import { useQuasar } from 'quasar'
import { ref, computed, watch, onMounted } from 'vue'
import { useLocalized } from 'src/composables/useLocalized'

import { addOrder, getOrdersByCrypto } from 'src/services/storage/crypto'
import { useBinanceStore } from 'src/stores/binance'
import cryptoMapper from 'src/helpers/crypto-mapper'
import CryptoChart from 'src/components/crypto/CryptoChart.vue'
import DialogForm from 'src/components/DialogForm.vue'
// import WatcherList from 'src/components/crypto/WatcherList.vue'
import SetWatcherForm from 'src/components/forms/SetWatcherForm.vue'

const binanceStore = useBinanceStore()
const $q = useQuasar()
const { t, n: fmtNum, d: fmtDate } = useLocalized()

const wanted = ref([
  'BTCUSDC',
  'ETHUSDC',
  'BNBUSDC',
  'XRPUSDC',
  'SOLUSDC',
  'STOUSDC',
  'BABYUSDC',
  'LDOUSDC',
  'XLMUSDC',
])

const from = ref('BTC')
const view = ref('cells') // cells, table
const splitterModel = ref(34)
const onFocus = ref('BTCUSDC')
const currOrders = ref(null)

onMounted(async () => {
  currOrders.value = await getOrdersByCrypto(from.value.toLowerCase())
})

const tickersArray = computed(() =>
  Object.entries(binanceStore.tickers).map(([symbol, info]) => ({
    symbol,
    ...info,
  })),
)
const currPriceNumb = computed(
  () => tickersArray.value?.find((t) => t?.symbol === onFocus.value)?.price,
)

const avgPriceNumb = computed(() => {
  const avgPrice = parseFloat(currOrders.value?.[0]?.avg_price)
  return Number.isNaN(avgPrice) ? 0 : avgPrice
})

const currPrice = computed(
  () =>
    `$${fmtNum(tickersArray.value?.find((tk) => tk?.symbol === onFocus.value)?.price, { minimumFractionDigits: 4 })}`,
)

const avgPrice = computed(() => {
  const avgPrice = parseFloat(currOrders.value?.[0]?.avg_price)
  return `$${(Number.isNaN(avgPrice) ? 0 : avgPrice)?.toFixed(4)}`
})

const isBull = computed(() => currPriceNumb.value > avgPriceNumb.value)

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

async function selectSymbol(symbol) {
  onFocus.value = symbol
  from.value = symbol?.replace('USDC', '')
  currOrders.value = await getOrdersByCrypto(from.value.toLowerCase())
}

async function rowClicked(ev, row) {
  await selectSymbol(row.symbol)
}

const columns = [
  {
    name: 'symbol',
    get label() {
      return t('app.common.labels.pair')
    },
    field: 'symbol',
    align: 'left',
    format: (v) => `${v.replace('USDC', '/USDC')}`,
  },
  // {
  //   name: 'volume',
  //   label: 'Volume, $',
  //   field: 'volume',
  //   align: 'left',
  //   format: (v) => `${v.toFixed(3)}`,
  // },
  {
    name: 'high',
    get label() {
      return t('app.common.labels.high24Usd')
    },
    field: 'high',
    align: 'left',
  },
  {
    name: 'low',
    get label() {
      return t('app.common.labels.low24Usd')
    },
    field: 'low',
    align: 'left',
  },
  {
    name: 'change',
    get label() {
      return t('app.common.labels.changePct')
    },
    field: 'change',
    align: 'left',
    format: (v) => `${v.toFixed(2)}`,
  },
  {
    name: 'price',
    get label() {
      return t('app.common.labels.priceUsd')
    },
    field: 'price',
    align: 'left',
    format: (v) => `${v.toFixed(4)}`,
  },
]

//TODO: WATCHERS & NOTIFICATIONS
const watcherColumns = [
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
  {
    name: 'crud',
    align: 'left',
    type: null,
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
    name: 'watched',
    get label() {
      return t('app.common.labels.watchedUsd')
    },
  },
  {
    name: 'current',
    get label() {
      return t('app.common.labels.currentUsd')
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
  {
    name: 'dt_insert',
    get label() {
      return t('app.common.labels.openedOn')
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
      close: false,
      width: '380px',
      modelValue: {
        symbol: onFocus.value,
        price: currPriceNumb.value,
        amount: 0,
      },
    },
  }).onOk(async (data) => {
    const resp = await addOrder({
      state: 'watched',
      is_crypto: true,
      crypto_id: data.symbol.replace('USDC', '').toLowerCase(),
      curr_price: data.price,
      amount: data.amount,
      user_id: 1,
    })

    if (resp.message) {
      $q.notify({
        type: 'positive',
        message: resp.message,
        position: 'top-left',
        timeout: 2000,
      })
      currOrders.value = await getOrdersByCrypto(from.value.toLowerCase())
    }
  })
}

const editWatcher = () => {
  $q.notify({
    type: 'info',
    message: t('app.common.notify.editWatcherSoon'),
    position: 'top-left',
  })
}

const deleteWatcher = () => {
  $q.dialog({
    component: DialogForm,
    componentProps: {
      component: () => `Are you sure you want to delete this watcher?`,
      persistent: true,
      close: false,
      cancel: t('app.common.labels.no'),
      ok: t('app.common.labels.yes'),
      width: '380px',
    },
  }).onOk(() => {
    $q.notify({
      type: 'info',
      message: t('app.common.notify.deleteWatcherSoon'),
      position: 'top-left',
    })
  })
}

const totalField = (field) => {
  const sum = orderRows.value.reduce((acc, row) => acc + (parseFloat(row[field]) || 0), 0)
  // Round to avoid floating-point noise; adjust decimals as needed
  return Math.round(sum * 1e8) / 1e8
}

watch(
  () => binanceStore.tickers,
  (newTickers) => {
    if (newTickers['katusdc'.toUpperCase()]?.price > 0.011)
      $q.notify({
        type: 'positive',
        message: t('app.common.notify.katAlert'),
        position: 'top-left',
      })
  },
  { deep: true },
)
</script>

<template>
  <q-page class="bg-grey-10">
    <!-- <span>{{ t('hi') }}</span> -->
    <q-splitter v-model="splitterModel" :limits="[23, 65]">
      <template #before>
        <div class="q-pa-md items-center" style="position: relative; left: -7px">
          <div class="row q-ml-md">
            <q-avatar size="lg" class="bg-secondary q-mr-lg" style="border: 1px solid grey">
              <img :src="cryptoMapper[from]?.logo" />
            </q-avatar>
            <div class="text-h4 text-center q-ml-md">
              {{ cryptoMapper[from]?.symbol }}
            </div>
            <div class="text-h5 text-center q-ml-md" style="padding-top: 7px">
              {{ cryptoMapper[from]?.name }}
            </div>
            <q-space />

            <q-btn
              flat
              dense
              rounded
              icon="visibility"
              class="text-purple-5"
              style="width: 30px; height: 30px; position: absolute; right: 10px; top: 4px"
              @click="addWatcher"
            />
          </div>

          <div class="q-pa-md q-ml-xl" style="min-height: 50px; margin-top: -20px">
            {{ cryptoMapper[from]?.description }}
          </div>

          <div class="text-center text-h6 text-purple-4">
            {{ `$  ${currPriceNumb?.toFixed(4)}` }}
          </div>
        </div>
        <div>
          <crypto-chart hide-header :symbol="onFocus" :wanted="wanted" />
        </div>
      </template>

      <template #after>
        <div
          class="q-pa-md"
          :style="{ maxHeight: `${$q.screen.height - 70}px`, overflowY: 'auto' }"
        >
          <div class="row q-col-gutter-md q-mb-xl">
            <div class="col-12">
              <!-- <q-btn-toggle
                v-model="view"
                size="sm"
                :options="[
                  { value: 'cells', slot: 'cells' },
                  { value: 'table', slot: 'table' },
                ]"
                class="bg-grey-8"
              >
                <template #cells>
                  <div class="row items-center no-wrap q-pl-sm">
                    <q-icon left name="border_all" />
                  </div>
                </template>
                <template #table>
                  <div class="row items-center no-wrap q-pr-sm">
                    <q-icon right name="table_rows" />
                  </div>
                </template>
              </q-btn-toggle> -->

              <div v-if="currOrders" class="float-right q-mr-md q-pt-md">
                <q-expansion-item
                  dense
                  :content-inset-level="0"
                  class="text-secondary absolute bg-grey-10 q-pt-xs"
                  :style="{
                    width: '98%',
                    top: '0px',
                    right: '2%',
                    borderRadius: '5px',
                    zIndex: 99,
                  }"
                >
                  <template #header>
                    <q-item-section>
                      <div class="row">
                        <span class="text-purple-4">
                          {{
                            currOrders.length === 0
                              ? t('app.crypto.list.ordersWatched')
                              : currOrders.length === 1
                                ? t('app.crypto.list.ordersWatchedOne')
                                : t('app.crypto.list.ordersWatchedMany', {
                                    count: currOrders.length,
                                  })
                          }}
                        </span>
                        <span class="q-mx-xs">|</span>
                        <span class="text-blue-4">{{
                          t('app.crypto.list.avgPrice', { price: avgPrice })
                        }}</span>
                        <span class="q-mx-xs">|</span>
                        <span class="text-purple-4">
                          {{ t('app.crypto.list.currPrice', { price: currPrice }) }}
                        </span>
                        <span class="q-mx-xs">|</span>
                        <span :class="`text-${isBull ? 'green' : 'red'}`">{{
                          `${(((currPriceNumb - avgPriceNumb) / avgPriceNumb) * 100).toFixed(2)} %`
                        }}</span>
                      </div>
                    </q-item-section>
                  </template>
                  <div class="bg-grey-10 q-pa-sm">
                    <q-table
                      dark
                      :rows="orderRows"
                      :columns="watcherColumns"
                      :rows-per-page-options="[0]"
                      class="text-secondary"
                      row-key="id"
                    >
                      <template #header-cell-crud="props">
                        <q-td :props="props">
                          <div class="text-bold">
                            {{ onFocus.replace('USDC', ' / USDC') }}
                          </div>
                        </q-td>
                      </template>
                      <template #body-cell-crud="props">
                        <q-td :props="props">
                          <div>
                            <q-btn dense flat icon="edit" @click="editWatcher(props.row)" />
                            <q-btn
                              dense
                              flat
                              icon="delete"
                              class="q-ml-xs"
                              @click="deleteWatcher(props.row)"
                            />
                          </div>
                        </q-td>
                      </template>
                      <template #body-cell-amount="props">
                        <q-td :props="props">
                          <div>
                            <span class="text-positive"
                              >{{ parseFloat(props.row.amount).toFixed(4) }}
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
                          <div>
                            {{ t('app.common.labels.priceColon') }}
                            <span
                              :class="`text-${props.row.price_diff > 0 ? 'positive' : 'negative'}`"
                            >
                              {{ parseFloat(props.row.price_diff).toFixed(4) }}
                            </span>
                          </div>
                          <div>
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
                          <div>
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
                              {{ fmtDate(props.row.dt_insert, { dateStyle: 'short' }) }}
                            </span>
                            <br />
                            <span class="text-secondary">
                              {{ fmtDate(props.row.dt_insert, { timeStyle: 'short' }) }}
                            </span>
                          </div>
                        </q-td>
                      </template>

                      <template #bottom-row>
                        <q-tr class="bg-grey-10">
                          <q-td
                            v-for="col in watcherColumns"
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
                    <!-- <pre>{{ currOrders }}</pre> -->
                  </div>
                </q-expansion-item>
              </div>
            </div>
            <div v-if="view === 'cells'" class="cow-12 row q-col-gutter-md">
              <div
                v-for="(ticker, symbol) in binanceStore.tickers"
                :key="symbol"
                class="col-12 col-sm-6 col-md-3"
                style="min-width: 234px"
                @click="selectSymbol(symbol)"
              >
                <q-card
                  v-if="!symbol.includes('EUR')"
                  dark
                  bordered
                  :class="`crypto-card ${symbol !== onFocus ? 'bg-dark' : 'bg-grey-9'}`"
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
                      ${{ fmtNum(ticker.price, { minimumFractionDigits: 4 }) }}
                    </div>

                    <div class="row q-mt-md text-caption text-grey-5">
                      <div class="col">
                        <div>{{ t('app.common.labels.high24') }}</div>
                        <div class="text-positive">
                          ${{ fmtNum(ticker.high, { minimumFractionDigits: 2 }) }}
                        </div>
                      </div>
                      <div class="col">
                        <div>{{ t('app.common.labels.low24') }}</div>
                        <div class="text-negative">
                          ${{ fmtNum(ticker.low, { minimumFractionDigits: 2 }) }}
                        </div>
                      </div>
                      <div class="col">
                        <div>{{ t('app.common.labels.volume') }}</div>
                        <div class="text-grey-3">
                          ${{ (ticker.volume / 1_000_000).toFixed(1) }}M
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
            <div v-else>
              <q-table
                class="crypto-table"
                dark
                flat
                bordered
                separator="cell"
                row-key="symbol"
                :rows-per-page-options="[0]"
                :rows="tickersArray"
                :columns="columns"
                :table-style="{ width: '100%' }"
                @row-click="rowClicked"
              />

              <!-- <pre>{{ tickersArray }}</pre> -->
            </div>

            <!-- Skeleton while loading -->
            <template v-if="Object.keys(binanceStore.tickers).length === 0">
              <div v-for="n in 3" :key="n" class="col-12 col-sm-6 col-md-4">
                <q-card dark bordered class="bg-grey-9">
                  <q-card-section>
                    <q-skeleton type="text" width="80px" />
                    <q-skeleton type="text" width="160px" class="text-h4 q-mt-sm" />
                    <q-skeleton type="text" class="q-mt-md" />
                  </q-card-section>
                </q-card>
              </div>
            </template>
          </div>
        </div>
      </template>
    </q-splitter>
  </q-page>
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

:deep(.crypto-table tbody tr:nth-child(odd)) {
  opacity: 0.7;
  background-color: rgb(40, 39, 39);
}
</style>
