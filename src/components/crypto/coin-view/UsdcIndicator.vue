<script setup>
import usdcIcon from 'src/assets/icons/usd-coin.png'
// import { computed } from 'vue'

// const props =

defineProps({
  // USDC value, 0 or higher
  usdcValue: {
    type: Number,
    default: 10000,
    validator: (v) => v >= 0,
  },
  size: {
    type: String,
    default: '32px',
  },
  // opacity of the "empty" portion of the logo (0 = fully transparent when unfilled)
  emptyOpacity: {
    type: Number,
    default: 0.5,
  },
})

// const clampedValue = computed(() => Math.min(1, Math.max(0, props.usdcValue)))

// Reveal the fully-colored layer from the left, hide the rest (right side) via inset clip-path
// const fillStyle = computed(() => {
//   const revealPercent = clampedValue.value * 100
//   const hiddenPercent = 100 - revealPercent
//   return {
//     clipPath: `inset(0 ${hiddenPercent}% 0 0)`,
//   }
// })
</script>

<template>
  <div class="row items-center justify-center q-gutter-sm">
    <q-img :src="usdcIcon" :style="{ width: '32px', height: '32px' }" />
    <span :style="{ fontSize: size }">
      <strong class="text-blue-5">USDC</strong> {{ usdcValue.toFixed(4) }}
    </span>
  </div>
</template>

<style scoped>
.usdc-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #627eea;
  background-color: #fff;
  overflow: hidden;
}

.usdc-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.usdc-layer--base {
  opacity: v-bind(emptyOpacity);
}

.usdc-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
