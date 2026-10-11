//RSI (Relative Strength Index) - Measures momentum (overbought / oversold).
export function rsi(data, period = 14) {
  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    let diff = data[i] - data[i - 1]
    if (diff >= 0) gains += diff
    else losses -= diff
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  let result = [null]

  for (let i = period + 1; i < data.length; i++) {
    let diff = data[i] - data[i - 1]

    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period
      avgLoss = (avgLoss * (period - 1)) / period
    } else {
      avgGain = (avgGain * (period - 1)) / period
      avgLoss = (avgLoss * (period - 1) - diff) / period
    }

    let rs = avgGain / avgLoss
    result.push(100 - 100 / (1 + rs))
  }

  return result
}
