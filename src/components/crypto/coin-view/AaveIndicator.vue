<script setup>
import { computed } from 'vue'
import aaveIcon from 'src/assets/aave.svg'

const props = defineProps({
  // AAVE value, 0 or higher
  aaveValue: { type: Number, default: 0, validator: (value) => value >= 0 },
  size: {
    type: String,
    default: '64px',
  },
  // opacity of the "empty" portion of the logo (0 = fully transparent when unfilled)
  emptyOpacity: { type: Number, default: 0.5 },
})

const clampedValue = computed(() => Math.min(1, Math.max(0, props.aaveValue)))

const fillStyle = computed(() => ({
  clipPath: `inset(0 ${100 - clampedValue.value * 100}% 0 0)`,
}))
</script>

<template>
  <div class="aave-indicator-container q-pa-sm">
    <div
      class="aave-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`AAVE ${(Math.min(1, Math.max(0, aaveValue)) * 100).toFixed(0)}%`"
      role="img"
    >
      <img class="aave-layer aave-layer--base" :src="aaveIcon" alt="" aria-hidden="true" />
      <img
        class="aave-layer aave-layer--fill"
        :style="fillStyle"
        :src="aaveIcon"
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
      <strong class="text-pink-6">AAVE</strong>
      <span class="crypto-amount text-pink-3">{{ (aaveValue || 0).toFixed(6) }}</span>
    </div>
  </div>
</template>

<style scoped>
.aave-indicator-container {
  max-width: 200px;
}
.aave-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #b6509e;
  background-color: #fff;
  overflow: hidden;
}
.aave-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.aave-layer--base {
  opacity: v-bind(emptyOpacity);
}
.aave-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
