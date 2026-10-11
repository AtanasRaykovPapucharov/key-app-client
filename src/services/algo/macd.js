// ── MACD ──────────────────────────────────────────────────────────────────────
// Returns { macdLine, signalLine, histogram } — each an array of { time, value }
// Histogram items also carry a `color` for lightweight-charts HistogramSeries.
export default function macd(candles, closes, fast = 12, slow = 26, signalPeriod = 9) {
  const empty = { macdLine: [], signalLine: [], histogram: [] }
  if (closes.length < slow + signalPeriod) return empty

  const fastEMA = _emaArray(closes, fast)
  const slowEMA = _emaArray(closes, slow)

  // slowEMA[i] → closes[slow-1+i]; fastEMA aligns with an offset of (slow-fast)
  const offset = slow - fast
  const macdValues = []
  for (let i = 0; i < slowEMA.length; i++) {
    macdValues.push(fastEMA[i + offset] - slowEMA[i])
  }

  const signalValues = _emaArray(macdValues, signalPeriod)

  // First candle index where we have a full signal value:
  const startIdx = slow + signalPeriod - 2

  const macdLine = [],
    signalLine = [],
    histogram = []
  for (let i = 0; i < signalValues.length; i++) {
    const macdVal = macdValues[signalPeriod - 1 + i]
    const sig = signalValues[i]
    const time = candles[startIdx + i]?.time
    if (time === undefined) break
    const diff = macdVal - sig
    macdLine.push({ time, value: macdVal })
    signalLine.push({ time, value: sig })
    histogram.push({ time, value: diff, color: diff >= 0 ? '#26a69a99' : '#ef535099' })
  }

  return { macdLine, signalLine, histogram }
}

// Internal EMA on plain number arrays (used by MACD)
function _emaArray(data, period) {
  if (data.length < period) return []
  const k = 2 / (period + 1)
  let prev = 0
  for (let i = 0; i < period; i++) prev += data[i]
  prev /= period

  const result = [prev]
  for (let i = period; i < data.length; i++) {
    prev = data[i] * k + prev * (1 - k)
    result.push(prev)
  }
  return result
}
