<script setup>
import { useLocalized } from 'src/composables/useLocalized'
// import { useQuasar } from 'quasar'
import ICON from 'src/helpers/icons'

const { t } = useLocalized()
// const $q = useQuasar()
const emit = defineEmits(['drawer', 'hobby-open'])
</script>
<template>
  <q-expansion-item
    :content-inset-level="0.9"
    :icon="ICON.MATH"
    class="text-grey-5 text-h6"
    header-class="text-grey-5"
    expand-icon-class="text-grey-5"
    :label="t('app.layout.nav.schoolMath')"
    default-opened
  >
    <q-btn
      to="/math-examer"
      size="md"
      class="text-grey-5"
      text-color="grey-5"
      :label="t('app.layout.nav.examer')"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
  </q-expansion-item>

  <q-expansion-item
    :content-inset-level="0.9"
    :icon="ICON.STOCKS"
    class="text-green-5 text-h6 q-mb-xs"
    header-class="text-green-5"
    expand-icon-class="text-green-5"
    :label="t('app.layout.nav.stocks')"
    default-opened
  >
    <q-btn
      to="/stocks-analyzer"
      size="md"
      class="text-green-5"
      label="MetriX"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />

    <q-btn
      to="/stocks-top100"
      size="md"
      class="text-green-5"
      :label="t('app.layout.nav.top100')"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
    <!-- <q-btn
      to="/stocks-trader"
      size="md"
      class="text-green-5"
      :label="t('app.layout.nav.trader')"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    /> -->
  </q-expansion-item>

  <q-expansion-item
    :content-inset-level="0.9"
    :icon="ICON.BONDS"
    class="text-red-5 text-h6 q-mb-xs"
    header-class="text-red-5"
    expand-icon-class="text-red-5"
    :label="t('app.layout.nav.bonds')"
    default-opened
  >
  </q-expansion-item>

  <q-expansion-item
    :content-inset-level="0.9"
    :icon="ICON.CRYPTO"
    class="text-orange-5 text-h6 q-mb-xs"
    header-class="text-orange-5"
    expand-icon-class="text-orange-5"
    :label="t('app.layout.nav.crypto')"
    default-opened
  >
    <q-btn
      to="/crypto-trader"
      size="md"
      class="text-orange-5"
      :label="t('app.layout.nav.trader')"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
    <q-btn
      to="/crypto-watcher"
      size="md"
      class="text-orange-5"
      :label="t('app.layout.nav.watcher')"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
    <q-btn
      to="/crypto-long-term"
      size="md"
      class="text-orange-5"
      :label="t('app.layout.nav.longTerm')"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
    <q-btn
      to="/crypto-unlock-calendar"
      size="md"
      class="text-orange-5"
      :label="t('app.layout.nav.unlockCalendar')"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
    <q-btn
      to="/crypto-top100"
      size="md"
      class="text-orange-5"
      :label="t('app.layout.nav.top100')"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
  </q-expansion-item>

  <q-expansion-item
    :content-inset-level="0.9"
    :icon="ICON.REAL_ESTATE"
    class="text-blue-5 text-h6 q-mb-xs"
    header-class="text-blue-5"
    expand-icon-class="text-blue-5"
    :label="t('app.layout.nav.realEstate')"
    default-opened
  >
  </q-expansion-item>

  <q-expansion-item
    :content-inset-level="0.9"
    :icon="ICON.TRADING"
    class="text-purple-5 text-h6"
    expand-icon-class="text-purple-5"
    :label="t('app.layout.nav.trading')"
    default-opened
  >
    <q-btn
      to="/trading-size-calculator"
      size="md"
      class="text-purple-5"
      :label="t('app.layout.nav.sizeCalculator')"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
  </q-expansion-item>
</template>
