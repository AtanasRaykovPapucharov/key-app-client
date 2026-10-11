<script setup>
import { computed } from 'vue'
import bnbIcon from 'src/assets/bnb.svg'

const props = defineProps({
  // BNB value, 0 or higher
  bnbValue: {
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

const clampedValue = computed(() => Math.min(1, Math.max(0, props.bnbValue)))

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
  <div class="bnb-indicator-container q-pa-sm">
    <div
      class="bnb-indicator"
      :style="{ width: size, height: size }"
      :aria-label="`BNB ${(bnbValue * 100).toFixed(0)}%`"
      role="img"
    >
      <!-- Base layer: dim/ghost version of the full logo (always visible) -->
      <img class="bnb-layer bnb-layer--base" :src="bnbIcon" alt="" aria-hidden="true" />

      <!-- Filled layer: full color version, revealed left-to-right by clip-path -->
      <img
        class="bnb-layer bnb-layer--fill"
        :style="fillStyle"
        :src="bnbIcon"
        alt=""
        aria-hidden="true"
      />
    </div>

    <div
      :style="{
        position: 'relative',
      }"
    >
      <strong class="text-yellow-8">BNB</strong> {{ (bnbValue || 0).toFixed(6) }}
    </div>
  </div>
</template>

<style scoped>
.bnb-indicator-container {
  max-width: 200px;
}

.bnb-indicator {
  position: relative;
  left: 20px;
  display: inline-block;
  border-radius: 50%;
  border: 1px solid #f3ba2f;
  background-color: #fff;
  overflow: hidden;
}

.bnb-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.bnb-layer--base {
  opacity: v-bind(emptyOpacity);
}

.bnb-layer--fill {
  opacity: 1;
  transition: clip-path 0.3s ease;
}
</style>
