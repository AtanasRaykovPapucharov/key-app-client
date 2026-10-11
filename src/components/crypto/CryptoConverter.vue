<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useBinanceStore } from 'src/stores/binance'
import cryptoMapper from 'src/helpers/crypto-mapper'
import { getEurUsdcPrice } from 'src/services/web/coingecko'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const emit = defineEmits(['update:amount', 'swap'])

const props = defineProps({
  from: {
    type: String,
    default: 'BTC',
  },
  to: {
    type: String,
    default: 'USDC',
  },
  width: {
    type: String,
    default: 'auto',
  },
  height: {
    type: String,
    default: '130px',
  },
  hidePrice: {
    type: Boolean,
    default: false,
  },
  disable: {
    type: Boolean,
    default: false,
  },
  disableFrom: {
    type: Boolean,
    default: false,
  },
  disableTo: {
    type: Boolean,
    default: false,
  },
  noSwap: {
    type: Boolean,
    default: false,
  },
  swapBeside: {
    type: Boolean,
    default: false,
  },
  amount: {
    type: Number,
    default: () => 1,
  },
  amountFrom: {
    type: Boolean,
    default: false,
  },
})

const from = ref(props.from)
const to = ref(props.to)
const amountValue = ref(Number(props.amount) || 0)
const amountInput = ref(String(amountValue.value))
const result = ref(null)
const resultInput = ref('')
const activeInput = ref(null)
const externalEurUsdcRate = ref(null)

const store = useBinanceStore()

const decimalInput = /^(?:\d+)?(?:\.\d*)?$/

function inputToNumber(value) {
  const text = String(value ?? '').trim()
  if (text === '' || text === '.') return null

  const numericValue = Number(text)
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null
}

function formatInputValue(value) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function updateAmountInput(value) {
  const text = String(value ?? '')
  if (!decimalInput.test(text)) return

  amountInput.value = text
  const numericValue = inputToNumber(text)
  if (numericValue === null) return

  amountValue.value = numericValue
  emit('update:amount', numericValue)
  calcTo()
}

function updateResultInput(value) {
  const text = String(value ?? '')
  if (!decimalInput.test(text)) return

  resultInput.value = text
  const numericValue = inputToNumber(text)
  if (numericValue === null) return

  result.value = numericValue
  calcFrom()
}

function commitAmountInput() {
  activeInput.value = null
  amountInput.value = formatInputValue(inputToNumber(amountInput.value) ?? amountValue.value)
}

function commitResultInput() {
  activeInput.value = null
  resultInput.value = formatInputValue(inputToNumber(resultInput.value) ?? result.value)
}

// All available assets = USDC + every base asset from tickers
const assetOptions = computed(() => {
  const bases = Object.keys(store.tickers).map((sym) => {
    // Strip USDC suffix  e.g. BTCUSDC → BTC
    return sym.replace(/USDC$/, '')
  })
  const all = ['USDC', ...bases]
  return all.map((a) => ({ label: a, value: a }))
})

// Get USD price for any asset (USDC = 1)
function usdPrice(asset) {
  if (asset === 'USDC') return 1
  const ticker = Object.entries(store.tickers).find(
    ([symbol]) => symbol.toUpperCase() === `${asset}USDC`.toUpperCase(),
  )?.[1]
  const price = Number(ticker?.price)
  if (asset === 'EUR' && (!Number.isFinite(price) || price <= 0)) {
    return externalEurUsdcRate.value
  }
  return Number.isFinite(price) && price > 0 ? price : null
}

// Exchange rate: how many `to` per 1 `from`
const rate = computed(() => {
  const fromPrice = usdPrice(from.value)
  const toPrice = usdPrice(to.value)
  if (!fromPrice || !toPrice) return null
  return fromPrice / toPrice
})

// const formattedResult = computed({
//   get() {
//     if (result.value === null) return '—'
//     // Use more decimals for small values
//     const decimals = result.value < 0.01 ? 8 : result.value < 1 ? 6 : 0
//     return result.value.toLocaleString('en-US', {
//       minimumFractionDigits: decimals,
//       maximumFractionDigits: decimals,
//     })
//   },
//   set(newValue) {
//     result.value = newValue
//   },
// })

function calcTo() {
  if (rate.value === null) {
    result.value = null
    resultInput.value = ''
    return
  }

  const currentAmount = amountValue.value || 0
  result.value = currentAmount * rate.value
  if (activeInput.value !== 'result') resultInput.value = formatInputValue(result.value)
}

function calcFrom() {
  if (rate.value === null) {
    result.value = null
    return
  }

  if (props.amountFrom) {
    const nextValue = Number(result.value) / Number(rate.value)
    amountValue.value = Number.isFinite(nextValue) ? nextValue : 0
    if (activeInput.value !== 'amount') amountInput.value = formatInputValue(amountValue.value)
    emit('update:amount', amountValue.value)
  }
}

function swap() {
  const tmp = from.value
  from.value = to.value
  to.value = tmp
  emit('swap', { from: from.value, to: to.value })
  calcTo()
}
// Recalculate whenever live prices, amount, or currencies change
watch(() => store.tickers, calcTo, { deep: true })

watch(
  () => props.amount,
  (newAmount) => {
    const numericAmount = Number(newAmount) || 0
    amountValue.value = numericAmount
    if (activeInput.value !== 'amount' || inputToNumber(amountInput.value) !== numericAmount) {
      amountInput.value = formatInputValue(numericAmount)
    }
    calcTo()
  },
  { immediate: true },
)

watch(
  () => [props.from, props.to],
  (newVal, oldVal) => {
    const [nextFrom, nextTo] = newVal || []
    const [prevFrom, prevTo] = oldVal || []

    if (nextFrom && nextFrom !== prevFrom) from.value = props.from
    if (nextTo && nextTo !== prevTo) to.value = props.to
    calcTo()
  },
  { deep: true, immediate: true },
)

onMounted(async () => {
  externalEurUsdcRate.value = await getEurUsdcPrice()
  calcTo()
})
</script>

<template>
  <div v-if="rate === null && from && to" class="text-caption text-negative text-center">
    {{ t('app.common.labels.missing') }} {{ from }}/{{ to }} {{ t('app.common.labels.priceLower') }}
  </div>

  <q-card dark bordered class="bg-grey-9" :style="{ width, height }">
    <q-card-section
      class="q-pb-sm"
      :style="swapBeside ? { position: 'relative', paddingRight: '48px' } : undefined"
    >
      <!-- Rate line -->
      <div v-if="!hidePrice">
        <div class="text-caption text-secondary text-right" v-if="rate !== null">
          1 {{ from }} =
          {{ rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) }}
          {{ to }}
        </div>
      </div>

      <div>
        <!-- From -->
        <div class="row items-center q-gutter-sm">
          <!-- Amount input -->
          <q-input
            :model-value="amountInput"
            type="text"
            dense
            dark
            filled
            hide-bottom-space
            :disable="rate === null"
            input-class="text-right"
            class="col"
            style="min-width: 90px"
            inputmode="decimal"
            @focus="activeInput = 'amount'"
            @blur="commitAmountInput"
            @update:model-value="updateAmountInput"
          >
            <template #prepend>
              <q-icon name="warning" color="negative" v-if="amountValue < 0" />
            </template>
          </q-input>
          <q-select
            v-model="from"
            :options="!disable && !disableFrom ? assetOptions : [{ label: from, value: from }]"
            :hide-dropdown-icon="disable || disableFrom"
            dense
            dark
            borderless
            hide-bottom-space
            options-dark
            options-dense
            emit-value
            map-options
            class="col-4"
            style="width: 102px"
            @update:model-value="calcTo"
          >
            <template #prepend>
              <q-avatar class="bg-secondary">
                <img :src="cryptoMapper[from]?.logo" />
              </q-avatar>
            </template>
          </q-select>
        </div>

        <!-- Swap button -->
        <div>
          <q-btn
            v-if="!noSwap"
            :style="
              swapBeside
                ? { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }
                : { position: 'absolute', right: '88px' }
            "
            flat
            dense
            round
            class="q-mt-xs"
            icon="swap_vert"
            color="grey-5"
            @click="swap()"
          />
          <br v-if="!noSwap && !swapBeside" />
          <br />
        </div>
        <!-- To -->
        <div class="row items-center q-gutter-sm">
          <!-- Result -->
          <!-- <div class="col text-center q-mt-md" style="min-width: 100px; margin-top: 0px">
            <div class="text-white text-weight-bold" style="font-size: 1.1rem; line-height: 1.2">
              {{ formattedResult }}
            </div>
          </div> -->
          <!-- Amount output -->
          <q-input
            :model-value="resultInput"
            type="text"
            dense
            dark
            filled
            hide-bottom-space
            :disable="rate === null"
            input-class="text-right"
            class="col"
            style="min-width: 90px"
            inputmode="decimal"
            @focus="activeInput = 'result'"
            @blur="commitResultInput"
            @update:model-value="updateResultInput"
          />
          <q-select
            v-model="to"
            :options="!disable && !disableTo ? assetOptions : [{ label: to, value: to }]"
            :hide-dropdown-icon="disable || disableTo"
            dense
            dark
            borderless
            hide-bottom-space
            options-dense
            options-dark
            emit-value
            map-options
            class="col-3"
            style="width: 100px"
            @update:model-value="calcFrom"
          >
            <template #prepend>
              <q-avatar class="bg-secondary">
                <img :src="cryptoMapper[to]?.logo" />
              </q-avatar>
            </template>
          </q-select>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
