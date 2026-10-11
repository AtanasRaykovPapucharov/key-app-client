// Simple Moving Average (SMA)
// Average of last N prices.

export function sma(data, period) {
  let result = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null)
      continue
    }

    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += data[i - j]
    }

    result.push(sum / period)
  }

  return result
}
