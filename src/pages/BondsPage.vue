<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'

import BondsFundamentals from 'src/components/bonds/BondsFundamentals.vue'
import BondsAnalysis from 'src/components/bonds/BondsAnalysis.vue'
import BondsResources from 'src/components/bonds/BondsResources.vue'
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
    void router.replace('/bonds-fundamentals').then(() => {
      window.dispatchEvent(new CustomEvent('cryptool:open-auth'))
    })
    return
  }

  canRenderAnalysis.value = true
})
</script>

<template>
  <q-page class="q-pa-none">
    <BondsFundamentals v-if="route === 'fundamentals'" />
    <BondsAnalysis v-if="route === 'analysis' && canRenderAnalysis" />
    <BondsResources v-if="route === 'resources'" />
  </q-page>
</template>
