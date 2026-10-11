<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'

import DailyPnl from 'src/components/user/DailyPNL.vue'
import DailyChart from 'src/components/user/DailyChart.vue'
import UserProfile from 'src/components/user/UserProfile.vue'
import UserRewards from 'src/components/user/UserRewards.vue'
import { useUserStore } from 'src/stores/user'
import { getLocalUser } from 'src/services/storage/local'

const router = useRouter()
const userStore = useUserStore()
const canRenderUserPage = ref(false)

defineProps({
  route: {
    type: String,
    default: () => 'daily-pnl',
  },
})

onBeforeMount(() => {
  const localUser = getLocalUser()
  const isAuthenticated = userStore.user.isAuthenticated || Boolean(localUser?.uid || localUser?.id)

  if (!isAuthenticated) {
    void router.replace('/crypto-watcher').then(() => {
      window.dispatchEvent(new CustomEvent('cryptool:open-auth'))
    })
    return
  }

  canRenderUserPage.value = true
})
</script>
<template>
  <template v-if="canRenderUserPage">
    <UserProfile v-if="route === 'profile'" />
    <div v-if="route === 'daily-pnl'" class="row bg-black q-pa-lg">
      <div class="col" style="height: 618px"><DailyPnl /></div>
      <div class="col"><DailyChart /></div>
    </div>
    <UserRewards v-if="route === 'achievements'" />
  </template>
</template>
