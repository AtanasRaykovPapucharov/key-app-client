<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const { locale } = useI18n({ useScope: 'global' })
const router = useRouter()
const criterion = ref('marketCap')
const search = ref('')
const stocks = ref([])
const loading = ref(false)
const errorMessage = ref('')

const criteria = computed(() => [
  {
    get label() {
      return t('app.common.labels.marketCap')
    },
    value: 'marketCap',
  },
  {
    get label() {
      return t('app.common.labels.dailyGain')
    },
    value: 'changePercent',
  },
  {
    get label() {
      return t('app.common.labels.volume')
    },
    value: 'volume',
  },
  {
    get label() {
      return t('app.stocks.lowestPe')
    },
    value: 'trailingPE',
  },
  {
    get label() {
      return t('app.stocks.dividendYield')
    },
    value: 'dividendYield',
  },
])

const columns = computed(() => [
  { name: 'rank', label: '#', field: 'rank', align: 'left', sortable: true },
  {
    name: 'symbol',
    label: t('app.stocks.top100.symbol'),
    field: 'symbol',
    align: 'left',
    sortable: true,
  },
  {
    name: 'name',
    label: t('app.stocks.top100.company'),
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'price',
    label: t('app.stocks.top100.price'),
    field: 'price',
    align: 'right',
    sortable: true,
  },
  { name: 'changePercent', label: '%', field: 'changePercent', align: 'right', sortable: true },
  {
    name: 'marketCap',
    label: t('app.stocks.top100.marketCap'),
    field: 'marketCap',
    align: 'right',
    sortable: true,
  },
  { name: 'trailingPE', label: 'P/E', field: 'trailingPE', align: 'right', sortable: true },
  {
    name: 'dividendYield',
    label: t('app.stocks.top100.dividend'),
    field: 'dividendYield',
    align: 'right',
    sortable: true,
  },
  {
    name: 'volume',
    label: t('app.stocks.top100.volume'),
    field: 'volume',
    align: 'right',
    sortable: true,
  },
])

const title = computed(() => t('app.stocks.top100.top100Stocks'))
const description = computed(() => t('app.stocks.top100.keyMetricsForLeading'))

const filteredStocks = computed(() => {
  const needle = search.value.trim().toLowerCase()
  if (!needle) return stocks.value
  return stocks.value.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(needle) || stock.name.toLowerCase().includes(needle),
  )
})

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat(locale.value, { maximumFractionDigits: digits }).format(value)
}

function formatCompact(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat(locale.value, {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPrice(row) {
  return row.price === null || row.price === undefined
    ? '—'
    : `${formatNumber(row.price)} ${row.currency || ''}`.trim()
}

async function loadStocks() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/yahoo/top100', {
      params: { criterion: criterion.value, limit: 100 },
    })
    stocks.value = response.data.stocks || []
  } catch (error) {
    stocks.value = []
    errorMessage.value = error.response?.data?.error || t('app.stocks.top100.couldNotLoadStock')
  } finally {
    loading.value = false
  }
}

function goToAnalyzer(row) {
  router.push({ path: '/stocks-analyzer', query: { symbol: row.symbol } })
}

watch(criterion, loadStocks)
onMounted(loadStocks)
</script>

<template>
  <div class="q-pa-md">
    <q-card class="top-card q-pa-md">
      <div class="row items-center justify-between q-col-gutter-md">
        <div class="col-12 col-md-3">
          <div class="text-h5 text-green-5">
            <q-icon name="leaderboard" class="q-mr-sm" />{{ title }}
          </div>
          <div class="text-body2 text-grey-5">{{ description }}</div>
        </div>
        <div class="col-12 col-md-5 flex flex-center">
          <q-input
            v-model="search"
            outlined
            dense
            dark
            clearable
            class="full-width"
            :label="t('app.stocks.top100.searchBySymbolOr')"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-5 col-md-4">
          <q-select
            v-model="criterion"
            :options="criteria"
            emit-value
            map-options
            outlined
            dense
            dark
            :label="t('app.stocks.top100.rankBy')"
          />
        </div>
      </div>

      <q-banner v-if="errorMessage" rounded class="bg-red-9 text-white q-mt-md">
        {{ errorMessage }}
      </q-banner>

      <q-table
        class="top-table q-mt-md"
        flat
        bordered
        dark
        dense
        row-key="symbol"
        :rows="filteredStocks"
        :columns="columns"
        :loading="loading"
        :pagination="{ rowsPerPage: 25 }"
        @row-click="(evt, row) => goToAnalyzer(row)"
      >
        <template #body-cell-symbol="props">
          <q-td :props="props">
            <span class="text-weight-bold text-green-5">{{ props.row.symbol }}</span>
          </q-td>
        </template>
        <template #body-cell-name="props">
          <q-td :props="props" class="company-name">{{ props.row.name }}</q-td>
        </template>
        <template #body-cell-price="props">
          <q-td :props="props">{{ formatPrice(props.row) }}</q-td>
        </template>
        <template #body-cell-changePercent="props">
          <q-td
            :props="props"
            :class="props.row.changePercent >= 0 ? 'text-green-5' : 'text-red-4'"
          >
            {{
              props.row.changePercent === null ? '—' : `${formatNumber(props.row.changePercent)}%`
            }}
          </q-td>
        </template>
        <template #body-cell-marketCap="props">
          <q-td :props="props">{{ formatCompact(props.row.marketCap) }}</q-td>
        </template>
        <template #body-cell-trailingPE="props">
          <q-td :props="props">{{ formatNumber(props.row.trailingPE) }}</q-td>
        </template>
        <template #body-cell-dividendYield="props">
          <q-td :props="props">{{
            props.row.dividendYield === null ? '—' : `${formatNumber(props.row.dividendYield)}%`
          }}</q-td>
        </template>
        <template #body-cell-volume="props">
          <q-td :props="props">{{ formatCompact(props.row.volume) }}</q-td>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<style scoped>
.top-card {
  border: 1px solid #424242;
  background: #212121;
}

.top-table {
  background: #1b1b1b;
}

.top-table :deep(tbody tr) {
  cursor: pointer;
}

.company-name {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
