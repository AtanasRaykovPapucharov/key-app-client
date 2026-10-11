<script setup>
import BtcIndicator from './coin-view/BtcIndicator.vue'
import EthIndicator from './coin-view/EthIndicator.vue'
import BnbIndicator from './coin-view/BnbIndicator.vue'
import SolIndicator from './coin-view/SolIndicator.vue'
import AdaIndicator from './coin-view/AdaIndicator.vue'
import LinkIndicator from './coin-view/LinkIndicator.vue'
import AaveIndicator from './coin-view/AaveIndicator.vue'
import SuiIndicator from './coin-view/SuiIndicator.vue'
import UniIndicator from './coin-view/UniIndicator.vue'
// import XmrIndicator from './coin-view/XmrIndicator.vue'
import ZecIndicator from './coin-view/ZecIndicator.vue'

import { ref } from 'vue'

defineProps({
  btcValue: { type: Number, default: 0 },
  ethValue: { type: Number, default: 0 },
  bnbValue: { type: Number, default: 0 },
  solValue: { type: Number, default: 0 },
  linkValue: { type: Number, default: 0 },
  adaValue: { type: Number, default: 0 },
  aaveValue: { type: Number, default: 0 },
  suiValue: { type: Number, default: 0 },
  uniValue: { type: Number, default: 0 },
  xmrValue: { type: Number, default: 0 },
  zecValue: { type: Number, default: 0 },
  size: { type: String, default: '48px' },
  selected: { type: String, default: 'BTC' },
})

const $emit = defineEmits(['select'])
const indicatorsRef = ref(null)

function scrollIndicators(direction) {
  indicatorsRef.value?.scrollBy({ left: direction * 220, behavior: 'smooth' })
}
</script>

<template>
  <div class="crypto-row">
    <q-btn
      v-if="!$q.screen.lt.sm"
      class="crypto-row__arrow"
      flat
      round
      dense
      icon="chevron_left"
      aria-label="Show previous indicators"
      @click="scrollIndicators(-1)"
    />
    <div ref="indicatorsRef" class="crypto-row__viewport">
      <div class="crypto-row__indicators">
        <div
          :class="`crypto-indicator ${selected === 'BTC' ? 'selected' : ''}`"
          @click="$emit('select', 'BTC')"
        >
          <BtcIndicator :btc-value="btcValue" :size="size" />
        </div>
        <div
          :class="`crypto-indicator ${selected === 'ETH' ? 'selected' : ''}`"
          @click="$emit('select', 'ETH')"
        >
          <EthIndicator :eth-value="ethValue" :size="size" />
        </div>
        <div
          :class="`crypto-indicator ${selected === 'SOL' ? 'selected' : ''}`"
          @click="$emit('select', 'SOL')"
        >
          <SolIndicator :sol-value="solValue" :size="size" />
        </div>
        <div
          :class="`crypto-indicator ${selected === 'ADA' ? 'selected' : ''}`"
          @click="$emit('select', 'ADA')"
        >
          <AdaIndicator :ada-value="adaValue" :size="size" />
        </div>
        <div
          :class="`crypto-indicator ${selected === 'LINK' ? 'selected' : ''}`"
          @click="$emit('select', 'LINK')"
        >
          <LinkIndicator :link-value="linkValue" :size="size" />
        </div>

        <div
          :class="`crypto-indicator ${selected === 'BNB' ? 'selected' : ''}`"
          @click="$emit('select', 'BNB')"
        >
          <BnbIndicator :bnb-value="bnbValue" :size="size" />
        </div>
        <div
          :class="`crypto-indicator ${selected === 'AAVE' ? 'selected' : ''}`"
          @click="$emit('select', 'AAVE')"
        >
          <AaveIndicator :aave-value="aaveValue" :size="size" />
        </div>
        <div
          :class="`crypto-indicator ${selected === 'SUI' ? 'selected' : ''}`"
          @click="$emit('select', 'SUI')"
        >
          <SuiIndicator :sui-value="suiValue" :size="size" />
        </div>
        <div
          :class="`crypto-indicator ${selected === 'UNI' ? 'selected' : ''}`"
          @click="$emit('select', 'UNI')"
        >
          <UniIndicator :uni-value="uniValue" :size="size" />
        </div>
        <!-- <div
          :class="`crypto-indicator ${selected === 'XMR' ? 'selected' : ''}`"
          @click="$emit('select', 'XMR')"
        >
          <XmrIndicator :xmr-value="xmrValue" :size="size" />
        </div> -->
        <div
          :class="`crypto-indicator ${selected === 'ZEC' ? 'selected' : ''}`"
          @click="$emit('select', 'ZEC')"
        >
          <ZecIndicator :zec-value="zecValue" :size="size" />
        </div>
      </div>
    </div>
    <q-btn
      v-if="!$q.screen.lt.sm"
      class="crypto-row__arrow"
      flat
      round
      dense
      icon="chevron_right"
      aria-label="Show next indicators"
      @click="scrollIndicators(1)"
    />
  </div>
</template>

<style lang="scss" scoped>
.crypto-row {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  margin: 0 auto;
}

.crypto-row__viewport {
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-behavior: smooth;
}

.crypto-row__viewport::-webkit-scrollbar {
  display: none;
}

.crypto-row__indicators {
  display: flex;
  gap: 4px;
  align-items: stretch;
  min-width: max-content;
}

.crypto-row__arrow {
  flex: 0 0 32px;
}

.crypto-indicator {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  width: clamp(76px, 17vw, 112px);
  flex: 0 0 clamp(76px, 17vw, 112px);
  min-height: 64px;
  box-sizing: border-box;
  flex-direction: column;
}

.crypto-indicator :deep([class*='-indicator-container']) {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 4px;
}

.crypto-indicator :deep([class$='-indicator']) {
  left: 0;
  margin: 0 auto;
}

.crypto-indicator :deep([class*='-indicator-container'] > div:not([class])) {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: center;
}

.crypto-indicator :deep([class*='-indicator-container'] > div:not([class]) strong) {
  order: 2;
}

.crypto-indicator :deep([class*='-indicator-container'] > div:not([class]) .crypto-amount) {
  order: 1;
}

.crypto-indicator::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: transparent;
}

.selected::after {
  background: rgb(198, 193, 193);
}
</style>
