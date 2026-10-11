// ── OBV (On-Balance Volume) ───────────────────────────────────────────────────
export default function obv(candles) {
  if (!candles.length) return []
  let obvVal = 0
  return candles.map((c, i) => {
    if (i > 0) {
      const diff = c.close - candles[i - 1].close
      if (diff > 0) obvVal += c.volume ?? 0
      else if (diff < 0) obvVal -= c.volume ?? 0
    }
    return { time: c.time, value: obvVal }
  })
}
