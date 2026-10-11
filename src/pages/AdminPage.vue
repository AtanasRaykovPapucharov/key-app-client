<script setup>
import { ref } from 'vue'
import TableSelect from 'src/components/select/TableSelect.vue'

const tableName = ref('')
defineProps({})

defineOptions({
  name: 'AdminPage',
})
</script>
<template>
  <fieldset class="rounded-borders q-pa-sm q-ma-sm bg-grey-5">
    <legend class="text-primary text-bold">&nbsp;ADMIN&nbsp;</legend>

    <table-select v-model="tableName" />
  </fieldset>
</template>
