<script setup>
import { ref } from 'vue'
import TableSelect from 'src/components/select/TableSelect.vue'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const tableName = ref('')
defineProps({})

defineOptions({
  name: 'AdminPage',
})
</script>
<template>
  <fieldset class="rounded-borders q-pa-sm q-ma-sm bg-grey-5">
    <legend class="text-primary text-bold">{{ t('app.pages.admin.legend') }}</legend>

    <table-select v-model="tableName" />
  </fieldset>
</template>
