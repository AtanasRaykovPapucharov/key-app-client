<script setup>
import { computed } from 'vue'

const props = defineProps({
  // ETH value, 0 or higher
  ethValue: {
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

const clampedValue = computed(() => Math.min(1, Math.max(0, props.ethValue)))

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
  <div class="eth-indicator-container q-pa-sm">
    <div
      class="eth-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`ETH ${(ethValue * 100).toFixed(0)}%`"
      role="img"
    >
      <!-- Base layer: dim/ghost version of the full logo (always visible) -->
      <svg class="eth-layer eth-layer--base" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g>
          <circle cx="32" cy="32" r="30" fill="#627EEA" />
          <g fill="#fff">
            <polygon points="32,10 32,25.5 45,32 32,10" fill-opacity="0.6" />
            <polygon points="32,10 19,32 32,25.5 32,10" />
            <polygon points="32,27.5 32,39.5 45,34.5 32,27.5" fill-opacity="0.6" />
            <polygon points="32,39.5 32,27.5 19,34.5 32,39.5" />
            <polygon points="32,46 32,54 45,36.8 32,46" fill-opacity="0.6" />
            <polygon points="32,54 32,46 19,36.8 32,54" />
          </g>
        </g>
      </svg>

      <!-- Filled layer: full color version, revealed left-to-right by clip-path -->
      <svg
        class="eth-layer eth-layer--fill"
        :style="fillStyle"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <circle cx="32" cy="32" r="30" fill="#627EEA" />
          <g fill="#fff">
            <polygon points="32,10 32,25.5 45,32 32,10" fill-opacity="0.6" />
            <polygon points="32,10 19,32 32,25.5 32,10" />
            <polygon points="32,27.5 32,39.5 45,34.5 32,27.5" fill-opacity="0.6" />
            <polygon points="32,39.5 32,27.5 19,34.5 32,39.5" />
            <polygon points="32,46 32,54 45,36.8 32,46" fill-opacity="0.6" />
            <polygon points="32,54 32,46 19,36.8 32,54" />
          </g>
        </g>
      </svg>
    </div>
    <div
      :style="{
        position: 'relative',
        paddingTop: '8px',
      }"
    >
      <strong class="text-blue">ETH</strong>
      <span class="crypto-amount text-blue-2">{{ (ethValue || 0).toFixed(6) }}</span>
    </div>
  </div>
</template>

<style scoped>
.eth-indicator-container {
  max-width: 200px;
}

.eth-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #627eea;
  background-color: #fff;
  overflow: hidden;
}

.eth-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.eth-layer--base {
  opacity: v-bind(emptyOpacity);
}

.eth-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
