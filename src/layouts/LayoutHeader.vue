<script setup>
import { useQuasar } from 'quasar'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useBinanceStore } from 'src/stores/binance'
import AppDialog from 'src/components/AppDialog.vue'
// import SniperLogo from 'src/components/SniperLogo.vue'
// import { useUserStore } from 'src/stores/user'
// import { storeToRefs } from 'pinia'

const emit = defineEmits(['btnClicked'])
const { locale, t } = useI18n({ useScope: 'global' })
const $q = useQuasar()
const $router = useRouter()
const $route = useRoute()
const $store = useBinanceStore()
// const userStore = useUserStore()
const infoDialog = ref(false)
const isCryptoLiveRoute = computed(() =>
  ['/', '/crypto-trader', '/crypto-watcher'].includes($route.path),
)

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
  <q-header
    elevated
    :style="{
      height: '70px',
      backgroundColor: '#0e0e0e',
      borderBottom: '1px solid grey',
      position: 'fixed',
      width: '100%',
      top: 0,
      left: 0,
      zIndex: 3000,
    }"
  >
    <q-toolbar class="row">
      <div class="col-12 col-md q-pl-sm" :style="{ marginLeft: '0px' }">
        <img
          alt="KEYAPP logo"
          src="~assets/key-app-logo.svg"
          :style="{
            width: !$q.screen.lt.sm ? '300px' : '180px',
            height: !$q.screen.lt.sm ? '71px' : '60px',
            cursor: 'pointer',
            zIndex: 900,
            position: 'absolute',
            left: !$q.screen.lt.sm ? '-28px' : '0px',
            top: '66%',
            transform: 'translateY(-50%)',
          }"
          @click="gotoIndex"
        />
        <q-space v-if="!$q.screen.lt.sm" />
        <div
          v-if="!$q.screen.lt.sm"
          class="text-subtitle1 text-grey-5"
          style="
            position: absolute;
            left: 160px;
            top: 2px;
            font-size: 14px;
            overflow: hidden;
            z-index: 1000;
          "
        >
          <q-btn
            dense
            flat
            rounded
            size="xs"
            icon="info"
            color="secondary"
            style="margin: 14px 0 0 5px"
            @click="infoDialog = true"
          />
          <!-- <span v-if="!$q.screen.lt.md">This is for self learning!</span> -->
          <!-- <br v-if="!$q.screen.lt.md" /> -->
          <span
            v-if="!$q.screen.lt.md"
            class="text-red-5"
            style="position: relative; top: 7px; left: 1px; font-size: 12px"
          >
            {{ t('common.header.educationOnly') }}
          </span>
        </div>
        <q-btn-group unelevated style="position: absolute; right: 70px; top: 25px">
          <q-btn
            label="BG"
            :flat="locale !== 'bg-BG'"
            :unelevated="locale === 'bg-BG'"
            color="primary"
            style="
              min-height: 18px;
              height: 18px;
              line-height: 18px;
              min-width: 22px;
              padding: 0 3px;
              font-size: 12px;
              z-index: 1300;
            "
            @click="locale = 'bg-BG'"
          />
          <q-btn
            label="EN"
            :flat="locale !== 'en-US'"
            :unelevated="locale === 'en-US'"
            color="primary"
            style="
              min-height: 18px;
              height: 18px;
              line-height: 18px;
              min-width: 22px;
              padding: 0 3px;
              font-size: 12px;
            "
            @click="locale = 'en-US'"
          />
        </q-btn-group>

        <q-btn
          v-if="$q.screen.lt.sm && $route.path !== '/'"
          flat
          round
          dense
          icon="menu_open"
          color="secondary"
          aria-label="Open aside"
          style="font-size: 17px; position: absolute; right: 10px; top: 13px; z-index: 1300"
          @click="openAside"
        />

        <q-chip
          v-if="!$q.screen.lt.sm"
          v-show="isCryptoLiveRoute"
          :color="$store.connected ? 'green-6' : 'orange-6'"
          text-color="white"
          :icon="$store.connected ? 'wifi' : 'wifi_off'"
          :label="$store.connected ? t('common.header.live') : t('common.header.connecting')"
          dense
          style="
            position: absolute;
            right: 128px;
            top: 20px;
            z-index: 1300;
            min-height: 18px;
            height: 18px;
            padding: 10px;
            font-size: 12px;
            font-weight: 700;
            line-height: 18px;
          "
        />
      </div>
      <div
        class="col-12 col-md-6"
        :style="{
          position: 'absolute',
          top: !$q.screen.lt.sm ? '17px' : '8px',
          left: '50%',
          width: 'auto',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          zIndex: '1100',
        }"
      >
        <!-- <q-btn
          to="/"
          flat
          size="xl"
          class="text-purple-4"
          style="margin-top: -12px"
          @click="emit('btnClicked', { tag: 'math' })"
        >
          <template #default>
            <img
              src="~assets/function-mathematical-symbol.svg"
              alt="Math"
              style="width: 40px; height: 34px"
            />
          </template>
        </q-btn> -->

        <!--
        <q-btn
          icon="fa fa-money-bill-wave"
          size="xl"
          class="text-green-6"
          style="margin-top: -12px"
          @click="emit('btnClicked', { tag: 'finance' })"
        /> -->
        <!-- <q-btn
          :size="$q.screen.lt.sm ? 'lg' : 'xl'"
          class="text-purple-5"
          :style="{ marginTop: $q.screen.lt.sm ? '0px' : '-12px' }"
          @click="emit('btnClicked', { tag: 'finance' })"
        >
          <template #default>
            <img
              src="~assets/phys.png"
              alt="Math"
              :style="{
                width: $q.screen.lt.sm ? '30px' : '40px',
                height: $q.screen.lt.sm ? '30px' : '40px',
              }"
            />
          </template>
        </q-btn> -->

        <!-- <q-btn
          icon="fa-brands fa-battle-net"
          :size="$q.screen.lt.sm ? 'lg' : 'xl'"
          class="text-red-5"
          :style="{ marginTop: $q.screen.lt.sm ? '0px' : '-12px' }"
          @click="emit('btnClicked', { tag: 'app' })"
        /> -->
        <q-btn
          icon="school"
          :size="$q.screen.lt.sm ? 'md' : 'xl'"
          class="text-green-5"
          :dense="$q.screen.lt.sm"
          :style="{
            marginTop: $q.screen.lt.sm ? '10px' : '-12px',
            marginLeft: $q.screen.lt.sm ? '30px' : '0px',
          }"
          @click="emit('btnClicked', { tag: 'finance' })"
        >
          <!-- <q-tooltip delay="300" class="bg-green-5 text-bold text-grey-1">LEARN</q-tooltip> -->
        </q-btn>

        <q-btn
          icon="apps"
          :size="$q.screen.lt.sm ? 'md' : 'xl'"
          class="text-red-5"
          :dense="$q.screen.lt.sm"
          :style="{
            marginTop: $q.screen.lt.sm ? '10px' : '-12px',
          }"
          @click="emit('btnClicked', { tag: 'app' })"
        >
          <!-- <q-tooltip delay="300" class="bg-red-5 text-bold text-grey-2">APPs</q-tooltip> -->
        </q-btn>

        <q-btn
          icon="contact_support"
          :size="$q.screen.lt.sm ? 'md' : 'xl'"
          class="text-purple-4"
          :dense="$q.screen.lt.sm"
          :style="{
            marginTop: $q.screen.lt.sm ? '10px' : '-12px',
          }"
          @click="emit('btnClicked', { tag: 'faq' })"
        >
          <!-- <q-tooltip delay="300" class="bg-purple-4 text-bold text-grey-3">FAQ</q-tooltip> -->
        </q-btn>

        <!-- <q-btn
          size="xl"
          class="text-purple-5"
          style="margin-top: -12px"
          @click="emit('btnClicked', { tag: 'physics' })"
        >
          <template #default>
            <img src="~assets/phys.png" alt="Math" style="width: 40px; height: 40px" />
          </template>
        </q-btn> -->

        <!-- <q-btn
          to="/"
          icon="fa fa-solid fa-guitar"
          size="xl"
          class="text-green-6"
          style="margin-top: -12px"
          @click="emit('btnClicked', { tag: 'guitar' })"
        />

        <q-btn
          to="/"
          icon="nightlife"
          size="xl"
          class="text-green-6"
          style="margin-top: -12px"
          @click="emit('btnClicked', { tag: 'tango' })"
        /> -->
      </div>
    </q-toolbar>
  </q-header>

  <AppDialog v-model="infoDialog" width="400px" :title="t('common.header.about')">
    <div class="text-subtitle1 text-grey-5" style="font-size: 14px; overflow: hidden">
      {{ t('common.header.selfLearning') }}<br />
      <!-- Basically, there are: <br />
          <div class="q-mt-md">
            <q-icon name="book" color="blue-5" size="md" class="q-mr-sm" />
            <strong>Crypto Education</strong> - <em class="q-ml-xs"> Text and video materials</em>
            <br />
          </div>
          <div class="q-mt-md">
            <q-icon name="bar_chart" color="red-5" size="md" class="q-mr-sm" />
            <strong>Crypto Watcher</strong> -
            <em class="q-ml-xs"> Watching crypto currency price </em>
            <br />
          </div>
          <div class="q-mt-md">
            <q-icon name="candlestick_chart" color="green-5" size="md" class="q-mr-sm" />
            <strong>Crypto Trading Simulator</strong> - <em>Virtual trading game</em>
            <br />
          </div> -->
      <div class="q-pt-md text-center">
        <span class="text-red-5" style="font-size: 16px">
          {{ t('common.header.notForRealTrading') }}
        </span>
      </div>
    </div>
  </AppDialog>
</template>
