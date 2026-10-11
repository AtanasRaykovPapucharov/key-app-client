<script setup>
import { computed } from 'vue'
import moneroIcon from 'src/assets/monero.svg'

const props = defineProps({
  // XMR value, 0 or higher
  xmrValue: { type: Number, default: 0, validator: (value) => value >= 0 },
  size: {
    type: String,
    default: '64px',
  },
  // opacity of the "empty" portion of the logo (0 = fully transparent when unfilled)
  emptyOpacity: { type: Number, default: 0.5 },
})

const clampedValue = computed(() => Math.min(1, Math.max(0, props.xmrValue)))

const fillStyle = computed(() => ({
  clipPath: `inset(0 ${100 - clampedValue.value * 100}% 0 0)`,
}))
</script>

<template>
  <div class="xmr-indicator-container q-pa-sm">
    <div
      class="xmr-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`XMR ${(Math.min(1, Math.max(0, xmrValue)) * 100).toFixed(0)}%`"
      role="img"
    >
      <img class="xmr-layer xmr-layer--base" :src="moneroIcon" alt="" aria-hidden="true" />
      <img class="xmr-layer xmr-layer--fill" :style="fillStyle" :src="moneroIcon" alt="" />
    </div>
    <div
      :style="{
        position: 'relative',
        paddingTop: '8px',
      }"
    >
      <strong class="text-orange-8">XMR</strong>
      <span class="crypto-amount text-orange-4">{{ (xmrValue || 0).toFixed(6) }}</span>
    </div>
  </div>
</template>

<style scoped>
.xmr-indicator-container {
  max-width: 200px;
}
.xmr-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #ff6600;
  background-color: #fff;
  overflow: hidden;
}
.xmr-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.xmr-layer--base {
  opacity: v-bind(emptyOpacity);
}
.xmr-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
