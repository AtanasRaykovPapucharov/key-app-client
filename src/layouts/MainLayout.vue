<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
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
import { SESSION_EXPIRED_EVENT } from 'src/boot/axios'
import { expireSession } from 'src/services/user'
import { useLocalized } from 'src/composables/useLocalized'
import { getToken } from 'src/services/auth/token'
import { fetchMe, saveLocale } from 'src/services/auth/account'
import EmailStatusBanner from 'src/components/user/EmailStatusBanner.vue'
import { loadServerConfig } from 'src/composables/useServerConfig'

const leftDrawer = ref(false)
const rightDrawerRef = ref(null)
const drawerTag = ref('finance')
const appHeaderClick = ref(0)
const faqHeaderClick = ref(0)
const route = useRoute()
const $q = useQuasar()
const { t, locale } = useLocalized()

// A 401 from any API call means the stored session is no longer valid
let expiring = false
const onSessionExpired = () => {
  if (expiring || !useUserStore().user?.isAuthenticated) return
  expiring = true
  expireSession()
  $q.notify({ type: 'warning', message: t('app.layout.auth.sessionExpired'), position: 'top' })
  window.dispatchEvent(new Event('cryptool:open-aside'))
  setTimeout(() => (expiring = false), 3000)
}
window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
onUnmounted(() => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired))

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

/** Refresh the stored profile (email status, admin flag…) from the server. */
async function refreshProfile() {
  if (!getToken()) return
  const data = await fetchMe()
  const userStore = useUserStore()
  if (data?.user) userStore.setUser({ ...userStore.user, ...data.user, isAuthenticated: true })
}

const init = async () => {
  const usr = getLocalUser()
  const loggedIn = Boolean(usr && (usr.id || usr.uid))
  if (loggedIn) useUserStore().setUser(usr)

  // Independent requests run in parallel; one failing doesn't block the others
  const bankStore = useBankStore()
  const results = await Promise.allSettled([
    loadServerConfig(),
    loggedIn ? usePortfolioStore().initializePortfolio() : null,
    loggedIn ? refreshProfile() : null,
    getCrypto().then((data) => useCryptoStore().setCrypto(data)),
    getBank().then((data) => {
      bankStore.setBank(data)
      return loggedIn ? bankStore.loadTransactions() : null
    }),
  ])
  for (const r of results) {
    if (r.status === 'rejected') console.warn('[init]', r.reason?.kind || r.reason?.message)
  }
}

onMounted(init)

// Emails (verification, reset) follow the app language
watch(locale, (code) => {
  if (useUserStore().user?.isAuthenticated) saveLocale(code).catch(() => {})
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
    <q-page-container class="bg-dark main-page-container" @click="hideDrawers">
      <EmailStatusBanner />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.main-page-container {
  min-width: 0;
  overflow-x: clip;
}

@media (max-width: 599px) {
  .main-page-container {
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
