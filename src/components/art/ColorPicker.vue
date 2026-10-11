<!-- <script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '#1976D2',
  },
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<template>
  <q-color v-model="model" format="hex" default-view="palette" class="full-width" />
</template> -->

<template>
  <div class="q-pa-sm" style="width: 320px">
    <q-input dense v-model="model" label="Color" filled readonly>
      <template #append>
        <q-icon name="colorize" class="cursor-pointer">
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-color v-model="model" format="hex" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <div
      :style="{
        backgroundColor: `${modelValue}`,
        minHeight: '30px',
      }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '#1976D2',
  },
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
