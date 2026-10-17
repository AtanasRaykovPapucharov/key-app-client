<script setup>
import { useQuasar } from 'quasar'
import { ref, computed, watch, onMounted } from 'vue'

import { useBinanceStore } from 'src/stores/binance'
import SetWatcherForm from 'src/components/forms/SetWatcherForm.vue'
import DialogForm from 'src/components/DialogForm.vue'
import { addOrder, getOrdersByCrypto } from 'src/services/storage/crypto'
import { getLocalUser } from 'src/services/storage/local'
import { useLocalized } from 'src/composables/useLocalized'

const { t: tt } = useLocalized()

const binanceStore = useBinanceStore()
const $q = useQuasar()

const from = ref('BTC')
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
    `$${tickersArray.value?.find((t) => t?.symbol === onFocus.value)?.price.toLocaleString('en-US', { minimumFractionDigits: 4 })}`,
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
      return tt('app.common.labels.amount')
    },
    field: 'amount',
    type: 'number',
  },
  {
    name: 'watched',
    get label() {
      return tt('app.common.labels.watchedUsd')
    },
  },
  {
    name: 'current',
    get label() {
      return tt('app.common.labels.currentUsd')
    },
  },
  {
    name: 'diff',
    get label() {
      return tt('app.common.labels.diffUsd')
    },
  },
  {
    name: 'diff_percent',
    get label() {
      return tt('app.common.labels.diffPct')
    },
  },
  {
    name: 'dt_insert',
    get label() {
      return tt('app.common.labels.openedOn')
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
      uid: getLocalUser()?.uid,
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
    message: tt('app.common.notify.editWatcherSoon'),
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
      cancel: tt('app.common.labels.no'),
      ok: tt('app.common.labels.yes'),
      width: '380px',
    },
  }).onOk(() => {
    $q.notify({
      type: 'info',
      message: tt('app.common.notify.deleteWatcherSoon'),
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
        message: tt('app.common.notify.katAlert'),
        position: 'top-left',
      })
  },
  { deep: true },
)
</script>

<template>
  <div class="bg-grey-10">
    <q-btn
      flat
      dense
      rounded
      icon="visibility"
      class="text-purple-5"
      style="width: 30px; height: 30px; position: absolute; right: 10px; top: 4px"
      @click="addWatcher"
    />
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
                    ? tt('app.crypto.list.ordersWatched')
                    : currOrders.length === 1
                      ? tt('app.crypto.list.ordersWatchedOne')
                      : tt('app.crypto.list.ordersWatchedMany', { count: currOrders.length })
                }}
              </span>
              <span class="q-mx-xs">|</span>
              <span class="text-blue-4">{{
                tt('app.crypto.list.avgPrice', { price: avgPrice })
              }}</span>
              <span class="q-mx-xs">|</span>
              <span class="text-purple-4">
                {{ tt('app.crypto.list.currPrice', { price: currPrice }) }}
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
                  <span class="text-positive">{{ parseFloat(props.row.amount).toFixed(4) }} </span>
                </div>
              </q-td>
            </template>
            <template #body-cell-watched="props">
              <q-td :props="props">
                <div>
                  {{ tt('app.common.labels.priceColon') }}
                  <span class="text-blue-4">{{ parseFloat(props.row.curr_price).toFixed(4) }}</span>
                </div>
                <div>
                  {{ tt('app.common.labels.totalColon') }}
                  <span class="text-blue-4">{{ parseFloat(props.row.curr_total).toFixed(4) }}</span>
                </div>
              </q-td>
            </template>
            <template #body-cell-current="props">
              <q-td :props="props">
                <div>
                  {{ tt('app.common.labels.priceColon') }}
                  <span class="text-purple-4">{{
                    parseFloat(props.row.price_now).toFixed(4)
                  }}</span>
                </div>
                <div>
                  {{ tt('app.common.labels.totalColon') }}
                  <span class="text-purple-4">{{
                    parseFloat(props.row.total_now).toFixed(4)
                  }}</span>
                </div>
              </q-td>
            </template>
            <template #body-cell-diff="props">
              <q-td :props="props">
                <div>
                  {{ tt('app.common.labels.priceColon') }}
                  <span :class="`text-${props.row.price_diff > 0 ? 'positive' : 'negative'}`">
                    {{ parseFloat(props.row.price_diff).toFixed(4) }}
                  </span>
                </div>
                <div>
                  {{ tt('app.common.labels.totalColon') }}
                  <span :class="`text-${props.row.total_diff > 0 ? 'positive' : 'negative'}`">
                    {{ parseFloat(props.row.total_diff).toFixed(4) }}
                  </span>
                </div>
              </q-td>
            </template>
            <template #body-cell-diff_percent="props">
              <q-td :props="props">
                <div>
                  <span :class="`text-${props.row.total_diff > 0 ? 'positive' : 'negative'}`">
                    {{
                      (
                        (parseFloat(props.row.total_diff) / parseFloat(props.row.curr_total)) *
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
                    {{ new Date(props.row.dt_insert).toLocaleString().split(',')[0].trim() }}
                  </span>
                  <br />
                  <span class="text-secondary">
                    {{ new Date(props.row.dt_insert).toLocaleString().split(',')[1].trim() }}
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
                      {{ tt('app.common.labels.totalColon') }}
                      <span class="text-blue-4">{{
                        parseFloat(totalField('curr_total')).toFixed(4)
                      }}</span>
                    </div>
                  </template>
                  <template v-else-if="col.name === 'current'">
                    <div>
                      {{ tt('app.common.labels.totalColon') }}
                      <span class="text-purple-4">{{
                        parseFloat(totalField('total_now')).toFixed(4)
                      }}</span>
                    </div>
                  </template>
                  <template v-else-if="col.name === 'diff'">
                    <div>
                      {{ tt('app.common.labels.totalColon') }}
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
                          ((totalField('total_diff') / totalField('curr_total')) * 100).toFixed(2)
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
