<script setup>
const emit = defineEmits(['info', 'close'])

// const props =
defineProps({
  readOnly: {
    type: Boolean,
    default: () => false,
  },

  label: {
    type: String,
    default: () => ' ',
  },
  onlyLabel: {
    type: Boolean,
    default: () => false,
  },

  hiddenInfo: {
    type: Boolean,
    default: () => false,
  },
  labelInfo: {
    type: String,
    default: () => ' ',
  },
  disableInfo: {
    type: Boolean,
    default: () => false,
  },

  hiddenClose: {
    type: Boolean,
    default: () => false,
  },
  labelClose: {
    type: String,
    default: () => ' ',
  },
  disableClose: {
    type: Boolean,
    default: () => false,
  },

  styles: {
    type: Object,
  },
})
</script>

<template>
  <section :style="styles">
    <q-btn
      v-if="!hiddenInfo"
      round
      flat
      dense
      icon="info"
      size="xs"
      style="position: absolute; right: 20px; top: 2px"
      :disable="readOnly || disableInfo"
      @click="emit('info')"
    >
      <q-tooltip :delay="500" transition-show="rotate" transition-hide="rotate">{{
        onlyLabel ? `${labelInfo}` : `Info ${label}`
      }}</q-tooltip>
    </q-btn>
    <q-btn
      v-close-popup
      round
      flat
      dense
      icon="close"
      size="xs"
      style="position: absolute; right: 2px; top: 2px"
      :disable="readOnly || disableClose"
      @click="emit('close')"
    />
  </section>
</template>

<style lang="scss"></style>
