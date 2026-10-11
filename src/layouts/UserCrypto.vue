<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from 'src/stores/portfolio'
import cryptoMapper from 'src/helpers/crypto-mapper'
import { useLocalized } from 'src/composables/useLocalized'

const { t, n } = useLocalized()

const portfolioStore = usePortfolioStore()
const { portfolio } = storeToRefs(portfolioStore)
const cryptoTab = ref('overview')

onMounted(() => {
  portfolioStore.initializePortfolio()
})

const cryptoAssets = computed(() => {
  const stableAsset =
    portfolio.value?.stable_curr && portfolio.value?.stable_amount != null
      ? [{ curr: portfolio.value.stable_curr, amount: portfolio.value.stable_amount }]
      : []

  return [...stableAsset, ...(portfolio.value?.crypto || [])].map((asset) => ({
    ...cryptoMapper[asset.curr],
    ...asset,
  }))
})
</script>

<template>
  <!-- <pre>{{ portfolio.crypto }}</pre> -->
  <div>
    <q-tabs
      v-model="cryptoTab"
      dense
      class="text-grey full-width"
      active-color="blue-grey-9"
      active-bg-color="blue-grey-9"
      indicator-color="blue-grey-9"
      align="justify"
      inline-label
      outside-arrows
      :mobile-arrows="false"
    >
      <q-tab name="overview" :label="t('app.layout.userCrypto.overview')" />
      <q-tab name="earn" :label="t('app.layout.userCrypto.earn')" />
      <q-tab name="spot" :label="t('app.layout.userCrypto.spot')" />
      <!-- <q-tab name="alpha" label="Alpha" /> -->
    </q-tabs>
    <q-tab-panels v-model="cryptoTab" animated class="bg-grey-9">
      <q-tab-panel name="overview">
        <div v-if="!cryptoAssets.length" class="text-body2 text-grey-5">
          {{ t('app.layout.userCrypto.empty') }}
        </div>
        <div v-for="cr in cryptoAssets" :key="cr.curr" class="asset-row q-mb-sm">
          <div class="asset-row__name">
            <q-avatar size="32px" class="bg-secondary q-mr-sm" style="border: 1px solid grey">
              <img :src="cr.logo" :alt="cr.curr" />
            </q-avatar>
            <span class="text-weight-medium q-mr-xs">{{ cr.curr }}</span>
            <span class="text-caption text-grey-5 ellipsis">{{ cr.name }}</span>
          </div>
          <span class="asset-row__amount">{{
            n(cr.amount, { maximumFractionDigits: 4, minimumFractionDigits: 4 })
          }}</span>
        </div>
      </q-tab-panel>
      <q-tab-panel name="earn">
        <div class="text-h6 text-center text-grey-5 q-my-md">
          {{ t('app.layout.userCrypto.earn') }} · {{ t('app.layout.userCrypto.comingSoon') }}
        </div>
      </q-tab-panel>
      <q-tab-panel name="spot">
        <div class="text-h6 text-center text-grey-5 q-my-md">
          {{ t('app.layout.userCrypto.spot') }} · {{ t('app.layout.userCrypto.comingSoon') }}
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<style scoped>
.asset-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 1.1rem;
}

.asset-row__name {
  display: flex;
  align-items: center;
  min-width: 0;
}

.asset-row__amount {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
