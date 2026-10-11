// ── KDJ (Stochastic with J line) - Optimized ─────────────────────────────────
// Returns { k, d, j } — each an array of { time, value }
export default function kdj(candles, period = 9) {
  if (candles.length < period) return { k: [], d: [], j: [] }

  const k = [],
    d = [],
    j = []
  let prevK = 50,
    prevD = 50

  for (let i = period - 1; i < candles.length; i++) {
    // Find high and low in window without slice/map
    let hh = candles[i - period + 1].high
    let ll = candles[i - period + 1].low
    for (let j = i - period + 2; j <= i; j++) {
      hh = Math.max(hh, candles[j].high)
      ll = Math.min(ll, candles[j].low)
    }

    const rsv = hh === ll ? 50 : ((candles[i].close - ll) / (hh - ll)) * 100
    const kVal = (2 / 3) * prevK + (1 / 3) * rsv
    const dVal = (2 / 3) * prevD + (1 / 3) * kVal
    const jVal = 3 * kVal - 2 * dVal
    prevK = kVal
    prevD = dVal
    const time = candles[i].time
    k.push({ time, value: kVal })
    d.push({ time, value: dVal })
    j.push({ time, value: jVal })
  }
  return { k, d, j }
}
