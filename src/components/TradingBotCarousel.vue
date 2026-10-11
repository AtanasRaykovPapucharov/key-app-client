<template>
  <div class="trading-bot-carousel">
    <!-- Phase step-tabs above the carousel -->
    <div class="phase-tabs">
      <div
        v-for="(phase, i) in phases"
        :key="i"
        class="phase-tab"
        :class="{ [`active-${phase.color}`]: slide === phase.name }"
        @click="slide = phase.name"
      >
        <div class="phase-tab__num">{{ String(i + 1).padStart(2, '0') }}</div>
        {{ phase.label }}
      </div>
    </div>

    <q-carousel
      v-model="slide"
      animated
      transition-prev="slide-right"
      transition-next="slide-left"
      arrows
      navigation
      :autoplay="10000"
      infinite
      class="carousel"
      :class="`border-${currentPhase?.color}`"
    >
      <!-- ── SLIDE 1: Data Watcher ── -->
      <q-carousel-slide name="data" class="q-pa-none">
        <div class="slide-grid" :key="animKey">
          <div class="slide-left">
            <div class="big-num text-info-dim">01</div>
            <div class="slide-title">Data income</div>
            <div class="slide-sub">Watcher</div>
            <div class="slide-facts">
              <div class="slide-fact"><span class="fact-dot dot-info"></span>5 live sources</div>
              <div class="slide-fact"><span class="fact-dot dot-info"></span>240 ticks / s</div>
              <div class="slide-fact"><span class="fact-dot dot-info"></span>&lt; 2 ms latency</div>
            </div>
          </div>
          <div class="slide-right">
            <div class="status-bar">
              <span class="live-dot"></span>
              WebSocket active — 3 exchanges
            </div>
            <div class="ticker-feed">
              <div
                v-for="(t, i) in tickers"
                :key="t.sym"
                class="ticker-row"
                :style="`animation-delay:${0.1 + i * 0.18}s`"
              >
                <span class="ticker-sym">{{ t.sym }}</span>
                <span class="ticker-chg" :class="t.up ? 'chg-up' : 'chg-dn'">{{ t.chg }}</span>
                <span class="ticker-price">{{ t.price }}</span>
              </div>
            </div>
            <div class="bar-chart">
              <div
                v-for="(b, i) in barData"
                :key="i"
                class="bar-item"
                :class="b.up ? 'bar-up' : 'bar-dn'"
                :style="`height:${b.h}px;animation-delay:${(0.08 + i * 0.056).toFixed(2)}s`"
              ></div>
            </div>
          </div>
        </div>
      </q-carousel-slide>

      <!-- ── SLIDE 2: Analyzer ── -->
      <q-carousel-slide name="analyzer" class="q-pa-none">
        <div class="slide-grid" :key="animKey">
          <div class="slide-left">
            <div class="big-num text-warning-dim">02</div>
            <div class="slide-title">Analyzer</div>
            <div class="slide-sub">Decision maker</div>
            <div class="slide-facts">
              <div class="slide-fact"><span class="fact-dot dot-warning"></span>12 indicators</div>
              <div class="slide-fact"><span class="fact-dot dot-warning"></span>ML-weighted</div>
              <div class="slide-fact"><span class="fact-dot dot-warning"></span>3 strategies</div>
            </div>
          </div>
          <div class="slide-right">
            <svg viewBox="0 0 280 76" height="76" style="width: 100%; display: block">
              <line
                x1="0"
                y1="18"
                x2="280"
                y2="18"
                stroke="rgba(128,128,128,.2)"
                stroke-width=".5"
              />
              <line
                x1="0"
                y1="38"
                x2="280"
                y2="38"
                stroke="rgba(128,128,128,.2)"
                stroke-width=".5"
              />
              <line
                x1="0"
                y1="58"
                x2="280"
                y2="58"
                stroke="rgba(128,128,128,.2)"
                stroke-width=".5"
              />
              <path
                class="chart-line cl-price"
                d="M0,58 C20,54 40,60 65,50 S105,40 135,42 S170,34 200,30 S245,25 280,20"
                stroke="#1976D2"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
              />
              <path
                class="chart-line cl-fast"
                d="M0,62 C25,58 55,62 80,54 S120,46 148,47 S182,40 212,36 S252,31 280,25"
                stroke="#F2A83B"
                stroke-width="1.5"
                fill="none"
                stroke-linecap="round"
                opacity=".85"
              />
              <path
                class="chart-line cl-slow"
                d="M0,66 C55,63 110,59 160,53 S225,46 280,38"
                stroke="#aaa"
                stroke-width="1"
                fill="none"
                opacity=".4"
              />
              <circle
                cx="212"
                cy="37"
                r="4"
                fill="none"
                stroke="#F2A83B"
                stroke-width="1.5"
                class="crossover-dot"
              />
              <line
                x1="212"
                y1="18"
                x2="212"
                y2="76"
                stroke="#aaa"
                stroke-width=".5"
                stroke-dasharray="3,3"
                class="crossover-dot"
              />
            </svg>
            <div class="signals">
              <div v-for="sig in signals" :key="sig.label" class="signal-row">
                <span class="sig-label">{{ sig.label }}</span>
                <div class="sig-track">
                  <div
                    class="sig-fill"
                    :class="`sig-${sig.color}`"
                    :style="`--w:${sig.pct}%;animation-delay:${sig.delay}s`"
                  ></div>
                </div>
                <span class="sig-val">{{ sig.val }}</span>
              </div>
            </div>
            <div>
              <span class="decision-badge">
                <q-icon name="trending_up" size="16px" />
                Long signal detected
              </span>
            </div>
          </div>
        </div>
      </q-carousel-slide>

      <!-- ── SLIDE 3: Trader ── -->
      <q-carousel-slide name="trader" class="q-pa-none">
        <div class="slide-grid" :key="animKey">
          <div class="slide-left">
            <div class="big-num text-positive-dim">03</div>
            <div class="slide-title">{{ tt('app.common.labels.trader') }}</div>
            <div class="slide-sub">Acting</div>
            <div class="slide-facts">
              <div class="slide-fact"><span class="fact-dot dot-positive"></span>Market orders</div>
              <div class="slide-fact"><span class="fact-dot dot-positive"></span>Risk-managed</div>
              <div class="slide-fact">
                <span class="fact-dot dot-positive"></span>Auto stop-loss
              </div>
            </div>
          </div>
          <div class="slide-right">
            <div class="order-card">
              <div class="order-label">New order placed</div>
              <div class="order-val">BUY 0.5 BTC</div>
              <div class="order-sub">@ $67,234.50 — Market order</div>
            </div>
            <div class="portfolio">
              <div class="portfolio-title">Portfolio allocation</div>
              <div v-for="(a, i) in assets" :key="a.label" class="asset-row">
                <span class="asset-label">{{ a.label }}</span>
                <div class="asset-track">
                  <div
                    class="asset-fill"
                    :class="`asset-${a.color}`"
                    :style="`--w:${a.pct}%;animation-delay:${0.5 + i * 0.22}s`"
                  ></div>
                </div>
                <span class="asset-pct">{{ a.pct }}%</span>
              </div>
            </div>
            <div class="confirm-badge">
              <q-icon name="check_circle" size="16px" />
              Order filled — +$4.37 (+0.73%)
            </div>
          </div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLocalized } from 'src/composables/useLocalized'

const { t: tt } = useLocalized()

const slide = ref('data')
const animKey = ref(0)

// Increment key on slide change to restart all CSS animations
watch(slide, () => {
  animKey.value++
})

const phases = [
  {
    name: 'data',
    get label() {
      return tt('app.components.bot.dataWatcher')
    },
    color: 'info',
  },
  {
    name: 'analyzer',
    get label() {
      return tt('app.components.bot.analyzer')
    },
    color: 'warning',
  },
  {
    name: 'trader',
    get label() {
      return tt('app.common.labels.trader')
    },
    color: 'positive',
  },
]

const currentPhase = computed(() => phases.find((p) => p.name === slide.value))

const tickers = [
  { sym: 'BTC/USD', chg: '+1.24%', price: '67,234.50', up: true },
  { sym: 'ETH/USD', chg: '+0.87%', price: '3,456.78', up: true },
  { sym: 'SOL/USD', chg: '−0.32%', price: '145.23', up: false },
  { sym: 'AAPL', chg: '+0.51%', price: '234.56', up: true },
  { sym: 'SPY', chg: '−0.15%', price: '522.11', up: false },
]

const barRaw = [
  26, 14, 36, 20, 44, 18, 50, 28, 58, 24, 55, 34, 62, 27, 68, 31, 60, 40, 72, 36, 78, 44, 66, 48,
  84,
]
const barUp = [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1]
const barData = barRaw.map((v, i) => ({ h: Math.round(v * 0.5), up: !!barUp[i] }))

const signals = [
  { label: 'RSI', pct: 67, val: '67', color: 'warning', delay: 0.4 },
  { label: 'MACD', pct: 80, val: '↑ bull', color: 'positive', delay: 0.62 },
  { label: 'VOL', pct: 56, val: '56%', color: 'info', delay: 0.84 },
]

const assets = [
  { label: 'BTC', pct: 42, color: 'positive' },
  { label: 'ETH', pct: 28, color: 'info' },
  {
    get label() {
      return tt('app.components.bot.cash')
    },
    pct: 30,
    color: 'neutral',
  },
]
</script>

<style scoped>
/* ── Layout ── */
.trading-bot-carousel {
  font-family: inherit;
}

.phase-tabs {
  display: flex;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}
.phase-tab {
  flex: 1;
  padding: 9px 8px;
  text-align: center;
  cursor: pointer;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.54);
  background: rgba(0, 0, 0, 0.03);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  transition:
    background 0.2s,
    color 0.2s;
  line-height: 1.35;
}
.phase-tab:last-child {
  border-right: none;
}
.phase-tab__num {
  font-size: 11px;
  opacity: 0.5;
  margin-bottom: 1px;
}
.active-info {
  background: rgba(25, 118, 210, 0.1) !important;
  color: #1976d2 !important;
}
.active-warning {
  background: rgba(242, 168, 59, 0.12) !important;
  color: #f57c00 !important;
}
.active-positive {
  background: rgba(33, 150, 83, 0.1) !important;
  color: #21a861 !important;
}

.carousel {
  border-radius: 12px;
  min-height: 290px;
}
.border-info {
  border: 1px solid #1976d2 !important;
}
.border-warning {
  border: 1px solid #f57c00 !important;
}
.border-positive {
  border: 1px solid #21a861 !important;
}

.slide-grid {
  display: grid;
  grid-template-columns: 175px 1fr;
  min-height: 286px;
  height: 100%;
}

/* ── Left panel ── */
.slide-left {
  padding: 1.25rem;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}
.big-num {
  font-size: 50px;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 0.5rem;
}
.text-info-dim {
  color: rgba(25, 118, 210, 0.22);
}
.text-warning-dim {
  color: rgba(245, 124, 0, 0.22);
}
.text-positive-dim {
  color: rgba(33, 150, 83, 0.22);
}
.slide-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}
.slide-sub {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.54);
  margin: 2px 0 0;
}
.slide-facts {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.slide-fact {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
  display: flex;
  align-items: center;
  gap: 6px;
}
.fact-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-info {
  background: #1976d2;
}
.dot-warning {
  background: #f57c00;
}
.dot-positive {
  background: #21a861;
}

/* ── Right panel ── */
.slide-right {
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

/* Ticker */
.status-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
}
.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #21a861;
  flex-shrink: 0;
  animation: tpulse 1.5s infinite;
}
.ticker-feed {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.ticker-row {
  display: flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.04);
  font-size: 12px;
  opacity: 0;
  animation: tfi 0.35s ease-out forwards;
}
.ticker-sym {
  min-width: 56px;
  font-family: monospace;
  font-weight: 600;
  font-size: 11.5px;
}
.ticker-price {
  margin-left: auto;
  font-family: monospace;
  font-weight: 600;
  font-size: 12px;
}
.ticker-chg {
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 3px;
  margin: 0 5px;
}
.chg-up {
  background: rgba(33, 150, 83, 0.12);
  color: #21a861;
}
.chg-dn {
  background: rgba(211, 47, 47, 0.1);
  color: #d32f2f;
}

/* Bar chart */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 44px;
}
.bar-item {
  width: 7px;
  border-radius: 2px 2px 0 0;
  opacity: 0;
  animation: tbg 0.3s ease-out forwards;
  transform-origin: bottom;
}
.bar-up {
  background: #21a861;
}
.bar-dn {
  background: #d32f2f;
}

/* Analyzer chart */
.chart-line {
  stroke-dasharray: 520;
  stroke-dashoffset: 520;
  animation: tdraw 2.2s ease-out forwards;
}
.cl-fast {
  stroke-dasharray: 420;
  stroke-dashoffset: 420;
  animation-delay: 0.55s;
}
.cl-slow {
  stroke-dasharray: 260;
  stroke-dashoffset: 260;
  animation-delay: 1.1s;
}
.crossover-dot {
  opacity: 0;
  animation: tfade 0.4s ease-out 2.2s forwards;
}

/* Signals */
.signals {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.signal-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.sig-label {
  min-width: 42px;
  font-family: monospace;
  color: rgba(0, 0, 0, 0.54);
}
.sig-track {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 3px;
  overflow: hidden;
}
.sig-fill {
  height: 100%;
  border-radius: 3px;
  width: 0;
  animation: tfw 1.4s ease-out forwards;
}
.sig-val {
  min-width: 38px;
  text-align: right;
  font-family: monospace;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
}
.sig-warning {
  background: #f57c00;
}
.sig-positive {
  background: #21a861;
}
.sig-info {
  background: #1976d2;
}

.decision-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(33, 150, 83, 0.12);
  color: #21a861;
  border: 1px solid rgba(33, 150, 83, 0.3);
  opacity: 0;
  animation: tfi 0.5s ease-out 2s forwards;
}

/* Trader */
.order-card {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 83, 0.35);
  background: rgba(33, 150, 83, 0.1);
  opacity: 0;
  animation: tsu 0.5s ease-out 0.1s forwards;
}
.order-label {
  font-size: 11px;
  color: #21a861;
  opacity: 0.7;
  margin-bottom: 3px;
}
.order-val {
  font-size: 14px;
  font-weight: 600;
  color: #21a861;
  font-family: monospace;
}
.order-sub {
  font-size: 12px;
  color: #21a861;
  opacity: 0.8;
  margin-top: 2px;
}
.portfolio {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.portfolio-title {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
}
.asset-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.asset-label {
  min-width: 34px;
  font-family: monospace;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.54);
}
.asset-track {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  overflow: hidden;
}
.asset-fill {
  height: 100%;
  border-radius: 4px;
  width: 0;
  animation: tfw 1.2s ease-out forwards;
}
.asset-pct {
  min-width: 30px;
  text-align: right;
  font-family: monospace;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
}
.asset-positive {
  background: #21a861;
}
.asset-info {
  background: #1976d2;
}
.asset-neutral {
  background: rgba(0, 0, 0, 0.35);
}
.confirm-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  background: rgba(33, 150, 83, 0.12);
  color: #21a861;
  opacity: 0;
  animation: tfi 0.5s ease-out 2.3s forwards;
}

/* ── Keyframes ── */
@keyframes tpulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.8);
  }
}
@keyframes tfi {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes tbg {
  from {
    opacity: 0;
    transform: scaleY(0);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}
@keyframes tdraw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes tfw {
  from {
    width: 0;
  }
  to {
    width: var(--w, 60%);
  }
}
@keyframes tsu {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes tfade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
