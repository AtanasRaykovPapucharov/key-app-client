import { ema } from './ema'

// MACD (Trend + Momentum Combo)
// MACD = short EMA − long EMA

export function macd(data) {
  const ema12 = ema(data, 12)
  const ema26 = ema(data, 26)

  let macdLine = data.map((_, i) => {
    if (ema12[i] && ema26[i]) {
      return ema12[i] - ema26[i]
    }
    return null
  })

  const signalLine = ema(
    macdLine.filter((v) => v !== null),
    9,
  )

  return { macdLine, signalLine }
}
