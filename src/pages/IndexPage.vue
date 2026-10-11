<template>
  <q-page
    class="ct-page"
    @pointerenter="updateSniperPosition"
    @pointermove="updateSniperPosition"
    @pointerleave="resetSniperPosition"
    @click="handleShoot"
  >
    <div class="ct-target-field" aria-hidden="true">
      <template v-for="target in columns" :key="target.id">
        <component
          v-if="target.component"
          :is="target.component"
          class="ct-falling-target"
          :style="targetStyle(target)"
          v-bind="target.props"
        />
        <img
          v-else
          :src="target.image"
          alt=""
          class="ct-falling-target ct-falling-logo"
          :style="targetStyle(target)"
        />
      </template>
    </div>

    <img
      :src="sniperImage"
      :alt="t('app.pages.index.crosshair')"
      :style="{
        left: `${sniperPosition.left}px`,
        top: `${sniperPosition.top}px`,
        width: '44px',
        height: '44px',
        pointerEvents: 'none',
        zIndex: 1000,
        position: 'fixed',
        opacity: sniperVisible ? 1 : 0,
        transform: 'translate(-50%, -50%)',
      }"
    />

    <div class="ct-scanlines"></div>
    <div class="ct-vignette"></div>

    <q-btn
      v-if="!$q.screen.lt.sm"
      flat
      round
      dense
      class="ct-sound-toggle"
      :icon="isMuted ? 'volume_off' : 'volume_up'"
      :aria-label="isMuted ? t('app.pages.index.unmute') : t('app.pages.index.mute')"
      @click.stop="toggleMute"
    />

    <div class="ct-kill-counter" :style="counterStyle" aria-live="polite">
      <q-icon name="gps_fixed" size="18px" class="ct-counter-icon" />
      <div class="ct-counter-value" :key="hitCount">{{ hitCount }}</div>
      <div class="ct-counter-label">{{ t('app.pages.index.shots') }}</div>
    </div>

    <div class="ct-content">
      <div class="ct-badge">
        <span class="ct-dot"></span>
        <span class="ct-live">{{ t('app.pages.index.live') }}</span>
        {{ t('app.pages.index.simulation') }}
      </div>

      <h1 class="ct-title">
        <span class="ct-title-line ct-title-main">{{ t('app.pages.index.titleMain') }}</span>
        <span class="ct-title-line ct-title-sub" :data-text="t('app.pages.index.titleSub')">{{
          t('app.pages.index.titleSub')
        }}</span>
      </h1>

      <p class="ct-tagline" :data-text="t('app.pages.index.tagline')">
        {{ t('app.pages.index.tagline') }}
      </p>

      <div class="ct-ticker">
        <div class="ct-ticker-track">
          <span v-for="(tk, i) in [...tickers, ...tickers]" :key="i" class="ct-ticker-item">
            <strong class="ct-ticker-symbol">{{ tk.symbol }}</strong>
            <strong>{{ tk.price }}</strong>
            <span v-if="tk.change !== '--'" :class="['ct-change', tk.up ? 'ct-up' : 'ct-down']">
              <span class="ct-arrow">{{ tk.up ? '▲' : '▼' }}</span
              >{{ tk.change }}
            </span>
            <span v-else class="ct-change">{{ tk.change }}</span>
          </span>
        </div>
      </div>

      <div class="ct-cta-row">
        <q-btn
          unelevated
          no-caps
          class="ct-btn-primary"
          :label="t('app.pages.index.startTrading')"
          icon="rocket_launch"
          size="lg"
          to="/crypto-trader"
        />
        <q-btn
          flat
          no-caps
          class="ct-btn-secondary"
          :label="t('app.pages.index.learnCrypto')"
          icon="menu_book"
          size="lg"
          to="/crypto-fundamentals"
        />
      </div>

      <div class="ct-stats">
        <div class="ct-stat" v-for="s in stats" :key="s.label">
          <div class="ct-stat-value">{{ s.value }}</div>
          <div class="ct-stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed, markRaw, onBeforeUnmount, onMounted, ref } from 'vue'
import { useBinanceStore } from 'src/stores/binance'
import { useLocalized } from 'src/composables/useLocalized'
import sniperImage from 'src/assets/sniper.svg'
import AdaIndicator from 'src/components/crypto/coin-view/AdaIndicator.vue'
import BnbIndicator from 'src/components/crypto/coin-view/BnbIndicator.vue'
import BtcIndicator from 'src/components/crypto/coin-view/BtcIndicator.vue'
import EthIndicator from 'src/components/crypto/coin-view/EthIndicator.vue'
import LinkIndicator from 'src/components/crypto/coin-view/LinkIndicator.vue'
import SolIndicator from 'src/components/crypto/coin-view/SolIndicator.vue'
import aaveLogo from 'src/assets/icons/aave.png'
import avalancheLogo from 'src/assets/icons/avalanche.png'
import chainlinkLogo from 'src/assets/icons/chainlink.png'
import dogecoinLogo from 'src/assets/icons/dogecoin.png'
import litecoinLogo from 'src/assets/icons/litecoin.png'
import polkadotLogo from 'src/assets/icons/polkadot-new.png'
import stellarLogo from 'src/assets/icons/stellar.png'
import uniswapLogo from 'src/assets/icons/uniswap.png'

const $q = useQuasar()
const { t } = useLocalized()

const binanceStore = useBinanceStore()

const sniperPosition = ref({ left: 40, top: 33 })
const sniperVisible = ref(false)
const isMuted = ref(false)
const audioContext = ref(null)
let animationId = null

const columns = ref([])
const SIDE_ZONE_RATIO = 0.3

const HIT_COUNT_STORAGE_KEY = 'cryptool-shot-count'

function loadHitCount() {
  try {
    const stored = Number.parseInt(localStorage.getItem(HIT_COUNT_STORAGE_KEY), 10)
    return Number.isFinite(stored) && stored >= 0 ? stored : 0
  } catch {
    return 0
  }
}

const hitCount = ref(loadHitCount())
const counterSide = ref('right')
const counterVisible = ref(false)
const pageWidth = ref(window.innerWidth)
const COUNTER_WIDTH = 150
const COUNTER_MARGIN = 24
const COUNTER_HIDE_DELAY = 5000
let counterHideTimer = null

function showCounter() {
  counterVisible.value = true
  clearTimeout(counterHideTimer)
  counterHideTimer = setTimeout(() => {
    counterVisible.value = false
  }, COUNTER_HIDE_DELAY)
}

const counterStyle = computed(() => ({
  opacity: counterVisible.value ? 1 : 0,
  transform:
    counterSide.value === 'right'
      ? `translateX(${pageWidth.value - COUNTER_WIDTH - COUNTER_MARGIN * 2}px)`
      : 'translateX(0)',
}))
const COIN_COMPONENTS = [
  { component: markRaw(BtcIndicator), props: { btcValue: 0.999 } },
  { component: markRaw(EthIndicator), props: { ethValue: 0.999 } },
  { component: markRaw(SolIndicator), props: { solValue: 0.999 } },
  { component: markRaw(BnbIndicator), props: { bnbValue: 0.999 } },
  { component: markRaw(LinkIndicator), props: { linkValue: 0.999 } },
  { component: markRaw(AdaIndicator), props: { adaValue: 0.999 } },
  { image: aaveLogo },
  { image: avalancheLogo },
  { image: chainlinkLogo },
  { image: dogecoinLogo },
  { image: litecoinLogo },
  { image: polkadotLogo },
  { image: stellarLogo },
  { image: uniswapLogo },
]
let targetId = 0

function randomCoin() {
  const coin = COIN_COMPONENTS[Math.floor(Math.random() * COIN_COMPONENTS.length)]

  return {
    id: (targetId += 1),
    component: coin.component,
    image: coin.image,
    props: { ...coin.props, size: '46px', emptyOpacity: 1 },
    size: 46,
    speed: 0.65 + Math.random() * 1.5,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.08,
  }
}

function targetStyle(target) {
  return {
    transform: `translate(${target.x - target.size / 2}px, ${target.y - target.size / 2}px) rotate(${target.rotation}rad)`,
    width: `${target.size}px`,
    height: `${target.size}px`,
  }
}

function buildColumns(pageWidth, pageHeight) {
  columns.value = []
  const leftZoneEnd = pageWidth * SIDE_ZONE_RATIO
  const rightZoneStart = pageWidth * (1 - SIDE_ZONE_RATIO)
  const targetCount = Math.max(6, Math.min(12, Math.floor((pageWidth * pageHeight) / 30000)))

  for (let i = 0; i < targetCount; i += 1) {
    const onLeft = Math.random() < 0.5
    const x = onLeft
      ? Math.random() * leftZoneEnd
      : rightZoneStart + Math.random() * (pageWidth - rightZoneStart)

    columns.value.push({
      x,
      y: Math.random() * -pageHeight,
      ...randomCoin(),
    })
  }
}

function resize() {
  pageWidth.value = window.innerWidth
  buildColumns(window.innerWidth, window.innerHeight)
}

function updateSniperPosition(event) {
  const page = event.currentTarget
  if (!page) return

  const bounds = page.getBoundingClientRect()
  const halfSize = 18
  const x = event.clientX - bounds.left
  const isLeftZone = x <= bounds.width * SIDE_ZONE_RATIO
  const isSideZone = isLeftZone || x >= bounds.width * (1 - SIDE_ZONE_RATIO)

  page.style.cursor = isSideZone ? 'none' : 'auto'
  sniperVisible.value = isSideZone
  if (!isSideZone) return

  counterSide.value = isLeftZone ? 'right' : 'left'

  sniperPosition.value = {
    left: Math.min(Math.max(event.clientX, halfSize), window.innerWidth - halfSize),
    top: Math.min(Math.max(event.clientY, bounds.top + halfSize), bounds.bottom - halfSize),
  }
}

function resetSniperPosition(event) {
  const page = event.currentTarget
  if (page) page.style.cursor = 'auto'
  sniperVisible.value = false
}

function respawnCoin(col, width) {
  const onLeft = Math.random() < 0.5
  const leftZoneEnd = width * SIDE_ZONE_RATIO
  const rightZoneStart = width * (1 - SIDE_ZONE_RATIO)

  col.x = onLeft
    ? Math.random() * leftZoneEnd
    : rightZoneStart + Math.random() * (width - rightZoneStart)
  col.y = -Math.random() * 180
  Object.assign(col, randomCoin())
}

function ensureAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null

  if (!audioContext.value) {
    audioContext.value = new AudioContextClass()
  }

  if (audioContext.value.state === 'suspended') {
    audioContext.value.resume()
  }

  return audioContext.value
}

function playShootSound() {
  if (isMuted.value) return

  const context = ensureAudioContext()
  if (!context) return

  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(240, context.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(70, context.currentTime + 0.12)

  gain.gain.setValueAtTime(0.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12)

  oscillator.connect(gain)
  gain.connect(context.destination)

  oscillator.start(context.currentTime)
  oscillator.stop(context.currentTime + 0.12)
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (!isMuted.value) {
    ensureAudioContext()
  }
}

function handleShoot(event) {
  const page = event.currentTarget
  if (!page) return

  const bounds = page.getBoundingClientRect()
  const x = event.clientX - bounds.left
  const y = event.clientY - bounds.top
  const isSideZone =
    x <= bounds.width * SIDE_ZONE_RATIO || x >= bounds.width * (1 - SIDE_ZONE_RATIO)

  if (!isSideZone) return

  const hit = columns.value.find((col) => {
    const dx = col.x - x
    const dy = col.y - y
    return Math.hypot(dx, dy) <= col.size / 2 + 6
  })

  if (hit) {
    playShootSound()
    hitCount.value += 1
    showCounter()
    try {
      localStorage.setItem(HIT_COUNT_STORAGE_KEY, String(hitCount.value))
    } catch {
      // storage unavailable (e.g. private mode) - keep in-memory count only
    }
    respawnCoin(hit, bounds.width)
  }
}

function draw() {
  const width = window.innerWidth
  const height = window.innerHeight

  columns.value.forEach((col) => {
    col.y += col.speed
    col.rotation += col.rotSpeed

    if (col.y > height + col.size) {
      respawnCoin(col, width)
    }
  })

  animationId = requestAnimationFrame(draw)
}

const MARKET_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'LINK', 'ADA']

const tickers = computed(() =>
  MARKET_SYMBOLS.map((symbol) => {
    const ticker = binanceStore.tickers[`${symbol}USDC`]
    const change = Number(ticker?.change)
    const price = Number(ticker?.price)

    return {
      symbol: `${symbol}/USDC`,
      price: Number.isFinite(price) ? price.toFixed(2) : '--',
      change: Number.isFinite(change) ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '--',
      up: !Number.isFinite(change) || change >= 0,
    }
  }),
)

const stats = computed(() => [
  { value: '$2.4M', label: t('app.pages.index.statVolume') },
  { value: '12,904', label: t('app.pages.index.statTraders') },
  { value: '0.0%', label: t('app.pages.index.statRisk') },
])

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  draw()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  clearTimeout(counterHideTimer)
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.ct-page {
  position: relative;
  min-height: 100vh;
  cursor: auto;
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ct-target-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ct-falling-target {
  position: absolute;
  display: block;
  box-sizing: border-box;
  max-width: none;
  padding: 0 !important;
  opacity: 0.9;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
  will-change: transform;
}

.ct-falling-target :deep([class*='-indicator-container']) {
  display: block;
  width: 100%;
  max-width: none;
  padding: 0;
}

.ct-falling-target :deep([class$='-indicator']) {
  left: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.ct-falling-target :deep(> div:last-child) {
  display: none;
}

.ct-falling-logo {
  object-fit: contain;
}

.ct-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(202, 193, 193, 0.025) 0px,
    rgba(202, 193, 193, 0.025) 1px,
    transparent 1px,
    transparent 3px
  );
  mix-blend-mode: overlay;
}

.ct-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 200px 60px rgba(0, 0, 0, 0.85);
}

.ct-sound-toggle {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
  color: rgba(202, 193, 193, 0.8);
  background: rgba(19, 20, 24, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 18px rgba(0, 0, 0, 0.28);
}

.ct-kill-counter {
  position: absolute;
  top: 88px;
  left: 24px;
  width: 150px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 10;
  pointer-events: none;
  border-radius: 10px;
  border: 1px solid rgba(255, 152, 0, 0.45);
  background: rgba(19, 20, 24, 0.72);
  box-shadow:
    0 0 18px rgba(0, 0, 0, 0.35),
    0 0 12px rgba(255, 152, 0, 0.15) inset;
  backdrop-filter: blur(4px);
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.4s ease;
}

.ct-counter-icon {
  color: #ff9800;
  text-shadow: 0 0 8px rgba(255, 152, 0, 0.7);
}

.ct-counter-value {
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
  color: #ffd166;
  text-shadow: 0 0 10px rgba(255, 209, 102, 0.5);
  animation: ct-counter-pop 0.25s ease;
}

.ct-counter-label {
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(202, 193, 193, 0.8);
}

@keyframes ct-counter-pop {
  0% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}

.ct-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 20px;
  max-width: 760px;
}

.ct-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 4px;
  border: 1px solid rgba(33, 186, 69, 0.55);
  background: rgba(33, 186, 69, 0.1);
  color: #21ba45;
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: 600;
  margin-bottom: 28px;
}

.ct-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff9800;
  box-shadow: 0 0 8px #ff9800;
  animation: ct-pulse 1.4s ease-in-out infinite;
}

.ct-live {
  color: #ff9800;
}

@keyframes ct-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.4);
  }
}

.ct-title {
  margin: 0;
  line-height: 0.95;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.ct-title-line {
  display: block;
  font-weight: 900;
  font-size: clamp(48px, 11vw, 104px);
  letter-spacing: 2px;
}

.ct-title-main {
  background: linear-gradient(270deg, #f7931a, #ffd166 50%, #21ba45);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 24px rgba(247, 147, 26, 0.2);
}

.ct-title-sub {
  background: linear-gradient(90deg, #f7931a, #ffd166 50%, #21ba45);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.ct-tagline {
  margin-top: 18px;
  font-size: clamp(15px, 2.4vw, 19px);
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(202, 193, 193, 0.55);
  font-weight: 500;
}

.ct-ticker {
  width: 100%;
  max-width: 460px;
  margin-top: 36px;
  overflow: hidden;
  border-top: 1px solid rgba(247, 147, 26, 0.35);
  border-bottom: 1px solid rgba(247, 147, 26, 0.35);
  background: rgba(18, 18, 18, 0.7);
  padding: 10px 0;
  mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
}

.ct-ticker-track {
  display: flex;
  width: max-content;
  animation: ct-scroll 28s linear infinite;
  will-change: transform;
}

@keyframes ct-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.ct-ticker-item {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  white-space: nowrap;
  color: rgba(202, 193, 193, 0.7);
  margin-right: 32px;
}

.ct-ticker-item strong {
  color: #cac1c1;
  margin: 0 4px;
}

.ct-ticker-symbol {
  font-weight: 800;
}

.ct-up {
  color: #21ba45;
}
.ct-down {
  color: #ff5252;
}
.ct-arrow {
  margin-right: 4px;
}

.ct-cta-row {
  display: flex;
  gap: 16px;
  margin-top: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.ct-btn-primary {
  background: #f7931a;
  color: #171717;
  font-weight: 700;
  padding: 4px 26px;
  border-radius: 4px;
  box-shadow:
    0 0 24px rgba(247, 147, 26, 0.3),
    0 0 0 1px rgba(255, 224, 178, 0.35) inset;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.ct-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 34px rgba(247, 147, 26, 0.5),
    0 0 0 1px rgba(255, 224, 178, 0.45) inset;
}

.ct-btn-secondary {
  color: rgba(202, 193, 193, 0.75);
  border: 1px solid rgba(255, 183, 77, 0.45);
  border-radius: 4px;
  padding: 4px 22px;
}

.ct-btn-secondary:hover {
  color: #ffcc80;
  border-color: #f7931a;
}

.ct-stats {
  display: flex;
  gap: 48px;
  margin-top: 52px;
  flex-wrap: wrap;
  justify-content: center;
}

.ct-stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #cac1c1;
  font-family: 'Courier New', monospace;
}

.ct-stat-label {
  margin-top: 4px;
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(202, 193, 193, 0.4);
}

@media (max-width: 599px) {
  .ct-content {
    width: 100%;
    padding: 24px 12px;
  }

  .ct-badge {
    max-width: calc(100vw - 24px);
    margin-bottom: 20px;
    padding: 6px 10px;
    font-size: 10px;
    letter-spacing: 1px;
  }

  .ct-title-line {
    font-size: clamp(42px, 17vw, 68px);
    letter-spacing: 1px;
  }

  .ct-tagline {
    max-width: 300px;
    margin-top: 14px;
    font-size: 13px;
    letter-spacing: 2px;
    line-height: 1.4;
  }

  .ct-ticker {
    max-width: calc(100vw - 24px);
    margin-top: 26px;
    padding: 8px 0;
  }

  .ct-cta-row {
    width: 100%;
    gap: 10px;
    margin-top: 28px;
  }

  .ct-btn-primary,
  .ct-btn-secondary {
    width: min(100%, 260px);
    justify-content: center;
    padding: 4px 16px;
  }

  .ct-stats {
    width: 100%;
    gap: 20px 28px;
    margin-top: 34px;
  }

  .ct-stat {
    min-width: 105px;
  }

  .ct-stat-value {
    font-size: 20px;
  }

  .ct-stat-label {
    font-size: 9px;
    letter-spacing: 1px;
  }

  .ct-kill-counter {
    top: 16px;
    left: 12px;
    width: 112px;
    padding: 8px 10px;
  }

  .ct-counter-value {
    font-size: 24px;
  }

  .ct-counter-label {
    font-size: 8px;
    letter-spacing: 1px;
  }
}

/* Copy comes from i18n in sentence case; display treatment stays here */
.ct-title-line,
.ct-badge,
.ct-counter-label,
.ct-stat-label {
  text-transform: uppercase;
}
</style>
