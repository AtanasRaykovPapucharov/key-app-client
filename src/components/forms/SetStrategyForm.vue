<script setup>
import { computed } from 'vue'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const strategyOptions = [
  {
    get label() {
      return t('app.forms.strategy.maCross')
    },
    value: 'moving_average',
  },
  {
    get label() {
      return t('app.forms.strategy.rsiReversal')
    },
    value: 'rsi',
  },
  {
    get label() {
      return t('app.forms.strategy.macdTrend')
    },
    value: 'macd',
  },
  {
    get label() {
      return t('app.forms.strategy.bollinger')
    },
    value: 'bollinger',
  },
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
      :label="t('app.common.labels.strategy')"
    />

    <template v-if="modelValue.strategy === 'moving_average'">
      <q-input
        dark
        filled
        type="number"
        :label="t('app.common.labels.fastPeriod')"
        :model-value="modelValue.fastPeriod"
        min="1"
        @update:model-value="updateNumber('fastPeriod', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        :label="t('app.common.labels.slowPeriod')"
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
        :label="t('app.common.labels.rsiPeriod')"
        :model-value="modelValue.rsiPeriod"
        min="2"
        @update:model-value="updateNumber('rsiPeriod', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        :label="t('app.forms.strategy.oversold')"
        :model-value="modelValue.oversold"
        min="1"
        max="49"
        @update:model-value="updateNumber('oversold', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        :label="t('app.forms.strategy.overbought')"
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
        :label="t('app.common.labels.fastPeriod')"
        :model-value="modelValue.macdFast"
        min="1"
        @update:model-value="updateNumber('macdFast', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        :label="t('app.common.labels.slowPeriod')"
        :model-value="modelValue.macdSlow"
        min="2"
        @update:model-value="updateNumber('macdSlow', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        :label="t('app.common.labels.signalPeriod')"
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
        :label="t('app.common.labels.period')"
        :model-value="modelValue.bollingerPeriod"
        min="2"
        @update:model-value="updateNumber('bollingerPeriod', $event)"
      />
      <q-input
        dark
        filled
        type="number"
        :label="t('app.forms.strategy.stdDev')"
        :model-value="modelValue.standardDeviation"
        min="0.1"
        step="0.1"
        @update:model-value="updateNumber('standardDeviation', $event)"
      />
    </template>
  </div>
</template>
