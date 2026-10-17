/**
 * Fixed-fractional position sizing — shared by the position sizing
 * calculator and the "size by risk" helper in the order form.
 *
 *   units = floor( (account × risk%) / |entry − stop| )
 *
 * `decimals` controls rounding: 0 for shares, 6 for crypto (fractional units).
 * Rounding is always DOWN, so the real risk never exceeds the chosen risk.
 */
export function sizePosition({ account, riskPct, entry, stop, decimals = 0 }) {
  const acc = Number(account) || 0
  const e = Number(entry) || 0
  const s = Number(stop) || 0
  const riskAmount = acc * ((Number(riskPct) || 0) / 100)
  const distance = Math.abs(e - s)
  if (!(distance > 0) || !(riskAmount > 0) || !(e > 0)) return null

  const factor = 10 ** decimals
  // tiny epsilon guards against 0.29999999 → 0.2 style float drops
  const units = Math.floor((riskAmount / distance) * factor + 1e-9) / factor
  const value = units * e
  return {
    riskAmount,
    distance,
    units,
    value,
    actualRisk: units * distance,
    exposurePct: acc > 0 ? (value / acc) * 100 : 0,
  }
}

/** Largest amount you can buy with `cash` at `price`, after a fee rate, rounded down. */
export function maxAffordable(cash, price, feeRate = 0, decimals = 6) {
  const c = Number(cash) || 0
  const p = Number(price) || 0
  if (!(c > 0) || !(p > 0)) return 0
  const factor = 10 ** decimals
  return Math.floor((c / (p * (1 + feeRate))) * factor + 1e-9) / factor
}
