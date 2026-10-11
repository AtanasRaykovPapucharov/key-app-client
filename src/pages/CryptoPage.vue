<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'

import CryptoFundamentals from 'src/components/crypto/CryptoFundamentals.vue'
import CryptoTop100 from 'src/components/crypto/CryptoTop100.vue'
import CryptoUnlockCalendar from 'src/components/crypto/CryptoUnlockCalendar.vue'
import CryptoAnalysis from 'src/components/crypto/CryptoAnalysis.vue'
import CryptoResources from 'src/components/crypto/CryptoResources.vue'
import CryptoTrader from 'src/components/crypto/CryptoTrader.vue'
import CryptoWatcher from 'src/components/crypto/CryptoWatcher.vue'
import CryptoList from 'src/components/crypto/CryptoList.vue'
import CryptoLongTerm from 'src/components/crypto/CryptoLongTerm.vue'
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
    void router.replace('/crypto-watcher').then(() => {
      window.dispatchEvent(new CustomEvent('cryptool:open-auth'))
    })
    return
  }

  canRenderAnalysis.value = true
})
</script>

<template>
  <q-page class="q-pa-none bg-dark">
    <CryptoFundamentals v-if="route === 'fundamentals'" />
    <CryptoTop100 v-if="route === 'top100'" />
    <CryptoUnlockCalendar v-if="route === 'unlock-calendar'" />
    <CryptoAnalysis v-if="route === 'analysis' && canRenderAnalysis" />
    <CryptoResources v-if="route === 'resources'" />
    <CryptoList v-if="route === 'list'" />
    <CryptoLongTerm v-if="route === 'long-term'" />
    <CryptoTrader v-if="route === 'trader'" />
    <CryptoWatcher v-if="route === 'watcher'" />
  </q-page>
</template>
