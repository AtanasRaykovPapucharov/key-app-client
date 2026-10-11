<script setup>
import { computed } from 'vue'
import { fee } from 'src/services/storage/calc'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const emit = defineEmits(['update:modelValue']) // fix: unified event instead of update:price / update:amount

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

// Helper: emit a full updated copy whenever a single field changes.
// This makes `v-model` in DialogForm work correctly.
const update = (field, value) => emit('update:modelValue', { ...props.modelValue, [field]: value })

const price = computed({
  get: () => props.modelValue.price,
  set: (val) => update('price', val),
})

const amount = computed({
  get: () => props.modelValue.amount,
  set: (val) => update('amount', val),
})

const baseSymbol = computed(
  () => props.modelValue.amountSymbol || props.modelValue.symbol?.replace('USDC', ''),
)
const priceSymbol = computed(() => props.modelValue.priceSymbol || 'USDC')
const totalSymbol = computed(() => props.modelValue.totalSymbol || 'USDC')

const total = computed(() => {
  const result = Number(price.value) * Number(amount.value)
  return isNaN(result) ? 0 : result
})

const bankFee = computed(() => fee(total.value))
</script>

<template>
  <div class="q-gutter-md">
    <div class="text-h6 text-center">
      {{ t('app.components.forms.doYouWant') }} {{ modelValue.order_type }}
      {{ modelValue.displaySymbol || modelValue.symbol?.replace('USDC', ' / USDC') }} ?
    </div>

    <q-input
      dark
      dense
      filled
      :readonly="!!modelValue.readOnly"
      input-class="text-right"
      v-model.number="price"
      :label="`Price (${priceSymbol})`"
      type="number"
    />
    <q-input
      dark
      dense
      filled
      :readonly="!!modelValue.readOnly"
      input-class="text-right"
      v-model.number="amount"
      :label="`Amount (${baseSymbol})`"
      type="number"
    />
    <q-input
      dark
      dense
      readonly
      filled
      input-class="text-right"
      :model-value="total"
      :label="`Total (${totalSymbol})`"
      type="number"
    />
    <q-input
      v-if="modelValue.order_type === 'buy' || modelValue.order_type === 'sell'"
      dark
      dense
      readonly
      filled
      input-class="text-right"
      :model-value="bankFee.toFixed(6)"
      :label="`Bank fee (${modelValue.feeSymbol || 'USDC'})`"
      type="number"
    />
  </div>
</template>

<style>
/* Chrome, Safari, Edge */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
