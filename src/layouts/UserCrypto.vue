<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from 'src/stores/portfolio'
import cryptoMapper from 'src/helpers/crypto-mapper'

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
      class="text-grey"
      active-color="blue-gyey-9"
      active-bg-color="blue-gyey-9"
      indicator-color="blue-gyey-9"
      align="justify"
      inline-label
      outside-arrows
      :mobile-arrows="false"
      style="max-width: 400px"
    >
      <q-tab name="overview" label="Overview" />
      <q-tab name="earn" label="Earn" />
      <q-tab name="spot" label="Spot" />
      <!-- <q-tab name="alpha" label="Alpha" /> -->
    </q-tabs>
    <q-tab-panels v-model="cryptoTab" animated class="bg-grey-9">
      <q-tab-panel name="overview">
        <div
          v-for="cr in cryptoAssets"
          :key="cr.curr"
          class="row text-h5 q-mb-sm"
          style="width: 100%"
        >
          <div>
            <q-avatar
              class="bg-secondary q-mr-md"
              style="border: 1px solid grey; margin-top: -7px; font-size: 20px"
            >
              <img :src="cr.logo" />
            </q-avatar>
            <span class="q-mr-sm">{{ cr.curr }}</span>
            <span style="font-size: 16px">{{ cr.name }}</span>
          </div>

          <q-space />
          <span>{{ parseFloat(cr.amount)?.toFixed(4) }}</span>
        </div>
      </q-tab-panel>
      <q-tab-panel name="earn">
        <div class="text-h5 q-mb-md" style="width: 100%">
          <div class="text-center">EARN</div>
        </div>
      </q-tab-panel>
      <q-tab-panel name="spot">
        <div class="text-h5 q-mb-md" style="width: 100%">
          <div class="text-center">SPOT</div>
        </div>
      </q-tab-panel>
      <!-- <q-tab-panel name="alpha">
                    <div class="text-h5 q-mb-md" style="width: 100%">
                      <div class="text-center">ALPHA</div>
                    </div>
                  </q-tab-panel> -->
    </q-tab-panels>
  </div>
</template>
