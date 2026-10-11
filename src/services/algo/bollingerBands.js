// ── Bollinger Bands (Optimized) ───────────────────────────────────────────────
// Returns { upper, middle, lower } — each an array of { time, value }
export default function bollingerBands(candles, closes, period = 20, multiplier = 2) {
  if (closes.length < period) return { upper: [], middle: [], lower: [] }

  const upper = [],
    middle = [],
    lower = []

  // Initialize for first window
  let sum = 0,
    sumSq = 0
  for (let i = 0; i < period; i++) {
    sum += closes[i]
    sumSq += closes[i] * closes[i]
  }

  function addBand(idx) {
    const mean = sum / period
    const variance = sumSq / period - mean * mean
    const sd = Math.sqrt(Math.max(variance, 0)) // Guard against floating point errors
    const time = candles[idx].time
    upper.push({ time, value: mean + multiplier * sd })
    middle.push({ time, value: mean })
    lower.push({ time, value: mean - multiplier * sd })
  }

  addBand(period - 1)

  // Sliding window
  for (let i = period; i < closes.length; i++) {
    const oldVal = closes[i - period]
    const newVal = closes[i]
    sum = sum - oldVal + newVal
    sumSq = sumSq - oldVal * oldVal + newVal * newVal
    addBand(i)
  }

  return { upper, middle, lower }
}
