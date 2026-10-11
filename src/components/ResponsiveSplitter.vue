<script setup>
/**
 * q-splitter on tablet/desktop; stacked layout on phones.
 * Pair with tabs that switch orientation: `:vertical="!$q.screen.lt.sm"`.
 */
import { computed } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: { type: Number, default: 22 },
  /** Below this Quasar breakpoint the panes stack. */
  stackBelow: { type: String, default: 'sm' },
  limits: { type: Array, default: () => [10, 50] },
})
const emit = defineEmits(['update:modelValue'])
const $q = useQuasar()

const stacked = computed(() => $q.screen.lt[props.stackBelow])
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>

<template>
  <div v-if="stacked" class="responsive-splitter--stacked">
    <div class="responsive-splitter__before">
      <slot name="before" />
    </div>
    <div class="responsive-splitter__after">
      <slot name="after" />
    </div>
  </div>
  <q-splitter v-else v-model="model" :limits="limits" v-bind="$attrs">
    <template #before>
      <slot name="before" />
    </template>
    <template #after>
      <slot name="after" />
    </template>
  </q-splitter>
</template>

<style scoped>
.responsive-splitter--stacked {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.responsive-splitter__before {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  min-width: 0;
}

.responsive-splitter__after {
  min-width: 0;
}
</style>
