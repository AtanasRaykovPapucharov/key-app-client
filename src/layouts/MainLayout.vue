<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

import LayoutHeader from './LayoutHeader.vue'
import LayoutLeftDrawer from './LayoutLeftDrawer.vue'
import LayoutRightDrawer from './LayoutRightDrawer.vue'

import { getLocalUser } from 'src/services/storage/local'
import { getCrypto } from 'src/services/storage/crypto'
import { getBank } from 'src/services/storage/bank'

import { useUserStore } from 'src/stores/user'
import { usePortfolioStore } from 'src/stores/portfolio'
import { useCryptoStore } from 'src/stores/crypto'
import { useBankStore } from 'src/stores/bank'

const leftDrawer = ref(false)
const rightDrawerRef = ref(null)
const drawerTag = ref('finance')
const appHeaderClick = ref(0)
const faqHeaderClick = ref(0)
const route = useRoute()
const $q = useQuasar()

const btnClicked = (ev) => {
  // console.log('Button clicked event:', ev)

  if (ev.other) {
    leftDrawer.value = false
    return
  }

  if (ev.tag === 'app') {
    appHeaderClick.value += 1
  }

  if (ev.tag === 'faq') {
    faqHeaderClick.value += 1
  }

  if (drawerTag.value != ev.tag) {
    drawerTag.value = ev.tag
    leftDrawer.value = true
  } else {
    leftDrawer.value = true
  }
}

const hideDrawers = () => {
  leftDrawer.value = false
  rightDrawerRef.value?.closeDrawer()
}

const init = async () => {
  const usr = getLocalUser()
  if (usr && (usr.id || usr.uid)) {
    useUserStore().setUser(usr)
    await usePortfolioStore().initializePortfolio()
  }

  const cryptoData = await getCrypto()
  useCryptoStore().setCrypto(cryptoData)

  const bankData = await getBank()
  const bankStore = useBankStore()
  bankStore.setBank(bankData)
  await bankStore.loadTransactions()
}

onMounted(async () => {
  await init()
})
</script>

<template>
  <q-layout view="hHh lpR fFf" :class="{ 'mobile-layout': $q.screen.lt.sm }">
    <layout-header @btn-clicked="btnClicked" />
    <layout-left-drawer
      :tag="drawerTag"
      :drawer-left="leftDrawer"
      :app-header-click="appHeaderClick"
      :faq-header-click="faqHeaderClick"
      @close="leftDrawer = false"
    />
    <layout-right-drawer v-if="route.path !== '/'" ref="rightDrawerRef" />
    <q-page-container
      class="bg-dark main-page-container"
      style="padding-top: 70px"
      @click="hideDrawers"
    >
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
@media (max-width: 599px) {
  .main-page-container {
    min-width: 0;
    padding-bottom: 24px;
    overflow-x: clip;
  }
}
</style>
