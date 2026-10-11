// ── RSI (Wilder's smoothing) ──────────────────────────────────────────────────
export default function rsi(candles, closes, period = 14) {
  if (closes.length < period + 1) return []

  let avgGain = 0,
    avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1]
    if (d > 0) avgGain += d
    else avgLoss -= d
  }
  avgGain /= period
  avgLoss /= period

  const result = [{ time: candles[period].time, value: _rsiVal(avgGain, avgLoss) }]

  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period
    result.push({ time: candles[i].time, value: _rsiVal(avgGain, avgLoss) })
  }
  return result
}

function _rsiVal(gain, loss) {
  return loss === 0 ? 100 : 100 - 100 / (1 + gain / loss)
}
