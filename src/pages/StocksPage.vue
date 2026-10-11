<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'

import StocksAnalysis from 'src/components/stocks/StocksAnalysis.vue'
import StocksAnalyzer from 'src/components/stocks/StocksAnalyzer.vue'
import StocksFundamentals from 'src/components/stocks/StocksFundamentals.vue'
import StocksResources from 'src/components/stocks/StocksResources.vue'
import StocksTop100 from 'src/components/stocks/StocksTop100.vue'
import StocksTrader from 'src/components/stocks/StocksTrader.vue'
import { useUserStore } from 'src/stores/user'
import { getLocalUser } from 'src/services/storage/local'

const props = defineProps({
  route: {
    type: String,
    default: () => 'analysis',
  },
})

const router = useRouter()
const userStore = useUserStore()
const canRenderAnalysis = ref(props.route !== 'analysis')

onBeforeMount(() => {
  const localUser = getLocalUser()
  const isAuthenticated = userStore.user.isAuthenticated || Boolean(localUser?.uid || localUser?.id)

  if (props.route !== 'analysis') return

  if (props.route === 'analysis' && !isAuthenticated) {
    void router.replace('/stocks-fundamentals').then(() => {
      window.dispatchEvent(new CustomEvent('cryptool:open-auth'))
    })
    return
  }

  canRenderAnalysis.value = true
})
</script>

<template>
  <q-page class="q-pa-none bg-dark">
    <StocksFundamentals v-if="route === 'fundamentals'" />
    <StocksAnalysis v-if="route === 'analysis' && canRenderAnalysis" />
    <StocksAnalyzer v-if="route === 'analyzer'" />
    <StocksTop100 v-if="route === 'top100'" />
    <StocksTrader v-if="route === 'trader'" />
    <StocksResources v-if="route === 'resources'" />
  </q-page>
</template>
