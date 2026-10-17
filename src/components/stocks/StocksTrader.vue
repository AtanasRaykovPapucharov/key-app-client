<script setup>
import { computed, nextTick, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/user'
import { getLocalUser } from 'src/services/storage/local'
import { useLocalized } from 'src/composables/useLocalized'

const { t, d: fmtDate } = useLocalized()

Chart.register(...registerables)

const STORAGE_KEY = 'cryptool-stocks-paper-orders'
const STARTING_CASH = 100000
const { locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const symbol = ref(route.query.symbol ? String(route.query.symbol).toUpperCase() : 'AAPL')
const searchText = ref('')
const range = ref('1y')
const quote = ref(null)
const history = ref([])
const searchResults = ref([])
const hasSearched = ref(false)
const loading = ref(false)
const searching = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const notice = ref('')
const side = ref('buy')
const amount = ref(1)
const orders = ref(loadOrders())
const chartCanvas = ref(null)
let chartInstance
let searchTimer
let ignoreSearchChange = false

const rangeOptions = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
]

onBeforeMount(() => {
  const localUser = getLocalUser()
  const isAuthenticated = userStore.user.isAuthenticated || Boolean(localUser?.uid || localUser?.id)

  if (!isAuthenticated) {
    void router.replace('/stocks-top100').then(() => {
      window.dispatchEvent(new CustomEvent('cryptool:open-auth'))
    })
  }
})

function loadOrders() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value))
}

const currentPrice = computed(() => Number(quote.value?.price) || 0)
const symbolOrders = computed(() => orders.value.filter((order) => order.symbol === symbol.value))
const position = computed(() =>
  symbolOrders.value.reduce(
    (result, order) => {
      const shares = Number(order.amount) || 0
      const value = shares * Number(order.price)
      if (order.side === 'buy') {
        result.shares += shares
        result.cost += value
      } else {
        const averageCost = result.shares > 0 ? result.cost / result.shares : 0
        result.shares -= shares
        result.cost = Math.max(0, result.cost - shares * averageCost)
        result.proceeds += value
      }
      return result
    },
    { shares: 0, cost: 0, proceeds: 0 },
  ),
)
const cashBalance = computed(
  () => STARTING_CASH - orders.value.reduce((total, order) => total + order.signedValue, 0),
)
const marketValue = computed(() => Math.max(0, position.value.shares) * currentPrice.value)
const portfolioValue = computed(() => cashBalance.value + marketValue.value)
const averagePrice = computed(() =>
  position.value.shares > 0 ? position.value.cost / position.value.shares : 0,
)
const unrealized = computed(() =>
  position.value.shares > 0 ? (currentPrice.value - averagePrice.value) * position.value.shares : 0,
)
const visibleOrders = computed(() => [...symbolOrders.value].reverse())

const formatNumber = (value, digits = 2) =>
  new Intl.NumberFormat(locale.value, { maximumFractionDigits: digits }).format(value || 0)
const formatPrice = (value) => `${formatNumber(value)} ${quote.value?.currency || 'USD'}`

async function loadStock() {
  const requestedSymbol = symbol.value.trim().toUpperCase()
  if (!requestedSymbol) return
  symbol.value = requestedSymbol
  loading.value = true
  errorMessage.value = ''
  notice.value = ''
  try {
    const [quoteResponse, historyResponse] = await Promise.all([
      api.get(`/yahoo/stock/${encodeURIComponent(requestedSymbol)}`),
      api.get(`/yahoo/stock/${encodeURIComponent(requestedSymbol)}/history`, {
        params: { range: range.value, interval: range.value === '1d' ? '5m' : '1d' },
      }),
    ])
    quote.value = quoteResponse.data
    history.value = historyResponse.data.quotes || []
    ignoreSearchChange = true
    searchText.value = quoteResponse.data.name || ''
    await nextTick()
    renderChart()
  } catch (error) {
    quote.value = null
    history.value = []
    errorMessage.value = error.response?.data?.error || 'Could not load stock data.'
    destroyChart()
  } finally {
    loading.value = false
  }
}

async function searchSymbols() {
  const query = searchText.value.trim()
  if (!query) return loadStock()
  searching.value = true
  hasSearched.value = false
  errorMessage.value = ''
  try {
    const response = await api.get('/yahoo/search', { params: { q: query } })
    searchResults.value = Array.isArray(response.data) ? response.data : []
    hasSearched.value = true
    const exactMatch = searchResults.value.find(
      (result) => result.symbol?.toUpperCase() === query.toUpperCase(),
    )
    if (exactMatch) selectSearchResult(exactMatch)
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Search failed.'
  } finally {
    searching.value = false
  }
}

function selectSearchResult(result) {
  symbol.value = String(result.symbol).toUpperCase()
  searchText.value = result.name || result.symbol
  searchResults.value = []
  hasSearched.value = false
  loadStock()
}

function submitOrder() {
  const shares = Number(amount.value)
  const price = currentPrice.value
  if (!Number.isFinite(shares) || shares <= 0 || !price) {
    notice.value = 'Enter a valid share amount after the quote loads.'
    return
  }
  const total = shares * price
  if (side.value === 'buy' && total > cashBalance.value) {
    notice.value = 'This order is larger than the available paper cash.'
    return
  }
  if (side.value === 'sell' && shares > position.value.shares) {
    notice.value = 'You do not hold enough shares to sell this amount.'
    return
  }
  submitting.value = true
  orders.value.push({
    id: `${Date.now()}-${Math.random()}`,
    symbol: symbol.value,
    side: side.value,
    amount: shares,
    price,
    signedValue: side.value === 'buy' ? total : -total,
    createdAt: new Date().toISOString(),
  })
  saveOrders()
  notice.value = `${side.value === 'buy' ? 'Bought' : 'Sold'} ${formatNumber(shares, 4)} shares of ${symbol.value}.`
  amount.value = 1
  submitting.value = false
}

function destroyChart() {
  chartInstance?.destroy()
  chartInstance = undefined
}

function renderChart() {
  destroyChart()
  if (!chartCanvas.value || !history.value.length) return
  const positive = (quote.value?.change ?? 0) >= 0
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: history.value.map((item) => new Date(item.date).toLocaleDateString(locale.value)),
      datasets: [
        {
          data: history.value.map((item) => item.close),
          borderColor: positive ? '#69f0ae' : '#ff7676',
          backgroundColor: positive ? 'rgba(105, 240, 174, 0.12)' : 'rgba(255, 118, 118, 0.12)',
          fill: true,
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#9e9e9e', maxTicksLimit: 8 }, grid: { display: false } },
        y: { ticks: { color: '#9e9e9e' }, grid: { color: 'rgba(255,255,255,0.08)' } },
      },
    },
  })
}

watch(searchText, (value, previousValue) => {
  if (ignoreSearchChange) {
    ignoreSearchChange = false
    return
  }
  clearTimeout(searchTimer)
  if (String(value || '').trim() && value !== previousValue)
    searchTimer = setTimeout(searchSymbols, 500)
})
watch(range, loadStock)
watch(
  () => route.query.symbol,
  (value) => {
    if (value && String(value).toUpperCase() !== symbol.value) {
      symbol.value = String(value).toUpperCase()
      loadStock()
    }
  },
)
onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  destroyChart()
})

loadStock()
</script>

<template>
  <div class="q-pa-md stocks-trader">
    <q-card class="trader-card q-pa-md">
      <div class="row q-col-gutter-sm items-center">
        <div class="col-12 col-sm-2">
          <q-input
            v-model="symbol"
            outlined
            dense
            dark
            :label="t('app.common.labels.symbol')"
            @keyup.enter="loadStock"
          />
        </div>
        <div class="col-12 col-sm-5">
          <q-input
            v-model="searchText"
            outlined
            dense
            dark
            :label="t('app.stocks.searchCompany')"
            @keyup.enter="searchSymbols"
            ><template #prepend
              ><q-btn
                flat
                round
                dense
                icon="search"
                :loading="searching"
                @click="searchSymbols" /></template
          ></q-input>
        </div>
        <div class="col text-right text-caption text-grey-5">
          {{ t('app.stocks.paperAccount') }} {{ formatPrice(portfolioValue) }}
        </div>
      </div>
      <q-list v-if="searchResults.length" bordered class="search-results q-mt-sm"
        ><q-item
          v-for="result in searchResults"
          :key="`${result.symbol}-${result.exchange}`"
          clickable
          @click="selectSearchResult(result)"
          ><q-item-section
            ><q-item-label>{{ result.symbol }} · {{ result.name }}</q-item-label
            ><q-item-label caption
              >{{ result.exchange }} · {{ result.type }}</q-item-label
            ></q-item-section
          ></q-item
        ></q-list
      >
      <q-banner v-else-if="hasSearched" class="bg-grey-9 text-grey-4 q-mt-sm">{{
        t('app.common.labels.noCompanies')
      }}</q-banner>
      <q-banner v-if="errorMessage" class="bg-red-9 text-white q-mt-md">{{
        errorMessage
      }}</q-banner>
      <q-banner v-if="notice" class="bg-grey-9 text-grey-3 q-mt-md" dense>{{ notice }}</q-banner>
      <template v-if="quote">
        <div class="row items-end justify-between q-mt-lg">
          <div>
            <div class="text-overline text-grey-5">
              {{ quote.symbol }} · {{ quote.exchange || '—' }}
            </div>
            <div class="text-h4 text-white">{{ quote.name }}</div>
          </div>
          <div class="text-right">
            <div class="text-h4 text-green-5">{{ formatPrice(quote.price) }}</div>
            <div :class="quote.change >= 0 ? 'text-green-5' : 'text-red-4'">
              {{ formatNumber(quote.change) }} ({{ formatNumber(quote.changePercent) }}%)
            </div>
          </div>
        </div>
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-lg-8">
            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle1 text-grey-3">
                {{ t('app.common.labels.priceHistory') }}
              </div>
              <q-btn-toggle
                v-model="range"
                dense
                unelevated
                toggle-color="green-5"
                :options="rangeOptions"
              />
            </div>
            <div class="chart-frame"><canvas ref="chartCanvas" /></div>
          </div>
          <div class="col-12 col-lg-4">
            <div class="trade-panel">
              <div class="text-subtitle1 text-green-5">{{ t('app.common.labels.order') }}</div>
              <q-btn-toggle
                v-model="side"
                class="q-mt-sm"
                spread
                unelevated
                toggle-color="green-6"
                :options="[
                  { label: t('app.common.actions.buy'), value: 'buy' },
                  { label: t('app.common.actions.sell'), value: 'sell' },
                ]"
              /><q-input
                v-model.number="amount"
                type="number"
                min="0.0001"
                step="0.0001"
                outlined
                dense
                dark
                :label="t('app.common.labels.shares')"
                class="q-mt-md"
              />
              <div class="row justify-between text-caption text-grey-5 q-mt-md">
                <span>{{ t('app.stocks.availableCash') }}</span
                ><span>{{ formatPrice(cashBalance) }}</span>
              </div>
              <div class="row justify-between text-caption text-grey-5">
                <span>{{ t('app.stocks.position') }}</span
                ><span
                  >{{ formatNumber(position.shares, 4) }} {{ t('app.stocks.sharesLower') }}</span
                >
              </div>
              <q-btn
                class="full-width q-mt-md"
                color="green-6"
                text-color="dark"
                :loading="submitting"
                :label="side === 'buy' ? 'Place buy order' : 'Place sell order'"
                @click="submitOrder"
              />
            </div>
          </div>
        </div>
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-sm-4">
            <div class="metric-cell">
              <span>{{ t('app.stocks.avgPrice') }}</span
              ><strong>{{ formatPrice(averagePrice) }}</strong>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="metric-cell">
              <span>{{ t('app.stocks.marketValue') }}</span
              ><strong>{{ formatPrice(marketValue) }}</strong>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="metric-cell">
              <span>{{ t('app.stocks.unrealized') }}</span
              ><strong :class="unrealized >= 0 ? 'text-green-5' : 'text-red-4'">{{
                formatPrice(unrealized)
              }}</strong>
            </div>
          </div>
        </div>
        <q-expansion-item
          v-if="visibleOrders.length"
          default-opened
          class="bg-grey-9 q-mt-md"
          :label="t('app.stocks.orderHistory')"
          ><q-table
            dark
            flat
            dense
            row-key="id"
            :rows="visibleOrders"
            :columns="[
              { name: 'createdAt', label: t('app.common.labels.date'), field: 'createdAt' },
              { name: 'side', label: t('app.common.labels.side'), field: 'side' },
              { name: 'amount', label: t('app.common.labels.shares'), field: 'amount' },
              { name: 'price', label: t('app.common.labels.price'), field: 'price' },
            ]"
            :rows-per-page-options="[0]"
            ><template #body-cell-createdAt="props"
              ><q-td :props="props">{{
                fmtDate(props.row.createdAt, { dateStyle: 'short', timeStyle: 'short' })
              }}</q-td></template
            ><template #body-cell-side="props"
              ><q-td
                :props="props"
                :class="props.row.side === 'buy' ? 'text-green-5' : 'text-red-4'"
                >{{ props.row.side.toUpperCase() }}</q-td
              ></template
            ><template #body-cell-price="props"
              ><q-td :props="props">{{ formatPrice(props.row.price) }}</q-td></template
            ></q-table
          ></q-expansion-item
        >
      </template>
      <q-inner-loading :showing="loading"><q-spinner color="green-5" size="3em" /></q-inner-loading>
    </q-card>
  </div>
</template>

<style scoped>
.trader-card {
  border: 1px solid #424242;
  background: #212121;
}
.search-results {
  background: #292929;
}
.chart-frame {
  position: relative;
  height: 360px;
  padding: 12px;
  border: 1px solid #424242;
  border-radius: 4px;
  background: #1b1b1b;
}
.trade-panel,
.metric-cell {
  padding: 14px;
  border: 1px solid #424242;
  border-radius: 4px;
  background: #1b1b1b;
}
.metric-cell {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #9e9e9e;
}
.metric-cell strong {
  color: #fff;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 700px) {
  .chart-frame {
    height: 280px;
  }
}
</style>
