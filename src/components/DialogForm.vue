<script setup>
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import { useI18n } from 'vue-i18n'
import AppDialog from './AppDialog.vue'

defineEmits([...useDialogPluginComponent.emits])

const props = defineProps({
  component: [Object, Function, String],

  modelValue: {
    type: Object,
    default: () => ({}),
  },

  persistent: {
    type: Boolean,
    default: false,
  },

  position: {
    type: String, // fix: was used in template but never declared
    default: undefined,
  },

  maximized: {
    type: Boolean,
    default: false,
  },

  fullWidth: {
    type: Boolean,
    default: false,
  },

  ok: {
    type: [Boolean, Object, String],
    default: true,
  },

  cancel: {
    type: [Boolean, Object, String],
    default: true,
  },

  close: {
    type: [Boolean, Object, String],
    default: true,
  },

  hideButtons: {
    // fix: was `hidebuttons` (inconsistent casing)
    type: Boolean,
    default: false,
  },

  width: {
    type: String,
    default: 'auto',
  },
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const { t } = useI18n({ useScope: 'global' })

// fix: use a local reactive copy so edits from the child are captured.
// previously, submitDialog() always returned the original props.modelValue.
const localValue = ref({ ...props.modelValue })

const submitDialog = () => onDialogOK(localValue.value)
</script>

<template>
  <AppDialog
    ref="dialogRef"
    :position="position"
    :persistent="persistent"
    :full-width="fullWidth"
    :maximized="maximized"
    @hide="onDialogHide"
    :width="width"
    :show-close="!hideButtons && Boolean(close)"
  >
    <div v-if="typeof component === 'string'">{{ component }}</div>
    <div v-else-if="typeof component === 'function'">{{ component() }}</div>
    <component v-else :is="component" v-model="localValue" @submit.prevent="submitDialog" />

    <template v-if="!hideButtons && (cancel || ok)" #actions>
      <q-btn v-if="cancel" flat :label="t('common.actions.cancel')" @click="onDialogCancel" />
      <q-btn
        v-if="ok"
        color="primary"
        :label="typeof ok === 'string' ? ok : ok?.label ? ok?.label : t('common.actions.ok')"
        @click="submitDialog"
      />
    </template>
  </AppDialog>
</template>
