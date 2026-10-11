import { bollingerBands, macd, movingAverage, rsi } from './algo'

export const STRATEGY_NAMES = {
  moving_average: 'Moving Average Crossover',
  rsi: 'RSI Reversal',
  macd: 'MACD Momentum',
  bollinger: 'Bollinger Band Reversal',
}

const hold = (price, reason) => ({ signal: 'HOLD', price, reason })

export function evaluateStrategy(candles = [], settings = {}) {
  const prices = candles.map((candle) => Number(candle.close)).filter(Number.isFinite)
  const price = prices.at(-1) ?? 0

  if (!price) return hold(0, 'Waiting for price data')

  switch (settings.strategy) {
    case 'moving_average':
      return evaluateMovingAverage(candles, prices, settings)
    case 'rsi':
      return evaluateRsi(candles, prices, settings)
    case 'macd':
      return evaluateMacd(candles, prices, settings)
    case 'bollinger':
      return evaluateBollinger(candles, prices, settings)
    default:
      return hold(price, 'Select a strategy')
  }
}

function evaluateMovingAverage(candles, prices, settings) {
  const fastPeriod = Number(settings.fastPeriod) || 9
  const slowPeriod = Number(settings.slowPeriod) || 21
  const fast = movingAverage(candles, prices, fastPeriod)
  const slow = movingAverage(candles, prices, slowPeriod)
  const currentFast = fast.at(-1)?.value
  const previousFast = fast.at(-2)?.value
  const currentSlow = slow.at(-1)?.value
  const previousSlow = slow.at(-2)?.value
  const price = prices.at(-1)

  if (![currentFast, previousFast, currentSlow, previousSlow].every(Number.isFinite)) {
    return hold(price, `Waiting for ${slowPeriod} candles`)
  }
  if (previousFast <= previousSlow && currentFast > currentSlow) {
    return { signal: 'BUY', price, reason: 'Fast average crossed above slow average' }
  }
  if (previousFast >= previousSlow && currentFast < currentSlow) {
    return { signal: 'SELL', price, reason: 'Fast average crossed below slow average' }
  }
  return hold(price, 'No moving-average crossover')
}

function evaluateRsi(candles, prices, settings) {
  const period = Number(settings.rsiPeriod) || 14
  const oversold = Number(settings.oversold) || 30
  const overbought = Number(settings.overbought) || 70
  const value = rsi(candles, prices, period).at(-1)?.value
  const price = prices.at(-1)

  if (!Number.isFinite(value)) return hold(price, `Waiting for ${period + 1} candles`)
  if (value <= oversold)
    return { signal: 'BUY', price, reason: `RSI is oversold at ${value.toFixed(2)}` }
  if (value >= overbought)
    return { signal: 'SELL', price, reason: `RSI is overbought at ${value.toFixed(2)}` }
  return hold(price, `RSI is neutral at ${value.toFixed(2)}`)
}

function evaluateMacd(candles, prices, settings) {
  const fastPeriod = Number(settings.macdFast) || 12
  const slowPeriod = Number(settings.macdSlow) || 26
  const signalPeriod = Number(settings.macdSignal) || 9
  const result = macd(candles, prices, fastPeriod, slowPeriod, signalPeriod)
  const current = result.histogram.at(-1)?.value
  const previous = result.histogram.at(-2)?.value
  const price = prices.at(-1)

  if (![current, previous].every(Number.isFinite)) {
    return hold(price, `Waiting for ${slowPeriod + signalPeriod} candles`)
  }
  if (previous <= 0 && current > 0) {
    return { signal: 'BUY', price, reason: 'MACD histogram turned positive' }
  }
  if (previous >= 0 && current < 0) {
    return { signal: 'SELL', price, reason: 'MACD histogram turned negative' }
  }
  return hold(price, 'No MACD momentum crossover')
}

function evaluateBollinger(candles, prices, settings) {
  const period = Number(settings.bollingerPeriod) || 20
  const multiplier = Number(settings.standardDeviation) || 2
  const bands = bollingerBands(candles, prices, period, multiplier)
  const upper = bands.upper.at(-1)?.value
  const lower = bands.lower.at(-1)?.value
  const price = prices.at(-1)

  if (![upper, lower].every(Number.isFinite)) return hold(price, `Waiting for ${period} candles`)
  if (price <= lower)
    return { signal: 'BUY', price, reason: 'Price reached the lower Bollinger band' }
  if (price >= upper)
    return { signal: 'SELL', price, reason: 'Price reached the upper Bollinger band' }
  return hold(price, 'Price is inside the Bollinger bands')
}
