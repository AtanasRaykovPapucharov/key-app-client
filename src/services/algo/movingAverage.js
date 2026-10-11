// ── SMA (Optimized with sliding window) ───────────────────────────────────────
export default function movingAverage(candles, closes, period) {
  if (closes.length < period) return []
  const result = []

  // Initialize sum for first window
  let sum = 0
  for (let i = 0; i < period; i++) sum += closes[i]
  result.push({ time: candles[period - 1].time, value: sum / period })

  // Sliding window
  for (let i = period; i < closes.length; i++) {
    sum = sum - closes[i - period] + closes[i]
    result.push({ time: candles[i].time, value: sum / period })
  }
  return result
}
