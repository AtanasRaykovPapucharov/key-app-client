<template>
  <div class="q-gutter-sm bg-grey-3 q-pa-xs" style="max-width: 350px">
    <div>
      <q-btn
        dense
        flat
        class="q-ml-sm float-right"
        color="primary"
        icon="colorize"
        @click="pickColor"
      />
      <q-color v-model="color" format="hex" no-footer />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const $q = useQuasar()
const color = ref('#1976D2')

const pickColor = async () => {
  if (!window.EyeDropper) {
    $q.notify({
      type: 'negative',
      message: t('app.components.art.pickerUnsupported'),
      position: 'top-left',
    })
    return
  }

  try {
    const eyeDropper = new EyeDropper()
    const result = await eyeDropper.open()
    color.value = result.sRGBHex
  } catch (err) {
    // user pressed ESC or cancelled
    console.error(err)
  }
}
</script>
