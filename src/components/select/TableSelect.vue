<script setup>
import { Dark, useQuasar } from 'quasar'
import { ref, watch, onMounted } from 'vue'
import {
  getTables,
  getTableColumns,
  getTableData,
  dropTable,
  createTable,
} from 'src/services/storage/rest'
import ExtendedTable from 'src/components/ExtendedTable.vue'
import AddEditDelete from 'src/components/buttons/AddEditDelete.vue'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

// const $q = useQuasar()
const emit = defineEmits(['update:modelValue'])
const $q = useQuasar()
const allTables = ref([])
const tableColumns = ref([])
const tableData = ref([])
const tableName = ref(null)

// keep local state in sync if parent changes
watch(
  () => props.modelValue,
  (newVal) => {
    tableName.value = newVal
  },
)

onMounted(async () => {
  try {
    allTables.value = await getTables()

    watch(
      () => tableName.value,
      async (newVal) => {
        tableColumns.value = await getTableColumns(newVal)
        tableData.value = await getTableData(newVal)

        emit('update:modelValue', newVal)
      },
    )
  } catch (err) {
    console.error('Failed to fetch tables:', err)
  }
})

const createTbl = async () => {
  $q.dialog({
    get title() {
      return t('app.components.admin.createTable')
    },
    message: t('app.common.validation.nameMin3'),
    prompt: {
      model: '',
      isValid: (val) => val.length > 2, // << here is the magic
      type: 'text', // optional
    },
    cancel: true,
    persistent: true,
  }).onOk(async (tblName) => {
    await createTable(tblName)
    refresh().then(() => {
      tableName.value = tblName
    })
  })
}
const dropTbl = async () => {
  await dropTable(tableName.value)
  tableName.value = null
  await refresh()
}

const refresh = async () => {
  allTables.value = await getTables()
  tableColumns.value = await getTableColumns(tableName.value)
  tableData.value = await getTableData(tableName.value)
}
</script>

<template>
  <extended-table :title="tableName" :rows="tableData" :cols="tableColumns" @refresh="refresh">
    <template #top>
      <div :style="{ width: !$q.screen.lt.sm ? '70%' : '360px' }">
        <div class="row items-center">
          <!-- <strong class="col-1" style="font-size: 24px">&nbsp;</strong> -->
          <add-edit-delete
            @add="createTbl"
            @delete="dropTbl"
            only-label
            hidden-edit
            label-add="Create Table"
            label-delete="Drop Table"
            :styles="{ position: 'relative', top: '-18px' }"
            class="col q-mr-xs"
          />
          <q-select
            v-model="tableName"
            :options="allTables"
            :label="t('app.components.admin.tableName')"
            :class="`col q-pl-sm ${!Dark.isActive ? 'bg-grey-3' : 'bg-grey-9'}`"
            style="width: 260px; border-radius: 5px"
            dense
            borderless
            emit-value
            map-options
            options-dense
          />
          <q-btn flat round class="q-mx-xs" icon="refresh" dense @click="refresh">
            <q-tooltip :delay="500" transition-show="rotate" transition-hide="rotate">
              {{ t('app.components.admin.refreshTables') }}
            </q-tooltip>
          </q-btn>
        </div>
      </div>
    </template>
  </extended-table>
</template>
