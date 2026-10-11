<script setup>
import { computed } from 'vue'

const props = defineProps({
  // BTC value, 0 or higher
  btcValue: {
    type: Number,
    default: 0,
    validator: (v) => v >= 0,
  },
  size: {
    type: String,
    default: '64px',
  },
  // opacity of the "empty" portion of the logo (0 = fully transparent when unfilled)
  emptyOpacity: {
    type: Number,
    default: 0.5,
  },
})

const clampedValue = computed(() => Math.min(1, Math.max(0, props.btcValue)))

// Reveal the fully-colored layer from the left, hide the rest (right side) via inset clip-path
const fillStyle = computed(() => {
  const revealPercent = clampedValue.value * 100
  const hiddenPercent = 100 - revealPercent
  return {
    clipPath: `inset(0 ${hiddenPercent}% 0 0)`,
  }
})
</script>

<template>
  <div class="btc-indicator-container q-pa-sm">
    <div
      class="btc-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`BTC ${(btcValue * 100).toFixed(0)}%`"
      role="img"
    >
      <!-- Base layer: dim/ghost version of the full logo (always visible) -->
      <svg class="btc-layer btc-layer--base" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g>
          <circle cx="32" cy="32" r="30" fill="#F7931A" />
          <path
            d="M43.5 27.6c.6-3.9-2.4-6-6.4-7.4l1.3-5.2-3.2-.8-1.3 5c-.85-.2-1.7-.4-2.6-.6l1.3-5.1-3.2-.8-1.3 5.2c-.7-.16-1.38-.32-2.05-.48v-.02l-4.4-1.1-.85 3.4s2.37.55 2.32.58c1.3.32 1.53 1.18 1.49 1.86l-1.5 6c.09.02.2.05.33.1l-.34-.08-2.1 8.4c-.16.4-.57 1-1.48.77.03.05-2.32-.58-2.32-.58l-1.58 3.65 4.15 1.04c.77.2 1.53.4 2.27.58l-1.32 5.3 3.2.8 1.32-5.3c.88.24 1.74.46 2.58.67l-1.3 5.25 3.2.8 1.33-5.3c5.47 1.04 9.58.62 11.3-4.33 1.4-3.98-.07-6.27-2.95-7.77 2.1-.48 3.68-1.85 4.1-4.68zm-7.3 10.28c-1 4-7.75 1.83-9.95 1.28l1.77-7.1c2.2.55 9.22 1.64 8.18 5.82zm1-10.34c-.9 3.63-6.54 1.78-8.36 1.33l1.6-6.43c1.83.46 7.7 1.3 6.76 5.1z"
            fill="#fff"
          />
        </g>
      </svg>

      <!-- Filled layer: full color version, revealed left-to-right by clip-path -->
      <svg
        class="btc-layer btc-layer--fill"
        :style="fillStyle"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <circle cx="32" cy="32" r="30" fill="#F7931A" />
          <path
            d="M43.5 27.6c.6-3.9-2.4-6-6.4-7.4l1.3-5.2-3.2-.8-1.3 5c-.85-.2-1.7-.4-2.6-.6l1.3-5.1-3.2-.8-1.3 5.2c-.7-.16-1.38-.32-2.05-.48v-.02l-4.4-1.1-.85 3.4s2.37.55 2.32.58c1.3.32 1.53 1.18 1.49 1.86l-1.5 6c.09.02.2.05.33.1l-.34-.08-2.1 8.4c-.16.4-.57 1-1.48.77.03.05-2.32-.58-2.32-.58l-1.58 3.65 4.15 1.04c.77.2 1.53.4 2.27.58l-1.32 5.3 3.2.8 1.32-5.3c.88.24 1.74.46 2.58.67l-1.3 5.25 3.2.8 1.33-5.3c5.47 1.04 9.58.62 11.3-4.33 1.4-3.98-.07-6.27-2.95-7.77 2.1-.48 3.68-1.85 4.1-4.68zm-7.3 10.28c-1 4-7.75 1.83-9.95 1.28l1.77-7.1c2.2.55 9.22 1.64 8.18 5.82zm1-10.34c-.9 3.63-6.54 1.78-8.36 1.33l1.6-6.43c1.83.46 7.7 1.3 6.76 5.1z"
            fill="#fff"
          />
        </g>
      </svg>
    </div>
    <div
      :style="{
        position: 'relative',
        paddingTop: '8px',
      }"
    >
      <strong class="text-orange">BTC</strong>
      <span class="crypto-amount text-orange-2">{{ (btcValue || 0).toFixed(6) }}</span>
    </div>
    <!-- <div class="float-right">≈ {{ (btcValue * 100).toFixed(0) }}%</div> -->
  </div>
</template>

<style scoped>
.btc-indicator-container {
  max-width: 200px;
}

.btc-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #f7931a;
  background-color: #fff;
  overflow: hidden;
}

.btc-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.btc-layer--base {
  opacity: v-bind(emptyOpacity);
}

.btc-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
