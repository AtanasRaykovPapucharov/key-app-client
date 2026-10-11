<script setup>
import { computed } from 'vue'

const props = defineProps({
  // LINK value, 0 or higher
  linkValue: {
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

const clampedValue = computed(() => Math.min(1, Math.max(0, props.linkValue)))

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
  <div class="link-indicator-container q-pa-sm">
    <div
      class="link-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`LINK ${(linkValue * 100).toFixed(0)}%`"
      role="img"
    >
      <!-- Base layer: dim/ghost version of the full logo (always visible) -->
      <svg
        class="link-layer link-layer--base"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <circle cx="32" cy="32" r="30" fill="#2A5ADA" />
          <!-- outer hexagon -->
          <polygon
            points="32,12 49.32,22 49.32,42 32,52 14.68,42 14.68,22"
            fill="none"
            stroke="#fff"
            stroke-width="3"
          />
          <!-- inner hexagon -->
          <polygon points="32,22 40.66,27 40.66,37 32,42 23.34,37 23.34,27" fill="#fff" />
        </g>
      </svg>

      <!-- Filled layer: full color version, revealed left-to-right by clip-path -->
      <svg
        class="link-layer link-layer--fill"
        :style="fillStyle"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <circle cx="32" cy="32" r="30" fill="#2A5ADA" />
          <polygon
            points="32,12 49.32,22 49.32,42 32,52 14.68,42 14.68,22"
            fill="none"
            stroke="#fff"
            stroke-width="3"
          />
          <polygon points="32,22 40.66,27 40.66,37 32,42 23.34,37 23.34,27" fill="#fff" />
        </g>
      </svg>
    </div>

    <div
      :style="{
        position: 'relative',
        paddingTop: '8px',
      }"
    >
      <strong class="text-indigo-8">LINK</strong>
      <span class="crypto-amount text-indigo-2">{{ (linkValue || 0).toFixed(6) }}</span>
    </div>
  </div>
</template>

<style scoped>
.link-indicator-container {
  max-width: 200px;
}

.link-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #2a5ada;
  background-color: #fff;
  overflow: hidden;
}

.link-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.link-layer--base {
  opacity: v-bind(emptyOpacity);
}

.link-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
