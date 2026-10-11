// Basic Trading Signal Logic
// Example: SMA crossover strategy

export function crossoverSignal(shortMA, longMA) {
  let signals = []

  for (let i = 1; i < shortMA.length; i++) {
    if (shortMA[i - 1] < longMA[i - 1] && shortMA[i] > longMA[i]) {
      signals.push('BUY')
    } else if (shortMA[i - 1] > longMA[i - 1] && shortMA[i] < longMA[i]) {
      signals.push('SELL')
    } else {
      signals.push(null)
    }
  }

  return signals
}
