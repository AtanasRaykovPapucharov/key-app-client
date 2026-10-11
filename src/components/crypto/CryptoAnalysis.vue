<script setup>
import { useQuasar } from 'quasar'
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import PageTitle from 'src/components/PageTitleFactory.vue'
import DialogForm from 'src/components/DialogForm.vue'
import ConfirmForm from 'src/components/forms/ConfirmForm.vue'
import tabsData from 'src/helpers/crypto-analysis-tabs.json'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/user'
import { useLocalized } from 'src/composables/useLocalized'

const { t: tt, field } = useLocalized()

const $q = useQuasar()
const userStore = useUserStore()

const noChanges = ref(true)

const columns = [
  {
    name: 'label',
    label: '',
    field: 'label',
    align: 'left',
  },
  {
    name: 'wanted',
    label: '',
    field: 'wanted',
    align: 'left',
    format: (v) => (!v ? 'NO' : typeof v === 'string' ? v : 'YES'),
  },
  {
    name: 'real',
    label: '',
    field: 'real',
    align: 'left',
  },
  {
    name: 'vote',
    label: '',
    field: 'vote',
    align: 'left',
  },
]

const tbl = ref(null)

const sumMax = computed(() =>
  tbl.value?.[0]?.rows?.reduce((total, row) => total + Number(row.max || 0), 0),
)
const sumVote = computed(() =>
  tbl.value?.[0]?.rows?.reduce((total, row) => total + Number(row.vote || 0), 0),
)

const splitterModel = ref(20)

const tabs = ref(JSON.parse(JSON.stringify(tabsData)))
const tab = ref('supply')
const oper = ref('add')
const projectName = ref('')
const currency = ref('')
const yearFounded = ref(2009)
const cryptoAnalyses = ref([])
const savedState = ref('')
const projectNameField = ref(null)
const currencyField = ref(null)

function getAnalysisState() {
  return JSON.stringify({
    project_name: projectName.value,
    crypto_id: currency.value.toLowerCase(),
    project_year: yearFounded.value,
    test: tabs.value,
  })
}

function markAnalysisClean() {
  savedState.value = getAnalysisState()
  noChanges.value = true
}

markAnalysisClean()

const totalMax = computed(() =>
  tabs.value.reduce((sum, t) => sum + t.rows.reduce((s, row) => s + Number(row.max || 0), 0), 0),
)
const totalVote = computed(() =>
  tabs.value.reduce((sum, t) => sum + t.rows.reduce((s, row) => s + Number(row.vote || 0), 0), 0),
)

function goToSource(url) {
  window.open(`https://${url}`, '_blank')
}

async function loadCryptoAnalyses() {
  try {
    const { data } = await api.get('/crypto-analysis')
    cryptoAnalyses.value = data
    if (oper.value === 'load') loadProject(currency.value)
    return true
  } catch (error) {
    console.error('Failed to load crypto analyses:', error)
    return false
  }
}

async function refreshAnalysis() {
  projectName.value = ''
  currency.value = ''
  yearFounded.value = 2009
  tabs.value = JSON.parse(JSON.stringify(tabsData))
  markAnalysisClean()

  await nextTick()
  projectNameField.value?.resetValidation()
  currencyField.value?.resetValidation()
}

function confirmAction(title, message, okLabel) {
  return new Promise((resolve) => {
    $q.dialog({
      component: DialogForm,
      componentProps: {
        component: ConfirmForm,
        modelValue: { message },
        persistent: true,
        close: true,
        cancel: tt('app.common.actions.cancel'),
        ok: okLabel,
        width: '380px',
        title,
      },
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false))
  })
}

async function deleteAnalysis() {
  const cryptoId = currency.value.trim().toLowerCase()
  if (!cryptoId) return

  const confirmed = await confirmAction(
    tt('app.crypto.analysis.confirmDelete'),
    tt('app.crypto.analysis.deleteQuestion', { symbol: cryptoId.toUpperCase() }),
    tt('app.crypto.analysis.delete'),
  )

  if (!confirmed) return

  try {
    await api.delete(`/crypto-analysis/${encodeURIComponent(cryptoId)}`, {
      headers: { 'x-uid': userStore.user?.uid },
    })
    await loadCryptoAnalyses()
    await refreshAnalysis()
    $q.notify({
      type: 'positive',
      position: 'top-left',
      message: tt('app.crypto.analysis.analysisDeleted'),
    })
  } catch (error) {
    console.error('Failed to delete crypto analysis:', error)
    $q.notify({
      type: 'negative',
      position: 'top-left',
      message: tt('app.crypto.analysis.failedToDeleteAnalysis'),
    })
  }
}

function loadProject(value) {
  const project = cryptoAnalyses.value.find(
    (item) => item.crypto_id?.toLowerCase() === value?.toLowerCase(),
  )
  if (!project) return

  projectName.value = project.project_name
  yearFounded.value = project.project_year

  let loadedTabs = project.test
  if (typeof loadedTabs === 'string') {
    try {
      loadedTabs = JSON.parse(loadedTabs)
    } catch (error) {
      console.error('Failed to parse saved crypto analysis:', error)
      return
    }
  }
  if (Array.isArray(loadedTabs)) tabs.value = loadedTabs
  markAnalysisClean()
}

onMounted(loadCryptoAnalyses)

async function saveAnalysis() {
  const uid = userStore.user?.uid
  if (!uid) return

  if (!projectName.value.trim() || !currency.value.trim()) {
    $q.notify({
      type: 'warning',
      position: 'top-left',
      message: tt('app.crypto.analysis.projectNameAndCurrency'),
    })
    return
  }

  const existingAnalysis = cryptoAnalyses.value.some(
    (item) => item.crypto_id?.toLowerCase() === currency.value.trim().toLowerCase(),
  )
  const shouldUpdate = oper.value === 'add' && existingAnalysis

  const confirmed = await confirmAction(
    shouldUpdate ? tt('app.crypto.analysis.confirmUpdate') : tt('app.crypto.analysis.confirmSave'),
    shouldUpdate ? tt('app.crypto.analysis.existsUpdate') : tt('app.crypto.analysis.areYouSureYou'),
    shouldUpdate ? tt('app.crypto.analysis.update') : tt('app.crypto.analysis.save'),
  )

  if (!confirmed) return

  const data = {
    project_name: projectName.value,
    crypto_id: currency.value.toLowerCase(),
    project_year: yearFounded.value,
    total_points: totalVote.value,
    test: tabs.value,
  }

  try {
    await api.post('/crypto-analysis', data, {
      headers: { 'x-uid': uid },
    })
    await loadCryptoAnalyses()
    markAnalysisClean()
    $q.notify({
      type: 'positive',
      position: 'top-left',
      message: tt('app.crypto.analysis.analysisSaved'),
    })
  } catch (error) {
    console.error('Failed to save crypto analysis:', error)
    $q.notify({
      type: 'negative',
      position: 'top-left',
      message: tt('app.crypto.analysis.failedToSaveAnalysis'),
    })
  }
}

watch(
  [projectName, currency, yearFounded, tabs],
  () => {
    noChanges.value = getAnalysisState() === savedState.value
  },
  { deep: true },
)

watch(oper, (value) => {
  if (value === 'add') {
    projectName.value = ''
    currency.value = ''
    yearFounded.value = 2009
    tabs.value = JSON.parse(JSON.stringify(tabsData))
    markAnalysisClean()
  } else {
    currency.value = 'btc'
    loadProject(currency.value)
  }
})
</script>

<template>
  <!-- <div class="row title-block q-pa-md">
    <PageTitle from="Crypto" title="Analysis" />
    <q-space />
    <div>
      <q-btn icon="save" :label="tt('app.common.actions.save')" :disable="noChanges" @click="saveAnalysis" />
    </div>
  </div> -->
  <div class="q-pa-md">
    <q-card dark bordered class="form-block bg-dark q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-2">
          <PageTitle from="Crypto" title="Analysis" />
        </div>
        <div class="col-12 col-md-3 row items-center no-wrap q-pl-none q-ml-n-md">
          <q-btn-toggle
            v-model="oper"
            size="md"
            padding="4px 8px"
            toggle-color="orange-5"
            class="no-wrap"
            style="flex-shrink: 0"
            :options="[
              { value: 'add', slot: 'add' },
              { value: 'load', slot: 'load' },
            ]"
          >
            <template #add>
              <div class="row items-center no-wrap">
                <q-icon center name="add" /> {{ tt('app.common.actions.add') }}
              </div>
            </template>
            <template #load>
              <div class="row items-center no-wrap">
                <q-icon center name="autorenew" /> {{ tt('app.common.actions.load') }}
              </div>
            </template>
          </q-btn-toggle>
          <q-btn
            flat
            icon="restart_alt"
            :label="tt('app.common.actions.reset')"
            no-caps
            size="md"
            padding="4px 8px"
            color="secondary"
            class="q-ml-xs refresh-action"
            style="flex-shrink: 0"
            @click="refreshAnalysis"
          >
            <q-tooltip>{{ tt('app.crypto.analysis.resetFields') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            icon="delete"
            :label="tt('app.common.actions.delete')"
            no-caps
            size="md"
            padding="4px 8px"
            color="negative"
            class="q-ml-xs"
            style="flex-shrink: 0"
            :disable="oper !== 'load' || !currency"
            @click="deleteAnalysis"
          >
            <q-tooltip>{{ tt('app.crypto.analysis.deleteAnalysis') }}</q-tooltip>
          </q-btn>
        </div>
        <div class="col-12 col-md-2 q-ml-sm">
          <q-input
            ref="projectNameField"
            v-model="projectName"
            color="orange-5"
            dark
            dense
            options-dense
            filled
            hide-bottom-space
            :readonly="oper === 'load'"
            :rules="[(value) => Boolean(value?.trim()) || tt('app.crypto.analysis.required')]"
            :label="tt('app.crypto.analysis.projectName')"
          />
        </div>
        <div class="col-12 col-md-1">
          <q-select
            ref="currencyField"
            v-if="oper === 'load'"
            v-model="currency"
            :options="cryptoAnalyses"
            :option-label="(option) => option.crypto_id?.toUpperCase()"
            option-value="crypto_id"
            emit-value
            map-options
            color="orange-5"
            dark
            dense
            options-dense
            filled
            hide-bottom-space
            popup-content-class="hide-scrollbar"
            @update:model-value="loadProject"
            :rules="[(value) => Boolean(value) || tt('app.crypto.analysis.required')]"
            :label="tt('app.crypto.analysis.currency')"
          />
          <q-input
            ref="currencyField"
            v-else
            v-model="currency"
            color="orange-5"
            dark
            dense
            filled
            hide-bottom-space
            :rules="[(value) => Boolean(value?.trim()) || tt('app.crypto.analysis.required')]"
            :label="tt('app.crypto.analysis.currency')"
          />
        </div>
        <div class="col-12 col-md-1">
          <q-select
            v-model="yearFounded"
            popup-content-class="hide-scrollbar"
            color="orange-5"
            dark
            dense
            options-dense
            :readonly="oper === 'load'"
            :options="
              Array.from({ length: new Date().getFullYear() - 2009 + 1 }, (_, i) => 2009 + i)
            "
            :label="tt('app.crypto.analysis.yearFounded')"
          />
        </div>
        <div class="col-12 col-md-2 text-right">
          <div class="text-caption text-secondary">
            {{ tt('app.crypto.analysis.totalPoints') }}
          </div>
          <div class="text-h5 text-orange-5">{{ totalVote }} / {{ totalMax }}</div>
        </div>
        <div class="col-12 col-md">
          <q-btn
            flat
            square
            stack
            icon="save"
            :label="tt('app.common.actions.save')"
            color="secondary"
            :disable="noChanges"
            @click="saveAnalysis"
            style="position: absolute; top: 14px; right: 14px"
          />
        </div>
      </div>
    </q-card>

    <q-splitter v-model="splitterModel">
      <template #before>
        <q-tabs v-model="tab" vertical class="text-orange-5" dense no-caps>
          <q-tab v-for="t in tabs" :key="t.id" :name="t.name" :label="field(t, 'label')" />
        </q-tabs>
      </template>

      <template #after>
        <q-tab-panels
          v-model="tab"
          class="bg-dark"
          animated
          swipeable
          vertical
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel v-for="t in tabs" :key="t.id" :name="t.name">
            <q-table
              ref="tbl"
              dark
              :rows="t.rows"
              :columns="columns.filter((c) => !c.hide)"
              :rows-per-page-options="[0]"
              class="text-secondary"
              row-key="id"
            >
              <template #header-cell-label="props">
                <q-th :props="props">
                  <div class="text-h6 q-mb-sm">{{ field(t, 'label') }}</div>
                </q-th>
              </template>
              <template #header-cell-wanted="props">
                <q-th :props="props">
                  <div>{{ tt('app.crypto.analysis.wantedValue') }}</div>
                </q-th>
              </template>
              <template #header-cell-real="props">
                <q-th :props="props">
                  <div>{{ tt('app.crypto.analysis.realValue') }}</div>
                </q-th>
              </template>
              <template #header-cell-vote="props">
                <q-th :props="props">
                  <strong
                    >{{ sumVote }} / {{ sumMax }} {{ tt('app.crypto.analysis.points') }}</strong
                  >
                </q-th>
              </template>
              <template #body-cell-vote="props">
                <q-td :props="props" class="text-white">
                  <q-radio
                    v-for="i in props.row.max"
                    :key="i"
                    v-model="props.row.vote"
                    :disable="!!props.row.wanted != !!props.row.real"
                    :val="i"
                    :label="String(i)"
                    left-label
                    dark
                    dense
                    size="xs"
                    class="q-mr-sm"
                    :color="
                      props.row.max == 3
                        ? i == 3
                          ? 'green-5'
                          : i == 2
                            ? 'orange-5'
                            : 'red-5'
                        : i == 5
                          ? 'green-5'
                          : i == 4 || i == 3
                            ? 'orange-5'
                            : 'red-5'
                    "
                  />
                </q-td>
              </template>
              <template #body-cell-real="props">
                <q-td :props="props" class="text-white">
                  <q-checkbox
                    v-model="props.row.real"
                    dense
                    dark
                    keep-color
                    size="sm"
                    :label="!props.row.real ? 'NO' : 'YES'"
                    :color="
                      !props.row.wanted
                        ? !props.row.real
                          ? 'green-6'
                          : 'red-5'
                        : !props.row.real
                          ? 'red-5'
                          : 'green-6'
                    "
                    style="bg-green"
                    @update:model-value="
                      !!$event !== !!props.row.wanted
                        ? (props.row.vote = 1)
                        : (props.row.vote = props.row.vote)
                    "
                  />
                </q-td>
              </template>
              <template #body-cell-label="props">
                <q-td :props="props" class="text-white">
                  <span class="text-secondary">{{ field(props.row, 'label') }}</span>
                </q-td>
              </template>

              <template #bottom>
                <div>
                  <span class="text-secondary">
                    {{ tt('app.crypto.analysis.resources') }}
                  </span>
                  <q-btn
                    v-for="(s, i) in t.sources"
                    :key="i"
                    :label="s"
                    class="text-orange-4"
                    @click="goToSource(s)"
                    dense
                    flat
                    no-caps
                    size="md"
                  />
                </div>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
</template>

<style scoped>
.refresh-action :deep(.q-icon) {
  margin-right: 2px !important;
}
</style>
