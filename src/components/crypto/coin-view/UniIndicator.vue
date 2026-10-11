<script setup>
import { computed } from 'vue'
import uniIcon from 'src/assets/uni.svg'

const props = defineProps({
  // UNI value, 0 or higher
  uniValue: { type: Number, default: 0, validator: (value) => value >= 0 },
  size: {
    type: String,
    default: '64px',
  },
  // opacity of the "empty" portion of the logo (0 = fully transparent when unfilled)
  emptyOpacity: { type: Number, default: 0.5 },
})

const clampedValue = computed(() => Math.min(1, Math.max(0, props.uniValue)))

const fillStyle = computed(() => ({
  clipPath: `inset(0 ${100 - clampedValue.value * 100}% 0 0)`,
}))
</script>

<template>
  <div class="uni-indicator-container q-pa-sm">
    <div
      class="uni-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`UNI ${(Math.min(1, Math.max(0, uniValue)) * 100).toFixed(0)}%`"
      role="img"
    >
      <img class="uni-layer uni-layer--base" :src="uniIcon" alt="" aria-hidden="true" />
      <img class="uni-layer uni-layer--fill" :style="fillStyle" :src="uniIcon" alt="" />
    </div>
    <div
      :style="{
        position: 'relative',
        paddingTop: '8px',
      }"
    >
      <strong class="text-pink-6">UNI</strong>
      <span class="crypto-amount text-pink-3">{{ (uniValue || 0).toFixed(6) }}</span>
    </div>
  </div>
</template>

<style scoped>
.uni-indicator-container {
  max-width: 200px;
}
.uni-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #ff007a;
  background-color: #fff;
  overflow: hidden;
}
.uni-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.uni-layer--base {
  opacity: v-bind(emptyOpacity);
}
.uni-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
