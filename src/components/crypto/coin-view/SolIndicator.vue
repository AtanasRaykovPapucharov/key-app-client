<script setup>
import { computed } from 'vue'

const props = defineProps({
  // SOL value, 0 or higher
  solValue: {
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

const clampedValue = computed(() => Math.min(1, Math.max(0, props.solValue)))

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
  <div class="sol-indicator-container q-pa-sm">
    <div
      class="sol-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`SOL ${(solValue * 100).toFixed(0)}%`"
      role="img"
    >
      <!-- Base layer: dim/ghost version of the full logo (always visible) -->
      <svg class="sol-layer sol-layer--base" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient
            id="sol-grad-base"
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stop-color="#9945FF" />
            <stop offset="1" stop-color="#14F195" />
          </linearGradient>
        </defs>
        <g>
          <circle cx="32" cy="32" r="30" fill="#2B2640" />
          <g fill="url(#sol-grad-base)">
            <path d="M20 22h20l4 4H24z" />
            <path d="M20 30h20l4 4H24z" />
            <path d="M20 38h20l4 4H24z" />
          </g>
        </g>
      </svg>

      <!-- Filled layer: full color version, revealed left-to-right by clip-path -->
      <svg
        class="sol-layer sol-layer--fill"
        :style="fillStyle"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="sol-grad-fill"
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stop-color="#9945FF" />
            <stop offset="1" stop-color="#14F195" />
          </linearGradient>
        </defs>
        <g>
          <circle cx="32" cy="32" r="30" fill="#2B2640" />
          <g fill="url(#sol-grad-fill)">
            <path d="M20 22h20l4 4H24z" />
            <path d="M20 30h20l4 4H24z" />
            <path d="M20 38h20l4 4H24z" />
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
      <strong class="text-purple">SOL</strong>
      <span class="crypto-amount text-purple-2">{{ (solValue || 0).toFixed(6) }}</span>
    </div>
  </div>
</template>

<style scoped>
.sol-indicator-container {
  max-width: 200px;
}

.sol-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #9945ff;
  background-color: #fff;
  overflow: hidden;
}

.sol-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.sol-layer--base {
  opacity: v-bind(emptyOpacity);
}

.sol-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
