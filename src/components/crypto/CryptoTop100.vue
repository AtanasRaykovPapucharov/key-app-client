<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'

const { locale } = useI18n({ useScope: 'global' })
const router = useRouter()
const lang = computed(() => locale.value.split('-')[0])
const criterion = ref('marketCap')
const search = ref('')
const coins = ref([])
const loading = ref(false)
const errorMessage = ref('')

const criteria = computed(() =>
  lang.value === 'bg'
    ? [
        { label: 'Пазарна капитализация', value: 'marketCap' },
        { label: 'Дневен ръст', value: 'changePercent' },
        { label: 'Обем', value: 'volume' },
        { label: 'Спад от ATH', value: 'athChangePct' },
        { label: 'Най-малко отключен обем', value: 'unlockedPct' },
      ]
    : [
        { label: 'Market cap', value: 'marketCap' },
        { label: 'Daily gain', value: 'changePercent' },
        { label: 'Volume', value: 'volume' },
        { label: 'Drop from ATH', value: 'athChangePct' },
        { label: 'Least unlocked supply', value: 'unlockedPct' },
      ],
)

const columns = computed(() => [
  { name: 'rank', label: '#', field: 'rank', align: 'left', sortable: true },
  {
    name: 'symbol',
    label: lang.value === 'bg' ? 'Символ' : 'Symbol',
    field: 'symbol',
    align: 'left',
    sortable: true,
  },
  {
    name: 'name',
    label: lang.value === 'bg' ? 'Име' : 'Name',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'price',
    label: lang.value === 'bg' ? 'Цена' : 'Price',
    field: 'price',
    align: 'right',
    sortable: true,
  },
  { name: 'changePercent', label: '24h %', field: 'changePercent', align: 'right', sortable: true },
  {
    name: 'marketCap',
    label: lang.value === 'bg' ? 'Капитализация' : 'Market cap',
    field: 'marketCap',
    align: 'right',
    sortable: true,
  },
  {
    name: 'volume',
    label: lang.value === 'bg' ? 'Обем' : 'Volume',
    field: 'volume',
    align: 'right',
    sortable: true,
  },
  {
    name: 'athChangePct',
    label: 'ATH %',
    field: 'athChangePct',
    align: 'right',
    sortable: true,
  },
  {
    name: 'unlockedPct',
    label: lang.value === 'bg' ? 'Отключено' : 'Unlocked',
    field: 'unlockedPct',
    align: 'right',
    sortable: true,
  },
])

const title = computed(() => (lang.value === 'bg' ? 'Топ 100 крипто' : 'Top 100 crypto'))
const description = computed(() =>
  lang.value === 'bg'
    ? 'Най-важните показатели за водещите монети според избрания критерий.'
    : 'Key metrics for leading coins ranked by the selected criterion.',
)

const filteredCoins = computed(() => {
  const needle = search.value.trim().toLowerCase()
  if (!needle) return coins.value
  return coins.value.filter(
    (coin) =>
      coin.symbol.toLowerCase().includes(needle) || coin.name.toLowerCase().includes(needle),
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
  return row.price === null || row.price === undefined ? '—' : `$${formatNumber(row.price, 4)}`
}

async function loadCoins() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/coingecko/top100', {
      params: { criterion: criterion.value, limit: 100 },
    })
    coins.value = response.data.coins || []
  } catch (error) {
    coins.value = []
    errorMessage.value =
      error.response?.data?.error ||
      (lang.value === 'bg'
        ? 'Данните не могат да бъдат заредени.'
        : 'Could not load coin rankings.')
  } finally {
    loading.value = false
  }
}

function goToAnalyzer(row) {
  router.push({ path: '/crypto-watcher', query: { symbol: row.symbol } })
}

watch(criterion, loadCoins)
onMounted(loadCoins)
</script>

<template>
  <div class="q-pa-md">
    <q-card class="top-card q-pa-md">
      <div class="row items-center justify-between q-col-gutter-md">
        <div class="col-12 col-md-3">
          <div class="text-h5 text-orange-5">
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
            :label="lang === 'bg' ? 'Търсене по символ или име' : 'Search by symbol or name'"
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
            :label="lang === 'bg' ? 'Класиране по' : 'Rank by'"
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
        row-key="id"
        :rows="filteredCoins"
        :columns="columns"
        :loading="loading"
        :pagination="{ rowsPerPage: 25 }"
        @row-click="(evt, row) => goToAnalyzer(row)"
      >
        <template #body-cell-symbol="props">
          <q-td :props="props">
            <span class="text-weight-bold text-orange-5">{{ props.row.symbol }}</span>
          </q-td>
        </template>
        <template #body-cell-name="props">
          <q-td :props="props" class="coin-name">{{ props.row.name }}</q-td>
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
        <template #body-cell-volume="props">
          <q-td :props="props">{{ formatCompact(props.row.volume) }}</q-td>
        </template>
        <template #body-cell-athChangePct="props">
          <q-td :props="props" :class="props.row.athChangePct >= 0 ? 'text-green-5' : 'text-red-4'">
            {{ props.row.athChangePct === null ? '—' : `${formatNumber(props.row.athChangePct)}%` }}
          </q-td>
        </template>
        <template #body-cell-unlockedPct="props">
          <q-td :props="props">
            {{ props.row.unlockedPct === null ? '—' : `${formatNumber(props.row.unlockedPct)}%` }}
          </q-td>
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

.coin-name {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
