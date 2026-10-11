<script setup>
import { useQuasar } from 'quasar'
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PageTitle from 'src/components/PageTitleFactory.vue'
import DialogForm from 'src/components/DialogForm.vue'
import ConfirmForm from 'src/components/forms/ConfirmForm.vue'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/user'
import { getLocalUser } from 'src/services/storage/local'
import tabsArr from '../../helpers/stocks-analisis-data'

const { locale } = useI18n({ useScope: 'global' })
const $q = useQuasar()
const userStore = useUserStore()

const tbl = ref(null)
const tabs = ref(JSON.parse(JSON.stringify(tabsArr)))
const oper = ref('add')
const projectName = ref('')
const symbol = ref('')
const yearFounded = ref(2009)
const savedState = ref('')
const isSaving = ref(false)
const noChanges = computed(() => getFormState() === savedState.value)
// const yearOptions = Array.from(
//   { length: new Date().getFullYear() - 1900 + 1 },
//   (_, index) => 1900 + index,
// )

const companies = ref([])
const filteredCompanies = ref([])
const companiesLoading = ref(false)
const metricsLoading = ref(false)
const selectedCompany = ref(null)
const searchText = ref('')
const searchResults = ref([])
const hasSearched = ref(false)
const searching = ref(false)
const savedAnalyses = ref([])
const selectedSymbolStorageKey = 'cryptool:stocks-analysis:selected-symbol'
let searchTimer
let ignoreSearchChange = false

function getFormState() {
  return JSON.stringify({
    company_name: projectName.value,
    symbol: symbol.value.trim().toUpperCase(),
    year_founded: yearFounded.value,
    test: tabs.value,
  })
}

function markFormClean() {
  savedState.value = getFormState()
}

function resetAnalysisTabs() {
  tabs.value = JSON.parse(JSON.stringify(tabsArr))
}

function applySavedAnalysis(analysis) {
  if (!analysis) return false

  yearFounded.value = analysis.year_founded ?? 2009

  let savedTabs = analysis.test
  if (typeof savedTabs === 'string') {
    try {
      savedTabs = JSON.parse(savedTabs)
    } catch (error) {
      console.error('Failed to parse saved stocks analysis:', error)
      return false
    }
  }

  if (Array.isArray(savedTabs)) tabs.value = savedTabs
  return true
}

async function loadSavedAnalyses() {
  const uid = userStore.user?.uid || getLocalUser()?.uid
  if (!uid) return

  try {
    const { data } = await api.get('/stocks-analysis', {
      headers: { 'x-uid': uid },
    })
    savedAnalyses.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to load saved stocks analyses:', error)
    savedAnalyses.value = []
  }
}

async function loadCompanies() {
  companiesLoading.value = true
  try {
    const response = await api.get('/yahoo/top100', { params: { limit: 100 } })
    companies.value = (response.data.stocks || []).map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      label: `${stock.symbol} — ${stock.name}`,
    }))
    filteredCompanies.value = companies.value
  } catch {
    companies.value = []
    filteredCompanies.value = []
  } finally {
    companiesLoading.value = false
  }
}

function filterCompanies(val, update) {
  update(() => {
    if (!val) {
      filteredCompanies.value = companies.value
      return
    }
    const needle = val.toLowerCase()
    filteredCompanies.value = companies.value.filter(
      (company) =>
        company.symbol.toLowerCase().includes(needle) ||
        company.name.toLowerCase().includes(needle),
    )
  })
}

async function searchSymbols() {
  const query = searchText.value.trim()
  if (!query) return

  searching.value = true
  hasSearched.value = false
  searchResults.value = []
  try {
    const { data } = await api.get('/yahoo/search', { params: { q: query } })
    searchResults.value = Array.isArray(data) ? data : []
    hasSearched.value = true
    const exactMatch = searchResults.value.find(
      (result) => result.symbol?.toUpperCase() === query.toUpperCase(),
    )
    if (exactMatch) selectSearchResult(exactMatch)
  } catch {
    hasSearched.value = true
  } finally {
    searching.value = false
  }
}

function toNumber(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return typeof value.raw === 'number' ? value.raw : null
  return typeof value === 'number' ? value : null
}

function divide(a, b) {
  return a === null || b === null || b === 0 ? null : a / b
}

function multiply(a, b) {
  return a === null || b === null ? null : a * b
}

function percent(value) {
  return value === null ? null : value * 100
}

function round2(value) {
  return value === null ? null : Math.round(value * 100) / 100
}

function buildMetricsByTab(data) {
  const financialData = data?.financialData || {}
  const keyStatistics = data?.defaultKeyStatistics || {}
  const summaryDetail = data?.summaryDetail || {}
  const price = data?.price || {}

  const totalDebt = toNumber(financialData.totalDebt)
  const totalCash = toNumber(financialData.totalCash)
  const ebitda = toNumber(financialData.ebitda)
  const totalRevenue = toNumber(financialData.totalRevenue)
  const freeCashflow = toNumber(financialData.freeCashflow)
  const operatingMargins = toNumber(financialData.operatingMargins)
  const marketCap = toNumber(summaryDetail.marketCap) ?? toNumber(price.marketCap)

  return {
    basics: {
      1: round2(totalDebt),
      5: round2(toNumber(financialData.grossProfits)),
      6: round2(toNumber(keyStatistics.netIncomeToCommon)),
      7: round2(multiply(operatingMargins, totalRevenue)),
      8: round2(multiply(operatingMargins, totalRevenue)),
      9: round2(ebitda),
      10: round2(marketCap),
      11: round2(toNumber(keyStatistics.enterpriseValue)),
      12: round2(toNumber(keyStatistics.trailingEps)),
    },
    debt: {
      1: round2(divide(toNumber(financialData.debtToEquity), 100)),
      2: round2(divide(totalDebt, ebitda)),
      4: round2(toNumber(financialData.currentRatio)),
      5: round2(divide(totalCash, totalDebt)),
    },
    profit: {
      1: round2(toNumber(summaryDetail.trailingPE)),
      2: round2(divide(marketCap, freeCashflow)),
      3: round2(toNumber(keyStatistics.pegRatio)),
      4: round2(toNumber(summaryDetail.priceToSalesTrailing12Months)),
      5: round2(toNumber(keyStatistics.priceToBook)),
    },
    efficiency: {
      2: round2(percent(toNumber(financialData.profitMargins))),
      3: round2(percent(operatingMargins)),
      4: round2(percent(toNumber(financialData.grossMargins))),
      5: round2(percent(toNumber(financialData.returnOnEquity))),
      6: round2(percent(toNumber(financialData.returnOnAssets))),
      8: round2(toNumber(keyStatistics.sharesOutstanding)),
    },
  }
}

function applyMetricsToTabs(data) {
  const metricsByTab = buildMetricsByTab(data)
  tabs.value.forEach((currentTab) => {
    const metrics = metricsByTab[currentTab.name]
    if (!metrics) return
    currentTab.rows.forEach((row) => {
      if (Object.prototype.hasOwnProperty.call(metrics, row.id) && metrics[row.id] !== null) {
        row.real = metrics[row.id]
      }
    })
  })
}

async function loadCompanyMetrics(sym) {
  metricsLoading.value = true
  try {
    const { data } = await api.get(`/yahoo/stock/${encodeURIComponent(sym)}/summary`)
    applyMetricsToTabs(data)
  } catch {
    // keep manual input available if the metrics request fails
  } finally {
    metricsLoading.value = false
  }
}

async function onCompanySelected(value) {
  const company = companies.value.find((item) => item.symbol === value)
  if (!company) return

  await selectCompany(company)
}

async function selectCompany(company) {
  selectedCompany.value = company.symbol
  searchText.value = ''

  projectName.value = company.name
  symbol.value = company.symbol
  localStorage.setItem(selectedSymbolStorageKey, company.symbol)
  yearFounded.value = 2009
  resetAnalysisTabs()
  await loadCompanyMetrics(company.symbol)

  const savedAnalysis = savedAnalyses.value.find(
    (analysis) => analysis.symbol?.toUpperCase() === company.symbol.toUpperCase(),
  )
  applySavedAnalysis(savedAnalysis)
  markFormClean()
}

async function selectSearchResult(result) {
  ignoreSearchChange = true
  searchText.value = result.name || result.symbol
  searchResults.value = []
  hasSearched.value = false
  await selectCompany(result)
}

async function restoreSavedAnalysis() {
  const savedAnalysis =
    savedAnalyses.value.find(
      (analysis) =>
        analysis.symbol?.toUpperCase() ===
        localStorage.getItem(selectedSymbolStorageKey)?.toUpperCase(),
    ) || savedAnalyses.value[0]

  if (!savedAnalysis?.symbol) return

  const company = companies.value.find(
    (item) => item.symbol.toUpperCase() === savedAnalysis.symbol.toUpperCase(),
  )
  symbol.value = savedAnalysis.symbol
  projectName.value = savedAnalysis.company_name || company?.name || savedAnalysis.symbol
  selectedCompany.value = company?.symbol || savedAnalysis.symbol
  resetAnalysisTabs()
  await loadCompanyMetrics(savedAnalysis.symbol)
  applySavedAnalysis(savedAnalysis)
  markFormClean()
}

onMounted(async () => {
  await Promise.all([loadCompanies(), loadSavedAnalyses()])
  await restoreSavedAnalysis()
})

watch(searchText, (value) => {
  if (ignoreSearchChange) {
    ignoreSearchChange = false
    return
  }
  clearTimeout(searchTimer)
  if (String(value || '').trim()) searchTimer = setTimeout(searchSymbols, 500)
})

onBeforeUnmount(() => clearTimeout(searchTimer))

// function resetForm() {
//   projectName.value = ''
//   symbol.value = ''
//   yearFounded.value = 2009
//   oper.value = 'add'
//   markFormClean()
// }

function confirmAction(title, message, okLabel) {
  return new Promise((resolve) => {
    $q.dialog({
      component: DialogForm,
      componentProps: {
        component: ConfirmForm,
        modelValue: { message },
        persistent: true,
        close: true,
        cancel: locale.value !== 'bg-BG' ? 'Cancel' : 'Отказ',
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

async function saveAnalysis() {
  const normalizedSymbol = symbol.value.trim().toUpperCase()
  const companyName = projectName.value.trim()
  const uid = userStore.user?.uid
  if (!uid) {
    $q.notify({
      type: 'warning',
      position: 'top-left',
      message:
        locale.value !== 'bg-BG' ? 'User session is required' : 'Изисква се потребителска сесия',
    })
    return
  }
  if (!companyName || !normalizedSymbol) {
    $q.notify({
      type: 'warning',
      position: 'top-left',
      message:
        locale.value !== 'bg-BG'
          ? 'Company and symbol are required'
          : 'Компанията и символът са задължителни',
    })
    return
  }

  const confirmed = await confirmAction(
    locale.value !== 'bg-BG' ? 'Confirm save' : 'Потвърждение за запис',
    locale.value !== 'bg-BG'
      ? `Save the ${normalizedSymbol} stock analysis?`
      : `Да се запази ли анализът за ${normalizedSymbol}?`,
    locale.value !== 'bg-BG' ? 'Save' : 'Запази',
  )
  if (!confirmed) return

  isSaving.value = true
  try {
    const { data: savedAnalysis } = await api.post(
      '/stocks-analysis',
      {
        symbol: normalizedSymbol,
        company_name: companyName,
        year_founded: yearFounded.value,
        total_points: totalVote.value,
        test: tabs.value,
      },
      { headers: { 'x-uid': uid } },
    )
    const savedIndex = savedAnalyses.value.findIndex(
      (analysis) => analysis.symbol?.toUpperCase() === normalizedSymbol,
    )
    if (savedIndex >= 0) savedAnalyses.value.splice(savedIndex, 1, savedAnalysis)
    else savedAnalyses.value.push(savedAnalysis)
    symbol.value = normalizedSymbol
    markFormClean()
    $q.notify({
      type: 'positive',
      position: 'top-left',
      message: locale.value !== 'bg-BG' ? 'Analysis saved' : 'Анализът е записан',
    })
  } catch (error) {
    console.error('Failed to save stocks analysis:', error)
    $q.notify({
      type: 'negative',
      position: 'top-left',
      message:
        error?.response?.data?.error ||
        (locale.value !== 'bg-BG' ? 'Failed to save analysis' : 'Неуспешен запис на анализа'),
    })
  } finally {
    isSaving.value = false
  }
}

// function deleteMockAnalysis() {
//   const index = mockAnalyses.value.findIndex((item) => item.symbol === symbol.value)
//   if (index < 0) return

//   mockAnalyses.value.splice(index, 1)
//   resetForm()
// }

markFormClean()

const sumMax = computed(() =>
  tbl.value?.[0]?.rows?.reduce((total, row) => total + Number(row.max || 0), 0),
)
const sumVote = computed(() =>
  tbl.value?.[0]?.rows?.reduce((total, row) => total + Number(row.vote || 0), 0),
)

const totalMax = computed(() =>
  tabs.value.reduce(
    (sum, currentTab) =>
      sum + currentTab.rows.reduce((tabSum, row) => tabSum + Number(row.max || 0), 0),
    0,
  ),
)
const totalVote = computed(() =>
  tabs.value.reduce(
    (sum, currentTab) =>
      sum + currentTab.rows.reduce((tabSum, row) => tabSum + Number(row.vote || 0), 0),
    0,
  ),
)

const columns = [
  {
    name: 'label',
    label: '',
    field: 'label',
    align: 'left',
  },
  {
    name: 'formula',
    label: '',
    field: 'formula',
    align: 'left',
  },
  {
    name: 'description',
    label: '',
    field: 'description',
    align: 'left',
  },
  {
    name: 'wanted',
    label: '',
    field: 'wanted',
    align: 'left',
    format: (v) => v || 'YES',
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

const tab = ref('debt')
const splitterModel = ref(20)

function goToSource(url) {
  window.open(`https://${url}`, '_blank')
}

function qRadioColor(i, max) {
  return max == 3
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
}
</script>

<template>
  <div class="q-pa-md">
    <q-card dark bordered class="form-block bg-dark q-pa-md q-mb-md">
      <div class="row q-col-gutter-sm items-center">
        <div class="col-12 col-md-2">
          <PageTitle from="Stocks" title="Analysis" />
        </div>

        <div class="col-12 col-md-1" style="margin-left: 40px">
          <q-select
            v-if="oper === 'load'"
            v-model="symbol"
            :options="[]"
            option-label="symbol"
            option-value="symbol"
            emit-value
            map-options
            color="green-5"
            dark
            dense
            options-dense
            filled
            hide-bottom-space
            :label="locale !== 'bg-BG' ? 'Symbol' : 'Символ'"
            @update:model-value="loadCompanyMetrics"
          />
          <q-input
            v-else
            v-model="symbol"
            color="green-5"
            dark
            dense
            filled
            readonly
            hide-bottom-space
            :label="locale !== 'bg-BG' ? 'Symbol' : 'Символ'"
          />
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-if="oper === 'add'"
            v-model="selectedCompany"
            :options="filteredCompanies"
            option-label="label"
            option-value="symbol"
            emit-value
            map-options
            use-input
            fill-input
            hide-selected
            input-debounce="200"
            color="green-5"
            dark
            dense
            options-dense
            filled
            hide-bottom-space
            :loading="companiesLoading || metricsLoading"
            :label="locale !== 'bg-BG' ? 'Company' : 'Компания'"
            @filter="filterCompanies"
            @update:model-value="onCompanySelected"
          />
          <q-input
            v-else
            v-model="projectName"
            color="green-5"
            dark
            dense
            filled
            hide-bottom-space
            readonly
            :label="locale !== 'bg-BG' ? 'Company' : 'Компания'"
          />
        </div>

        <div class="col-12 col-md-3">
          <q-input
            v-model="searchText"
            color="green-5"
            dark
            dense
            filled
            hide-bottom-space
            :label="locale !== 'bg-BG' ? 'Search' : 'Търсене'"
            @keyup.enter="searchSymbols"
          >
            <template #prepend>
              <q-btn
                flat
                round
                dense
                color="green-5"
                icon="search"
                :loading="searching"
                @click="searchSymbols"
              />
            </template>
          </q-input>
          <q-list
            v-if="searchResults.length"
            bordered
            class="bg-grey-9 q-mt-sm"
            style="max-width: 600px; z-index: 1000; position: absolute"
          >
            <q-item
              v-for="result in searchResults"
              :key="`${result.symbol}-${result.exchange}`"
              clickable
              @click="selectSearchResult(result)"
            >
              <q-item-section>
                <q-item-label>{{ result.symbol }} · {{ result.name }}</q-item-label>
                <q-item-label caption class="text-secondary">
                  {{ result.exchange }} · {{ result.type }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-banner v-else-if="hasSearched" rounded class="bg-grey-9 text-grey-4 q-mt-sm">
            {{ locale !== 'bg-BG' ? 'No matching companies found.' : 'Няма намерени компании.' }}
          </q-banner>
        </div>

        <div class="col-12 col-md-2 text-right">
          <div class="text-caption text-secondary">
            {{ locale !== 'bg-BG' ? 'Total points' : 'Общо точки' }}
          </div>
          <div class="text-h5 text-green-5">{{ totalVote }} / {{ totalMax }}</div>
        </div>
        <div class="col-12 col-md">
          <q-btn
            flat
            square
            stack
            icon="save"
            label="Save"
            color="secondary"
            :disable="isSaving || noChanges || !projectName.trim() || !symbol.trim()"
            @click="saveAnalysis"
          />
        </div>
      </div>
    </q-card>

    <q-splitter v-model="splitterModel" style="height: 750px">
      <template #:before>
        <q-tabs v-model="tab" vertical class="text-green-5" dense no-caps>
          <q-tab
            v-for="t in tabs"
            :key="t.id"
            :name="t.name"
            :label="locale !== 'bg-BG' ? t.label : t.labelBg"
          />
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
              :columns="
                columns.filter((c) => !c.hide && !(t.name === 'basics' && c.name === 'vote'))
              "
              :rows-per-page-options="[0]"
              class="text-secondary"
              row-key="id"
            >
              <template #header-cell-label="props">
                <q-th :props="props">
                  <div class="text-h6 text-green-5 q-mb-sm">
                    {{ locale !== 'bg-BG' ? t.label : t.labelBg }}
                  </div>
                </q-th>
              </template>
              <template #header-cell-formula="props">
                <q-th :props="props">
                  <div>
                    {{ locale !== 'bg-BG' ? 'Formula' : 'Формула' }}
                  </div>
                </q-th>
              </template>
              <template #header-cell-description="props">
                <q-th :props="props">
                  <div>
                    {{ locale !== 'bg-BG' ? 'Description' : 'Описание' }}
                  </div>
                </q-th>
              </template>
              <template #header-cell-wanted="props">
                <q-th :props="props">
                  <div>{{ locale !== 'bg-BG' ? 'Wanted' : 'Желателно' }}</div>
                </q-th>
              </template>
              <template #header-cell-real="props">
                <q-th :props="props">
                  <div>{{ locale !== 'bg-BG' ? 'Real value' : 'Реална стойност' }}</div>
                </q-th>
              </template>
              <template #header-cell-vote="props">
                <q-th :props="props">
                  <strong
                    >{{ sumVote }} / {{ sumMax }}
                    {{ locale !== 'bg-BG' ? 'points' : 'точки' }}</strong
                  >
                </q-th>
              </template>
              <template #body-cell-real="props">
                <q-td :props="props" class="text-white">
                  <q-input
                    v-model="props.row.real"
                    type="number"
                    color="green-5"
                    dark
                    dense
                    filled
                    readonly
                    hide-bottom-space
                    :style="{ maxWidth: t.name === 'basics' ? '200px' : '120px' }"
                  >
                    <template #append>
                      <q-icon name="edit" class="cursor-pointer">
                        <q-popup-edit
                          class="bg-grey-9"
                          v-model="props.row.real"
                          #default="scope"
                          :title="locale !== 'bg-BG' ? 'Edit value:' : 'Редактирай:'"
                        >
                          <q-btn
                            dense
                            flat
                            icon="close"
                            size="sm"
                            style="position: absolute; top: 5px; right: 5px"
                            @click="scope.cancel"
                          />
                          <q-input
                            v-model="scope.value"
                            type="number"
                            input-class="text-secondary"
                            dense
                            autofocus
                            @keyup.enter="scope.set"
                          >
                            <template #append>
                              <q-btn
                                flat
                                color="secondary"
                                label="SET"
                                class="cursor-pointer"
                                @click="scope.set"
                              />
                            </template>
                          </q-input>
                        </q-popup-edit>
                      </q-icon>
                    </template>
                  </q-input>
                </q-td>
              </template>
              <template #body-cell-vote="props">
                <q-td :props="props" class="text-white">
                  <q-radio
                    v-for="i in props.row.max"
                    :key="i"
                    v-model="props.row.vote"
                    :val="i"
                    :label="String(i)"
                    left-label
                    dark
                    dense
                    size="xs"
                    class="q-mr-sm"
                    :color="qRadioColor(i, props.row.max)"
                  />
                </q-td>
              </template>
              <template #body-cell-formula="props">
                <q-td
                  :props="props"
                  class="text-white"
                  style="max-width: 360px; white-space: pre-wrap; /* overflow-wrap: break-word; */"
                >
                  <span class="text-secondary">
                    {{ locale !== 'bg-BG' ? props.row.formula : props.row.formulaBg }}
                  </span>
                </q-td>
              </template>
              <template #body-cell-label="props">
                <q-td :props="props" class="text-white">
                  <span class="text-secondary">
                    {{ locale !== 'bg-BG' ? props.row.label : props.row.labelBg }}
                  </span>
                  <span v-if="props.row.required" class="text-red-5 q-ml-sm">!!!</span>
                </q-td>
              </template>
              <template #body-cell-description="props">
                <q-td
                  :props="props"
                  class="text-white"
                  style="max-width: 360px; white-space: pre-wrap; overflow-wrap: break-word"
                >
                  <span class="text-secondary">{{
                    locale !== 'bg-BG' ? props.row.description : props.row.descriptionBg
                  }}</span>
                </q-td>
              </template>

              <template #bottom>
                <div>
                  <span class="text-secondary">
                    {{ locale !== 'bg-BG' ? 'Resources: ' : 'Източници: ' }}
                  </span>
                  <q-btn
                    v-for="(s, i) in t.sources"
                    :key="i"
                    :label="s"
                    @click="goToSource(s)"
                    class="text-green-5"
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
