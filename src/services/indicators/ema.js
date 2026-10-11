// Exponential Moving Average (EMA)
// Gives more weight to recent prices.

export function ema(data, period) {
  const k = 2 / (period + 1)
  let result = []
  let prevEma = data[0]

  result.push(prevEma)

  for (let i = 1; i < data.length; i++) {
    let current = data[i] * k + prevEma * (1 - k)
    result.push(current)
    prevEma = current
  }

  return result
}
