import { sma } from './sma'

// Bollinger Bands (Volatility)
// Middle = SMA
// Upper = SMA + (stdDev × 2)
// Lower = SMA − (stdDev × 2)

export function bollingerBands(data, period = 20) {
  let smaValues = sma(data, period)
  let bands = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      bands.push(null)
      continue
    }

    let slice = data.slice(i - period + 1, i + 1)
    let mean = smaValues[i]

    let variance =
      slice.reduce((sum, val) => {
        return sum + Math.pow(val - mean, 2)
      }, 0) / period

    let stdDev = Math.sqrt(variance)

    bands.push({
      middle: mean,
      upper: mean + 2 * stdDev,
      lower: mean - 2 * stdDev,
    })
  }

  return bands
}
