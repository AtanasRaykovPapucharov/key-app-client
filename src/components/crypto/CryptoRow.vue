<script setup>
import { computed } from 'vue'
import BtcIndicator from './coin-view/BtcIndicator.vue'
import EthIndicator from './coin-view/EthIndicator.vue'
import BnbIndicator from './coin-view/BnbIndicator.vue'
import SolIndicator from './coin-view/SolIndicator.vue'
import UsdcIndicator from './coin-view/UsdcIndicator.vue'

const props = defineProps({
  usdVal: { type: Number, default: null },
  availableUsdc: { type: Number, default: 0 },
  btcValue: { type: Number, default: 0 },
  ethValue: { type: Number, default: 0 },
  bnbValue: { type: Number, default: 0 },
  solValue: { type: Number, default: 0 },
  btcUsdcAmount: { type: Number, default: 0 },
  ethUsdcAmount: { type: Number, default: 0 },
  bnbUsdcAmount: { type: Number, default: 0 },
  solUsdcAmount: { type: Number, default: 0 },
  size: { type: String, default: '64px' },
  selected: { type: String, default: 'BTC' },
})

const $emit = defineEmits(['select'])

const sumUsdcAmount = computed(() => {
  return props.btcUsdcAmount + props.ethUsdcAmount + props.bnbUsdcAmount + props.solUsdcAmount
})
</script>

<template>
  <!-- <div class="text-h3 q-mb-md text-center bg-red">USDC {{ usdVal }}</div> -->
  <UsdcIndicator :usdc-value="(usdVal || sumUsdcAmount) + props.availableUsdc" />
  <div class="available-usdc">
    Available: <span class="text-green-5">{{ props.availableUsdc.toFixed(4) }}</span>
    <span class="q-mx-xs text-green-5 q-mr-lg">USDC</span>

    In-Crypto: <span class="text-red-5">{{ usdVal || sumUsdcAmount.toFixed(4) }}</span>
    <span class="q-mx-xs text-red-5">USDC</span>
  </div>
  <br />
  <div class="crypto-row" style="max-width: 600px; margin: 0 auto">
    <div
      :class="`crypto-indicator ${selected === 'BTC' ? 'selected' : ''}`"
      @click="$emit('select', 'BTC')"
    >
      <BtcIndicator :btc-value="btcValue" :size="size" />
      <div class="usdc-amount text-red-5">{{ btcUsdcAmount.toFixed(2) }} USDC</div>
      <br />
    </div>
    <div
      :class="`crypto-indicator ${selected === 'ETH' ? 'selected' : ''}`"
      @click="$emit('select', 'ETH')"
    >
      <EthIndicator :eth-value="ethValue" :size="size" />
      <div class="usdc-amount text-red-5">{{ ethUsdcAmount.toFixed(2) }} USDC</div>
      <br />
    </div>
    <div
      :class="`crypto-indicator ${selected === 'BNB' ? 'selected' : ''}`"
      @click="$emit('select', 'BNB')"
    >
      <BnbIndicator :bnb-value="bnbValue" :size="size" />
      <div class="usdc-amount text-red-5">{{ bnbUsdcAmount.toFixed(2) }} USDC</div>
      <br />
    </div>
    <div
      :class="`crypto-indicator ${selected === 'SOL' ? 'selected' : ''}`"
      @click="$emit('select', 'SOL')"
    >
      <SolIndicator :sol-value="solValue" :size="size" />
      <div class="usdc-amount text-red-5">{{ solUsdcAmount.toFixed(2) }} USDC</div>
      <br />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.crypto-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  align-items: stretch;
}

.crypto-indicator {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 0;
  width: 100%;
  min-height: 80px;
  box-sizing: border-box;
  flex-direction: column;
}

.usdc-amount {
  margin-top: 4px;
  color: #8bc6ff;
  font-size: 0.75rem;
  line-height: 1.1;
  white-space: nowrap;
}

.available-usdc {
  margin-top: 2px;
  color: #9e9e9e;
  font-size: 0.75rem;
  text-align: center;
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
