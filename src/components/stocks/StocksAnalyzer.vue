<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

Chart.register(...registerables)

const { locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const symbol = ref(route.query.symbol ? String(route.query.symbol).toUpperCase() : 'AAPL')
const searchText = ref('')
const range = ref('1y')
const interval = ref('1d')
const quote = ref(null)
const history = ref([])
const summary = ref(null)
const companies = ref([])
const filteredCompanies = ref([])
const selectedCompany = ref(null)
const searchResults = ref([])
const hasSearched = ref(false)
const loading = ref(false)
const searching = ref(false)
const companiesLoading = ref(false)
const errorMessage = ref('')
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

const METRIC_KEYS = [
  'marketCap',
  'trailingPE',
  'forwardPE',
  'priceToBook',
  'beta',
  'dividendYield',
  'fiftyTwoWeekHigh',
  'fiftyTwoWeekLow',
  'volume',
  'avgVolume3Month',
  'epsTrailingTwelveMonths',
  'bookValue',
]
const metricLabels = computed(() =>
  Object.fromEntries(METRIC_KEYS.map((key) => [key, t(`app.stocks.metrics.${key}`)])),
)

const metricUnits = {
  marketCap: 'currency',
  trailingPE: 'x',
  forwardPE: 'x',
  priceToBook: 'x',
  beta: 'x',
  dividendYield: '%',
  fiftyTwoWeekHigh: 'currency',
  fiftyTwoWeekLow: 'currency',
  volume: 'shares',
  avgVolume3Month: 'shares',
  epsTrailingTwelveMonths: 'currency',
  bookValue: 'currency',
  totalCashPerShare: 'currency',
  maxAge: 'hours',
}

const getMetricUnit = (key) => {
  if (metricUnits[key]) return metricUnits[key]
  if (/margin|growth|yield|return|rate|percent|payout/i.test(key)) return '%'
  if (/pe|priceToBook|beta/i.test(key)) return 'x'
  if (/volume|sharesOutstanding/i.test(key)) return 'shares'
  if (
    /price|value|revenue|earnings|ebitda|income|cash|debt|asset|liabilit|equity|capital/i.test(key)
  ) {
    return 'currency'
  }
  return ''
}

const formatMetricLabel = (key, label) => {
  if (key === 'maxAge') return 'Expiration Life'

  return label
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (word.toLowerCase() === 'ebitda') return 'EBITDA'
      if (['of', 'per'].includes(word.toLowerCase())) return word.toLowerCase()
      if (word === 'P/E' || word === 'EPS') return word
      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`
    })
    .join(' ')
}

const metricLabel = (key, label) => {
  const unit = getMetricUnit(key)
  const formattedLabel = formatMetricLabel(key, label)
  if (!unit) return formattedLabel
  if (unit === 'currency') return `${formattedLabel} (${quote.value?.currency || '$'})`
  if (unit === 'x') return formattedLabel
  return `${formattedLabel} (${unit})`
}

const quoteMetrics = computed(() =>
  Object.entries(metricLabels.value)
    .map(([key, label]) => ({
      key,
      label: metricLabel(key, label),
      value: quote.value?.[key],
    }))
    .filter((metric) => metric.value !== null && metric.value !== undefined),
)

const summaryMetrics = computed(() => {
  const sources = [
    summary.value?.financialData,
    summary.value?.defaultKeyStatistics,
    summary.value?.summaryDetail,
  ]
  const entries = []
  for (const source of sources) {
    for (const [key, value] of Object.entries(source || {})) {
      if (entries.some((entry) => entry.key === key)) continue
      const normalized = value && typeof value === 'object' && 'raw' in value ? value.raw : value
      if (typeof normalized === 'number') {
        entries.push({
          key,
          label: metricLabel(key, key),
          value: key === 'maxAge' ? normalized / 3600 : normalized,
        })
      }
    }
  }
  return entries.slice(0, 12)
})

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value !== 'number') return value
  return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(value)
}

const formatPrice = (value) => {
  if (value === null || value === undefined) return '—'
  return `${formatNumber(value)} ${quote.value?.currency || ''}`.trim()
}

async function loadCompanies() {
  companiesLoading.value = true
  try {
    const response = await api.get('/yahoo/top100', { params: { limit: 100 } })
    companies.value = (response.data.stocks || []).map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      label: `${stock.symbol} — ${stock.name}`,
    }))
    filteredCompanies.value = companies.value
  } catch {
    companies.value = []
    filteredCompanies.value = []
  } finally {
    companiesLoading.value = false
  }
}

function filterCompanies(value, update) {
  update(() => {
    const query = value.toLowerCase()
    filteredCompanies.value = query
      ? companies.value.filter(
          (company) =>
            company.symbol.toLowerCase().includes(query) ||
            company.name.toLowerCase().includes(query),
        )
      : companies.value
  })
}

async function loadStock() {
  const requestedSymbol = symbol.value.trim().toUpperCase()
  if (!requestedSymbol) return
  symbol.value = requestedSymbol
  loading.value = true
  errorMessage.value = ''
  searchResults.value = []
  try {
    const [quoteResponse, historyResponse, summaryResponse] = await Promise.all([
      api.get(`/yahoo/stock/${encodeURIComponent(requestedSymbol)}`),
      api.get(`/yahoo/stock/${encodeURIComponent(requestedSymbol)}/history`, {
        params: { range: range.value, interval: interval.value },
      }),
      api.get(`/yahoo/stock/${encodeURIComponent(requestedSymbol)}/summary`),
    ])
    quote.value = quoteResponse.data
    selectedCompany.value = companies.value.some((company) => company.symbol === requestedSymbol)
      ? requestedSymbol
      : null
    history.value = historyResponse.data.quotes || []
    summary.value = summaryResponse.data
    await nextTick()
    renderChart()
  } catch (error) {
    quote.value = null
    history.value = []
    summary.value = null
    errorMessage.value = error.response?.data?.error || t('app.stocks.analyzer.couldNotLoadStock')
    destroyChart()
  } finally {
    loading.value = false
  }
}

async function searchSymbols() {
  const query = searchText.value.trim()
  if (!query) return

  searching.value = true
  hasSearched.value = false
  searchResults.value = []
  try {
    const { data } = await api.get('/yahoo/search', { params: { q: query } })
    searchResults.value = Array.isArray(data) ? data : []
    hasSearched.value = true
    const exactMatch = searchResults.value.find(
      (result) => result.symbol?.toUpperCase() === query.toUpperCase(),
    )
    if (exactMatch) selectSearchResult(exactMatch)
  } catch {
    hasSearched.value = true
  } finally {
    searching.value = false
  }
}

function selectSearchResult(result) {
  ignoreSearchChange = true
  searchText.value = result.name || result.symbol
  searchResults.value = []
  hasSearched.value = false
  selectCompany(result)
}

function selectCompany(value) {
  const company =
    typeof value === 'object' ? value : companies.value.find((item) => item.symbol === value)
  if (!company) return

  const normalizedSymbol = company.symbol.toUpperCase()
  selectedCompany.value = companies.value.some((item) => item.symbol === normalizedSymbol)
    ? normalizedSymbol
    : null
  symbol.value = normalizedSymbol
  searchText.value = ''
  loadStock()
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
          label: quote.value?.symbol || symbol.value,
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

watch(searchText, (value) => {
  if (ignoreSearchChange) {
    ignoreSearchChange = false
    return
  }
  clearTimeout(searchTimer)
  if (String(value || '').trim()) searchTimer = setTimeout(searchSymbols, 500)
})
watch(range, loadStock)
watch(
  () => route.query.symbol,
  (newSymbol) => {
    if (!newSymbol) return
    const normalized = String(newSymbol).toUpperCase()
    if (normalized !== symbol.value) {
      symbol.value = normalized
      loadStock()
    }
  },
)
onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  destroyChart()
})
onMounted(loadCompanies)
loadStock()
</script>

<template>
  <div class="analyzer-card q-px-md q-pb-md">
    <q-banner v-if="errorMessage" rounded class="bg-red-9 text-white q-mt-md">
      {{ errorMessage }}
    </q-banner>

    <template v-if="quote">
      <div class="stock-header row items-center justify-between q-mt-sm">
        <div class="stock-identity">
          <div class="text-overline text-grey-5">
            {{ quote.symbol }} · {{ quote.exchange || '—' }}
          </div>
          <div class="text-h4 text-white">{{ quote.name }}</div>
        </div>

        <div class="stock-controls row q-col-gutter-sm items-center">
          <div class="col-12 col-sm-2">
            <q-input
              v-model="symbol"
              outlined
              dense
              dark
              readonly
              filled
              color="green-5"
              :label="t('app.common.labels.symbol')"
              @keyup.enter="loadStock"
            />
          </div>

          <div class="col-12 col-sm-5">
            <q-select
              v-model="selectedCompany"
              :options="filteredCompanies"
              option-label="label"
              option-value="symbol"
              emit-value
              map-options
              use-input
              fill-input
              hide-selected
              input-debounce="200"
              outlined
              dense
              dark
              color="green-5"
              :loading="companiesLoading"
              :label="t('app.stocks.topCompanies')"
              @filter="filterCompanies"
              @update:model-value="selectCompany"
            />
          </div>

          <div class="stock-control-search col-12 col-sm-4">
            <q-input
              v-model="searchText"
              outlined
              dense
              dark
              color="green-5"
              :label="t('app.common.actions.search')"
              @keyup.enter="searchSymbols"
            >
              <template #prepend>
                <q-btn
                  flat
                  round
                  color="green-5"
                  dense
                  icon="search"
                  :loading="searching"
                  @click="searchSymbols"
                />
              </template>
            </q-input>
            <q-list v-if="searchResults.length" bordered class="search-suggestions">
              <q-item
                v-for="result in searchResults"
                :key="`${result.symbol}-${result.exchange}`"
                clickable
                @click="selectSearchResult(result)"
              >
                <q-item-section>
                  <q-item-label>{{ result.symbol }} · {{ result.name }}</q-item-label>
                  <q-item-label caption class="text-secondary"
                    >{{ result.exchange }} · {{ result.type }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else-if="hasSearched" class="search-suggestions search-suggestions--empty">
              {{ t('app.common.labels.noCompanies') }}
            </div>
          </div>
        </div>

        <div class="stock-price text-right">
          <div class="text-h4 text-green-5">{{ formatPrice(quote.price) }}</div>
          <div :class="quote.change >= 0 ? 'text-green-5' : 'text-red-4'">
            {{ formatNumber(quote.change) }} ({{ formatNumber(quote.changePercent) }}%)
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mt-xs">
        <div class="col-12 col-lg-8">
          <div class="chart-toolbar row items-center justify-between q-mb-sm">
            <div class="text-subtitle1 text-grey-3">{{ t('app.common.labels.priceHistory') }}</div>
            <q-btn-toggle
              v-model="range"
              dense
              unelevated
              toggle-color="green-5"
              text-color="grey-4"
              :options="rangeOptions"
            />
          </div>
          <div class="chart-frame"><canvas ref="chartCanvas" /></div>
        </div>
        <div class="col-12 col-lg-4">
          <div class="metric-grid">
            <div v-for="metric in quoteMetrics" :key="metric.key" class="metric-cell">
              <div class="text-caption text-grey-5">{{ metric.label }}</div>
              <div class="text-body1 text-white">{{ formatNumber(metric.value) }}</div>
            </div>
          </div>
        </div>
      </div>

      <q-separator class="q-mb-sm" />
      <div class="text-h6 text-green-5 q-mb-md">{{ t('app.stocks.extended') }}</div>
      <div class="metric-grid summary-grid">
        <div v-for="metric in summaryMetrics" :key="metric.key" class="metric-cell">
          <div class="text-caption text-grey-5">{{ metric.label }}</div>
          <div class="text-body1 text-white">{{ formatNumber(metric.value) }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.analyzer-card {
  border: 1px solid #424242;
  background: #212121;
}

.stock-control-search {
  position: relative;
}

.search-suggestions {
  position: absolute;
  z-index: 10;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
  max-height: 220px;
  overflow-y: auto;
  margin: 0;
  border: 1px solid #424242;
  background: #292929;
}

.search-suggestions :deep(.q-item) {
  min-height: 48px;
}

.search-suggestions :deep(.q-item__label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-suggestions--empty {
  padding: 10px 12px;
  color: #9e9e9e;
}

.stock-header {
  gap: 24px;
  flex-wrap: nowrap;
}

.stock-identity {
  flex: 0 1 220px;
  min-width: 0;
}

.stock-controls {
  flex: 1 1 auto;
  min-width: 0;
}

.stock-price {
  flex: 0 0 auto;
  min-width: max-content;
}

.chart-frame {
  position: relative;
  height: 360px;
  padding: 12px;
  border: 1px solid #424242;
  border-radius: 4px;
  background: #1b1b1b;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.metric-cell {
  min-width: 0;
  padding: 12px;
  border: 1px solid #424242;
  border-radius: 4px;
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: 700px) {
  .stock-header {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
    flex-wrap: wrap;
  }

  .stock-identity {
    flex: 0 0 auto;
  }

  .stock-price {
    text-align: left;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-frame {
    height: 280px;
  }
}
</style>
