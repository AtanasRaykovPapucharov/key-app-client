<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalized } from 'src/composables/useLocalized'
import { api } from 'src/boot/axios'

const { locale } = useI18n({ useScope: 'global' })
const { t } = useLocalized()
const coins = ref([])
const loading = ref(false)
const errorMessage = ref('')

const title = computed(() => t('app.crypto.unlockcalendar.tokenUnlockCalendar'))
// CoinGecko does not expose exact vesting dates for free, so this approximates
// unlock pressure using circulating vs. total/max supply.
const note = computed(() => t('app.crypto.unlockcalendar.noFreeApiExposes'))

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
      error.response?.data?.error || t('app.crypto.unlockcalendar.couldNotLoadUnlock')
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
              {{ t('app.crypto.unlockcalendar.circulating') }}
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
              {{ t('app.crypto.unlockcalendar.unlocked') }}
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
