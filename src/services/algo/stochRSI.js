// ── Stochastic RSI (Optimized) ────────────────────────────────────────────────
import rsi from './rsi'

// Returns { k, d } — each an array of { time, value }
export default function stochRSI(
  candles,
  closes,
  rsiPeriod = 14,
  stochPeriod = 14,
  smoothK = 3,
  smoothD = 3,
) {
  const rsiData = rsi(candles, closes, rsiPeriod)
  if (rsiData.length < stochPeriod) return { k: [], d: [] }

  const rsiVals = rsiData.map((d) => d.value)
  const rawK = new Array(rsiVals.length - stochPeriod + 1)

  for (let i = stochPeriod - 1; i < rsiVals.length; i++) {
    // Find high and low in window without slice/map
    let hi = rsiVals[i - stochPeriod + 1]
    let lo = hi
    for (let j = i - stochPeriod + 2; j <= i; j++) {
      hi = Math.max(hi, rsiVals[j])
      lo = Math.min(lo, rsiVals[j])
    }

    const idx = i - stochPeriod + 1
    rawK[idx] = hi === lo ? 0 : ((rsiVals[i] - lo) / (hi - lo)) * 100
  }

  const smoothedKVals = _smaArray(rawK, smoothK)
  const smoothedK = smoothedKVals.map((v, i) => ({
    time: rsiData[stochPeriod - 1 + smoothK - 1 + i].time,
    value: v,
  }))

  const smoothedDVals = _smaArray(smoothedKVals, smoothD)
  const smoothedD = smoothedDVals.map((v, i) => ({
    time: smoothedK[smoothD - 1 + i].time,
    value: v,
  }))

  return { k: smoothedK, d: smoothedD }
}

// Internal SMA on plain number arrays (Optimized with sliding window)
function _smaArray(data, period) {
  if (data.length < period) return []
  const result = []

  let sum = 0
  for (let i = 0; i < period; i++) sum += data[i]
  result.push(sum / period)

  for (let i = period; i < data.length; i++) {
    sum = sum - data[i - period] + data[i]
    result.push(sum / period)
  }
  return result
}
