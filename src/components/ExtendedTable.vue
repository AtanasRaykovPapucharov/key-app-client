<script setup>
import { Dark } from 'quasar'
import { ref, computed, watch } from 'vue'
import {
  addTblRow,
  editTblRow,
  deleteTblRow,
  addColumn,
  deleteColumn,
} from 'src/services/storage/rest'
import DatatypeSelect from 'src/components/select/DatatypeSelect.vue'
import AppDialog from 'src/components/AppDialog.vue'

const emit = defineEmits('refresh')
const props = defineProps({
  title: { type: String, default: 'Table' },
  rows: { type: Array, default: () => [] },
  cols: { type: Array, default: () => [] },
})

const total = ref(true)
const localRows = ref([...props.rows])
watch(
  () => props.rows,
  (v) => (localRows.value = [...v]),
)

const columns = computed(() => [
  // <-- prepend the actions column (name must match slot suffix)
  {
    name: 'actions',
    field: 'actions',
    label: '',
    sortable: false,
    align: 'center',
    style: 'width:56px',
  },
  ...props.cols.map((el) => ({
    name: el.column_name,
    field: el.column_name,
    type: el.data_type,
    label: `${el.column_name} [ ${el.data_type} ]`,
    align: 'left',
    sortable: el.column_name.endsWith('id') || el.column_name.endsWith('name'),
    opts: !el.column_name.endsWith('id')
      ? el.data_type !== 'boolean'
        ? ['delete', 'sum']
        : ['delete']
      : ['add'],
  })),
])

const showDialog = ref(false)
const crudMode = ref('Add')
const crudType = ref('Row')
const newName = ref(null)
const newType = ref(null)

const formData = ref({})

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
})

function addCol() {
  crudMode.value = 'Add'
  crudType.value = 'Column'
  formData.value = props.cols.reduce((acc, c) => {
    acc[c.column_name] = ''
    return acc
  }, {})
  showDialog.value = true
}
function deleteCol(col) {
  crudMode.value = 'Delete'
  crudType.value = 'Column'
  newName.value = col.name
  newType.value = col.type
  showDialog.value = true
}
function showMessage(col) {
  alert(sumCol(col))
}
function sumCol(col) {
  let result

  switch (col.type) {
    case 'text':
      result = localRows.value.reduce((acc, row) => {
        const val = row[col.name]?.length
        return acc + (isNaN(val) ? 0 : val)
      }, 0)
      break
    case 'character varying':
      result = localRows.value.reduce((acc, row) => {
        const val = row[col.name]?.length
        return acc + (isNaN(val) ? 0 : val)
      }, 0)
      break
    case 'boolean':
      result = '-'
      break

    default:
      result = localRows.value.reduce((acc, row) => {
        const val = Number(row[col.name])
        return acc + (isNaN(val) ? 0 : val)
      }, 0)
      break
  }

  return result
}

function addRow() {
  crudMode.value = 'Add'
  crudType.value = 'Row'
  formData.value = props.cols.reduce((acc, c) => {
    acc[c.column_name] = ''
    return acc
  }, {})
  showDialog.value = true
}
function editRow(row) {
  crudMode.value = 'Edit'
  crudType.value = 'Row'
  formData.value = { ...row }
  showDialog.value = true
}
function deleteRow(row) {
  crudMode.value = 'Delete'
  crudType.value = 'Row'
  formData.value = { ...row }
  showDialog.value = true
}
async function save() {
  switch (crudMode.value) {
    case 'Add':
      if (crudType.value !== 'Row') {
        // TODO: implement add column
        await addColumn(props.title, newName.value, newType.value)
      } else {
        await addTblRow(props.title, { ...formData.value })
      }
      break

    case 'Edit':
      await editTblRow(props.title, { ...formData.value })
      break

    case 'Delete':
      if (crudType.value !== 'Row') {
        // TODO: implement delete column
        await deleteColumn(props.title, newName.value)
      } else {
        await deleteTblRow(props.title, formData.value[props.title + 'id'])
      }
      break
  }
  emit('refresh')
  cancel()
}
function cancel() {
  newName.value = null
  newType.value = null
  showDialog.value = false
}
function inputType(dataType) {
  switch (dataType) {
    case 'smallint':
      return 'number'
    case 'bigint':
      return 'number'
    case 'integer':
      return 'number'
    case 'numeric':
      return 'number'

    default:
      return 'text'
  }
}
</script>

<template>
  <q-table
    dense
    bordered
    binary-state-sort
    virtual-scroll-horizontal
    :card-class="`${!Dark.isActive ? 'bg-grey-1' : 'bg-grey-3'} text-grey-10`"
    table-class="text-black bg-grey-3"
    table-header-class="bg-grey-5"
    :title="title"
    row-key="id"
    :rows="localRows"
    :columns="columns"
    :pagination="pagination"
    :style="{ maxWidth: `${parseInt($q.screen.width - 75)}px` }"
  >
    <!-- keep top slot re-exposed -->
    <template #:top>
      <slot name="top" />
    </template>

    <!-- header slot for the actions column (name === 'actions') -->
    <template #header-cell-actions>
      <q-th v-if="title" class="text-center">
        <q-btn flat dense round icon="add" color="primary" @click="addRow">
          <q-tooltip :delay="500" transition-show="rotate" transition-hide="rotate">
            Add Row
          </q-tooltip>
        </q-btn>
      </q-th>
    </template>

    <template #header-cell="props">
      <q-th class="text-left">
        {{ props.col.label }}
        <q-btn-dropdown
          flat
          dense
          round
          no-icon-animation
          size="sm"
          :icon="undefined"
          dropdown-icon="more_vert"
        >
          <q-list>
            <q-item
              v-if="props.col.opts.includes('add')"
              dense
              clickable
              v-close-popup
              @click="addCol"
            >
              <q-item-section>Add</q-item-section>
            </q-item>
            <q-item
              v-if="props.col.opts.includes('sum')"
              dense
              clickable
              v-close-popup
              @click="showMessage(props.col)"
            >
              <q-item-section>Sum</q-item-section>
            </q-item>
            <q-item
              v-if="props.col.opts.includes('delete')"
              dense
              clickable
              v-close-popup
              @click="deleteCol(props.col)"
            >
              <q-item-section>Delete</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-th>
    </template>

    <!-- body slot for the actions column -->
    <template #body-cell-actions="props">
      <q-td class="text-center">
        <q-btn-dropdown
          flat
          dense
          round
          no-icon-animation
          :icon="undefined"
          dropdown-icon="more_vert"
        >
          <q-list>
            <q-item dense clickable v-close-popup @click="editRow(props.row)">
              <q-item-section>Edit</q-item-section>
            </q-item>
            <q-item dense clickable v-close-popup @click="deleteRow(props.row)">
              <q-item-section>Delete</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-td>
    </template>
    <template #pagination>
      <q-checkbox
        v-model="total"
        label="Sum"
        size="sm"
        color="black"
        style="position: absolute; left: 16px"
      />
    </template>

    <!-- Custom footer row -->
    <template #bottom-row>
      <q-tr v-if="total">
        <!-- First cell as a label -->
        <q-td colspan="1" class="text-left text-bold text-primary"> Total </q-td>

        <!-- Example: loop through numeric columns -->
        <q-td
          v-for="col in columns.filter((c) => c.name !== 'actions')"
          :key="col.name"
          class="text-left text-bold text-primary"
        >
          {{ sumCol(col) }}
        </q-td>

        <!-- keep the actions column empty -->
        <q-td v-if="columns.some((c) => c.name === 'actions')" />
      </q-tr>

      <!-- simple add/edit dialog -->
      <AppDialog
        v-model="showDialog"
        width="400px"
        :title="`${crudMode.toUpperCase()} ${crudType.toUpperCase()}`"
      >
        <template v-if="crudType === 'Row'">
          <div v-for="col in cols" :key="col.column_name" class="q-mb-sm">
            <q-input
              v-if="
                col.data_type !== 'boolean' &&
                (crudMode !== 'Add' || (crudMode === 'Add' && col.column_name !== `${title}id`))
              "
              v-model="formData[col.column_name]"
              :readonly="crudMode === 'Delete' || col.column_name === `${title}id`"
              :type="inputType(col.data_type)"
              :label="col.column_name"
              filled
            />

            <q-checkbox
              v-if="col.data_type === 'boolean'"
              v-model="formData[col.column_name]"
              :label="col.column_name"
            />
          </div>
        </template>
        <div v-else class="row">
          <q-input
            :readonly="crudMode === 'Delete'"
            :class="`col-${7}`"
            v-model="newName"
            type="text"
            label="Name"
            filled
          />
          <datatype-select
            :readOnly="crudMode === 'Delete'"
            class="col q-ml-xs"
            v-model="newType"
          />
        </div>
        <template #actions>
          <q-btn flat label="Cancel" @click="cancel" color="primary" />
          <q-btn flat label="Save" @click="save" color="primary" />
        </template>
      </AppDialog>
    </template>
  </q-table>
</template>
