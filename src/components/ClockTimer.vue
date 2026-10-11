<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

defineOptions({ name: 'ClockTimer' })

const props = defineProps({
  time: {
    type: Number,
    default: 60,
  },
  styles: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['finished'])

const remainingSeconds = ref(normalizeTime(props.time))
let timerId = null
let endsAt = 0

const radius = 54
const circumference = 2 * Math.PI * radius

const totalSeconds = computed(() => normalizeTime(props.time))
const progress = computed(() => {
  if (!totalSeconds.value) return 0
  return Math.max(0, Math.min(1, remainingSeconds.value / totalSeconds.value))
})
const strokeOffset = computed(() => circumference * (1 - progress.value))
const formattedTime = computed(() => {
  const hours = Math.floor(remainingSeconds.value / 3600)
  const minutes = Math.floor((remainingSeconds.value % 3600) / 60)
  const seconds = remainingSeconds.value % 60

  if (hours > 0) {
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
  }

  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  return String(seconds)
})

function normalizeTime(value) {
  return Math.max(0, Math.floor(Number(value) || 0))
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

function tick() {
  remainingSeconds.value = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))

  if (remainingSeconds.value === 0) {
    stopTimer()
    emit('finished')
  }
}

function startTimer() {
  stopTimer()
  remainingSeconds.value = totalSeconds.value
  if (!totalSeconds.value) {
    emit('finished')
    return
  }

  endsAt = Date.now() + totalSeconds.value * 1000
  timerId = setInterval(tick, 200)
}

watch(() => props.time, startTimer, { immediate: true })

onBeforeUnmount(stopTimer)
</script>

<template>
  <div class="clock-timer" :style="styles">
    <svg class="clock-timer__svg" viewBox="0 0 128 128" aria-hidden="true">
      <circle class="clock-timer__track" cx="64" cy="64" :r="radius" />
      <circle
        class="clock-timer__progress"
        cx="64"
        cy="64"
        :r="radius"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeOffset"
        :style="{ opacity: progress > 0 ? 1 : 0 }"
      />
    </svg>
    <div class="clock-timer__time">{{ formattedTime }}</div>
  </div>
</template>

<style scoped lang="scss">
.clock-timer {
  position: relative;
  width: 128px;
  height: 128px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.clock-timer__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.clock-timer__track,
.clock-timer__progress {
  fill: none;
  stroke-width: 10;
}

.clock-timer__track {
  stroke: rgba(255, 255, 255, 0.18);
}

.clock-timer__progress {
  stroke: #22c55e;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.2s linear;
}

.clock-timer__time {
  position: relative;
  z-index: 1;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
</style>
