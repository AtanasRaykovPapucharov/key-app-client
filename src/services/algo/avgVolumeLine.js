// ── Average Volume Line ───────────────────────────────────────────────────────
// Returns { bars: [{time,value,color}], line: [{time,value}] }
export default function avgVolumeLine(candles, period = 20) {
  const bars = new Array(candles.length)
  const vols = new Array(candles.length)

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]
    const vol = c.volume ?? 0
    bars[i] = {
      time: c.time,
      value: vol,
      color: (c.close ?? 0) >= (c.open ?? 0) ? '#26a69a55' : '#ef535055',
    }
    vols[i] = vol
  }

  const line = _smaArray(vols, period).map((v, i) => ({
    time: candles[i + period - 1].time,
    value: v,
  }))
  return { bars, line }
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
