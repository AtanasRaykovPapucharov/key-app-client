<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: String,
  readOnly: Boolean,
})

const typeOptions = [
  { value: 'text', label: 'TEXT' },
  { value: 'boolean', label: 'BOOLEAN' },
  { value: 'numeric', label: 'NUMERIC' },
  { value: 'smallint', label: 'SMALLINT' },
  { value: 'integer', label: 'INTEGER' },
  { value: 'bigint', label: 'BIGINT' },
  { value: 'smallserial', label: 'SMALLSERIAL' },
  { value: 'serial', label: 'SERIAL' },
  { value: 'bigserial', label: 'BIGSERIAL' },
  { value: 'json', label: 'JSON' },
  { value: 'jsonb', label: 'JSONB' },
]

const emit = defineEmits(['update:modelValue'])

const dataType = computed({
  // getter
  get() {
    return props.modelValue
  },
  // setter
  set(newValue) {
    emit('update:modelValue', newValue)
  },
})
</script>

<template>
  <q-select
    v-model="dataType"
    :options="typeOptions"
    label="Data Type"
    class="q-pl-sm bg-grey-3"
    style="width: 150px; border-radius: 5px"
    :readonly="readOnly"
    dense
    borderless
    emit-value
    map-options
    options-dense
  />
</template>
