// quizUtils.js
// Small shared helpers used by every question generator.

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build 3 plausible-but-wrong numeric distractors around the correct answer
export function buildDistractors(correct) {
  const distractors = new Set()
  const deltas = shuffle([1, 2, 3, 4, 5, -1, -2, -3, -4, -5, 10, -10])
  let i = 0
  while (distractors.size < 3 && i < deltas.length) {
    const candidate = correct + deltas[i]
    if (candidate !== correct && !distractors.has(candidate)) {
      distractors.add(candidate)
    }
    i++
  }
  let fallback = correct + 1
  while (distractors.size < 3) {
    fallback++
    if (fallback !== correct && !distractors.has(fallback)) {
      distractors.add(fallback)
    }
  }
  return [...distractors]
}

// Correct answer + 3 distractors, shuffled into final option order
export function buildOptions(correct) {
  return shuffle([correct, ...buildDistractors(correct)])
}

/* ------------------------------------------------------------------ */
/* Bilingual helpers (used by the NVO-style generators)               */
/* A label is either a plain string (same in both languages) or an    */
/* object { en, bg }. QuizRunner resolves it for the active language. */
/* ------------------------------------------------------------------ */

export const MINUS = '−'

export function pick(arr) {
  return arr[randInt(0, arr.length - 1)]
}

export function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}

/** Bilingual label: L('Hello', 'Здравей') → { en, bg } */
export function L(en, bg) {
  return { en, bg: bg ?? en }
}

/** Number → { en: '−1.8', bg: '−1,8' } (true minus sign, BG decimal comma). */
export function num(x, maxDecimals = 4) {
  const rounded = Math.round(x * 10 ** maxDecimals) / 10 ** maxDecimals
  const abs = String(Math.abs(rounded))
  const sign = rounded < 0 ? MINUS : ''
  return L(`${sign}${abs}`, `${sign}${abs.replace('.', ',')}`)
}

/** Reduced fraction as text: frac(-2, 48) → '−1/24', frac(6, 3) → '2'. */
export function frac(n, d) {
  if (d < 0) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  n /= g
  d /= g
  const sign = n < 0 ? MINUS : ''
  return d === 1 ? `${sign}${Math.abs(n)}` : `${sign}${Math.abs(n)}/${d}`
}

/** Signed term for building expressions: sgn(3) → '+ 3', sgn(-3) → '− 3'. */
export function sgn(v) {
  return v < 0 ? `${MINUS} ${Math.abs(v)}` : `+ ${v}`
}

/** Polynomial ax² + bx + c in normal form, e.g. '4x² + 26x'. */
export function poly(a, b, c) {
  const parts = []
  const term = (coef, pow) => {
    if (coef === 0) return
    const abs = Math.abs(coef)
    const body = pow === 0 ? `${abs}` : `${abs === 1 ? '' : abs}${pow === 2 ? 'x²' : 'x'}`
    if (!parts.length) parts.push(`${coef < 0 ? MINUS : ''}${body}`)
    else parts.push(`${coef < 0 ? MINUS : '+'} ${body}`)
  }
  term(a, 2)
  term(b, 1)
  term(c, 0)
  return parts.length ? parts.join(' ') : '0'
}

const asLabel = (v) => (typeof v === 'object' && v !== null ? v : L(String(v)))

/**
 * Multiple-choice question with exactly 4 unique options.
 * `correct` and `distractors` are labels (string, number or { en, bg }).
 * Extra distractors are dropped, duplicates removed; `fallback()` must
 * return a fresh label when there aren't enough distinct distractors.
 */
export function mcq({ id = 0, question, correct, distractors, media, fallback }) {
  const correctLabel = asLabel(correct)
  const seen = new Set([correctLabel.en])
  const wrong = []
  for (const d of distractors.map(asLabel)) {
    if (wrong.length === 3) break
    if (!seen.has(d.en)) {
      seen.add(d.en)
      wrong.push(d)
    }
  }
  let guard = 0
  while (wrong.length < 3 && fallback && guard++ < 50) {
    const d = asLabel(fallback(wrong.length))
    if (!seen.has(d.en)) {
      seen.add(d.en)
      wrong.push(d)
    }
  }
  const options = shuffle([correctLabel, ...wrong]).map((label) => ({ value: label.en, label }))
  return { id, question, correctAnswer: correctLabel.en, options, ...(media ? { media } : {}) }
}

/** Numeric fallback distractors around a value: value ± step·k. */
export function nearby(value, step = 1) {
  return (k) => num(value + (k % 2 ? -1 : 1) * step * (Math.floor(k / 2) + 2))
}
