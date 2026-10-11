<script setup>
import { computed } from 'vue'
import zecIcon from 'src/assets/zec.svg'

const props = defineProps({
  // ZEC value, 0 or higher
  zecValue: { type: Number, default: 0, validator: (value) => value >= 0 },
  size: {
    type: String,
    default: '64px',
  },
  // opacity of the "empty" portion of the logo (0 = fully transparent when unfilled)
  emptyOpacity: { type: Number, default: 0.5 },
})

const clampedValue = computed(() => Math.min(1, Math.max(0, props.zecValue)))

const fillStyle = computed(() => ({
  clipPath: `inset(0 ${100 - clampedValue.value * 100}% 0 0)`,
}))
</script>

<template>
  <div class="zec-indicator-container q-pa-sm">
    <div
      class="zec-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`ZEC ${(Math.min(1, Math.max(0, zecValue)) * 100).toFixed(0)}%`"
      role="img"
    >
      <img class="zec-layer zec-layer--base" :src="zecIcon" alt="" aria-hidden="true" />
      <img
        class="zec-layer zec-layer--fill"
        :style="fillStyle"
        :src="zecIcon"
        alt=""
        aria-hidden="true"
      />
    </div>
    <div
      :style="{
        position: 'relative',
        paddingTop: '8px',
      }"
    >
      <strong class="text-yellow-8">ZEC</strong>
      <span class="crypto-amount text-yellow-4">{{ (zecValue || 0).toFixed(6) }}</span>
    </div>
  </div>
</template>

<style scoped>
.zec-indicator-container {
  max-width: 200px;
}
.zec-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #ecb244;
  background-color: #fff;
  overflow: hidden;
}
.zec-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.zec-layer--base {
  opacity: v-bind(emptyOpacity);
}
.zec-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
