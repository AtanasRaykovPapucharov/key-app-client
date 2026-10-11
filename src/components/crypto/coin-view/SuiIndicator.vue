<script setup>
import { computed } from 'vue'
import suiIcon from 'src/assets/sui.svg'

const props = defineProps({
  // SUI value, 0 or higher
  suiValue: { type: Number, default: 0, validator: (value) => value >= 0 },
  size: {
    type: String,
    default: '64px',
  },
  // opacity of the "empty" portion of the logo (0 = fully transparent when unfilled)
  emptyOpacity: { type: Number, default: 0.5 },
})

const clampedValue = computed(() => Math.min(1, Math.max(0, props.suiValue)))

const fillStyle = computed(() => ({
  clipPath: `inset(0 ${100 - clampedValue.value * 100}% 0 0)`,
}))
</script>

<template>
  <div class="sui-indicator-container q-pa-sm">
    <div
      class="sui-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`SUI ${(Math.min(1, Math.max(0, suiValue)) * 100).toFixed(0)}%`"
      role="img"
    >
      <img class="sui-layer sui-layer--base" :src="suiIcon" alt="" aria-hidden="true" />
      <img
        class="sui-layer sui-layer--fill"
        :style="fillStyle"
        :src="suiIcon"
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
      <strong class="text-light-blue-5">SUI</strong>
      <span class="crypto-amount text-light-blue-3">{{ (suiValue || 0).toFixed(6) }}</span>
    </div>
  </div>
</template>

<style scoped>
.sui-indicator-container {
  max-width: 200px;
}
.sui-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #6fbcf0;
  background-color: #fff;
  overflow: hidden;
}
.sui-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.sui-layer--base {
  opacity: v-bind(emptyOpacity);
}
.sui-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
