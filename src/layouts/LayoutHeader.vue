<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useBinanceStore } from 'src/stores/binance'
import { useLocalized } from 'src/composables/useLocalized'
import AppDialog from 'src/components/AppDialog.vue'
import LanguageSelect from 'src/components/select/LanguageSelect.vue'

const emit = defineEmits(['btnClicked'])
const { t } = useLocalized()
const $q = useQuasar()
const $router = useRouter()
const $route = useRoute()
const $store = useBinanceStore()
const infoDialog = ref(false)

const isMobile = computed(() => $q.screen.lt.sm)
const isCryptoLiveRoute = computed(() =>
  ['/', '/crypto-trader', '/crypto-watcher'].includes($route.path),
)

const navItems = computed(() => [
  { tag: 'finance', icon: 'school', color: 'text-green-5', label: t('app.layout.header.learn') },
  { tag: 'app', icon: 'apps', color: 'text-red-5', label: t('app.layout.header.apps') },
  {
    tag: 'faq',
    icon: 'contact_support',
    color: 'text-purple-4',
    label: t('app.layout.header.faq'),
  },
])

function openAside() {
  window.dispatchEvent(new Event('cryptool:open-aside'))
}

const gotoIndex = () => {
  emit('btnClicked', { other: true })
  $router.push('/')
}

onMounted(() => $store.connect())
onUnmounted(() => $store.disconnect())
</script>

<template>
  <q-header elevated class="app-header">
    <q-toolbar class="app-header__bar">
      <!-- Brand -->
      <div class="app-header__brand">
        <button type="button" class="app-header__logo-btn" @click="gotoIndex">
          <img
            :alt="t('app.layout.header.logoAlt')"
            src="~assets/key-app-logo.svg"
            class="app-header__logo"
          />
        </button>
        <div v-if="!isMobile" class="app-header__notice">
          <q-btn
            dense
            flat
            round
            size="sm"
            icon="info"
            color="secondary"
            :aria-label="t('app.layout.header.about')"
            @click="infoDialog = true"
          />
          <span v-if="$q.screen.gt.sm" class="text-red-5">{{
            t('common.header.educationOnly')
          }}</span>
        </div>
      </div>

      <!-- Primary navigation -->
      <nav class="app-header__nav" :aria-label="t('app.layout.drawer.menu')">
        <q-btn
          v-for="item in navItems"
          :key="item.tag"
          flat
          :round="isMobile || $q.screen.lt.lg"
          :dense="isMobile"
          :icon="item.icon"
          :size="isMobile ? 'md' : 'lg'"
          :class="item.color"
          :aria-label="item.label"
          @click="emit('btnClicked', { tag: item.tag })"
        >
          <span v-if="$q.screen.gt.md" class="q-ml-sm text-body2 text-weight-medium">{{
            item.label
          }}</span>
          <q-tooltip v-if="$q.screen.lt.lg" :delay="400">{{ item.label }}</q-tooltip>
        </q-btn>
      </nav>

      <!-- Utilities -->
      <div class="app-header__tools">
        <q-chip
          v-if="!isMobile && isCryptoLiveRoute"
          :color="$store.connected ? 'green-6' : 'orange-6'"
          text-color="white"
          :icon="$store.connected ? 'wifi' : 'wifi_off'"
          :label="$store.connected ? t('common.header.live') : t('common.header.connecting')"
          dense
          class="app-header__live"
          style="padding: 13px"
        />
        <q-btn
          v-if="isMobile"
          dense
          flat
          round
          size="sm"
          icon="info"
          color="secondary"
          :aria-label="t('app.layout.header.about')"
          @click="infoDialog = true"
        />
        <LanguageSelect />
        <q-btn
          v-if="isMobile && $route.path !== '/'"
          flat
          round
          dense
          icon="menu_open"
          color="secondary"
          :aria-label="t('app.common.actions.openAside')"
          @click="openAside"
        />
      </div>
    </q-toolbar>
  </q-header>

  <AppDialog v-model="infoDialog" width="400px" :title="t('common.header.about')">
    <div class="text-grey-5 text-body2">
      {{ t('common.header.selfLearning') }}
      <div class="q-pt-md text-center text-red-5 text-subtitle1">
        {{ t('common.header.notForRealTrading') }}
      </div>
    </div>
  </AppDialog>
</template>

<style scoped>
.app-header {
  background-color: #0e0e0e;
  border-bottom: 1px solid grey;
}

.app-header__bar {
  min-height: 64px;
  gap: 8px;
  padding: 0 8px 0 0;
}

.app-header__brand {
  display: flex;
  align-items: center;
  flex: 1 1 0;
  min-width: 0;
  gap: 4px;
}

.app-header__logo-btn {
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  line-height: 0;
}

.app-header__logo-btn:focus-visible {
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}

.app-header__logo {
  display: block;
  height: 64px;
  width: auto;
  aspect-ratio: 360 / 170;
}

.app-header__notice {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.app-header__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 0 0 auto;
}

.app-header__tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1 1 0;
  min-width: 0;
  gap: 8px;
}

.app-header__live {
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 599px) {
  .app-header__bar {
    min-height: 56px;
    gap: 2px;
    padding-right: 4px;
  }

  .app-header__logo {
    height: 52px;
  }

  .app-header__nav {
    gap: 0;
  }

  .app-header__tools {
    gap: 2px;
  }
}

@media (max-width: 359px) {
  .app-header__logo {
    height: 44px;
  }
}
</style>
