<script setup>
import { computed } from 'vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const strategyOptions = [
  { label: 'Moving Average Crossover', value: 'moving_average' },
  { label: 'RSI Reversal', value: 'rsi' },
  { label: 'MACD Trend', value: 'macd' },
  { label: 'Bollinger Bands', value: 'bollinger' },
]

const selectedStrategy = computed({
  get: () => props.modelValue.strategy,
  set: (value) => update('strategy', value),
})

const update = (field, value) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

const updateNumber = (field, value) => update(field, Number(value))
</script>

<template>
  <div class="q-gutter-md">
    <q-select
      v-model="selectedStrategy"
      dark
      filled
      emit-value
      map-options
      :options="strategyOptions"
      label="Strategy"
    />

    <template v-if="modelValue.strategy === 'moving_average'">
      <q-input
        dark
        filled
        type="number"
        label="Fast period"
        :model-value="modelValue.fastPeriod"
        min="1"
        @update:model-value="updateNumber('fastPeriod', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        label="Slow period"
        :model-value="modelValue.slowPeriod"
        min="2"
        @update:model-value="updateNumber('slowPeriod', $event)"
      />
    </template>

    <template v-else-if="modelValue.strategy === 'rsi'">
      <q-input
        dark
        filled
        type="number"
        label="RSI period"
        :model-value="modelValue.rsiPeriod"
        min="2"
        @update:model-value="updateNumber('rsiPeriod', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        label="Oversold level"
        :model-value="modelValue.oversold"
        min="1"
        max="49"
        @update:model-value="updateNumber('oversold', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        label="Overbought level"
        :model-value="modelValue.overbought"
        min="51"
        max="99"
        @update:model-value="updateNumber('overbought', $event)"
      />
    </template>

    <template v-else-if="modelValue.strategy === 'macd'">
      <q-input
        dark
        filled
        type="number"
        label="Fast period"
        :model-value="modelValue.macdFast"
        min="1"
        @update:model-value="updateNumber('macdFast', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        label="Slow period"
        :model-value="modelValue.macdSlow"
        min="2"
        @update:model-value="updateNumber('macdSlow', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        label="Signal period"
        :model-value="modelValue.macdSignal"
        min="1"
        @update:model-value="updateNumber('macdSignal', $event)"
      />
    </template>

    <template v-else-if="modelValue.strategy === 'bollinger'">
      <q-input
        dark
        filled
        type="number"
        label="Period"
        :model-value="modelValue.bollingerPeriod"
        min="2"
        @update:model-value="updateNumber('bollingerPeriod', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        label="Standard deviation"
        :model-value="modelValue.standardDeviation"
        min="0.1"
        step="0.1"
        @update:model-value="updateNumber('standardDeviation', $event)"
      />
    </template>
  </div>
</template>
