// ── Parabolic SAR ─────────────────────────────────────────────────────────────
// Returns [{ time, value, isBull }] — isBull used to split into two series
export default function parabolicSAR(candles, step = 0.02, max = 0.2) {
  if (candles.length < 2) return []
  const result = []
  let isBull = true
  let af = step
  let ep = candles[0].high
  let sar = candles[0].low

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i]
    const prev = candles[i - 1]
    let newSar = sar + af * (ep - sar)

    if (isBull) {
      newSar = Math.min(newSar, prev.low, i >= 2 ? candles[i - 2].low : prev.low)
      if (c.low < newSar) {
        isBull = false
        newSar = ep
        ep = c.low
        af = step
      } else {
        if (c.high > ep) {
          ep = c.high
          af = Math.min(af + step, max)
        }
      }
    } else {
      newSar = Math.max(newSar, prev.high, i >= 2 ? candles[i - 2].high : prev.high)
      if (c.high > newSar) {
        isBull = true
        newSar = ep
        ep = c.high
        af = step
      } else {
        if (c.low < ep) {
          ep = c.low
          af = Math.min(af + step, max)
        }
      }
    }

    sar = newSar
    result.push({ time: c.time, value: sar, isBull })
  }
  return result
}
