<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts'
import { createBinanceWs, candlesBinanceHistory } from 'src/services/web/binance'
import { getLongTermCandles } from 'src/services/web/coingecko'
import {
  movingAverage,
  ema,
  bollingerBands,
  rsi,
  macd,
  parabolicSAR,
  supertrend,
  avgVolumeLine,
  kdj,
  obv,
  williamsR,
  stochRSI,
} from 'src/services/algo'
import { useBinanceStore } from 'src/stores/binance'
import CryptoDropdown from 'src/components/select/CryptoDropdown.vue'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const emit = defineEmits([
  'update:symbol',
  'update:range',
  'update:interval',
  'update:chartMode',
  'update:logScale',
  'update:maShort',
  'update:maLong',
  'update:emaShort',
  'update:emaLong',
  'update:bbPeriod',
  'update:bbMult',
  'update:sarStep',
  'update:sarMax',
  'update:superPeriod',
  'update:superMult',
  'update:avlPeriod',
  'update:rsiPeriod',
  'update:rsiOverbought',
  'update:rsiOversold',
  'update:macdFast',
  'update:macdSlow',
  'update:macdSignal',
  'update:indicators',
  'update:signal',
  'update:candles',
])

// ── Store ─────────────────────────────────────────────────────────────────────
const binanceStore = useBinanceStore()

// ── Props ─────────────────────────────────────────────────────────────────────
const props = defineProps({
  symbol: { type: String, default: () => 'BTCUSDC' },
  wanted: { type: Array },
  controls: { type: Boolean, default: false },
  hideHeader: { type: Boolean, default: false },
  dropDown: { type: Boolean, default: true },
  range: { type: String, default: 'short' }, // 'short', '90', '365', '1825', 'max'
  interval: { type: String, default: '1h' }, // '1h', '1d', '3d', '1w', '1M', 'auto'
  chartMode: { type: String, default: 'candles' }, // 'candles' | 'area'
  logScale: { type: Boolean, default: false },
  showRangeControls: { type: Boolean, default: true },
  maShort: { type: Number, default: 5 },
  maLong: { type: Number, default: 20 },
  emaShort: { type: Number, default: 9 },
  emaLong: { type: Number, default: 21 },
  bbPeriod: { type: Number, default: 20 },
  bbMult: { type: Number, default: 2 },
  sarStep: { type: Number, default: 0.02 },
  sarMax: { type: Number, default: 0.2 },
  superPeriod: { type: Number, default: 10 },
  superMult: { type: Number, default: 3 },
  avlPeriod: { type: Number, default: 20 },
  rsiPeriod: { type: Number, default: 14 },
  rsiOverbought: { type: Number, default: 70 },
  rsiOversold: { type: Number, default: 30 },
  macdFast: { type: Number, default: 12 },
  macdSlow: { type: Number, default: 26 },
  macdSignal: { type: Number, default: 9 },
})

const cryptosymbol = computed({
  get() {
    return props.symbol
  },
  set(newValue) {
    emit('update:symbol', newValue)
  },
})

// ── Coin & Symbol Mapping ─────────────────────────────────────────────────────
const COIN_MAP = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  XLM: 'stellar',
  LTC: 'litecoin',
  LINK: 'chainlink',
  DOT: 'polkadot',
  DOGE: 'dogecoin',
  TRX: 'tron',
  AVAX: 'avalanche-2',
}

const SYMBOL_MAP = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  binancecoin: 'BNB',
  ripple: 'XRP',
  cardano: 'ADA',
  stellar: 'XLM',
  litecoin: 'LTC',
  chainlink: 'LINK',
  polkadot: 'DOT',
  dogecoin: 'DOGE',
  tron: 'TRX',
  'avalanche-2': 'AVAX',
}

function symbolToCoinId(sym) {
  if (!sym) return 'bitcoin'
  const lower = sym.toLowerCase()
  if (SYMBOL_MAP[lower]) return lower
  const base = sym.replace(/(USDC|USDT|BUSD|USD)$/i, '').toUpperCase()
  return COIN_MAP[base] || lower
}

// ── Range & Mode State ────────────────────────────────────────────────────────
const selectedRange = ref(props.range)
const selectedInterval = ref(props.interval)
const selectedMode = ref(props.chartMode)
const isLogScale = ref(props.logScale)
const loading = ref(false)

watch(
  () => props.range,
  (val) => {
    if (val && val !== selectedRange.value) selectedRange.value = val
  },
)
watch(
  () => props.interval,
  (val) => {
    if (val && val !== selectedInterval.value) selectedInterval.value = val
  },
)
watch(
  () => props.chartMode,
  (val) => {
    if (val && val !== selectedMode.value) selectedMode.value = val
  },
)
watch(
  () => props.logScale,
  (val) => {
    if (val !== isLogScale.value) isLogScale.value = val
  },
)

// ── MA configuration state ───────────────────────────────────────────────────
const maShortPeriod = ref(props.maShort || 5)
const maLongPeriod = ref(props.maLong || 20)

const maPreset = computed(() => {
  if (maShortPeriod.value === 5 && maLongPeriod.value === 20) return '5/20'
  if (maShortPeriod.value === 50 && maLongPeriod.value === 200) return '50/200'
  return 'custom'
})

function selectMaPreset(preset) {
  if (preset === '5/20') {
    maShortPeriod.value = 5
    maLongPeriod.value = 20
  } else if (preset === '50/200') {
    maShortPeriod.value = 50
    maLongPeriod.value = 200
  }
  if (!indicators.value.ma) indicators.value.ma = true
  if (candles.length) updateMAIndicator(candles.map((c) => c.close))
}

function onCustomMaChange() {
  if (!indicators.value.ma) indicators.value.ma = true
  if (candles.length) updateMAIndicator(candles.map((c) => c.close))
}

watch(
  () => props.maShort,
  (val) => {
    if (val && val !== maShortPeriod.value) maShortPeriod.value = val
  },
)
watch(
  () => props.maLong,
  (val) => {
    if (val && val !== maLongPeriod.value) maLongPeriod.value = val
  },
)

watch([maShortPeriod, maLongPeriod], ([sVal, lVal]) => {
  emit('update:maShort', sVal)
  emit('update:maLong', lVal)
  if (candles.length) updateMAIndicator(candles.map((c) => c.close))
})

// ── EMA configuration state ──────────────────────────────────────────────────
const emaShortPeriod = ref(props.emaShort || 9)
const emaLongPeriod = ref(props.emaLong || 21)

const emaPreset = computed(() => {
  if (emaShortPeriod.value === 9 && emaLongPeriod.value === 21) return '9/21'
  if (emaShortPeriod.value === 12 && emaLongPeriod.value === 26) return '12/26'
  if (emaShortPeriod.value === 20 && emaLongPeriod.value === 50) return '20/50'
  return 'custom'
})

function selectEmaPreset(preset) {
  if (preset === '9/21') {
    emaShortPeriod.value = 9
    emaLongPeriod.value = 21
  } else if (preset === '12/26') {
    emaShortPeriod.value = 12
    emaLongPeriod.value = 26
  } else if (preset === '20/50') {
    emaShortPeriod.value = 20
    emaLongPeriod.value = 50
  }
  if (!indicators.value.ema) indicators.value.ema = true
  if (candles.length) updateEMAIndicator(candles.map((c) => c.close))
}

function onCustomEmaChange() {
  if (!indicators.value.ema) indicators.value.ema = true
  if (candles.length) updateEMAIndicator(candles.map((c) => c.close))
}

watch(
  () => props.emaShort,
  (val) => {
    if (val && val !== emaShortPeriod.value) emaShortPeriod.value = val
  },
)
watch(
  () => props.emaLong,
  (val) => {
    if (val && val !== emaLongPeriod.value) emaLongPeriod.value = val
  },
)

watch([emaShortPeriod, emaLongPeriod], ([sVal, lVal]) => {
  emit('update:emaShort', sVal)
  emit('update:emaLong', lVal)
  if (candles.length) updateEMAIndicator(candles.map((c) => c.close))
})

// ── Bollinger Bands configuration state ───────────────────────────────────────
const bbPeriodState = ref(props.bbPeriod || 20)
const bbMultState = ref(props.bbMult || 2)

const bbPreset = computed(() => {
  if (bbPeriodState.value === 20 && bbMultState.value === 2) return '20/2'
  if (bbPeriodState.value === 20 && bbMultState.value === 2.5) return '20/2.5'
  return 'custom'
})

function selectBbPreset(preset) {
  if (preset === '20/2') {
    bbPeriodState.value = 20
    bbMultState.value = 2
  } else if (preset === '20/2.5') {
    bbPeriodState.value = 20
    bbMultState.value = 2.5
  }
  if (!indicators.value.bb) indicators.value.bb = true
  if (candles.length) updateBBIndicator(candles.map((c) => c.close))
}

function onCustomBbChange() {
  if (!indicators.value.bb) indicators.value.bb = true
  if (candles.length) updateBBIndicator(candles.map((c) => c.close))
}

watch(
  () => props.bbPeriod,
  (val) => {
    if (val && val !== bbPeriodState.value) bbPeriodState.value = val
  },
)
watch(
  () => props.bbMult,
  (val) => {
    if (val && val !== bbMultState.value) bbMultState.value = val
  },
)

watch([bbPeriodState, bbMultState], ([pVal, mVal]) => {
  emit('update:bbPeriod', pVal)
  emit('update:bbMult', mVal)
  if (candles.length) updateBBIndicator(candles.map((c) => c.close))
})

// ── Parabolic SAR configuration state ─────────────────────────────────────────
const sarStepState = ref(props.sarStep || 0.02)
const sarMaxState = ref(props.sarMax || 0.2)

const sarPreset = computed(() => {
  if (sarStepState.value === 0.02 && sarMaxState.value === 0.2) return '0.02/0.2'
  if (sarStepState.value === 0.01 && sarMaxState.value === 0.1) return '0.01/0.1'
  return 'custom'
})

function selectSarPreset(preset) {
  if (preset === '0.02/0.2') {
    sarStepState.value = 0.02
    sarMaxState.value = 0.2
  } else if (preset === '0.01/0.1') {
    sarStepState.value = 0.01
    sarMaxState.value = 0.1
  }
  if (!indicators.value.sar) indicators.value.sar = true
  if (candles.length) updateSARIndicator()
}

function onCustomSarChange() {
  if (!indicators.value.sar) indicators.value.sar = true
  if (candles.length) updateSARIndicator()
}

watch(
  () => props.sarStep,
  (val) => {
    if (val && val !== sarStepState.value) sarStepState.value = val
  },
)
watch(
  () => props.sarMax,
  (val) => {
    if (val && val !== sarMaxState.value) sarMaxState.value = val
  },
)

watch([sarStepState, sarMaxState], ([stVal, mxVal]) => {
  emit('update:sarStep', stVal)
  emit('update:sarMax', mxVal)
  if (candles.length) updateSARIndicator()
})

// ── Supertrend configuration state ────────────────────────────────────────────
const superPeriodState = ref(props.superPeriod || 10)
const superMultState = ref(props.superMult || 3)

const superPreset = computed(() => {
  if (superPeriodState.value === 10 && superMultState.value === 3) return '10/3'
  if (superPeriodState.value === 10 && superMultState.value === 2) return '10/2'
  return 'custom'
})

function selectSuperPreset(preset) {
  if (preset === '10/3') {
    superPeriodState.value = 10
    superMultState.value = 3
  } else if (preset === '10/2') {
    superPeriodState.value = 10
    superMultState.value = 2
  }
  if (!indicators.value.super) indicators.value.super = true
  if (candles.length) updateSuperIndicator()
}

function onCustomSuperChange() {
  if (!indicators.value.super) indicators.value.super = true
  if (candles.length) updateSuperIndicator()
}

watch(
  () => props.superPeriod,
  (val) => {
    if (val && val !== superPeriodState.value) superPeriodState.value = val
  },
)
watch(
  () => props.superMult,
  (val) => {
    if (val && val !== superMultState.value) superMultState.value = val
  },
)

watch([superPeriodState, superMultState], ([pVal, mVal]) => {
  emit('update:superPeriod', pVal)
  emit('update:superMult', mVal)
  if (candles.length) updateSuperIndicator()
})

// ── AVL configuration state ───────────────────────────────────────────────────
const avlPeriodState = ref(props.avlPeriod || 20)

function selectAvlPreset(preset) {
  avlPeriodState.value = Number(preset) || 20
  if (!indicators.value.avl) indicators.value.avl = true
  if (candles.length) {
    updateAVLIndicator()
    updateVOLIndicator()
  }
}

function onCustomAvlChange() {
  if (!indicators.value.avl) indicators.value.avl = true
  if (candles.length) {
    updateAVLIndicator()
    updateVOLIndicator()
  }
}

watch(
  () => props.avlPeriod,
  (val) => {
    if (val && val !== avlPeriodState.value) avlPeriodState.value = val
  },
)

watch(avlPeriodState, (pVal) => {
  emit('update:avlPeriod', pVal)
  if (candles.length) {
    updateAVLIndicator()
    updateVOLIndicator()
  }
})

// ── RSI configuration state ───────────────────────────────────────────────────
const rsiPeriodState = ref(props.rsiPeriod || 14)
const rsiOverboughtState = ref(props.rsiOverbought || 70)
const rsiOversoldState = ref(props.rsiOversold || 30)

const rsiPreset = computed(() => {
  if (
    rsiPeriodState.value === 14 &&
    rsiOverboughtState.value === 70 &&
    rsiOversoldState.value === 30
  )
    return '14'
  if (
    rsiPeriodState.value === 9 &&
    rsiOverboughtState.value === 80 &&
    rsiOversoldState.value === 20
  )
    return '9'
  return 'custom'
})

function selectRsiPreset(preset) {
  if (preset === '14') {
    rsiPeriodState.value = 14
    rsiOverboughtState.value = 70
    rsiOversoldState.value = 30
  } else if (preset === '9') {
    rsiPeriodState.value = 9
    rsiOverboughtState.value = 80
    rsiOversoldState.value = 20
  }
  if (!indicators.value.rsi) indicators.value.rsi = true
  onCustomRsiChange()
}

function onCustomRsiChange() {
  if (!indicators.value.rsi) indicators.value.rsi = true
  if (candles.length) updateRSIIndicator(candles.map((c) => c.close))
}

watch(
  () => props.rsiPeriod,
  (val) => {
    if (val && val !== rsiPeriodState.value) rsiPeriodState.value = val
  },
)
watch(
  () => props.rsiOverbought,
  (val) => {
    if (val && val !== rsiOverboughtState.value) rsiOverboughtState.value = val
  },
)
watch(
  () => props.rsiOversold,
  (val) => {
    if (val && val !== rsiOversoldState.value) rsiOversoldState.value = val
  },
)

watch([rsiPeriodState, rsiOverboughtState, rsiOversoldState], ([pVal, obVal, osVal]) => {
  emit('update:rsiPeriod', pVal)
  emit('update:rsiOverbought', obVal)
  emit('update:rsiOversold', osVal)
  if (candles.length) updateRSIIndicator(candles.map((c) => c.close))
})

// ── MACD configuration state ──────────────────────────────────────────────────
const macdFastState = ref(props.macdFast || 12)
const macdSlowState = ref(props.macdSlow || 26)
const macdSignalState = ref(props.macdSignal || 9)

const macdPreset = computed(() => {
  if (macdFastState.value === 12 && macdSlowState.value === 26 && macdSignalState.value === 9)
    return '12/26/9'
  if (macdFastState.value === 5 && macdSlowState.value === 35 && macdSignalState.value === 5)
    return '5/35/5'
  return 'custom'
})

function selectMacdPreset(preset) {
  if (preset === '12/26/9') {
    macdFastState.value = 12
    macdSlowState.value = 26
    macdSignalState.value = 9
  } else if (preset === '5/35/5') {
    macdFastState.value = 5
    macdSlowState.value = 35
    macdSignalState.value = 5
  }
  if (!indicators.value.macd) indicators.value.macd = true
  onCustomMacdChange()
}

function onCustomMacdChange() {
  if (!indicators.value.macd) indicators.value.macd = true
  if (candles.length) updateMACDIndicator(candles.map((c) => c.close))
}

watch(
  () => props.macdFast,
  (val) => {
    if (val && val !== macdFastState.value) macdFastState.value = val
  },
)
watch(
  () => props.macdSlow,
  (val) => {
    if (val && val !== macdSlowState.value) macdSlowState.value = val
  },
)
watch(
  () => props.macdSignal,
  (val) => {
    if (val && val !== macdSignalState.value) macdSignalState.value = val
  },
)

watch([macdFastState, macdSlowState, macdSignalState], ([fVal, sVal, sigVal]) => {
  emit('update:macdFast', fVal)
  emit('update:macdSlow', sVal)
  emit('update:macdSignal', sigVal)
  if (candles.length) updateMACDIndicator(candles.map((c) => c.close))
})

// ── Indicator toggle state ────────────────────────────────────────────────────
const indicators = ref({
  ma: props.controls,
  ema: props.controls,
  bb: props.controls,
  sar: true,
  super: true,
  avl: true,
  rsi: false,
  macd: false,
  vol: false,
  kdj: false,
  obv: false,
  wr: false,
  stochRsi: false,
})

const SUB_INDICATORS = ['rsi', 'macd', 'vol', 'kdj', 'obv', 'wr', 'stochRsi']
const SUB_LABELS = computed(() => ({
  rsi: `RSI(${rsiPeriodState.value})`,
  macd: `MACD ${macdFastState.value}/${macdSlowState.value}/${macdSignalState.value}`,
  vol: `VOL(${avlPeriodState.value})`,
  kdj: 'KDJ',
  obv: 'OBV',
  wr: 'WR',
  stochRsi: 'StochRSI',
}))

const activeOscillator = ref('rsi')

const iSignals = ref({
  ma: 'HOLD',
  ema: 'HOLD',
  bb: 'HOLD',
  sar: 'HOLD',
  super: 'HOLD',
  avl: 'HOLD',
  rsi: 'HOLD',
  macd: 'HOLD',
  vol: 'HOLD',
  kdj: 'HOLD',
  obv: 'HOLD',
  wr: 'HOLD',
  stochRsi: 'HOLD',
})

// ── Composite signal ──────────────────────────────────────────────────────────
const composite = computed(() => {
  const active = Object.keys(indicators.value).filter((k) => indicators.value[k])
  if (!active.length)
    return {
      get label() {
        return t('app.crypto.chart.hold')
      },
      buys: 0,
      sells: 0,
      total: 0,
    }

  const total = active.length
  let buys = 0,
    sells = 0
  for (const key of active) {
    if (iSignals.value[key] === 'BUY') buys++
    else if (iSignals.value[key] === 'SELL') sells++
  }

  const label =
    buys > sells && total - (buys + sells) < buys
      ? 'BUY'
      : sells > buys && total - (buys + sells) < sells
        ? 'SELL'
        : 'HOLD'

  return { label, buys, sells, total }
})

const showOscillator = computed(() => SUB_INDICATORS.some((k) => indicators.value[k]))
const enabledOscillators = computed(() => SUB_INDICATORS.filter((k) => indicators.value[k]))

// ── Chart setup ───────────────────────────────────────────────────────────────
const binanceWs = createBinanceWs(props.wanted)
const chartEl = ref(null)
const subChartEl = ref(null)

let chart, subChart
let candles = []

// Main chart series
let series, areaSeries
let maShortSeries, maLongSeries
let emaShortSeries, emaLongSeries
let bbUpperSeries, bbMiddleSeries, bbLowerSeries
let sarBullSeries, sarBearSeries
let superBullSeries, superBearSeries
let avlBarSeries, avlLineSeries

// Sub-chart series
let rsiSeries
let macdLineSeries, macdSignalSeries, macdHistSeries
let volBarSeries, volLineSeries
let kdjKSeries, kdjDSeries, kdjJSeries
let obvSeries
let wrSeries
let stochRsiKSeries, stochRsiDSeries

const CHART_STYLE = {
  layout: { background: { color: '#1d1d1d' }, textColor: '#DDD' },
  grid: { vertLines: { color: '#2a2a2a' }, horzLines: { color: '#2a2a2a' } },
  timeScale: { timeVisible: true },
}

function addSeries(targetChart, type, options = {}) {
  if (typeof targetChart[`add${type}Series`] === 'function') {
    return targetChart[`add${type}Series`](options)
  }
  const map = {
    Candlestick: CandlestickSeries,
    Area: AreaSeries,
    Line: LineSeries,
    Histogram: HistogramSeries,
  }
  return targetChart.addSeries(map[type], options)
}

function dedupeCandles(rows) {
  if (!rows || !Array.isArray(rows)) return []
  const out = []
  const sorted = [...rows]
    .filter((c) => c && Number.isFinite(c.time) && Number.isFinite(c.close))
    .sort((a, b) => a.time - b.time)
  for (const row of sorted) {
    if (out.length && out[out.length - 1].time === row.time) {
      out[out.length - 1] = row
    } else {
      out.push(row)
    }
  }
  return out
}

function initMainChart() {
  if (!chartEl.value || chart) return
  chart = createChart(chartEl.value, {
    ...CHART_STYLE,
    autoSize: true,
    rightPriceScale: {
      mode: isLogScale.value ? 1 : 0,
      scaleMargins: { top: 0.1, bottom: 0.1 },
    },
  })

  series = addSeries(chart, 'Candlestick', {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderVisible: false,
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
  })

  areaSeries = addSeries(chart, 'Area', {
    lineColor: '#f2a900',
    lineWidth: 2,
    topColor: 'rgba(242, 169, 0, 0.40)',
    bottomColor: 'rgba(242, 169, 0, 0.02)',
  })

  maShortSeries = addSeries(chart, 'Line', { color: '#4CAF50', lineWidth: 2, title: 'MA5' })
  maLongSeries = addSeries(chart, 'Line', { color: '#F44336', lineWidth: 2, title: 'MA20' })

  emaShortSeries = addSeries(chart, 'Line', { color: '#00BCD4', lineWidth: 1, title: 'EMA9' })
  emaLongSeries = addSeries(chart, 'Line', { color: '#FF9800', lineWidth: 1, title: 'EMA21' })

  bbUpperSeries = addSeries(chart, 'Line', {
    color: '#78909C',
    lineWidth: 1,
    lineStyle: 2,
    title: 'BB+2σ',
  })
  bbMiddleSeries = addSeries(chart, 'Line', {
    color: '#546E7A',
    lineWidth: 1,
    lineStyle: 2,
    title: 'BBmid',
  })
  bbLowerSeries = addSeries(chart, 'Line', {
    color: '#78909C',
    lineWidth: 1,
    lineStyle: 2,
    title: 'BB-2σ',
  })

  sarBullSeries = addSeries(chart, 'Line', {
    color: '#26a69a',
    lineWidth: 1,
    lineStyle: 4,
    title: 'SAR▲',
  })
  sarBearSeries = addSeries(chart, 'Line', {
    color: '#ef5350',
    lineWidth: 1,
    lineStyle: 4,
    title: 'SAR▼',
  })

  superBullSeries = addSeries(chart, 'Line', { color: '#00E676', lineWidth: 2, title: 'ST▲' })
  superBearSeries = addSeries(chart, 'Line', { color: '#FF1744', lineWidth: 2, title: 'ST▼' })

  avlBarSeries = addSeries(chart, 'Histogram', {
    priceScaleId: 'avl',
    color: '#26a69a44',
    title: 'VOL',
  })
  avlLineSeries = addSeries(chart, 'Line', {
    priceScaleId: 'avl',
    color: '#FFB74D',
    lineWidth: 1,
    title: 'AVL',
  })
  chart.priceScale('avl').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
}

function initSubChart() {
  if (!subChartEl.value || subChart) return
  subChart = createChart(subChartEl.value, {
    ...CHART_STYLE,
    height: 150,
    rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.1 } },
    timeScale: { visible: false },
  })

  rsiSeries = addSeries(subChart, 'Line', { color: '#7C4DFF', lineWidth: 2, title: 'RSI(14)' })
  rsiSeries.createPriceLine({
    price: 70,
    color: '#ef5350',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: true,
    title: 'OB',
  })
  rsiSeries.createPriceLine({
    price: 30,
    color: '#26a69a',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: true,
    title: 'OS',
  })
  rsiSeries.createPriceLine({
    price: 50,
    color: '#555555',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: false,
  })

  macdHistSeries = addSeries(subChart, 'Histogram', { title: 'MACD Hist', priceScaleId: 'right' })
  macdLineSeries = addSeries(subChart, 'Line', { color: '#2196F3', lineWidth: 2, title: 'MACD' })
  macdSignalSeries = addSeries(subChart, 'Line', {
    color: '#FF5722',
    lineWidth: 1,
    get title() {
      return t('app.common.labels.signal')
    },
  })

  volBarSeries = addSeries(subChart, 'Histogram', { title: 'Vol', priceScaleId: 'right' })
  volLineSeries = addSeries(subChart, 'Line', { color: '#FFB74D', lineWidth: 1, title: 'Vol MA' })

  kdjKSeries = addSeries(subChart, 'Line', { color: '#F9A825', lineWidth: 1, title: 'K' })
  kdjDSeries = addSeries(subChart, 'Line', { color: '#E91E63', lineWidth: 1, title: 'D' })
  kdjJSeries = addSeries(subChart, 'Line', { color: '#00BCD4', lineWidth: 1, title: 'J' })

  obvSeries = addSeries(subChart, 'Line', { color: '#AB47BC', lineWidth: 2, title: 'OBV' })

  wrSeries = addSeries(subChart, 'Line', { color: '#26C6DA', lineWidth: 2, title: 'WR(14)' })
  wrSeries.createPriceLine({
    price: -20,
    color: '#ef5350',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: true,
    title: 'OB',
  })
  wrSeries.createPriceLine({
    price: -80,
    color: '#26a69a',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: true,
    title: 'OS',
  })
  wrSeries.createPriceLine({
    price: -50,
    color: '#555555',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: false,
  })

  stochRsiKSeries = addSeries(subChart, 'Line', { color: '#66BB6A', lineWidth: 1, title: 'K' })
  stochRsiDSeries = addSeries(subChart, 'Line', { color: '#EF5350', lineWidth: 1, title: 'D' })
  stochRsiKSeries.createPriceLine({
    price: 80,
    color: '#ef5350',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: true,
  })
  stochRsiKSeries.createPriceLine({
    price: 20,
    color: '#26a69a',
    lineWidth: 1,
    lineStyle: 2,
    axisLabelVisible: true,
  })

  chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
    if (range) subChart.timeScale().setVisibleLogicalRange(range)
  })
  subChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
    if (range) chart.timeScale().setVisibleLogicalRange(range)
  })
}

// ── Indicator update functions ────────────────────────────────────────────────
function updateAllIndicators() {
  if (!candles.length) return
  const closes = candles.map((c) => c.close)
  updateMAIndicator(closes)
  updateEMAIndicator(closes)
  updateBBIndicator(closes)
  updateSARIndicator()
  updateSuperIndicator()
  updateAVLIndicator()
  updateRSIIndicator(closes)
  updateMACDIndicator(closes)
  updateVOLIndicator()
  updateKDJIndicator()
  updateOBVIndicator()
  updateWRIndicator()
  updateStochRSIIndicator(closes)
}

function updateMAIndicator(closes) {
  if (!candles.length || !closes.length) return
  const shortP = Math.max(1, Number(maShortPeriod.value) || 5)
  const longP = Math.max(1, Number(maLongPeriod.value) || 20)

  if (maShortSeries) maShortSeries.applyOptions({ title: `MA${shortP}` })
  if (maLongSeries) maLongSeries.applyOptions({ title: `MA${longP}` })

  const short = movingAverage(candles, closes, shortP)
  const long = movingAverage(candles, closes, longP)

  if (indicators.value.ma) {
    maShortSeries?.setData(short)
    maLongSeries?.setData(long)
  }

  const s = short.at(-1)?.value,
    l = long.at(-1)?.value
  iSignals.value.ma = !s || !l ? 'HOLD' : s > l ? 'BUY' : s < l ? 'SELL' : 'HOLD'
}

function updateEMAIndicator(closes) {
  if (!candles.length || !closes.length) return
  const sP = Math.max(1, Number(emaShortPeriod.value) || 9)
  const lP = Math.max(1, Number(emaLongPeriod.value) || 21)

  if (emaShortSeries) emaShortSeries.applyOptions({ title: `EMA${sP}` })
  if (emaLongSeries) emaLongSeries.applyOptions({ title: `EMA${lP}` })

  const short = ema(candles, closes, sP)
  const long = ema(candles, closes, lP)

  if (indicators.value.ema) {
    emaShortSeries?.setData(short)
    emaLongSeries?.setData(long)
  }

  const s = short.at(-1)?.value,
    l = long.at(-1)?.value
  iSignals.value.ema = !s || !l ? 'HOLD' : s > l ? 'BUY' : s < l ? 'SELL' : 'HOLD'
}

function updateBBIndicator(closes) {
  if (!candles.length || !closes.length) return
  const p = Math.max(1, Number(bbPeriodState.value) || 20)
  const m = Math.max(0.1, Number(bbMultState.value) || 2)

  const { upper, middle, lower } = bollingerBands(candles, closes, p, m)

  if (indicators.value.bb) {
    bbUpperSeries?.setData(upper)
    bbMiddleSeries?.setData(middle)
    bbLowerSeries?.setData(lower)
  }

  const price = closes.at(-1)
  const u = upper.at(-1)?.value,
    l = lower.at(-1)?.value
  iSignals.value.bb = !u || !l ? 'HOLD' : price > u ? 'SELL' : price < l ? 'BUY' : 'HOLD'
}

function updateSARIndicator() {
  if (!candles.length) return
  const st = Math.max(0.001, Number(sarStepState.value) || 0.02)
  const mx = Math.max(st, Number(sarMaxState.value) || 0.2)

  const data = parabolicSAR(candles, st, mx)
  const bull = data.filter((d) => d.isBull).map(({ time, value }) => ({ time, value }))
  const bear = data.filter((d) => !d.isBull).map(({ time, value }) => ({ time, value }))
  if (indicators.value.sar) {
    sarBullSeries?.setData(bull)
    sarBearSeries?.setData(bear)
  }
  const last = data.at(-1)
  iSignals.value.sar = !last ? 'HOLD' : last.isBull ? 'BUY' : 'SELL'
}

function updateSuperIndicator() {
  if (!candles.length) return
  const p = Math.max(1, Number(superPeriodState.value) || 10)
  const m = Math.max(0.1, Number(superMultState.value) || 3)

  const data = supertrend(candles, p, m)
  const bull = data.filter((d) => d.direction === 1).map(({ time, value }) => ({ time, value }))
  const bear = data.filter((d) => d.direction === -1).map(({ time, value }) => ({ time, value }))
  if (indicators.value.super) {
    superBullSeries?.setData(bull)
    superBearSeries?.setData(bear)
  }
  const last = data.at(-1)
  iSignals.value.super = !last ? 'HOLD' : last.direction === 1 ? 'BUY' : 'SELL'
}

function updateAVLIndicator() {
  if (!candles.length) return
  const p = Math.max(1, Number(avlPeriodState.value) || 20)
  const { bars, line } = avgVolumeLine(candles, p)
  if (indicators.value.avl) {
    avlBarSeries?.setData(bars)
    avlLineSeries?.setData(line)
  }
  const lastBar = bars.at(-1)?.value
  const lastLine = line.at(-1)?.value
  iSignals.value.avl = !lastBar || !lastLine ? 'HOLD' : lastBar > lastLine ? 'BUY' : 'HOLD'
}

function updateVOLIndicator() {
  if (!subChart || !candles.length) return
  const p = Math.max(1, Number(avlPeriodState.value) || 20)
  const { bars, line } = avgVolumeLine(candles, p)
  const shouldDraw = indicators.value.vol && activeOscillator.value === 'vol'
  volBarSeries?.setData(shouldDraw ? bars : [])
  volLineSeries?.setData(shouldDraw ? line : [])
  const lastBar = bars.at(-1)?.value
  const lastLine = line.at(-1)?.value
  iSignals.value.vol = !lastBar || !lastLine ? 'HOLD' : lastBar > lastLine ? 'BUY' : 'HOLD'
}

function updateRSIIndicator(closes) {
  if (!subChart || !candles.length) return
  const p = Math.max(1, Number(rsiPeriodState.value) || 14)
  const ob = Number(rsiOverboughtState.value) || 70
  const os = Number(rsiOversoldState.value) || 30

  if (rsiSeries) rsiSeries.applyOptions({ title: `RSI(${p})` })
  const data = rsi(candles, closes, p)
  const shouldDraw = indicators.value.rsi && activeOscillator.value === 'rsi'
  rsiSeries?.setData(shouldDraw ? data : [])
  const latest = data.at(-1)?.value
  iSignals.value.rsi = !latest ? 'HOLD' : latest > ob ? 'SELL' : latest < os ? 'BUY' : 'HOLD'
}

function updateMACDIndicator(closes) {
  if (!subChart || !candles.length) return
  const f = Math.max(1, Number(macdFastState.value) || 12)
  const s = Math.max(f + 1, Number(macdSlowState.value) || 26)
  const sigP = Math.max(1, Number(macdSignalState.value) || 9)

  const { macdLine, signalLine, histogram } = macd(candles, closes, f, s, sigP)
  const shouldDraw = indicators.value.macd && activeOscillator.value === 'macd'
  macdLineSeries?.setData(shouldDraw ? macdLine : [])
  macdSignalSeries?.setData(shouldDraw ? signalLine : [])
  macdHistSeries?.setData(shouldDraw ? histogram : [])
  const m = macdLine.at(-1)?.value,
    sig = signalLine.at(-1)?.value
  iSignals.value.macd = !m || !sig ? 'HOLD' : m > sig ? 'BUY' : m < sig ? 'SELL' : 'HOLD'
}

function updateKDJIndicator() {
  if (!subChart || !candles.length) return
  const { k, d, j } = kdj(candles, 9)
  const shouldDraw = indicators.value.kdj && activeOscillator.value === 'kdj'
  kdjKSeries?.setData(shouldDraw ? k : [])
  kdjDSeries?.setData(shouldDraw ? d : [])
  kdjJSeries?.setData(shouldDraw ? j : [])
  const lastK = k.at(-1)?.value
  const lastD = d.at(-1)?.value
  const lastJ = j.at(-1)?.value
  iSignals.value.kdj =
    !lastK || !lastD
      ? 'HOLD'
      : lastJ < 20 || (lastK < 30 && lastK > lastD)
        ? 'BUY'
        : lastJ > 80 || (lastK > 70 && lastK < lastD)
          ? 'SELL'
          : lastK > lastD
            ? 'BUY'
            : lastK < lastD
              ? 'SELL'
              : 'HOLD'
}

function updateOBVIndicator() {
  if (!subChart || !candles.length) return
  const data = obv(candles)
  const shouldDraw = indicators.value.obv && activeOscillator.value === 'obv'
  obvSeries?.setData(shouldDraw ? data : [])
  if (data.length >= 2) {
    const last = data.at(-1)?.value
    const prev = data.at(-2)?.value
    iSignals.value.obv = last > prev ? 'BUY' : last < prev ? 'SELL' : 'HOLD'
  } else {
    iSignals.value.obv = 'HOLD'
  }
}

function updateWRIndicator() {
  if (!subChart || !candles.length) return
  const data = williamsR(candles, 14)
  const shouldDraw = indicators.value.wr && activeOscillator.value === 'wr'
  wrSeries?.setData(shouldDraw ? data : [])
  const last = data.at(-1)?.value
  iSignals.value.wr =
    last === undefined ? 'HOLD' : last < -80 ? 'BUY' : last > -20 ? 'SELL' : 'HOLD'
}

function updateStochRSIIndicator(closes) {
  if (!subChart || !candles.length) return
  const { k, d } = stochRSI(candles, closes, 14, 14, 3, 3)
  const shouldDraw = indicators.value.stochRsi && activeOscillator.value === 'stochRsi'
  stochRsiKSeries?.setData(shouldDraw ? k : [])
  stochRsiDSeries?.setData(shouldDraw ? d : [])
  const lastK = k.at(-1)?.value
  const lastD = d.at(-1)?.value
  iSignals.value.stochRsi =
    !lastK || !lastD
      ? 'HOLD'
      : lastK < 20 && lastK > lastD
        ? 'BUY'
        : lastK > 80 && lastK < lastD
          ? 'SELL'
          : lastK > lastD
            ? 'BUY'
            : lastK < lastD
              ? 'SELL'
              : 'HOLD'
}

// ── Toggle handler ────────────────────────────────────────────────────────────
const _clearSeries = {
  ma: () => {
    maShortSeries.setData([])
    maLongSeries.setData([])
  },
  ema: () => {
    emaShortSeries.setData([])
    emaLongSeries.setData([])
  },
  bb: () => {
    bbUpperSeries.setData([])
    bbMiddleSeries.setData([])
    bbLowerSeries.setData([])
  },
  sar: () => {
    sarBullSeries.setData([])
    sarBearSeries.setData([])
  },
  super: () => {
    superBullSeries.setData([])
    superBearSeries.setData([])
  },
  avl: () => {
    avlBarSeries.setData([])
    avlLineSeries.setData([])
  },
  rsi: () => rsiSeries?.setData([]),
  macd: () => {
    macdLineSeries?.setData([])
    macdSignalSeries?.setData([])
    macdHistSeries?.setData([])
  },
  vol: () => {
    volBarSeries?.setData([])
    volLineSeries?.setData([])
  },
  kdj: () => {
    kdjKSeries?.setData([])
    kdjDSeries?.setData([])
    kdjJSeries?.setData([])
  },
  obv: () => obvSeries?.setData([]),
  wr: () => wrSeries?.setData([]),
  stochRsi: () => {
    stochRsiKSeries?.setData([])
    stochRsiDSeries?.setData([])
  },
}

const _redrawIndicator = {
  ma: (c) => updateMAIndicator(c),
  ema: (c) => updateEMAIndicator(c),
  bb: (c) => updateBBIndicator(c),
  sar: () => updateSARIndicator(),
  super: () => updateSuperIndicator(),
  avl: () => updateAVLIndicator(),
  rsi: (c) => updateRSIIndicator(c),
  macd: (c) => updateMACDIndicator(c),
  vol: () => updateVOLIndicator(),
  kdj: () => updateKDJIndicator(),
  obv: () => updateOBVIndicator(),
  wr: () => updateWRIndicator(),
  stochRsi: (c) => updateStochRSIIndicator(c),
}

async function toggleIndicator(key) {
  indicators.value[key] = !indicators.value[key]
  const on = indicators.value[key]
  const closes = candles.map((c) => c.close)
  const isSub = SUB_INDICATORS.includes(key)

  if (on && isSub && !subChart) {
    await nextTick()
    initSubChart()
    updateAllIndicators()
  }

  if (on) {
    if (isSub) activeOscillator.value = key
    _redrawIndicator[key]?.(closes)
  } else {
    _clearSeries[key]?.()
    iSignals.value[key] = 'HOLD'
    if (isSub && activeOscillator.value === key) {
      const next = SUB_INDICATORS.find((k) => k !== key && indicators.value[k])
      activeOscillator.value = next ?? key
      if (next) _redrawIndicator[next]?.(closes)
    }
  }
}

function switchOscillator(osc) {
  activeOscillator.value = osc
  updateAllIndicators()
}

// ── Render Chart ──────────────────────────────────────────────────────────────
function renderChart() {
  if (!chart || !candles) return
  const isCandlesMode = selectedMode.value === 'candles' && candles.length > 0
  series.setData(isCandlesMode ? candles : [])
  areaSeries.setData(isCandlesMode ? [] : candles.map((c) => ({ time: c.time, value: c.close })))
  updateAllIndicators()
}

// ── Chart Data Loading & Streaming ────────────────────────────────────────────
const topCoins = computed(() =>
  Object.entries(binanceStore.tickers).map(([symbol, info]) => ({
    symbol,
    ...info,
  })),
)

async function loadCandles() {
  loading.value = true
  const sym = props.symbol || 'BTCUSDC'
  const r = selectedRange.value || 'short'
  const inv = selectedInterval.value || '1h'
  const coinId = symbolToCoinId(sym)

  try {
    let raw = []
    if (r === 'short' && (inv === '1h' || inv === 'auto')) {
      raw = await candlesBinanceHistory(sym, '1h')
    } else {
      const actualInv = inv === 'auto' ? undefined : inv
      const res = await getLongTermCandles(coinId, r === 'short' ? '90' : r, actualInv)
      raw = res?.candles || []
      if (!raw || !raw.length) {
        const binanceInv =
          inv === 'auto' ? (r === '365' || r === '1825' || r === 'max' ? '1d' : '1h') : inv
        raw = await candlesBinanceHistory(sym, binanceInv)
      }
    }

    candles = dedupeCandles(raw)
    renderChart()
    if (chart) {
      chart.timeScale().fitContent()
      subChart?.timeScale().fitContent()
    }
    emit('update:candles', [...candles])
  } catch (err) {
    console.error('[CryptoChart] Failed to load candles:', err)
  } finally {
    loading.value = false
  }
}

function getWsInterval() {
  const inv = selectedInterval.value
  if (inv === '1d' || inv === '3d' || inv === '1w' || inv === '1M') return inv
  return '1h'
}

function connectWs() {
  binanceWs.disconnect()
  const sym = props.symbol || 'BTCUSDC'
  binanceWs.connect(sym, updateChart, null, getWsInterval())
}

function updateChart(candle) {
  if (!candles.length) {
    candles = [candle]
  } else {
    const last = candles[candles.length - 1]
    if (last.time === candle.time) {
      candles[candles.length - 1] = { ...last, ...candle }
    } else if (candle.time > last.time) {
      candles.push({ ...candle })
      if (selectedRange.value === 'short' && candles.length > 1000) {
        candles.shift()
      }
    }
  }

  const isCandlesMode = selectedMode.value === 'candles'
  if (isCandlesMode) {
    series.setData(candles)
  } else {
    areaSeries.setData(candles.map((c) => ({ time: c.time, value: c.close })))
  }

  updateAllIndicators()
  emit('update:candles', [...candles])
}

// ── Watchers & Lifecycle ──────────────────────────────────────────────────────
watch([selectedRange, selectedInterval], () => {
  emit('update:range', selectedRange.value)
  emit('update:interval', selectedInterval.value)
  void loadCandles()
  connectWs()
})

watch(selectedMode, (val) => {
  emit('update:chartMode', val)
  renderChart()
})

watch(isLogScale, (val) => {
  emit('update:logScale', val)
  chart?.priceScale('right').applyOptions({ mode: val ? 1 : 0 })
})

let currentSymbol = ref(null)

watch(
  () => props.symbol,
  async (newSymbol) => {
    currentSymbol.value = newSymbol
    await loadCandles()
    if (newSymbol !== currentSymbol.value) return
    connectWs()
  },
  { immediate: true },
)

watch(
  () => composite.value,
  (newVal) => {
    emit('update:signal', newVal)
  },
  { deep: true },
)

onMounted(() => {
  initMainChart()
})

onUnmounted(() => {
  binanceWs.disconnect()
  chart?.remove()
  subChart?.remove()
  chart = null
  subChart = null
})
</script>

<template>
  <q-card class="bg-dark" style="margin-top: -17px">
    <q-card-section v-if="!hideHeader">
      <div class="row">
        <div class="col-12" style="border-bottom: 2px solid #555">
          <CryptoDropdown :top-coins="topCoins" v-model:selected-symbol="cryptosymbol" />
        </div>
      </div>
    </q-card-section>

    <!-- ── Timeframe & Indicator controls ──────────────────────────────── -->
    <q-card-section v-if="controls" class="q-pt-xs q-pb-xs">
      <!-- Overlay indicators row -->
      <div class="row q-gutter-xs items-center q-my-xs">
        <div class="col-auto">
          <div class="row q-gutter-xs items-start">
            <span class="text-caption text-grey-5 q-mr-xs q-mt-xs" style="min-width: 48px">
              {{ t('app.crypto.chart.overlay') }}
            </span>

            <!-- MA -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.ma && (iSignals.ma === 'BUY' || iSignals.ma === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.ma === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.ma }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.ma ? 'positive' : 'grey-7'"
                :label="`MA ${maShortPeriod}/${maLongPeriod}`"
                @click="toggleIndicator('ma')"
              >
                <q-list dark style="min-width: 250px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Calculates average price over X/Y candles to smooth volatility. Fast MA crossing
                    above Slow MA signals a BUY (Golden Cross); crossing below signals a SELL (Death
                    Cross).
                  </div>
                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.maPresets') }}
                  </q-item-label>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectMaPreset('5/20')"
                    :active="maPreset === '5/20'"
                    active-class="text-orange-5"
                  >
                    <q-item-section>
                      <q-item-label>5 / 20 MA</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.shortTrend')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectMaPreset('50/200')"
                    :active="maPreset === '50/200'"
                    active-class="text-orange-5"
                  >
                    <q-item-section>
                      <q-item-label>50 / 200 MA</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.goldenDeath')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.dynMa') }}
                  </q-item-label>
                  <div class="row q-col-gutter-xs q-px-xs q-pb-xs">
                    <div class="col-6">
                      <q-input
                        v-model.number="maShortPeriod"
                        type="number"
                        dense
                        outlined
                        dark
                        color="orange-6"
                        :label="t('app.crypto.chart.xFast')"
                        :min="1"
                        @update:model-value="onCustomMaChange"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model.number="maLongPeriod"
                        type="number"
                        dense
                        outlined
                        dark
                        color="orange-6"
                        :label="t('app.crypto.chart.ySlow')"
                        :min="1"
                        @update:model-value="onCustomMaChange"
                      />
                    </div>
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- EMA Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.ema && (iSignals.ema === 'BUY' || iSignals.ema === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.ema === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.ema }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.ema ? 'cyan-8' : 'grey-7'"
                :label="`EMA ${emaShortPeriod}/${emaLongPeriod}`"
                @click="toggleIndicator('ema')"
              >
                <q-list dark style="min-width: 250px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Exponentially weighted moving average applying higher weight to recent prices.
                    Reacts faster than SMA to catch early trend shifts and momentum crossovers.
                  </div>
                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.emaPresets') }}
                  </q-item-label>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectEmaPreset('9/21')"
                    :active="emaPreset === '9/21'"
                    active-class="text-cyan-4"
                  >
                    <q-item-section>
                      <q-item-label>9 / 21 EMA</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.stdFast')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectEmaPreset('12/26')"
                    :active="emaPreset === '12/26'"
                    active-class="text-cyan-4"
                  >
                    <q-item-section>
                      <q-item-label>12 / 26 EMA</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.macdComponents')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectEmaPreset('20/50')"
                    :active="emaPreset === '20/50'"
                    active-class="text-cyan-4"
                  >
                    <q-item-section>
                      <q-item-label>20 / 50 EMA</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.mediumTrend')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.dynEma') }}
                  </q-item-label>
                  <div class="row q-col-gutter-xs q-px-xs q-pb-xs">
                    <div class="col-6">
                      <q-input
                        v-model.number="emaShortPeriod"
                        type="number"
                        dense
                        outlined
                        dark
                        color="cyan-6"
                        :label="t('app.crypto.chart.xFast')"
                        :min="1"
                        @update:model-value="onCustomEmaChange"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model.number="emaLongPeriod"
                        type="number"
                        dense
                        outlined
                        dark
                        color="cyan-6"
                        :label="t('app.crypto.chart.ySlow')"
                        :min="1"
                        @update:model-value="onCustomEmaChange"
                      />
                    </div>
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- Bollinger Bands Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.bb && (iSignals.bb === 'BUY' || iSignals.bb === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.bb === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.bb }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.bb ? 'blue-grey-4' : 'grey-7'"
                :label="`BOLL ${bbPeriodState}×${bbMultState}`"
                @click="toggleIndicator('bb')"
              >
                <q-list dark style="min-width: 250px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Volatility bands around an SMA centerline. Squeezes signal high-volatility
                    breakouts. Candle touching upper band indicates overbought (SELL); touching
                    lower band indicates oversold (BUY).
                  </div>
                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.bbPresets') }}
                  </q-item-label>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectBbPreset('20/2')"
                    :active="bbPreset === '20/2'"
                    active-class="text-blue-grey-3"
                  >
                    <q-item-section>
                      <q-item-label>{{ t('app.crypto.chart.bb20') }}</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.stdBands')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectBbPreset('20/2.5')"
                    :active="bbPreset === '20/2.5'"
                    active-class="text-blue-grey-3"
                  >
                    <q-item-section>
                      <q-item-label>{{ t('app.crypto.chart.bb25') }}</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.wideBands')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.dynBb') }}
                  </q-item-label>
                  <div class="row q-col-gutter-xs q-px-xs q-pb-xs">
                    <div class="col-6">
                      <q-input
                        v-model.number="bbPeriodState"
                        type="number"
                        dense
                        outlined
                        dark
                        color="blue-grey-4"
                        :label="t('app.common.labels.period')"
                        :min="1"
                        @update:model-value="onCustomBbChange"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model.number="bbMultState"
                        type="number"
                        step="0.1"
                        dense
                        outlined
                        dark
                        color="blue-grey-4"
                        :label="t('app.crypto.chart.dev')"
                        :min="0.1"
                        @update:model-value="onCustomBbChange"
                      />
                    </div>
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- Parabolic SAR Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.sar && (iSignals.sar === 'BUY' || iSignals.sar === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.sar === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.sar }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.sar ? 'orange-6' : 'grey-7'"
                :label="`SAR ${sarStepState}/${sarMaxState}`"
                @click="toggleIndicator('sar')"
              >
                <q-list dark style="min-width: 250px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Trailing stop-and-reverse dots tracking price acceleration. Dots flipping below
                    price signal a bullish uptrend (BUY); dots flipping above signal a bearish
                    downtrend (SELL) and dynamic stop-loss.
                  </div>
                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.sarPresets') }}
                  </q-item-label>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectSarPreset('0.02/0.2')"
                    :active="sarPreset === '0.02/0.2'"
                    active-class="text-orange-4"
                  >
                    <q-item-section>
                      <q-item-label>0.02 / 0.2</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.stdAf')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectSarPreset('0.01/0.1')"
                    :active="sarPreset === '0.01/0.1'"
                    active-class="text-orange-4"
                  >
                    <q-item-section>
                      <q-item-label>0.01 / 0.1</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.smoothAf')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.dynSar') }}
                  </q-item-label>
                  <div class="row q-col-gutter-xs q-px-xs q-pb-xs">
                    <div class="col-6">
                      <q-input
                        v-model.number="sarStepState"
                        type="number"
                        step="0.005"
                        dense
                        outlined
                        dark
                        color="orange-5"
                        :label="t('app.crypto.chart.stepAf')"
                        :min="0.001"
                        @update:model-value="onCustomSarChange"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model.number="sarMaxState"
                        type="number"
                        step="0.05"
                        dense
                        outlined
                        dark
                        color="orange-5"
                        :label="t('app.crypto.chart.maxAf')"
                        :min="0.01"
                        @update:model-value="onCustomSarChange"
                      />
                    </div>
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- Supertrend Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.super && (iSignals.super === 'BUY' || iSignals.super === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.super === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.super }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.super ? 'green-6' : 'grey-7'"
                :label="`SUPER ${superPeriodState}×${superMultState}`"
                @click="toggleIndicator('super')"
              >
                <q-list dark style="min-width: 250px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    ATR-based trend-following indicator showing trailing support (green line, BUY)
                    in uptrends and trailing resistance (red line, SELL) in downtrends. Line/color
                    flips signal trend reversals.
                  </div>
                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.stPresets') }}
                  </q-item-label>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectSuperPreset('10/3')"
                    :active="superPreset === '10/3'"
                    active-class="text-green-4"
                  >
                    <q-item-section>
                      <q-item-label>10 / 3.0</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.stdAtr')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectSuperPreset('10/2')"
                    :active="superPreset === '10/2'"
                    active-class="text-green-4"
                  >
                    <q-item-section>
                      <q-item-label>10 / 2.0</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.tightAtr')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.dynSt') }}
                  </q-item-label>
                  <div class="row q-col-gutter-xs q-px-xs q-pb-xs">
                    <div class="col-6">
                      <q-input
                        v-model.number="superPeriodState"
                        type="number"
                        dense
                        outlined
                        dark
                        color="green-5"
                        :label="t('app.common.labels.period')"
                        :min="1"
                        @update:model-value="onCustomSuperChange"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model.number="superMultState"
                        type="number"
                        step="0.5"
                        dense
                        outlined
                        dark
                        color="green-5"
                        :label="t('app.crypto.chart.mult')"
                        :min="0.1"
                        @update:model-value="onCustomSuperChange"
                      />
                    </div>
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- AVL Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.avl && (iSignals.avl === 'BUY' || iSignals.avl === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.avl === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.avl }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.avl ? 'amber-7' : 'grey-7'"
                :label="`AVL ${avlPeriodState}`"
                @click="toggleIndicator('avl')"
              >
                <q-list dark style="min-width: 230px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Calculates a moving average line over trading volume bars. High volume confirms
                    strong buying/selling conviction, while declining volume warns of trend
                    exhaustion.
                  </div>
                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.volPresets') }}
                  </q-item-label>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectAvlPreset('20')"
                    :active="avlPeriodState === 20"
                    active-class="text-amber-5"
                  >
                    <q-item-section>
                      <q-item-label>{{ t('app.crypto.chart.p20') }}</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.stdVol')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectAvlPreset('50')"
                    :active="avlPeriodState === 50"
                    active-class="text-amber-5"
                  >
                    <q-item-section>
                      <q-item-label>{{ t('app.crypto.chart.p50') }}</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.longVol')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.dynPeriod') }}
                  </q-item-label>
                  <div class="q-px-xs q-pb-xs">
                    <q-input
                      v-model.number="avlPeriodState"
                      type="number"
                      dense
                      outlined
                      dark
                      color="amber-6"
                      :label="t('app.crypto.chart.volMaPeriod')"
                      :min="1"
                      @update:model-value="onCustomAvlChange"
                    />
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- Sub / Oscillator indicators row -->
      <div class="row q-gutter-xs items-center q-my-xs">
        <div class="col-auto">
          <div class="row q-gutter-xs items-end">
            <span class="text-caption text-grey-5 q-mr-xs q-mb-xs" style="min-width: 48px">
              {{ t('app.crypto.chart.subOsc') }}
            </span>

            <!-- RSI Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.rsi && (iSignals.rsi === 'BUY' || iSignals.rsi === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.rsi === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.rsi }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.rsi ? 'deep-purple-4' : 'grey-7'"
                :label="`RSI (${rsiPeriodState})`"
                @click="toggleIndicator('rsi')"
              >
                <q-list dark style="min-width: 250px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Bounded momentum oscillator (0–100) measuring speed and velocity of recent price
                    moves. Readings above 70 indicate overbought levels (SELL warning); readings
                    below 30 indicate oversold levels (BUY opportunity).
                  </div>
                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.rsiPresets') }}
                  </q-item-label>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectRsiPreset('14')"
                    :active="rsiPreset === '14'"
                    active-class="text-purple-4"
                  >
                    <q-item-section>
                      <q-item-label>{{ t('app.crypto.chart.rsi14') }}</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.stdRsi')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectRsiPreset('9')"
                    :active="rsiPreset === '9'"
                    active-class="text-purple-4"
                  >
                    <q-item-section>
                      <q-item-label>{{ t('app.crypto.chart.rsi9') }}</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.fastRsi')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.dynRsi') }}
                  </q-item-label>
                  <div class="row q-col-gutter-xs q-px-xs q-pb-xs">
                    <div class="col-12 q-mb-xs">
                      <q-input
                        v-model.number="rsiPeriodState"
                        type="number"
                        dense
                        outlined
                        dark
                        color="deep-purple-3"
                        :label="t('app.common.labels.period')"
                        :min="1"
                        @update:model-value="onCustomRsiChange"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model.number="rsiOverboughtState"
                        type="number"
                        dense
                        outlined
                        dark
                        color="deep-purple-3"
                        :label="t('app.crypto.chart.obLevel')"
                        :min="1"
                        :max="99"
                        @update:model-value="onCustomRsiChange"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model.number="rsiOversoldState"
                        type="number"
                        dense
                        outlined
                        dark
                        color="deep-purple-3"
                        :label="t('app.crypto.chart.osLevel')"
                        :min="1"
                        :max="99"
                        @update:model-value="onCustomRsiChange"
                      />
                    </div>
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- MACD Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.macd && (iSignals.macd === 'BUY' || iSignals.macd === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.macd === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.macd }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.macd ? 'blue-5' : 'grey-7'"
                :label="`MACD ${macdFastState}/${macdSlowState}/${macdSignalState}`"
                @click="toggleIndicator('macd')"
              >
                <q-list dark style="min-width: 250px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Trend and momentum oscillator tracking distance between fast and slow EMAs. MACD
                    line crossing above Signal line generates a BUY signal; crossing below generates
                    a SELL signal.
                  </div>
                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.macdPresets') }}
                  </q-item-label>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectMacdPreset('12/26/9')"
                    :active="macdPreset === '12/26/9'"
                    active-class="text-blue-4"
                  >
                    <q-item-section>
                      <q-item-label>12 / 26 / 9</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.stdMacd')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="selectMacdPreset('5/35/5')"
                    :active="macdPreset === '5/35/5'"
                    active-class="text-blue-4"
                  >
                    <q-item-section>
                      <q-item-label>5 / 35 / 5</q-item-label>
                      <q-item-label caption class="text-grey-5">{{
                        t('app.crypto.chart.fastMacd')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-separator dark class="q-my-xs" />

                  <q-item-label header class="text-grey-4 text-caption q-px-xs">
                    {{ t('app.crypto.chart.dynMacd') }}
                  </q-item-label>
                  <div class="row q-col-gutter-xs q-px-xs q-pb-xs">
                    <div class="col-4">
                      <q-input
                        v-model.number="macdFastState"
                        type="number"
                        dense
                        outlined
                        dark
                        color="blue-4"
                        :label="t('app.common.labels.fast')"
                        :min="1"
                        @update:model-value="onCustomMacdChange"
                      />
                    </div>
                    <div class="col-4">
                      <q-input
                        v-model.number="macdSlowState"
                        type="number"
                        dense
                        outlined
                        dark
                        color="blue-4"
                        :label="t('app.common.labels.slow')"
                        :min="2"
                        @update:model-value="onCustomMacdChange"
                      />
                    </div>
                    <div class="col-4">
                      <q-input
                        v-model.number="macdSignalState"
                        type="number"
                        dense
                        outlined
                        dark
                        color="blue-4"
                        :label="t('app.common.labels.signal')"
                        :min="1"
                        @update:model-value="onCustomMacdChange"
                      />
                    </div>
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- VOL Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.vol && (iSignals.vol === 'BUY' || iSignals.vol === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.vol === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.vol }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.vol ? 'amber-8' : 'grey-7'"
                label="VOL"
                @click="toggleIndicator('vol')"
              >
                <q-list dark style="min-width: 230px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Plots raw trading volume histogram alongside a Volume Moving Average line in the
                    sub-chart. High volume confirms trend strength and breakout validity.
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- KDJ Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.kdj && (iSignals.kdj === 'BUY' || iSignals.kdj === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.kdj === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.kdj }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.kdj ? 'yellow-8' : 'grey-7'"
                label="KDJ"
                @click="toggleIndicator('kdj')"
              >
                <q-list dark style="min-width: 230px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Enhanced Stochastic oscillator with K, D, and J lines (0–100). J line crossing
                    above K/D in oversold zone signals BUY; crossing below in overbought zone
                    signals SELL.
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- OBV Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.obv && (iSignals.obv === 'BUY' || iSignals.obv === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.obv === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.obv }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.obv ? 'purple-4' : 'grey-7'"
                label="OBV"
                @click="toggleIndicator('obv')"
              >
                <q-list dark style="min-width: 230px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    On-Balance Volume: Cumulative volume metric adding volume on up days and
                    subtracting on down days. Rising OBV confirms buying pressure before price
                    surges.
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- WR Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="indicators.wr && (iSignals.wr === 'BUY' || iSignals.wr === 'SELL')"
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.wr === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.wr }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.wr ? 'cyan-6' : 'grey-7'"
                label="WR"
                @click="toggleIndicator('wr')"
              >
                <q-list dark style="min-width: 230px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Williams %R: Fast momentum oscillator (-100 to 0) measuring close relative to
                    highest high. Readings above -20 signal overbought; readings below -80 signal
                    oversold.
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>

            <!-- StochRSI Dropdown -->
            <div class="column items-center">
              <div style="height: 18px" class="q-mb-xs flex items-center justify-center">
                <q-badge
                  v-if="
                    indicators.stochRsi &&
                    (iSignals.stochRsi === 'BUY' || iSignals.stochRsi === 'SELL')
                  "
                  class="text-weight-bold"
                  style="font-size: 10px"
                  :color="iSignals.stochRsi === 'BUY' ? 'green-8' : 'red-8'"
                >
                  {{ iSignals.stochRsi }}
                </q-badge>
              </div>
              <q-btn-dropdown
                split
                glossy
                dense
                unelevated
                size="sm"
                class="q-px-xs"
                content-style="max-width: 300px"
                :color="indicators.stochRsi ? 'green-5' : 'grey-7'"
                label="StochRSI"
                @click="toggleIndicator('stochRsi')"
              >
                <q-list dark style="min-width: 230px; max-width: 300px" class="bg-grey-10 q-pa-sm">
                  <div class="text-caption text-grey-4 q-px-xs q-mb-xs">
                    Stochastic RSI: Applies Stochastic formula to RSI values (0–100). Reaches
                    extreme overbought (&gt;80) and oversold (&lt;20) states faster than standard
                    RSI for quick reversal timing.
                  </div>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeframe / Range row (under indicators) -->
      <div v-if="showRangeControls" class="row q-gutter-xs items-center q-mt-md">
        <span class="text-caption text-grey-5 q-mr-xs" style="min-width: 48px">{{
          t('app.common.labels.rangeColon')
        }}</span>
        <q-btn-toggle
          v-model="selectedRange"
          dense
          unelevated
          size="xs"
          class="toggle-pill"
          text-color="grey-5"
          toggle-color="orange-7"
          toggle-text-color="grey-10"
          :options="[
            { value: 'short', label: '100B' },
            { value: '90', label: '3M' },
            { value: '365', label: '1Y' },
            { value: '1825', label: '5Y' },
            { value: 'max', label: t('app.crypto.chart.max') },
          ]"
        />

        <span class="text-caption text-grey-5 q-ml-sm q-mr-xs">{{
          t('app.common.labels.intervalColon')
        }}</span>
        <q-btn-toggle
          v-model="selectedInterval"
          dense
          unelevated
          size="xs"
          class="toggle-pill"
          text-color="grey-5"
          toggle-color="blue-grey-6"
          toggle-text-color="grey-10"
          :options="[
            { value: 'auto', label: t('app.crypto.chart.auto') },
            { value: '1h', label: '1H' },
            { value: '1d', label: '1D' },
            { value: '3d', label: '3D' },
            { value: '1w', label: '1W' },
            { value: '1M', label: '1M' },
          ]"
        />

        <span class="text-caption text-grey-5 q-ml-sm q-mr-xs">{{
          t('app.common.labels.typeColon')
        }}</span>
        <q-btn-toggle
          v-model="selectedMode"
          dense
          unelevated
          size="xs"
          class="toggle-pill"
          text-color="grey-5"
          toggle-color="cyan-8"
          toggle-text-color="grey-10"
          :options="[
            { value: 'candles', label: t('app.crypto.chart.candles') },
            { value: 'area', label: t('app.crypto.chart.area') },
          ]"
        />

        <q-toggle
          v-model="isLogScale"
          dense
          dark
          size="xs"
          color="orange-6"
          class="text-grey-5 q-ml-xs"
          :label="t('app.crypto.chart.log')"
        />

        <q-space />

        <q-spinner-facebook v-if="loading" size="18px" color="orange-6" class="q-mr-xs" />
      </div>
    </q-card-section>

    <!-- ── Main chart ──────────────────────────────────────────────────── -->
    <div class="relative-position">
      <div ref="chartEl" style="height: 420px; overflow: hidden" />
      <q-inner-loading :showing="loading">
        <q-spinner-facebook size="48px" color="orange-6" />
      </q-inner-loading>
    </div>

    <!-- ── Oscillator sub-chart (lazy-mounted) ────────────────────────── -->
    <template v-if="controls && showOscillator">
      <div class="row items-center q-px-sm q-pt-xs q-gutter-xs">
        <span class="text-caption text-grey-5">{{ t('app.crypto.chart.oscillator') }}</span>
        <q-btn-toggle
          :model-value="activeOscillator"
          dense
          unelevated
          size="xs"
          toggle-color="primary"
          :options="enabledOscillators.map((k) => ({ label: SUB_LABELS[k], value: k }))"
          @update:model-value="switchOscillator"
        />
        <template v-if="activeOscillator === 'rsi' && indicators.rsi">
          <q-chip dense size="sm" style="background: #7c4dff; color: #fff"
            >RSI({{ rsiPeriodState }})</q-chip
          >
          <span class="text-caption text-grey-5"
            >OB&gt;{{ rsiOverboughtState }} · OS&lt;{{ rsiOversoldState }}</span
          >
        </template>
        <template v-if="activeOscillator === 'macd' && indicators.macd">
          <q-chip dense size="sm" style="background: #2196f3; color: #fff"
            >MACD {{ macdFastState }}/{{ macdSlowState }}</q-chip
          >
          <q-chip dense size="sm" style="background: #ff5722; color: #fff"
            >Sig {{ macdSignalState }}</q-chip
          >
        </template>
        <template v-if="activeOscillator === 'kdj' && indicators.kdj">
          <q-chip dense size="sm" style="background: #f9a825; color: #111">K</q-chip>
          <q-chip dense size="sm" style="background: #e91e63; color: #fff">D</q-chip>
          <q-chip dense size="sm" style="background: #00bcd4; color: #111">J</q-chip>
        </template>
        <template v-if="activeOscillator === 'obv' && indicators.obv">
          <q-chip dense size="sm" style="background: #ab47bc; color: #fff">OBV</q-chip>
        </template>
        <template v-if="activeOscillator === 'wr' && indicators.wr">
          <q-chip dense size="sm" style="background: #26c6da; color: #111">WR</q-chip>
          <span class="text-caption text-grey-5">OB&gt;-20 · OS&lt;-80</span>
        </template>
        <template v-if="activeOscillator === 'stochRsi' && indicators.stochRsi">
          <q-chip dense size="sm" style="background: #66bb6a; color: #111">K</q-chip>
          <q-chip dense size="sm" style="background: #ef5350; color: #fff">D</q-chip>
          <span class="text-caption text-grey-5">OB&gt;80 · OS&lt;20</span>
        </template>
        <template v-if="activeOscillator === 'vol' && indicators.vol">
          <q-chip dense size="sm" style="background: #ffb74d; color: #111">VOL MA</q-chip>
        </template>
      </div>

      <div ref="subChartEl" style="height: 150px; overflow: hidden" />
    </template>
  </q-card>
</template>

<style scoped>
.toggle-pill {
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 8px;
  overflow: hidden;
}
</style>
