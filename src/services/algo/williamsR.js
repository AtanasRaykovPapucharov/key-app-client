// ── Williams %R (Optimized) ───────────────────────────────────────────────────
export default function williamsR(candles, period = 14) {
  if (candles.length < period) return []
  const result = []

  for (let i = period - 1; i < candles.length; i++) {
    // Find high and low in window without slice/map
    let hh = candles[i - period + 1].high
    let ll = candles[i - period + 1].low
    for (let j = i - period + 2; j <= i; j++) {
      hh = Math.max(hh, candles[j].high)
      ll = Math.min(ll, candles[j].low)
    }

    const wr = hh === ll ? -50 : ((hh - candles[i].close) / (hh - ll)) * -100
    result.push({ time: candles[i].time, value: wr })
  }
  return result
}
