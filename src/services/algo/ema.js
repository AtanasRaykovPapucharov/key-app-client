// ── EMA ───────────────────────────────────────────────────────────────────────
export default function ema(candles, closes, period) {
  if (closes.length < period) return []
  const k = 2 / (period + 1)
  let prev = 0
  for (let i = 0; i < period; i++) prev += closes[i]
  prev /= period

  const result = [{ time: candles[period - 1].time, value: prev }]
  for (let i = period; i < closes.length; i++) {
    prev = closes[i] * k + prev * (1 - k)
    result.push({ time: candles[i].time, value: prev })
  }
  return result
}
