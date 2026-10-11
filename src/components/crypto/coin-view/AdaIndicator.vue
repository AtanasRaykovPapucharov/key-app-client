<script setup>
import { computed } from 'vue'

const props = defineProps({
  // ADA value, 0 or higher
  adaValue: {
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

const clampedValue = computed(() => Math.min(1, Math.max(0, props.adaValue)))

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
  <div class="ada-indicator-container q-pa-sm">
    <div
      class="ada-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`ADA ${(adaValue * 100).toFixed(0)}%`"
      role="img"
    >
      <!-- Base layer: dim/ghost version of the full logo (always visible) -->
      <svg class="ada-layer ada-layer--base" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <g>
          <circle cx="32" cy="32" r="30" fill="#0033AD" />
          <g fill="#fff">
            <!-- center dot -->
            <circle cx="32" cy="32" r="3.2" />
            <!-- inner ring -->
            <circle cx="32" cy="20" r="2.4" />
            <circle cx="32" cy="44" r="2.4" />
            <circle cx="21.6" cy="26" r="2.4" />
            <circle cx="42.4" cy="26" r="2.4" />
            <circle cx="21.6" cy="38" r="2.4" />
            <circle cx="42.4" cy="38" r="2.4" />
            <!-- outer ring -->
            <circle cx="32" cy="10" r="2" />
            <circle cx="32" cy="54" r="2" />
            <circle cx="13" cy="21" r="2" />
            <circle cx="51" cy="21" r="2" />
            <circle cx="13" cy="43" r="2" />
            <circle cx="51" cy="43" r="2" />
            <circle cx="9" cy="32" r="2" />
            <circle cx="55" cy="32" r="2" />
          </g>
        </g>
      </svg>

      <!-- Filled layer: full color version, revealed left-to-right by clip-path -->
      <svg
        class="ada-layer ada-layer--fill"
        :style="fillStyle"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <circle cx="32" cy="32" r="30" fill="#0033AD" />
          <g fill="#fff">
            <circle cx="32" cy="32" r="3.2" />
            <circle cx="32" cy="20" r="2.4" />
            <circle cx="32" cy="44" r="2.4" />
            <circle cx="21.6" cy="26" r="2.4" />
            <circle cx="42.4" cy="26" r="2.4" />
            <circle cx="21.6" cy="38" r="2.4" />
            <circle cx="42.4" cy="38" r="2.4" />
            <circle cx="32" cy="10" r="2" />
            <circle cx="32" cy="54" r="2" />
            <circle cx="13" cy="21" r="2" />
            <circle cx="51" cy="21" r="2" />
            <circle cx="13" cy="43" r="2" />
            <circle cx="51" cy="43" r="2" />
            <circle cx="9" cy="32" r="2" />
            <circle cx="55" cy="32" r="2" />
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
      <strong class="text-blue-8">ADA</strong>
      <span class="crypto-amount text-blue-grey-2">{{ (adaValue || 0).toFixed(4) }}</span>
    </div>
  </div>
</template>

<style scoped>
.ada-indicator-container {
  max-width: 200px;
}

.ada-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #0033ad;
  background-color: #fff;
  overflow: hidden;
}

.ada-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ada-layer--base {
  opacity: v-bind(emptyOpacity);
}

.ada-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
