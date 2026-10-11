<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { getLongTermChart, getCoingeckoMarkets } from 'src/services/web/coingecko'
import CryptoChart from 'src/components/crypto/CryptoChart.vue'
import StrategyBuilder from 'src/components/crypto/StrategyBuilder.vue'

const { locale } = useI18n({ useScope: 'global' })
const $q = useQuasar()
const bg = computed(() => locale.value === 'bg-BG')
const t = (en, bgText) => (bg.value ? bgText : en)

const coins = [
  { value: 'bitcoin', label: 'Bitcoin', symbol: 'BTC' },
  { value: 'ethereum', label: 'Ethereum', symbol: 'ETH' },
  { value: 'solana', label: 'Solana', symbol: 'SOL' },
  { value: 'binancecoin', label: 'BNB', symbol: 'BNB' },
  { value: 'ripple', label: 'XRP', symbol: 'XRP' },
  { value: 'cardano', label: 'Cardano', symbol: 'ADA' },
  { value: 'stellar', label: 'Stellar', symbol: 'XLM' },
  { value: 'litecoin', label: 'Litecoin', symbol: 'LTC' },
  { value: 'chainlink', label: 'Chainlink', symbol: 'LINK' },
  { value: 'polkadot', label: 'Polkadot', symbol: 'DOT' },
  { value: 'dogecoin', label: 'Dogecoin', symbol: 'DOGE' },
  { value: 'tron', label: 'TRON', symbol: 'TRX' },
  { value: 'avalanche-2', label: 'Avalanche', symbol: 'AVAX' },
]

const ranges = [
  { value: '90', labelEn: '3M', labelBg: '3М' },
  { value: '365', labelEn: '1Y', labelBg: '1Г' },
  { value: '1825', labelEn: '5Y', labelBg: '5Г' },
  { value: 'max', labelEn: 'Max', labelBg: 'Макс' },
]

const intervals = [
  { value: 'auto', label: 'Auto' },
  { value: '1d', label: '1D' },
  { value: '3d', label: '3D' },
  { value: '1w', label: '1W' },
  { value: '1M', label: '1M' },
]

const overlayKeys = ['ma', 'ema', 'bb', 'sar', 'super', 'avl']

const DEFAULT_SETTINGS = {
  ma: { short: 50, long: 200 },
  ema: { short: 9, long: 21 },
  bb: { period: 20, mult: 2 },
  sar: { step: 0.02, max: 0.2 },
  super: { period: 10, mult: 3 },
  rsi: { period: 14, overbought: 70, oversold: 30 },
  macd: { fast: 12, slow: 26, signal: 9 },
  vol: { period: 20 },
}

const STORAGE = {
  settings: 'cryptool.longterm.indicators',
  alerts: 'cryptool.longterm.alerts',
  strategies: 'cryptool.longterm.strategies',
}

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

const settings = ref({
  ...structuredClone(DEFAULT_SETTINGS),
  ...readStore(STORAGE.settings, {}),
})
const alerts = ref(readStore(STORAGE.alerts, []))
const strategies = ref(readStore(STORAGE.strategies, []))

const overlayLabels = computed(() => ({
  ma: `MA ${settings.value.ma.short}/${settings.value.ma.long}`,
  ema: `EMA ${settings.value.ema.short}/${settings.value.ema.long}`,
  bb: `BB ${settings.value.bb.period}×${settings.value.bb.mult}`,
  sar: 'SAR',
  super: 'SuperTrend',
  avl: `Vol MA ${settings.value.vol.period}`,
}))

const oscillators = computed(() => [
  { value: 'rsi', label: `RSI(${settings.value.rsi.period})` },
  {
    value: 'macd',
    label: `MACD ${settings.value.macd.fast}/${settings.value.macd.slow}`,
  },
  { value: 'vol', label: 'VOL' },
])

const coinId = ref('bitcoin')
const days = ref('365')
const interval = ref('1d')
const chartMode = ref('candles')
const activeOscillator = ref('rsi')
const logScale = ref(true)
const loading = ref(false)
const errorMsg = ref('')
const chartData = ref(null)
const market = ref(null)
const meta = ref(null)
const indicators = ref({ ma: true, ema: false, bb: false, sar: false, super: true, avl: false })
const iSignals = ref({ ma: 'HOLD', ema: 'HOLD', bb: 'HOLD', sar: 'HOLD', super: 'HOLD' })
const oscSignals = ref({ rsi: 'HOLD', macd: 'HOLD' })
const settingsOpen = ref(false)
const settingsTab = ref('indicators')
const livePrice = ref(null)
const alertDraft = ref({ direction: 'above', value: null, notifyBrowser: true })
const strategyBuilder = ref(null)

const candlesList = ref([])
const candleCount = ref(0)
const logos = ref({})

const selectedCoin = computed(() => coins.find((c) => c.value === coinId.value) || coins[0])
const selectedLogo = computed(() => logos.value[coinId.value] || null)

const coinOptions = computed(() =>
  coins.map((c) => ({
    value: c.value,
    label: `${c.label} (${c.symbol})`,
    symbol: c.symbol,
    logo: logos.value[c.value] || null,
  })),
)

function onCandlesReceived(newCandles) {
  candlesList.value = newCandles || []
  candleCount.value = candlesList.value.length
  if (candlesList.value.length > 0) {
    const lastPrice = candlesList.value[candlesList.value.length - 1].close
    if (Number.isFinite(lastPrice)) {
      livePrice.value = lastPrice
      evaluateAlerts(lastPrice)
    }
  }
}

function onSignalReceived(signal) {
  if (signal?.label) {
    iSignals.value.ma = signal.label
  }
}

// lightweight-charts requires strictly ascending, unique timestamps
function dedupe(rows) {
  const out = []
  for (const row of [...rows].sort((a, b) => a.time - b.time)) {
    if (out.length && out[out.length - 1].time === row.time) out[out.length - 1] = row
    else out.push(row)
  }
  return out
}

const priceLine = computed(() => {
  const raw = (candlesList.value || []).map((c) => ({ time: c.time, value: c.close }))
  if (raw.length) return raw
  return dedupe((chartData.value?.prices || []).filter((p) => Number.isFinite(p.value)))
})

const stats = computed(() => {
  const data = priceLine.value
  if (!data.length) return null
  const first = data[0].value
  const last = data[data.length - 1].value
  const high = data.reduce((a, p) => (p.value > a.value ? p : a), data[0])
  const low = data.reduce((a, p) => (p.value < a.value ? p : a), data[0])
  const years = (data[data.length - 1].time - data[0].time) / (365.25 * 24 * 3600)
  const cagr = years > 0.5 && first > 0 ? (Math.pow(last / first, 1 / years) - 1) * 100 : null
  return {
    last,
    changePct: first > 0 ? ((last - first) / first) * 100 : 0,
    high: high.value,
    highDate: new Date(high.time * 1000),
    low: low.value,
    lowDate: new Date(low.time * 1000),
    fromHighPct: high.value > 0 ? ((last - high.value) / high.value) * 100 : 0,
    cagr,
    years,
    from: new Date(data[0].time * 1000),
  }
})

const statCards = computed(() => {
  const s = stats.value
  return [
    { key: 'last', label: t('Last', 'Последна'), value: fmtMoney(s?.last), icon: 'payments' },
    {
      key: 'change',
      label: t('Range change', 'Промяна за периода'),
      value: fmtPct(s?.changePct),
      icon: 'trending_up',
      pct: s?.changePct,
    },
    {
      key: 'high',
      label: t('Period high', 'Връх за периода'),
      value: fmtMoney(s?.high),
      caption: fmtDate(s?.highDate),
      icon: 'arrow_upward',
    },
    {
      key: 'low',
      label: t('Period low', 'Дъно за периода'),
      value: fmtMoney(s?.low),
      caption: fmtDate(s?.lowDate),
      icon: 'arrow_downward',
    },
    {
      key: 'drawdown',
      label: t('From high', 'От върха'),
      value: fmtPct(s?.fromHighPct),
      icon: 'waterfall_chart',
      pct: s?.fromHighPct,
    },
    {
      key: 'cagr',
      label: t('CAGR', 'Год. доходност'),
      value: fmtPct(s?.cagr),
      caption: s?.years ? `${s.years.toFixed(1)} ${t('yrs', 'г.')}` : '',
      icon: 'auto_graph',
      pct: s?.cagr,
    },
  ]
})

const STAT_INFO = {
  last: {
    en: 'The most recent closing price in the loaded range. It updates whenever new data is fetched, and it is the reference used for the drawdown and range change figures.',
    bg: 'Последната затваряща цена в заредения период. Обновява се при всяко зареждане на данни и служи за база при изчисляване на спада от върха и промяната за периода.',
  },
  change: {
    en: 'Percentage difference between the first and the last price of the selected range. It ignores everything in between, so a volatile path and a straight line can produce the same number.',
    bg: 'Процентна разлика между първата и последната цена в избрания период. Не отчита движението между тях, затова волатилен път и права линия могат да дадат еднакъв резултат.',
  },
  high: {
    en: 'Highest price reached inside the selected range, together with the date it happened. This is a range high, not necessarily the all-time high shown in the market panel below.',
    bg: 'Най-високата цена в избрания период и датата, на която е достигната. Това е връх за периода, а не задължително историческият връх от панела по-долу.',
  },
  low: {
    en: 'Lowest price reached inside the selected range, with its date. Useful for judging how wide the trading band has been over the period.',
    bg: 'Най-ниската цена в избрания период и нейната дата. Полезна е за преценка колко широк е бил диапазонът на движение.',
  },
  drawdown: {
    en: 'How far the current price sits below the range high, in percent. A value of -60% means the price would need to roughly triple to reclaim that peak.',
    bg: 'Колко процента под върха за периода се намира текущата цена. Стойност от -60% означава, че цената трябва да се утрои, за да достигне отново върха.',
  },
  cagr: {
    en: 'Compound annual growth rate: the constant yearly return that would take the first price to the last one over the same time span. It smooths out volatility and is only shown for ranges longer than six months.',
    bg: 'Средногодишен сложен темп на растеж: постоянната годишна доходност, която би превърнала първата цена в последната за същия период. Изглажда волатилността и се показва само за периоди над шест месеца.',
  },
}

const infoOpen = ref(false)
const infoKey = ref(null)

const infoCard = computed(() => {
  if (!infoKey.value) return null
  const card = statCards.value.find((c) => c.key === infoKey.value)
  const text = STAT_INFO[infoKey.value]
  return card && text ? { ...card, description: bg.value ? text.bg : text.en } : null
})

function openInfo(key) {
  infoKey.value = key
  infoOpen.value = true
}

// Majority vote across every enabled overlay plus the visible oscillator
const composite = computed(() => {
  const active = overlayKeys.filter((k) => indicators.value[k] && iSignals.value[k])
  const votes = active.map((k) => iSignals.value[k])
  votes.push(oscSignals.value[activeOscillator.value] || 'HOLD')
  const buys = votes.filter((v) => v === 'BUY').length
  const sells = votes.filter((v) => v === 'SELL').length
  const label = buys > sells ? 'BUY' : sells > buys ? 'SELL' : 'HOLD'
  return { label, buys, sells, total: votes.length }
})

const compositeColor = computed(
  () => ({ BUY: 'positive', SELL: 'negative', HOLD: 'grey-7' })[composite.value.label],
)

// const badges = computed(() =>
//   overlayKeys
//     .filter((k) => indicators.value[k])
//     .map((k) => ({ key: k, label: overlayLabels.value[k], signal: iSignals.value[k] || 'HOLD' })),
// )

const fmtMoney = (v) =>
  v == null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: v >= 1000 ? 0 : v >= 1 ? 2 : 6,
        notation: v >= 1_000_000 ? 'compact' : 'standard',
      }).format(v)

const fmtPct = (v) => (v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`)
const fmtDate = (d) => (d && !isNaN(d) ? d.toLocaleDateString(locale.value) : '—')
const pctClass = (v) => (v == null ? 'text-grey-5' : v >= 0 ? 'text-positive' : 'text-negative')
// const signalColor = (s) => ({ BUY: 'positive', SELL: 'negative', HOLD: 'grey-7' })[s] || 'grey-7'

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const [historyRes, marketRes] = await Promise.all([
      getLongTermChart(coinId.value, days.value, 'usd', 'auto'),
      getCoingeckoMarkets([coinId.value]),
    ])

    chartData.value = historyRes?.prices?.length ? historyRes : null
    market.value = marketRes?.[0] || null

    if (market.value?.price) {
      livePrice.value = market.value.price
      evaluateAlerts(livePrice.value)
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = t('Failed to load data.', 'Неуспешно зареждане на данните.')
  } finally {
    loading.value = false
  }
}

async function loadLogos() {
  const rows = await getCoingeckoMarkets(coins.map((c) => c.value))
  logos.value = Object.fromEntries(rows.filter((r) => r.image).map((r) => [r.id, r.image]))
}

// ── Indicator settings ────────────────────────────────────────────────────────
function resetSettings() {
  settings.value = structuredClone(DEFAULT_SETTINGS)
}

function applySettings() {
  $q.notify({ message: t('Indicators updated', 'Индикаторите са обновени'), color: 'positive' })
}

// ── Price alerts ──────────────────────────────────────────────────────────────
const activeAlerts = computed(() => alerts.value.filter((a) => a.coinId === coinId.value))

function addAlert() {
  const value = Number(alertDraft.value.value)
  if (!Number.isFinite(value) || value <= 0) {
    $q.notify({ message: t('Enter a valid price', 'Въведете валидна цена'), color: 'negative' })
    return
  }
  alerts.value = [
    ...alerts.value,
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      coinId: coinId.value,
      symbol: selectedCoin.value.symbol,
      direction: alertDraft.value.direction,
      value,
      notifyBrowser: alertDraft.value.notifyBrowser,
      enabled: true,
      triggeredAt: null,
    },
  ]
  alertDraft.value = { ...alertDraft.value, value: null }
  if (alertDraft.value.notifyBrowser) void requestNotificationPermission()
}

function removeAlert(id) {
  alerts.value = alerts.value.filter((a) => a.id !== id)
}

function toggleAlert(id) {
  alerts.value = alerts.value.map((a) =>
    a.id === id ? { ...a, enabled: !a.enabled, triggeredAt: null } : a,
  )
}

async function requestNotificationPermission() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'default') return
  try {
    await Notification.requestPermission()
  } catch {
    /* permission dialog unavailable */
  }
}

function fireAlert(alert, price) {
  const dir = alert.direction === 'above' ? '≥' : '≤'
  const message = `${alert.symbol} ${dir} ${fmtMoney(alert.value)} — ${fmtMoney(price)}`
  $q.notify({
    message,
    caption: t('Price alert', 'Ценови сигнал'),
    color: alert.direction === 'above' ? 'positive' : 'negative',
    icon: 'notifications_active',
    timeout: 8000,
  })
  if (
    alert.notifyBrowser &&
    typeof Notification !== 'undefined' &&
    Notification.permission === 'granted'
  ) {
    new Notification(t('Price alert', 'Ценови сигнал'), { body: message })
  }
}

function evaluateAlerts(price) {
  if (!Number.isFinite(price)) return
  alerts.value = alerts.value.map((alert) => {
    if (!alert.enabled || alert.coinId !== coinId.value) return alert
    const hit = alert.direction === 'above' ? price >= alert.value : price <= alert.value
    if (hit && !alert.triggeredAt) {
      fireAlert(alert, price)
      return { ...alert, triggeredAt: Date.now() }
    }
    if (!hit && alert.triggeredAt) return { ...alert, triggeredAt: null }
    return alert
  })
}

let alertTimer = null

async function pollPrice() {
  if (!alerts.value.some((a) => a.enabled && a.coinId === coinId.value)) return
  const rows = await getCoingeckoMarkets([coinId.value])
  const price = rows?.[0]?.price
  if (Number.isFinite(price)) {
    livePrice.value = price
    evaluateAlerts(price)
  }
}

function settingsTabOpen(tab) {
  settingsTab.value = tab
  settingsOpen.value = true
}

// ── Draggable live chart window ───────────────────────────────────────────────
const liveChartOpen = ref(false)
const liveChartMaximized = ref(false)
const liveSymbol = computed(() => `${selectedCoin.value.symbol}USDC`)
const windowPos = ref({ x: 120, y: 90 })
const dragState = { active: false, offsetX: 0, offsetY: 0 }

function openLiveChart() {
  liveChartOpen.value = true
}

function startDrag(event) {
  if (liveChartMaximized.value) return
  dragState.active = true
  dragState.offsetX = event.clientX - windowPos.value.x
  dragState.offsetY = event.clientY - windowPos.value.y
  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', stopDrag)
}

function onDrag(event) {
  if (!dragState.active) return
  const maxX = window.innerWidth - 200
  const maxY = window.innerHeight - 60
  windowPos.value = {
    x: Math.min(Math.max(event.clientX - dragState.offsetX, -160), maxX),
    y: Math.min(Math.max(event.clientY - dragState.offsetY, 0), maxY),
  }
}

function stopDrag() {
  dragState.active = false
  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', stopDrag)
}

const settingsMA = (x, y) => {
  settings.value.ma.short = x
  settings.value.ma.long = y
}

watch(settings, (val) => writeStore(STORAGE.settings, val), { deep: true })
watch(alerts, (val) => writeStore(STORAGE.alerts, val), { deep: true })
watch(strategies, (val) => writeStore(STORAGE.strategies, val), { deep: true })
watch([coinId, days, interval], load)

onMounted(async () => {
  await nextTick()
  void loadLogos()
  await load()
  void strategyBuilder.value?.runAll()
  alertTimer = setInterval(() => {
    void pollPrice()
    void strategyBuilder.value?.runAll()
  }, 60000)
})

onBeforeUnmount(() => {
  clearInterval(alertTimer)
  stopDrag()
})
</script>

<template>
  <div class="long-term q-pa-md">
    <!-- Header -->
    <div class="row items-center q-col-gutter-md q-mb-md">
      <div class="col-auto">
        <q-avatar size="46px" class="coin-avatar text-weight-bold">
          <img v-if="selectedLogo" :src="selectedLogo" :alt="selectedCoin.symbol" />
          <template v-else>{{ selectedCoin.symbol }}</template>
        </q-avatar>
      </div>
      <div v-if="!$q.screen.lt.sm" class="col">
        <div class="text-h5 text-weight-bold text-white">
          {{ selectedCoin.label }}
          <span class="text-grey-6 text-subtitle1">/ USD</span>
        </div>
        <div class="text-caption text-grey-6">
          {{ t('Long term history', 'Дългосрочна история') }}
          <span v-if="stats"> · {{ t('since', 'от') }} {{ fmtDate(stats.from) }}</span>
          <span v-if="meta">
            · {{ meta.interval }} · {{ candleCount }} {{ t('bars', 'бара') }}</span
          >
        </div>
      </div>
      <q-space v-else />
      <div class="col-auto text-right">
        <div class="text-h5 text-weight-bold text-white">{{ fmtMoney(stats?.last) }}</div>
        <div class="text-caption" :class="pctClass(stats?.changePct)">
          {{ fmtPct(stats?.changePct) }}
          <span class="text-grey-6">{{ t('this range', 'за периода') }}</span>
        </div>
      </div>
      <div class="col-auto">
        <q-chip :color="compositeColor" text-color="grey-10" class="text-weight-bold" square>
          {{ composite.label }}
        </q-chip>
      </div>
    </div>

    <!-- Controls -->
    <q-card flat class="panel q-pa-sm q-mb-md">
      <div class="row items-center q-col-gutter-sm">
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="coinId"
            :options="coinOptions"
            emit-value
            map-options
            dense
            outlined
            dark
            color="orange-6"
            :label="t('Asset', 'Актив')"
          >
            <template #prepend>
              <q-avatar size="22px" class="coin-avatar text-caption">
                <img v-if="selectedLogo" :src="selectedLogo" :alt="selectedCoin.symbol" />
                <template v-else>{{ selectedCoin.symbol.slice(0, 1) }}</template>
              </q-avatar>
            </template>
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar size="24px" class="coin-avatar text-caption">
                    <img v-if="scope.opt.logo" :src="scope.opt.logo" :alt="scope.opt.symbol" />
                    <template v-else>{{ scope.opt.symbol.slice(0, 1) }}</template>
                  </q-avatar>
                </q-item-section>
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-auto">
          <q-btn-toggle
            v-model="days"
            dense
            unelevated
            no-caps
            class="toggle-pill"
            text-color="grey-5"
            toggle-color="orange-7"
            toggle-text-color="grey-10"
            :options="ranges.map((r) => ({ value: r.value, label: bg ? r.labelBg : r.labelEn }))"
          />
        </div>
        <div class="col-auto">
          <q-btn-toggle
            v-model="interval"
            dense
            unelevated
            no-caps
            class="toggle-pill"
            text-color="grey-5"
            toggle-color="blue-grey-6"
            toggle-text-color="grey-10"
            :options="intervals"
          />
        </div>
        <div class="col-auto">
          <q-btn-toggle
            v-model="chartMode"
            dense
            unelevated
            no-caps
            class="toggle-pill"
            text-color="grey-5"
            toggle-color="cyan-8"
            toggle-text-color="grey-10"
            :options="[
              { value: 'candles', label: t('Candles', 'Свещи'), disable: !candleCount },
              { value: 'area', label: t('Area', 'Площ') },
            ]"
          />
        </div>
        <div class="col-auto">
          <q-toggle
            v-model="logScale"
            dense
            dark
            color="orange-6"
            class="text-grey-5"
            :label="t('Log', 'Лог')"
          />
        </div>
        <q-space />
        <div class="col-auto q-gutter-sm">
          <q-btn
            flat
            round
            dense
            color="grey-5"
            icon="notifications"
            @click="settingsTabOpen('alerts')"
          >
            <q-badge v-if="activeAlerts.length" floating color="orange-7" text-color="grey-10">
              {{ activeAlerts.length }}
            </q-badge>
          </q-btn>
          <q-btn flat round dense color="grey-5" icon="candlestick_chart" @click="openLiveChart" />
          <q-btn
            flat
            round
            dense
            color="grey-5"
            icon="tune"
            @click="settingsTabOpen('indicators')"
          />
          <q-btn flat round dense color="grey-5" icon="refresh" :loading="loading" @click="load" />
        </div>
      </div>

      <q-separator dark class="q-my-sm" />

      <div class="row items-center q-gutter-sm">
        <q-btn
          v-for="key in overlayKeys"
          :key="key"
          dense
          unelevated
          no-caps
          size="sm"
          class="ind-btn"
          :class="{ 'ind-btn--on': indicators[key] }"
          :label="overlayLabels[key]"
          @click="toggleIndicator(key)"
        />
        <q-space />
        <q-btn-toggle
          v-model="activeOscillator"
          dense
          unelevated
          no-caps
          size="sm"
          class="toggle-pill"
          text-color="grey-5"
          toggle-color="purple-6"
          toggle-text-color="grey-10"
          :options="oscillators"
        />
      </div>
    </q-card>

    <q-banner v-if="errorMsg" class="error-banner q-mb-md" rounded dense>
      <template #avatar><q-icon name="warning" color="negative" /></template>
      {{ errorMsg }}
    </q-banner>

    <!-- Active alerts -->
    <div v-if="activeAlerts.length" class="row items-center q-gutter-sm q-mb-md">
      <q-chip
        v-for="alert in activeAlerts"
        :key="alert.id"
        dense
        square
        removable
        :color="alert.triggeredAt ? 'orange-9' : 'blue-grey-9'"
        text-color="grey-3"
        :icon="alert.direction === 'above' ? 'trending_up' : 'trending_down'"
        @remove="removeAlert(alert.id)"
        @click="toggleAlert(alert.id)"
      >
        {{ alert.symbol }} {{ alert.direction === 'above' ? '≥' : '≤' }} {{ fmtMoney(alert.value) }}
        <span v-if="!alert.enabled" class="q-ml-xs text-grey-6">({{ t('off', 'изкл.') }})</span>
      </q-chip>
      <span v-if="livePrice" class="text-caption text-grey-6 q-ml-sm">
        {{ t('live', 'на живо') }}: {{ fmtMoney(livePrice) }}
      </span>
    </div>

    <!-- Stat tiles -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div v-for="card in statCards" :key="card.key" class="col-6 col-md-2">
        <q-card flat class="panel stat-tile q-pa-sm cursor-pointer" @click="openInfo(card.key)">
          <div class="row items-center no-wrap">
            <q-icon :name="card.icon" size="16px" class="q-mr-xs text-grey-6" />
            <div class="text-caption text-grey-6 ellipsis">{{ card.label }}</div>
            <q-space />
            <q-icon name="info_outline" size="14px" class="tile-info" />
          </div>
          <div
            class="text-subtitle1 text-weight-bold"
            :class="card.pct != null ? pctClass(card.pct) : 'text-white'"
          >
            {{ card.value }}
          </div>
          <div v-if="card.caption" class="text-caption text-grey-7">{{ card.caption }}</div>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="infoOpen" transition-duration="500">
      <q-card v-if="infoCard" flat class="info-dialog q-pa-md">
        <div class="row items-center q-mb-sm">
          <q-icon :name="infoCard.icon" size="22px" class="q-mr-sm text-orange-6" />
          <div class="text-subtitle1 text-weight-bold text-white">{{ infoCard.label }}</div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="grey-5" />
        </div>
        <div
          class="text-h6 q-mb-sm"
          :class="infoCard.pct != null ? pctClass(infoCard.pct) : 'text-white'"
        >
          {{ infoCard.value }}
          <span v-if="infoCard.caption" class="text-caption text-grey-7">
            · {{ infoCard.caption }}
          </span>
        </div>
        <div class="text-body2 text-grey-4">{{ infoCard.description }}</div>
      </q-card>
    </q-dialog>

    <!-- Draggable live chart window -->
    <Teleport to="body">
      <div
        v-if="liveChartOpen"
        class="live-window"
        :class="{ 'live-window--max': liveChartMaximized }"
        :style="liveChartMaximized ? null : { left: `${windowPos.x}px`, top: `${windowPos.y}px` }"
      >
        <div class="live-window__bar" @pointerdown="startDrag">
          <q-icon name="drag_indicator" size="18px" class="text-grey-6" />
          <q-avatar size="22px" class="coin-avatar text-caption q-mr-xs">
            <img v-if="selectedLogo" :src="selectedLogo" :alt="selectedCoin.symbol" />
            <template v-else>{{ selectedCoin.symbol.slice(0, 1) }}</template>
          </q-avatar>
          <span class="text-subtitle2 text-white">{{ liveSymbol }}</span>
          <span class="text-caption text-grey-6 q-ml-sm">{{ t('live', 'на живо') }}</span>
          <q-space />
          <q-btn
            flat
            round
            dense
            size="sm"
            color="grey-5"
            :icon="liveChartMaximized ? 'close_fullscreen' : 'open_in_full'"
            @click="liveChartMaximized = !liveChartMaximized"
          />
          <q-btn
            flat
            round
            dense
            size="sm"
            color="grey-5"
            icon="close"
            @click="liveChartOpen = false"
          />
        </div>
        <div class="live-window__body">
          <CryptoChart
            :key="liveSymbol"
            :symbol="liveSymbol"
            controls
            hide-header
            :drop-down="false"
          />
        </div>
      </div>
    </Teleport>

    <!-- Main United Chart -->
    <q-card flat class="panel chart-panel relative-position">
      <CryptoChart
        :symbol="liveSymbol"
        v-model:range="days"
        v-model:interval="interval"
        v-model:chart-mode="chartMode"
        v-model:log-scale="logScale"
        v-model:ma-short="settings.ma.short"
        v-model:ma-long="settings.ma.long"
        v-model:ema-short="settings.ema.short"
        v-model:ema-long="settings.ema.long"
        v-model:bb-period="settings.bb.period"
        v-model:bb-mult="settings.bb.mult"
        v-model:sar-step="settings.sar.step"
        v-model:sar-max="settings.sar.max"
        v-model:super-period="settings.super.period"
        v-model:super-mult="settings.super.mult"
        v-model:rsi-period="settings.rsi.period"
        v-model:rsi-overbought="settings.rsi.overbought"
        v-model:rsi-oversold="settings.rsi.oversold"
        v-model:macd-fast="settings.macd.fast"
        v-model:macd-slow="settings.macd.slow"
        v-model:macd-signal="settings.macd.signal"
        v-model:avl-period="settings.vol.period"
        controls
        hide-header
        :drop-down="false"
        @update:candles="onCandlesReceived"
        @update:signal="onSignalReceived"
      />
    </q-card>

    <!-- Market facts -->
    <q-card v-if="market" flat class="panel q-mt-md q-pa-md">
      <div class="row q-col-gutter-md text-body2">
        <div class="col-6 col-md-3">
          <div class="text-caption text-grey-6">{{ t('All time high', 'Исторически връх') }}</div>
          <div class="text-white">
            {{ fmtMoney(market.ath) }}
            <span class="text-grey-7">· {{ fmtDate(new Date(market.athDate)) }}</span>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="text-caption text-grey-6">{{ t('All time low', 'Историческо дъно') }}</div>
          <div class="text-white">
            {{ fmtMoney(market.atl) }}
            <span class="text-grey-7">· {{ fmtDate(new Date(market.atlDate)) }}</span>
          </div>
        </div>
        <div class="col-6 col-md-2">
          <div class="text-caption text-grey-6">{{ t('Market cap', 'Пазарна кап.') }}</div>
          <div class="text-white">{{ fmtMoney(market.marketCap) }}</div>
        </div>
        <div class="col-6 col-md-2">
          <div class="text-caption text-grey-6">{{ t('1Y change', 'Промяна 1Г') }}</div>
          <div :class="pctClass(market.change1y)">{{ fmtPct(market.change1y) }}</div>
        </div>
        <div class="col-6 col-md-2">
          <div class="text-caption text-grey-6">{{ t('200D change', 'Промяна 200Д') }}</div>
          <div :class="pctClass(market.change200d)">{{ fmtPct(market.change200d) }}</div>
        </div>
      </div>
    </q-card>

    <div class="row items-center q-mt-sm text-caption text-grey-7">
      <q-badge outline color="orange-6" class="q-mr-sm">
        {{ chartMode === 'candles' ? meta?.source || '—' : chartData?.source || '—' }}
      </q-badge>
      <span>{{ t('Long term data + technical overlays', 'Дългосрочни данни + индикатори') }}</span>
    </div>

    <!-- Customisation -->
    <q-dialog v-model="settingsOpen" position="right" full-height transition-duration="500">
      <q-card flat class="settings-drawer column no-wrap">
        <q-toolbar class="settings-header">
          <q-avatar size="28px" class="coin-avatar text-caption">
            <img v-if="selectedLogo" :src="selectedLogo" :alt="selectedCoin.symbol" />
            <template v-else>{{ selectedCoin.symbol.slice(0, 1) }}</template>
          </q-avatar>
          <q-toolbar-title class="text-subtitle1 text-white">
            {{ t('Customise', 'Настройки') }}
          </q-toolbar-title>
          <q-btn v-close-popup flat round dense icon="close" color="grey-5" />
        </q-toolbar>

        <q-tabs
          v-model="settingsTab"
          dense
          no-caps
          active-color="orange-6"
          indicator-color="orange-6"
          class="text-grey-5"
        >
          <q-tab name="indicators" icon="show_chart" :label="t('Indicators', 'Индикатори')" />
          <q-tab name="alerts" icon="notifications" :label="t('Alerts', 'Сигнали')" />
          <q-tab name="strategy" icon="savings" :label="t('Strategy', 'Стратегия')" />
        </q-tabs>
        <q-separator dark />

        <q-tab-panels v-model="settingsTab" animated class="settings-panels col">
          <!-- Indicators -->
          <q-tab-panel name="indicators" class="q-gutter-md">
            <div class="text-caption text-grey-6">
              {{
                t(
                  'Periods apply to the selected candle interval.',
                  'Периодите важат за избрания интервал на свещите.',
                )
              }}
            </div>

            <div class="setting-group">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-subtitle2 text-white">
                  {{ t('Moving average', 'Пълзяща средна') }}
                </div>
                <q-btn-group unelevated outline size="xs">
                  <q-btn
                    dense
                    no-caps
                    size="xs"
                    :color="
                      settings.ma.short === 5 && settings.ma.long === 20 ? 'orange-7' : 'grey-8'
                    "
                    label="5/20"
                    @click="settingsMA(5, 20)"
                  />
                  <q-btn
                    dense
                    no-caps
                    size="xs"
                    :color="
                      settings.ma.short === 50 && settings.ma.long === 200 ? 'orange-7' : 'grey-8'
                    "
                    label="50/200"
                    @click="settingsMA(50, 200)"
                  />
                </q-btn-group>
              </div>
              <div class="text-caption text-grey-5 q-mb-xs">
                {{
                  t(
                    'Smooths price data to identify trend direction and crossover signals.',
                    'Изглажда цената за определяне на посоката на тренда и сигнали за пресичане.',
                  )
                }}
              </div>
              <div class="row q-col-gutter-sm">
                <q-input
                  v-model.number="settings.ma.short"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Fast (X)', 'Бърза (X)')"
                />
                <q-input
                  v-model.number="settings.ma.long"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Slow (Y)', 'Бавна (Y)')"
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="text-subtitle2 text-white q-mb-xs">EMA</div>
              <div class="text-caption text-grey-5 q-mb-xs">
                {{
                  t(
                    'Exponential average giving higher weight to recent price changes.',
                    'Експоненциална средна с по-голяма тежест за последните цени.',
                  )
                }}
              </div>
              <div class="row q-col-gutter-sm">
                <q-input
                  v-model.number="settings.ema.short"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Fast', 'Бърза')"
                />
                <q-input
                  v-model.number="settings.ema.long"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Slow', 'Бавна')"
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="text-subtitle2 text-white q-mb-xs">{{ t('Bollinger', 'Болинджър') }}</div>
              <div class="text-caption text-grey-5 q-mb-xs">
                {{
                  t(
                    'Volatility bands above/below SMA. Band squeezes signal price breakouts.',
                    'Ленти за волатилност около пълзяща средна. Свиването показва нов тренд.',
                  )
                }}
              </div>
              <div class="row q-col-gutter-sm">
                <q-input
                  v-model.number="settings.bb.period"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Period', 'Период')"
                />
                <q-input
                  v-model.number="settings.bb.mult"
                  class="col"
                  type="number"
                  step="0.1"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Deviation', 'Отклонение')"
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="text-subtitle2 text-white q-mb-xs">Parabolic SAR</div>
              <div class="text-caption text-grey-5 q-mb-xs">
                {{
                  t(
                    'Trailing stop-and-reverse dots indicating trend direction and reversals.',
                    'Следващи точки за затваряне и обръщане, показващи посоката и обрата.',
                  )
                }}
              </div>
              <div class="row q-col-gutter-sm">
                <q-input
                  v-model.number="settings.sar.step"
                  class="col"
                  type="number"
                  step="0.005"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Step AF', 'Стъпка AF')"
                />
                <q-input
                  v-model.number="settings.sar.max"
                  class="col"
                  type="number"
                  step="0.05"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Max AF', 'Макс AF')"
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="text-subtitle2 text-white q-mb-xs">Supertrend</div>
              <div class="text-caption text-grey-5 q-mb-xs">
                {{
                  t(
                    'ATR-based trend-following indicator showing trailing support/resistance.',
                    'Воден от ATR индикатор, показващ динамични нива на подкрепа/съпротива.',
                  )
                }}
              </div>
              <div class="row q-col-gutter-sm">
                <q-input
                  v-model.number="settings.super.period"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Period', 'Период')"
                />
                <q-input
                  v-model.number="settings.super.mult"
                  class="col"
                  type="number"
                  step="0.5"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Multiplier', 'Множител')"
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="text-subtitle2 text-white q-mb-xs">RSI</div>
              <div class="text-caption text-grey-5 q-mb-xs">
                {{
                  t(
                    'Momentum oscillator (0-100) detecting overbought/oversold price levels.',
                    'Осцилатор за импулс (0-100) за откриване на свръхкупени/свръхпродадени нива.',
                  )
                }}
              </div>
              <div class="row q-col-gutter-sm">
                <q-input
                  v-model.number="settings.rsi.period"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Period', 'Период')"
                />
                <q-input
                  v-model.number="settings.rsi.overbought"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Overbought', 'Свръхкупен')"
                />
                <q-input
                  v-model.number="settings.rsi.oversold"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Oversold', 'Свръхпродаден')"
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="text-subtitle2 text-white q-mb-xs">MACD</div>
              <div class="text-caption text-grey-5 q-mb-xs">
                {{
                  t(
                    'Trend-following momentum indicator showing the distance between EMAs.',
                    'Индикатор за импулс, показващ разликата между бърза и бавна ЕМА.',
                  )
                }}
              </div>
              <div class="row q-col-gutter-sm">
                <q-input
                  v-model.number="settings.macd.fast"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Fast', 'Бърза')"
                />
                <q-input
                  v-model.number="settings.macd.slow"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Slow', 'Бавна')"
                />
                <q-input
                  v-model.number="settings.macd.signal"
                  class="col"
                  type="number"
                  dense
                  outlined
                  dark
                  color="orange-6"
                  :label="t('Signal', 'Сигнал')"
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="text-subtitle2 text-white q-mb-xs">{{ t('Volume MA', 'Обем MA') }}</div>
              <div class="text-caption text-grey-5 q-mb-xs">
                {{
                  t(
                    'Moving average line calculated on trading volume bars.',
                    'Пълзяща средна, изчислена върху стълбовете на търговския обем.',
                  )
                }}
              </div>
              <q-input
                v-model.number="settings.vol.period"
                type="number"
                dense
                outlined
                dark
                color="orange-6"
                :label="t('Period', 'Период')"
              />
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                unelevated
                no-caps
                color="orange-7"
                text-color="grey-10"
                :label="t('Apply', 'Приложи')"
                @click="applySettings"
              />
              <q-btn
                flat
                no-caps
                color="grey-5"
                :label="t('Reset', 'Нулирай')"
                @click="resetSettings"
              />
            </div>
          </q-tab-panel>

          <!-- Alerts -->
          <q-tab-panel name="alerts" class="q-gutter-md">
            <div class="text-caption text-grey-6">
              {{
                t(
                  'Alerts are checked every minute while this page is open.',
                  'Сигналите се проверяват всяка минута, докато страницата е отворена.',
                )
              }}
            </div>

            <div class="setting-group q-gutter-sm">
              <q-btn-toggle
                v-model="alertDraft.direction"
                spread
                dense
                unelevated
                no-caps
                class="toggle-pill"
                text-color="grey-5"
                toggle-color="orange-7"
                toggle-text-color="grey-10"
                :options="[
                  { value: 'above', label: t('Above', 'Над') },
                  { value: 'below', label: t('Below', 'Под') },
                ]"
              />
              <q-input
                v-model.number="alertDraft.value"
                type="number"
                dense
                outlined
                dark
                color="orange-6"
                :label="`${t('Price', 'Цена')} (USD)`"
                :hint="livePrice ? `${t('now', 'сега')}: ${fmtMoney(livePrice)}` : ''"
              />
              <q-toggle
                v-model="alertDraft.notifyBrowser"
                dense
                dark
                color="orange-6"
                class="text-grey-5"
                :label="t('Browser notification', 'Известие в браузъра')"
              />
              <q-btn
                unelevated
                no-caps
                color="orange-7"
                text-color="grey-10"
                icon="add_alert"
                :label="`${t('Add alert for', 'Добави сигнал за')} ${selectedCoin.symbol}`"
                @click="addAlert"
              />
            </div>

            <q-list v-if="alerts.length" separator dark class="setting-group">
              <q-item v-for="alert in alerts" :key="alert.id">
                <q-item-section avatar>
                  <q-avatar size="26px" class="coin-avatar text-caption">
                    <img
                      v-if="logos[alert.coinId]"
                      :src="logos[alert.coinId]"
                      :alt="alert.symbol"
                    />
                    <template v-else>{{ alert.symbol.slice(0, 1) }}</template>
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-white">
                    {{ alert.symbol }} {{ alert.direction === 'above' ? '≥' : '≤' }}
                    {{ fmtMoney(alert.value) }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{
                      alert.triggeredAt
                        ? `${t('triggered', 'задействан')} ${fmtDate(new Date(alert.triggeredAt))}`
                        : t('armed', 'активен')
                    }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center q-gutter-sm">
                    <q-toggle
                      :model-value="alert.enabled"
                      dense
                      dark
                      color="orange-6"
                      @update:model-value="toggleAlert(alert.id)"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="grey-6"
                      @click="removeAlert(alert.id)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-caption text-grey-7">
              {{ t('No alerts yet.', 'Все още няма сигнали.') }}
            </div>
          </q-tab-panel>

          <!-- Strategy -->
          <q-tab-panel name="strategy" class="q-gutter-sm">
            <StrategyBuilder
              ref="strategyBuilder"
              v-model="strategies"
              :coin-options="coinOptions"
              :coin-id="coinId"
              :symbol="selectedCoin.symbol"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.long-term {
  background: radial-gradient(1200px 600px at 15% -10%, #1c2430 0%, #101318 55%, #0b0d11 100%);
  min-height: 100%;
  color: #cfd6e0;
}

.panel {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  backdrop-filter: blur(6px);
}

.stat-tile {
  height: 84px;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.stat-tile:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 169, 0, 0.45);
  background: rgba(242, 169, 0, 0.06);
}

.tile-info {
  color: rgba(255, 255, 255, 0.18);
  transition: color 0.15s ease;
}

.stat-tile:hover .tile-info {
  color: #f2a900;
}

.info-dialog {
  width: 460px;
  max-width: 90vw;
  background: #14181f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.chart-panel {
  padding: 4px;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.35);
}

.chart-loader {
  background: rgba(11, 13, 17, 0.65);
}

.main-chart {
  width: 100%;
  height: 420px;
}

.sub-chart {
  width: 100%;
  height: 150px;
}

.coin-avatar {
  background: linear-gradient(135deg, #f2a900, #b96f00);
  color: #14181f;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.toggle-pill {
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 8px;
  overflow: hidden;
}

.ind-btn {
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 8px;
  color: #8b949e;
}

.ind-btn--on {
  border-color: rgba(242, 169, 0, 0.6);
  background: rgba(242, 169, 0, 0.14);
  color: #f2a900;
}

.error-banner {
  background: rgba(244, 67, 54, 0.12);
  border: 1px solid rgba(244, 67, 54, 0.35);
  color: #ffb4ae;
}

.settings-drawer {
  width: 420px;
  max-width: 100vw;
  background: #14181f;
  color: #cfd6e0;
}

.settings-header {
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  gap: 10px;
}

.settings-panels {
  background: transparent;
  overflow-y: auto;
}

.setting-group {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 10px;
}

.live-window {
  position: fixed;
  z-index: 7000;
  width: 720px;
  max-width: 96vw;
  min-width: 320px;
  min-height: 260px;
  resize: both;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #14181f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
}

.live-window--max {
  inset: 12px;
  width: auto;
  height: auto;
  resize: none;
}

.live-window__bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  cursor: move;
  touch-action: none;
  user-select: none;
}

.live-window__body {
  flex: 1;
  overflow: auto;
  padding: 6px;
}
</style>
