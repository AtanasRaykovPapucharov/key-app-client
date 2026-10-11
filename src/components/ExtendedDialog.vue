<script setup>
import { useDialogPluginComponent } from 'quasar'
import { ref, reactive, computed, useAttrs } from 'vue'
import AppDialog from './AppDialog.vue'

defineEmits([...useDialogPluginComponent.emits])

const props = defineProps({
  component: [Object, Function, String],
  modelValue: Object,

  returnData: {
    type: [String, Object, Array],
    default: 'all',
  },

  title: String,

  persistent: {
    type: Boolean,
    default: false,
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

  hidebuttons: {
    type: Boolean,
    default: false,
  },

  width: {
    type: String,
    default: 'auto',
  },

  headerHightString: {
    type: String,
    default: '30px',
  },

  position: {
    type: String,
    default: null,
  },

  absolute: {
    type: Boolean,
    default: false,
  },
})

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

const attrs = {
  ...useAttrs(),
  ...(props.modelValue && { modelValue: props.modelValue }),
}

const vmodels = reactive({})

if (props.returnData === 'all') {
  Object.assign(vmodels, attrs)
} else if (Array.isArray(props.returnData)) {
  Object.assign(
    vmodels,
    props.returnData.reduce((acc, curr) => {
      acc[curr] = attrs[curr]
      return acc
    }, {}),
  )
} else {
  vmodels[props.returnData] = attrs[props.returnData]
}

const form_data = ref({ ...attrs })

for (const key of Object.keys(vmodels)) {
  form_data.value[`onUpdate:${key}`] = (val) => {
    form_data.value[key] = val
    vmodels[key] = val
  }
}

const getVmodels = computed(() => {
  if (props.returnData === 'all' || Array.isArray(props.returnData)) {
    return JSON.parse(JSON.stringify(vmodels))
  }

  return vmodels[props.returnData]
})

const buttonBinding = (param) => {
  if (!param || typeof param === 'boolean') return null

  if (typeof param === 'string') {
    return { label: param }
  }

  return param
}

const submitDialog = () => {
  onDialogOK(getVmodels.value)
}

const onCancel = () => {
  if (typeof form_data.value?.arg?.closeOper === 'function') {
    form_data.value.arg.closeOper()
  } else {
    onDialogCancel()
  }
}
</script>

<template>
  <AppDialog
    ref="dialogRef"
    :position="position"
    :persistent="persistent"
    :full-width="fullWidth"
    :maximized="maximized"
    :width="width"
    :title="title"
    :show-close="false"
    @hide="onDialogHide"
  >
    <q-form class="text-grey-10" @submit.prevent="submitDialog">
      <component :is="component" v-bind="form_data" @submit="submitDialog" />
    </q-form>

    <template v-if="!hidebuttons && (cancel || ok)" #actions>
      <q-btn v-if="cancel" v-bind="buttonBinding(cancel)" dense flat icon="close" @click="onCancel">
        <q-tooltip :delay="500">{{ !ok ? 'Close' : 'Cancel' }}</q-tooltip>
      </q-btn>
      <q-btn v-if="ok" v-bind="buttonBinding(ok)" type="submit" dense flat icon="check">
        <q-tooltip :delay="500">OK</q-tooltip>
      </q-btn>
    </template>
  </AppDialog>
</template>
