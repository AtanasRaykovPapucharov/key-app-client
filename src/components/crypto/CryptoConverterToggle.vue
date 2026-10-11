<script setup>
import { ref } from 'vue'
import CryptoConverter from './CryptoConverter.vue'
import AppDialog from '../AppDialog.vue'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const helpDialog = ref(false)
const from = ref('BTC')
</script>

<template>
  <q-toggle icon="swap_horiz" size="lg" dense v-model="helpDialog" style="margin-top: -15px" />

  <AppDialog v-model="helpDialog" width="360px" :title="t('app.crypto.converter.title')">
    <div class="q-px-xs">
      <CryptoConverter hide-price :from="from" :height="'150px'" />
    </div>
  </AppDialog>
</template>

<style scoped></style>
