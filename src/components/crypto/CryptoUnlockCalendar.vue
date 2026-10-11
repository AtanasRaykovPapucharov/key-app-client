<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from 'src/boot/axios'

const { locale } = useI18n({ useScope: 'global' })
const lang = computed(() => locale.value.split('-')[0])
const coins = ref([])
const loading = ref(false)
const errorMessage = ref('')

const title = computed(() =>
  lang.value === 'bg' ? 'Календар за отключване на токени' : 'Token unlock calendar',
)
// CoinGecko does not expose exact vesting dates for free, so this approximates
// unlock pressure using circulating vs. total/max supply.
const note = computed(() =>
  lang.value === 'bg'
    ? 'Няма безплатен API с точни дати за отключване, затова прогресът показва циркулиращо спрямо общо/максимално предлагане — колкото по-нисък %, толкова повече токени тепърва ще бъдат отключени.'
    : 'No free API exposes exact unlock dates, so progress shows circulating vs. total/max supply — the lower the %, the more tokens are still to be unlocked.',
)

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

async function loadUnlocks() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/coingecko/top100', {
      params: { criterion: 'unlockedPct', limit: 30 },
    })
    coins.value = response.data.coins || []
  } catch (error) {
    coins.value = []
    errorMessage.value =
      error.response?.data?.error ||
      (lang.value === 'bg' ? 'Данните не могат да бъдат заредени.' : 'Could not load unlock data.')
  } finally {
    loading.value = false
  }
}

onMounted(loadUnlocks)
</script>

<template>
  <div class="q-pa-md">
    <q-card class="top-card q-pa-md">
      <div class="text-h5 text-orange-5">
        <q-icon name="event_available" class="q-mr-sm" />{{ title }}
      </div>
      <div class="text-body2 text-grey-5 q-mb-md">{{ note }}</div>

      <q-banner v-if="errorMessage" rounded class="bg-red-9 text-white q-mb-md">
        {{ errorMessage }}
      </q-banner>

      <q-linear-progress v-if="loading" indeterminate color="orange-5" class="q-mb-md" />

      <q-list separator dark>
        <q-item v-for="coin in coins" :key="coin.id">
          <q-item-section>
            <q-item-label>
              <span class="text-weight-bold text-orange-5">{{ coin.symbol }}</span>
              <span class="text-grey-5"> — {{ coin.name }}</span>
            </q-item-label>
            <q-item-label caption>
              {{ formatCompact(coin.circulatingSupply) }} /
              {{ formatCompact(coin.totalSupply) }}
              {{ lang === 'bg' ? 'в обращение' : 'circulating' }}
            </q-item-label>
          </q-item-section>
          <q-item-section side style="min-width: 160px">
            <q-linear-progress
              :value="coin.unlockedPct / 100"
              color="orange-5"
              track-color="grey-9"
              size="10px"
              rounded
            />
            <div class="text-caption text-grey-5 text-right q-mt-xs">
              {{ formatNumber(coin.unlockedPct) }}%
              {{ lang === 'bg' ? 'отключено' : 'unlocked' }}
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </div>
</template>

<style scoped>
.top-card {
  border: 1px solid #424242;
  background: #212121;
}

.top-card :deep(.q-item) {
  padding-left: 0;
  padding-right: 0;
}
</style>
