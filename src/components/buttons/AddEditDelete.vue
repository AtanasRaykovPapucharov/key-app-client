<script setup>
const emit = defineEmits(['add', 'edit', 'delete'])

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

  hiddenAdd: {
    type: Boolean,
    default: () => false,
  },
  labelAdd: {
    type: String,
    default: () => ' ',
  },
  disableAdd: {
    type: Boolean,
    default: () => false,
  },

  hiddenEdit: {
    type: Boolean,
    default: () => false,
  },
  labelEdit: {
    type: String,
    default: () => ' ',
  },
  disableEdit: {
    type: Boolean,
    default: () => false,
  },

  hiddenDelete: {
    type: Boolean,
    default: () => false,
  },
  labelDelete: {
    type: String,
    default: () => ' ',
  },
  disableDelete: {
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
      v-if="!hiddenAdd"
      round
      dense
      flat
      icon="add"
      size="md"
      :style=" {height: '20px', position: 'absolute', right: !hiddenEdit ? '60px' : '30px', top: '0'}"
      :disable="readOnly || disableAdd"
      @click="emit('add')"
    >
      <q-tooltip :delay="500" transition-show="rotate" transition-hide="rotate">{{
        onlyLabel ? `${labelAdd}` : `Add ${label}`
      }}</q-tooltip></q-btn
    >
    <q-btn
      v-if="!hiddenEdit"
      round
      dense
      flat
      icon="edit"
      size="md"
      style="height: 20px; position: absolute; right: 30px; top: 0"
      :disable="readOnly || disableEdit"
      @click="emit('edit')"
    >
      <q-tooltip :delay="500" transition-show="rotate" transition-hide="rotate">{{
        onlyLabel ? `${labelEdit}` : `Edit ${label}`
      }}</q-tooltip>
    </q-btn>
    <q-btn
      v-if="!hiddenDelete"
      round
      dense
      flat
      icon="delete"
      size="md"
      style="height: 20px; position: absolute; right: 0px; top: 0"
      :disable="readOnly || disableDelete"
      @click="emit('delete')"
    >
      <q-tooltip :delay="500" transition-show="rotate" transition-hide="rotate">{{
        onlyLabel ? `${labelDelete}` : `Delete ${label}`
      }}</q-tooltip>
    </q-btn>
  </section>
</template>
