<script setup>
import { useQuasar } from 'quasar'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLocalized } from 'src/composables/useLocalized'

import { useUserStore } from 'src/stores/user'
import { signOut } from 'src/services/user'

import UserAuth from './UserAuth.vue'
import UserWallet from './UserWallet.vue'
import UserCrypto from './UserCrypto.vue'
import UserBank from './UserBank.vue'
import UserSettings from './UserSettings.vue'

const $q = useQuasar()
const { t } = useLocalized()
const $router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const drawerRight = ref(!$q.screen.lt.sm)
const miniStateRight = ref(true)
const asideTab = ref('wallet')
const drawerWidth = computed(() => ($q.screen.lt.sm ? $q.screen.width : 410))

const closeDrawer = () => {
  drawerRight.value = !$q.screen.lt.sm
  miniStateRight.value = true
}

defineExpose({ closeDrawer })

const openAuth = () => {
  drawerRight.value = true
  miniStateRight.value = false
}

const openAside = () => {
  drawerRight.value = true
  miniStateRight.value = false
}

const signOutHandler = async () => {
  const success = await signOut()

  if (success) {
    asideTab.value = 'wallet'
    miniStateRight.value = true
    await $router.push('/')
  }
}

onMounted(() => window.addEventListener('cryptool:open-auth', openAuth))
onMounted(() => window.addEventListener('cryptool:open-aside', openAside))
onBeforeUnmount(() => {
  window.removeEventListener('cryptool:open-auth', openAuth)
  window.removeEventListener('cryptool:open-aside', openAside)
})

watch(
  () => asideTab.value,
  (newVal) => {
    switch (newVal) {
      case 'main':
        $router.push('/')
        miniStateRight.value = true
        break
      case 'trading':
        $router.push('/trading')
        miniStateRight.value = true
        break

      default:
        miniStateRight.value = false
        break
    }
  },
)
</script>

<template>
  <q-drawer
    v-model="drawerRight"
    side="right"
    show-if-above
    bordered
    :mini="$q.screen.lt.sm ? false : !drawerRight || miniStateRight"
    mini-to-overlay
    :no-swipe-open="$q.screen.lt.sm"
    :width="drawerWidth"
    :breakpoint="599"
    class="bg-black"
  >
    <q-btn
      v-if="$q.screen.lt.sm"
      flat
      round
      dense
      icon="close"
      color="secondary"
      :aria-label="t('app.common.actions.closeAside')"
      class="mobile-aside-close"
      @click="drawerRight = false"
    />
    <q-scroll-area class="fit">
      <div v-if="user.isAuthenticated">
        <div v-if="!miniStateRight" class="mobile-aside-content q-pa-md q-mt-lg">
          <q-tabs
            v-model="asideTab"
            dense
            class="text-grey mobile-aside-tabs"
            active-color="primary"
            active-bg-color="primary"
            indicator-color="primary"
            align="justify"
            inline-label
            outside-arrows
            :mobile-arrows="false"
            style="max-width: 100%"
          >
            <q-tab name="user" :aria-label="t('app.layout.drawer.user')">
              <template #default>
                <q-icon name="person" size="lg" color="secondary" />
              </template>
            </q-tab>
            <q-tab name="wallet" :aria-label="t('app.layout.drawer.wallet')">
              <template #default>
                <q-icon name="wallet" size="lg" color="secondary" />
              </template>
            </q-tab>
            <q-tab name="crypto" :aria-label="t('app.layout.drawer.crypto')">
              <template #default>
                <q-icon name="currency_bitcoin" size="lg" color="secondary" />
              </template>
            </q-tab>
            <q-tab name="bank" :aria-label="t('app.layout.drawer.bank')">
              <template #default>
                <q-icon name="account_balance" size="lg" color="secondary" />
              </template>
            </q-tab>
            <q-tab name="settings" :aria-label="t('app.layout.drawer.settings')">
              <template #default>
                <q-icon name="settings" size="lg" color="secondary" />
              </template>
            </q-tab>
          </q-tabs>

          <q-tab-panels
            v-model="asideTab"
            animated
            transition-prev="slide-down"
            transition-next="slide-up"
            class="bg-grey-9 mobile-tab-panel"
            style="min-height: min(480px, 60vh)"
          >
            <q-tab-panel name="user">
              <div class="aside-panel-head q-mb-md">
                <div class="text-right">{{ user.username }}</div>
                <q-separator color="primary" />
                <q-btn
                  to="profile"
                  dense
                  flat
                  icon="badge"
                  align="left"
                  :label="t('app.layout.drawer.profile')"
                  size="xl"
                  color="secondary"
                  style="width: 100%"
                />
                <q-btn
                  to="daily"
                  dense
                  flat
                  icon="event"
                  align="left"
                  :label="t('app.layout.drawer.dailyPnl')"
                  size="xl"
                  color="secondary"
                  style="width: 100%"
                />
                <q-btn
                  to="achievements"
                  dense
                  flat
                  icon="fa fa-award"
                  align="left"
                  :label="t('app.layout.drawer.achievements')"
                  size="xl"
                  color="secondary"
                  style="width: 100%"
                />
              </div>
            </q-tab-panel>

            <q-tab-panel name="wallet">
              <div class="aside-panel-head q-mb-md">
                <div class="text-right">{{ t('app.layout.drawer.wallet') }}</div>
                <q-separator color="primary" />
              </div>
              <UserWallet />
            </q-tab-panel>

            <q-tab-panel name="crypto">
              <div class="aside-panel-head q-mb-md">
                <div class="text-right">{{ t('app.layout.drawer.crypto') }}</div>
                <q-separator color="primary" />
                <UserCrypto />
              </div>
            </q-tab-panel>

            <q-tab-panel name="bank">
              <div class="aside-panel-head q-mb-md">
                <div class="text-right">{{ t('app.layout.drawer.bank') }}</div>
                <q-separator color="primary" />
                <UserBank />
              </div>
            </q-tab-panel>

            <q-tab-panel name="settings">
              <div class="aside-panel-head q-mb-md">
                <div class="text-right">{{ t('app.layout.drawer.settings') }}</div>
                <q-separator color="primary" />
                <UserSettings />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
        <div v-else class="q-mt-lg">
          <!-- <q-btn to="/" dense flat icon="bar_chart" size="xl" color="secondary" /> -->
          <q-btn
            dense
            flat
            icon="person"
            size="xl"
            color="secondary"
            :aria-label="t('app.layout.drawer.user')"
            @click="
              (() => {
                miniStateRight = false
                asideTab = 'user'
              })()
            "
          />
          <q-btn
            dense
            flat
            icon="wallet"
            size="xl"
            color="secondary"
            :aria-label="t('app.layout.drawer.wallet')"
            @click="
              (() => {
                miniStateRight = false
                asideTab = 'wallet'
              })()
            "
          />
          <q-btn
            dense
            flat
            icon="currency_bitcoin"
            size="xl"
            color="secondary"
            :aria-label="t('app.layout.drawer.crypto')"
            @click="
              (() => {
                miniStateRight = false
                asideTab = 'crypto'
              })()
            "
          />
          <!-- <q-btn to="trading" dense flat icon="candlestick_chart" size="xl" color="secondary" /> -->

          <q-btn
            dense
            flat
            icon="account_balance"
            size="xl"
            color="secondary"
            :aria-label="t('app.layout.drawer.bank')"
            @click="
              (() => {
                miniStateRight = false
                asideTab = 'bank'
              })()
            "
          />
          <q-btn
            dense
            flat
            icon="settings"
            size="xl"
            color="secondary"
            :aria-label="t('app.layout.drawer.settings')"
            @click="
              (() => {
                miniStateRight = false
                asideTab = 'settings'
              })()
            "
          />
          <q-btn
            dense
            flat
            icon="logout"
            size="xl"
            color="secondary"
            :aria-label="t('app.layout.drawer.logOut')"
            @click="signOutHandler"
          />
        </div>
      </div>
      <div v-else>
        <div v-if="!miniStateRight" class="mobile-aside-content q-pa-lg q-mt-lg">
          <div class="q-pt-sm q-mt-xs">
            <UserAuth />
          </div>
        </div>
        <div v-else class="q-mt-lg">
          <q-btn
            dense
            flat
            icon="login"
            size="xl"
            color="secondary"
            :aria-label="t('app.layout.drawer.logIn')"
            @click="
              (() => {
                miniStateRight = false
              })()
            "
          />
        </div>
      </div>
    </q-scroll-area>

    <div v-if="!$q.screen.lt.sm" class="absolute" style="top: 3px; left: -16px">
      <q-btn
        class="mini-toggle-btn"
        dense
        round
        unelevated
        size="md"
        :aria-label="t('app.layout.drawer.toggle')"
        @click="miniStateRight = !miniStateRight"
      >
        <q-icon
          class="mini-toggle-icon bg-secondary text-black"
          size="xs"
          :name="`${miniStateRight ? 'chevron_left' : 'chevron_right'}`"
        />
      </q-btn>
    </div>
  </q-drawer>
</template>

<style scoped>
.aside-panel-head {
  width: 100%;
  font-size: clamp(1.4rem, 5vw, 2.125rem);
  line-height: 1.2;
}

.mobile-aside-close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
}

@media (max-width: 599px) {
  .mobile-aside-content {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    padding-top: 52px;
  }

  .mobile-aside-tabs,
  .mobile-tab-panel {
    width: 100%;
    max-width: 100%;
    margin-right: auto;
    margin-left: auto;
  }
}
</style>
