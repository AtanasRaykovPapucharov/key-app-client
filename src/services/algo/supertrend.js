// ── Supertrend ────────────────────────────────────────────────────────────────
// Returns [{ time, value, direction }] — direction: 1=bull, -1=bear
export default function supertrend(candles, period = 10, multiplier = 3) {
  if (candles.length < period + 1) return []

  // Wilder ATR
  const tr = new Array(candles.length)
  tr[0] = candles[0].high - candles[0].low
  for (let i = 1; i < candles.length; i++) {
    tr[i] = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close),
    )
  }

  let atr = 0
  for (let i = 0; i < period; i++) atr += tr[i]
  atr /= period

  const atrs = [atr]
  for (let i = period; i < tr.length; i++) {
    atr = (atr * (period - 1) + tr[i]) / period
    atrs.push(atr)
  }

  const result = []
  let prevUpperBand = 0,
    prevLowerBand = 0,
    prevDirection = 1

  for (let i = period - 1; i < candles.length; i++) {
    const c = candles[i]
    const atrVal = atrs[i - (period - 1)]
    const hl2 = (c.high + c.low) / 2

    let upperBand = hl2 + multiplier * atrVal
    let lowerBand = hl2 - multiplier * atrVal

    if (i > period - 1) {
      const pClose = candles[i - 1].close
      lowerBand = lowerBand > prevLowerBand || pClose < prevLowerBand ? lowerBand : prevLowerBand
      upperBand = upperBand < prevUpperBand || pClose > prevUpperBand ? upperBand : prevUpperBand
    }

    let direction
    if (i === period - 1) {
      direction = c.close <= upperBand ? 1 : -1
    } else {
      direction =
        prevDirection === -1 ? (c.close > prevUpperBand ? 1 : -1) : c.close < prevLowerBand ? -1 : 1
    }

    prevUpperBand = upperBand
    prevLowerBand = lowerBand
    prevDirection = direction

    result.push({ time: c.time, value: direction === 1 ? lowerBand : upperBand, direction })
  }
  return result
}
