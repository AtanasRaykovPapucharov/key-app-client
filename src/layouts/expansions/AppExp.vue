<script setup>
import { useI18n } from 'vue-i18n'
// import { useQuasar } from 'quasar'
import ICON from 'src/helpers/icons'

const { locale } = useI18n()
// const $q = useQuasar()
const emit = defineEmits(['drawer', 'hobby-open'])
</script>
//analytics
<template>
  <q-expansion-item
    :content-inset-level="0.9"
    :icon="ICON.MATH"
    class="text-grey-5 text-h6"
    header-class="text-grey-5"
    expand-icon-class="text-grey-5"
    :label="locale !== 'bg-BG' ? 'School Math' : 'Математика'"
    caption=""
  >
    <q-btn
      to="/math-examer"
      size="md"
      class="text-grey-5"
      text-color="grey-5"
      label="Examer"
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
    :label="locale !== 'bg-BG' ? 'Stocks' : 'Акции'"
    caption=""
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
      :label="locale !== 'bg-BG' ? 'Top 100' : 'Топ 100'"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
    <!-- <q-btn
      to="/stocks-trader"
      size="md"
      class="text-green-5"
      label="Trader"
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
    :label="locale !== 'bg-BG' ? 'Bonds' : 'Облигации'"
    caption=""
  >
  </q-expansion-item>

  <q-expansion-item
    :content-inset-level="0.9"
    :icon="ICON.CRYPTO"
    class="text-orange-5 text-h6 q-mb-xs"
    header-class="text-orange-5"
    expand-icon-class="text-orange-5"
    :label="locale !== 'bg-BG' ? 'Crypto' : 'Крипто'"
    caption=""
    default-opened
  >
    <q-btn
      to="/crypto-trader"
      size="md"
      class="text-orange-5"
      label="Trader"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
    <q-btn
      to="/crypto-watcher"
      size="md"
      class="text-orange-5"
      label="Watcher"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
    <q-btn
      to="/crypto-long-term"
      size="md"
      class="text-orange-5"
      label="Long Term Analyzer"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
    <q-btn
      to="/crypto-unlock-calendar"
      size="md"
      class="text-orange-5"
      :label="locale !== 'bg-BG' ? 'Unlock Calendar' : 'Календар Отключване'"
      style="width: 100%"
      no-caps
      @click="emit('drawer')"
    />
    <q-btn
      to="/crypto-top100"
      size="md"
      class="text-orange-5"
      :label="locale !== 'bg-BG' ? 'Top 100' : 'Топ 100'"
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
    :label="locale !== 'bg-BG' ? 'Real Estate' : 'Недвижими имоти'"
    caption=""
  >
  </q-expansion-item>

  <q-expansion-item
    :content-inset-level="0.9"
    :icon="ICON.TRADING"
    class="text-purple-5 text-h6"
    expand-icon-class="text-purple-5"
    :label="locale !== 'bg-BG' ? 'Trading' : 'Търговия'"
    caption=""
  >
  </q-expansion-item>
</template>
