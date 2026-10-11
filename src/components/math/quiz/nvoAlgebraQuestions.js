// nvoAlgebraQuestions.js
// Harder, exam-style algebra problems modelled on the Bulgarian national
// external assessment (НВО) in mathematics for 7th grade.
// Every generator randomises its numbers and builds distractors from the
// mistakes students typically make, not from random ±1 offsets.

import { randInt, pick, gcd, L, num, frac, sgn, poly, mcq, nearby, MINUS } from './quizUtils.js'

const and = (a, b) => L(`${a} and ${b}`, `${a} и ${b}`)
const noSolution = L('the equation has no solution', 'уравнението няма решение')
const fmtInt = (v) => (v < 0 ? `${MINUS}${Math.abs(v)}` : `${v}`)

/* 1. Order of operations with fractions: a/b − a/b · k */
export function orderOfOperations() {
  const b = pick([2, 4, 5, 10])
  const a = randInt(1, b - 1 || 1)
  const k = randInt(4, 12)
  const v = a / b
  return mcq({
    question: L(
      `What is the value of the expression ${a}/${b} ${MINUS} ${a}/${b} · ${k}?`,
      `Стойността на израза ${a}/${b} ${MINUS} ${a}/${b} · ${k} е:`,
    ),
    correct: num(v - v * k),
    distractors: [num(0), num(-v * (k + 1)), num(v * (k - 1)), num(v * k)],
    fallback: nearby(v - v * k, 0.5),
  })
}

/* 2. Linear equation with a fractional root: ax + b = c */
export function linearEquation() {
  const a = pick([12, 15, 16, 18, 24, 25, 36])
  const b = randInt(-9, 9) || 3
  let c = randInt(-9, 9)
  while ((c - b) % a === 0) c++
  return mcq({
    question: L(
      `What is the root of the equation ${a}x ${sgn(b)} = ${fmtInt(c)}?`,
      `Коренът на уравнението ${a}x ${sgn(b)} = ${fmtInt(c)} е:`,
    ),
    correct: frac(c - b, a),
    distractors: [frac(b - c, a), frac(c + b, a), frac(a, c - b), frac(c - b, -a)],
    fallback: (k) => frac(c - b + k + 1, a),
  })
}

/* 3. Equation with absolute value: |x − a| − b = c (sometimes no solution) */
export function absoluteValueEquation() {
  const a = randInt(-6, 9) || 4
  const b = randInt(3, 12)
  const noRoots = Math.random() < 0.25
  const d = noRoots ? -randInt(1, 6) : randInt(2, 10)
  const c = d - b
  const pair = (p, q) => and(fmtInt(p), fmtInt(q))
  const correct = d < 0 ? noSolution : pair(a + d, a - d)
  const wrongD = b - c > 0 && b - c !== d ? b - c : Math.abs(d) + 2
  return mcq({
    question: L(
      `What are the roots of the equation |x ${sgn(-a)}| ${MINUS} ${b} = ${fmtInt(c)}?`,
      `Корените на уравнението |x ${sgn(-a)}| ${MINUS} ${b} = ${fmtInt(c)} са:`,
    ),
    correct,
    distractors: [
      pair(-a - Math.abs(d), -a + Math.abs(d)),
      pair(a + wrongD, a - wrongD),
      d < 0 ? pair(a + Math.abs(d), a - Math.abs(d)) : noSolution,
    ],
    fallback: (k) => pair(a + Math.abs(d) + k + 1, a - Math.abs(d) - k - 1),
  })
}

/* 4. Linear inequality where the sign must flip: p − qx ≤ r − sx */
export function linearInequality() {
  const s = randInt(1, 4)
  const q = s + randInt(1, 3) // q > s, so dividing by (s − q) flips the sign
  const m = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
  const p = randInt(-6, 12)
  const r = p + (s - q) * m
  const strict = Math.random() < 0.5
  const op = strict ? '<' : '≤'
  const closedL = strict ? '(' : '['
  const closedR = strict ? ')' : ']'
  const qx = q === 1 ? 'x' : `${q}x`
  const sx = s === 1 ? 'x' : `${s}x`
  return mcq({
    question: L(
      `The solution of the inequality ${fmtInt(p)} ${MINUS} ${qx} ${op} ${fmtInt(r)} ${MINUS} ${sx} is the interval:`,
      `Решението на неравенството ${fmtInt(p)} ${MINUS} ${qx} ${op} ${fmtInt(r)} ${MINUS} ${sx} е интервалът:`,
    ),
    correct: `${closedL}${fmtInt(m)}; +∞)`,
    distractors: [
      `(${MINUS}∞; ${fmtInt(m)}${closedR}`,
      `${closedL}${fmtInt(-m)}; +∞)`,
      `(${MINUS}∞; ${fmtInt(-m)}${closedR}`,
      `(${MINUS}∞; ${fmtInt(m)}${strict ? ']' : ')'}`,
    ],
    fallback: (k) => `${closedL}${fmtInt(m + k + 1)}; +∞)`,
  })
}

/* 5. Powers: (aⁿ − aⁿ⁻¹) / (aⁿ + aⁿ⁻¹) = (a − 1)/(a + 1) */
export function powerFraction() {
  const a = pick([2, 3, 4, 5])
  const n = randInt(5, 12)
  const sup = (x) => String(x).replace(/\d/g, (dgt) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[dgt])
  return mcq({
    question: L(
      `The value of (${a}${sup(n)} ${MINUS} ${a}${sup(n - 1)}) / (${a}${sup(n)} + ${a}${sup(n - 1)}) is:`,
      `Стойността на израза (${a}${sup(n)} ${MINUS} ${a}${sup(n - 1)}) / (${a}${sup(n)} + ${a}${sup(n - 1)}) е равна на:`,
    ),
    correct: frac(a - 1, a + 1),
    distractors: ['0', '1', frac(1, a * a), frac(a - 1, a), frac(1, a + 1)],
  })
}

/* 6. Probability: a random digit / two-digit number divisible by k */
export function probabilityDivisible() {
  const twoDigit = Math.random() < 0.5
  const k = twoDigit ? pick([3, 4, 6, 7, 8, 9, 11, 12]) : pick([2, 3, 4, 5, 6])
  if (!twoDigit) {
    const count = Math.floor(9 / k) + 1 // includes 0
    return mcq({
      question: L(
        `What is the probability that a randomly chosen single-digit non-negative number is divisible by ${k}?`,
        `Вероятността произволно избрано едноцифрено неотрицателно число да се дели на ${k}, е:`,
      ),
      correct: frac(count, 10),
      distractors: [frac(count - 1, 10), frac(count - 1, 9), frac(count, 9), frac(1, k)],
    })
  }
  const count = Math.floor(99 / k) - Math.floor(9 / k)
  return mcq({
    question: L(
      `What is the probability that a randomly chosen two-digit number is divisible by ${k}?`,
      `Вероятността произволно избрано двуцифрено число да се дели на ${k}, е:`,
    ),
    correct: frac(count, 90),
    distractors: [frac(count, 99), frac(count + 1, 90), frac(1, k), frac(count - 1, 90)],
  })
}

/* 7. Percentages: interest rate, or two successive changes */
export function percentProblem() {
  if (Math.random() < 0.5) {
    const r = randInt(2, 9)
    const P = pick([5000, 8000, 12000, 15000, 20000, 25000])
    const end = P + (P * r) / 100
    const pct = (v) => L(`${num(v).en}%`, `${num(v).bg}%`)
    return mcq({
      question: L(
        `€${P.toLocaleString('en-US')} was invested in a fund and after one year it grew to €${end.toLocaleString('en-US')}. What was the annual interest rate?`,
        `В инвестиционен фонд вложили ${P.toLocaleString('bg-BG')} евро и след една година сумата нараснала на ${end.toLocaleString('bg-BG')} евро. Колко е бил годишният лихвен процент?`,
      ),
      correct: pct(r),
      distractors: [pct(r / 10), pct(1 + r / 100), pct(1 + r / 10), pct(r * 10)],
      fallback: (k) => pct(r + k + 1),
    })
  }
  const a = pick([10, 20, 30, 40, 50])
  const net = -(a * a) / 100
  const pct = (v) => L(`${num(v).en}%`, `${num(v).bg}%`)
  return mcq({
    question: L(
      `A price was raised by ${a}% and then the new price was lowered by ${a}%. By what percent did the original price change?`,
      `Цена била увеличена с ${a}%, а след това новата цена била намалена с ${a}%. С колко процента се е променила първоначалната цена?`,
    ),
    correct: pct(net),
    distractors: [pct(0), pct((a * a) / 100), pct(-a / 2), pct(-2 * a)],
    fallback: (k) => pct(net - (k + 1)),
  })
}

/* 8. Joint work: t1 and t2 minutes alone → together t1·t2/(t1 + t2) */
export function jointWork() {
  const [a, b] = pick([
    [1, 2],
    [2, 3],
    [1, 3],
    [3, 4],
    [2, 5],
  ])
  const m = randInt(1, 4)
  const T = a * b * m
  const t1 = b * m * (a + b)
  const t2 = a * m * (a + b)
  const [x, y] = [Math.min(t1, t2), Math.max(t1, t2)]
  const nameA = pick([L('Petko', 'Петко'), L('Ivo', 'Иво'), L('Maria', 'Мария')])
  const nameB = pick([L('Matey', 'Матей'), L('Ana', 'Ана'), L('Niki', 'Ники')])
  return mcq({
    question: L(
      `${nameA.en} can tidy the room alone in ${x} minutes, and ${nameB.en} in ${y} minutes. How many minutes will it take them working together?`,
      `${nameA.bg} може сам да подреди стаята за ${x} минути, а ${nameB.bg} — за ${y} минути. За колко минути двамата заедно ще подредят стаята?`,
    ),
    correct: num(T),
    distractors: [num((x + y) / 2), num(y - x), num(x / 2), num(T * 2)],
    fallback: nearby(T, 2),
  })
}

/* 9. Factoring: (a − k)² − m·a(a − k) */
export function factoringIdentity() {
  const k = randInt(2, 9)
  const m = pick([2, 3])
  const c = m - 1 // (a−k)(−c·a − k) = (k − a)(c·a + k)
  const ca = c === 1 ? 'a' : `${c}a`
  return mcq({
    question: L(
      `The expression (a ${MINUS} ${k})² ${MINUS} ${m}a(a ${MINUS} ${k}) is identically equal to:`,
      `Изразът (a ${MINUS} ${k})² ${MINUS} ${m}a(a ${MINUS} ${k}) е тъждествено равен на:`,
    ),
    correct: `(${k} ${MINUS} a)(${ca} + ${k})`,
    distractors: [
      `(a ${MINUS} ${k})(1 ${MINUS} ${m}a)`,
      `(a ${MINUS} ${k})(${ca} + ${k})`,
      `(${k} ${MINUS} a)(${MINUS}1 + ${m}a)`,
      `${m + 1}(a ${MINUS} ${k})(a ${MINUS} ${c + 1})`,
    ],
  })
}

/* 15. Quadratic-looking equations: x² = kx, x² = k², (x − a)² = b² */
export function quadraticRoots() {
  const kind = randInt(0, 2)
  if (kind === 0) {
    const k = randInt(3, 30)
    return mcq({
      question: L(
        `Find the roots of the equation x² = ${k}x.`,
        `Намерете корените на уравнението x² = ${k}x.`,
      ),
      correct: and('0', k),
      distractors: [L(`only ${k}`, `само ${k}`), and(fmtInt(-k), k), and('0', fmtInt(-k))],
    })
  }
  if (kind === 1) {
    const k = randInt(3, 15)
    return mcq({
      question: L(
        `Find the roots of the equation x² = ${k * k}.`,
        `Намерете корените на уравнението x² = ${k * k}.`,
      ),
      correct: and(fmtInt(-k), k),
      distractors: [L(`only ${k}`, `само ${k}`), and('0', k), noSolution],
    })
  }
  const a = randInt(-6, 8) || 2
  const b = randInt(2, 9)
  return mcq({
    question: L(
      `Find the roots of the equation (x ${sgn(-a)})² = ${b * b}.`,
      `Намерете корените на уравнението (x ${sgn(-a)})² = ${b * b}.`,
    ),
    correct: and(fmtInt(a - b), fmtInt(a + b)),
    distractors: [
      and(fmtInt(-a - b), fmtInt(-a + b)),
      L(`only ${fmtInt(a + b)}`, `само ${fmtInt(a + b)}`),
      and(fmtInt(a - b * b), fmtInt(a + b * b)),
    ],
  })
}

/* 16. Simplify first, then substitute a large value */
export function smartSubstitution() {
  const N = pick([2024, 2025, 2026, 1999, 2030])
  if (Math.random() < 0.5) {
    return mcq({
      question: L(
        `Find the value of (x + 1)² ${MINUS} x(x + 1) for x = ${N}.`,
        `Намерете числената стойност на израза (x + 1)² ${MINUS} x(x + 1) за x = ${N}.`,
      ),
      correct: num(N + 1),
      distractors: [num(N), num(2 * N + 1), num(1), num(N * N)],
    })
  }
  const a = randInt(2, 9)
  return mcq({
    question: L(
      `Find the value of (x + ${a})² ${MINUS} x(x + ${2 * a}) for x = ${N}.`,
      `Намерете числената стойност на израза (x + ${a})² ${MINUS} x(x + ${2 * a}) за x = ${N}.`,
    ),
    correct: num(a * a),
    distractors: [num(2 * a * N + a * a), num(a * a + N), num(0), num(2 * a * a)],
  })
}

/* 17. Bar-chart style statistics: mean of monthly values */
export function monthlyAverage() {
  const months = L('April, May, June, July and August', 'април, май, юни, юли и август')
  const mean = randInt(8, 25)
  const values = Array.from({ length: 4 }, () => randInt(Math.max(1, mean - 10), mean + 10))
  values.push(mean * 5 - values.reduce((s, v) => s + v, 0))
  if (values[4] <= 0) values[4] = mean // keep it positive; mean then shifts
  const real = values.reduce((s, v) => s + v, 0) / 5
  return mcq({
    question: L(
      `A company sold ${values.join(', ')} apartments in ${months.en} respectively. What is the average number sold per month?`,
      `Строителна фирма продала съответно ${values.join(', ')} апартамента през ${months.bg}. Каква е средната месечна продажба?`,
    ),
    correct: num(real, 1),
    distractors: [
      num(Math.max(...values) - Math.min(...values)),
      num(real * 5),
      num((values[0] + values[4]) / 2, 1),
      num(real + 1, 1),
    ],
    fallback: nearby(real, 2),
  })
}

/* 18. Percent of a whole from the remainder */
export function seatsProblem() {
  const p = pick([60, 70, 75, 80, 85, 90, 95])
  const freeShare = (100 - p) / 100
  const unit = 100 / gcd(100, 100 - p)
  const total = unit * randInt(2, 8)
  const free = Math.round(total * freeShare)
  return mcq({
    question: L(
      `At a screening, the audience took ${p}% of the seats and ${free} seats were left empty. How many seats are there in total?`,
      `На прожекция в киносалон зрителите заели ${p}% от местата, а ${free} места останали свободни. Колко са всичките места в киносалона?`,
    ),
    correct: num(total),
    distractors: [
      num(Math.round((free * 100) / p)),
      num(total - free),
      num(total + free),
      num(free * 10),
    ],
    fallback: nearby(total, 5),
  })
}

/* 21. Isosceles triangle with side ratio 1 : k (the x, x, kx case is impossible) */
export function isoscelesPerimeter() {
  const k = randInt(2, 6)
  return mcq({
    question: L(
      `Two sides of an isosceles triangle are in the ratio 1 : ${k}. If the shorter side is x cm, what is the perimeter?`,
      `Две от страните на равнобедрен триъгълник се отнасят както 1 : ${k}. Ако по-малката му страна е x cm, на колко е равен периметърът?`,
    ),
    correct: `${2 * k + 1}x`,
    distractors: [`${k + 2}x`, `${k + 1}x`, `${2 * k + 2}x`],
  })
}

/* 22А. Normal form of (x + a)³ − x(x + 1)² − c(x² + d) */
export function normalForm() {
  const a = randInt(1, 4)
  const c = randInt(1, 4)
  const d = randInt(1, 9)
  const A = 3 * a - 2 - c
  const B = 3 * a * a - 1
  const C = a ** 3 - c * d
  const cTerm = c === 1 ? '' : c
  return mcq({
    question: L(
      `Write M = (x + ${a})³ ${MINUS} x(x + 1)² ${MINUS} ${cTerm}(x² + ${d}) in normal form.`,
      `Представете M = (x + ${a})³ ${MINUS} x(x + 1)² ${MINUS} ${cTerm}(x² + ${d}) в нормален вид.`,
    ),
    correct: poly(A, B, C),
    distractors: [
      poly(A, 3 * a * a + 1, C),
      poly(3 * a - c, B, C),
      poly(A, B, a ** 3 + c * d),
      poly(A + 4, B, C),
    ],
  })
}

/* 22Б/В. Solve |px + q| = r, then decide which roots satisfy an inequality */
export function absInequalityCheck() {
  const p = pick([2, 4, 5, 6])
  const q = randInt(-5, 5) || 3
  const r = randInt(6, 15)
  const x1 = (r - q) / p // larger root
  const x2 = (-r - q) / p // smaller root
  const lab = (v) => num(v, 3)
  const geq = Math.random() < 0.5
  const where = pick(['between', 'below', 'above'])
  const m =
    where === 'between'
      ? Math.round(((x1 + x2) / 2) * 2) / 2
      : where === 'below'
        ? Math.floor(x2) - 1
        : Math.ceil(x1) + 1
  const ok = [x1, x2].filter((x) => (geq ? x >= m : x <= m))
  const only = (v) => L(`only ${lab(v).en}`, `само ${lab(v).bg}`)
  const both = L('both roots', 'и двата корена')
  const neither = L('neither root', 'нито един корен')
  const correct = ok.length === 2 ? both : ok.length === 0 ? neither : only(ok[0])
  const op = geq ? '≥' : '≤'
  return mcq({
    question: L(
      `Which roots of |${p}x ${sgn(q)}| = ${r} are solutions of the inequality x ${op} ${lab(m).en}?`,
      `Кои от корените на уравнението |${p}x ${sgn(q)}| = ${r} са решения на неравенството x ${op} ${lab(m).bg}?`,
    ),
    correct,
    distractors: [only(x1), only(x2), both, neither],
  })
}

/* 23. Karat gold problems (pure gold, mixing alloys, diluting with silver) */
export function karatProblem() {
  const kind = randInt(0, 2)
  const intro = L(
    '1 karat means 1/24 of the alloy mass is pure gold.',
    '1 карат означава, че 1/24 от масата на сплавта е чисто злато.',
  )
  if (kind === 0) {
    const K = pick([9, 12, 14, 18, 22])
    const mass = (24 / gcd(24, K)) * randInt(2, 15)
    const pure = (mass * K) / 24
    return mcq({
      question: L(
        `${intro.en} How many grams of pure gold are there in ${mass} g of ${K}-karat gold?`,
        `${intro.bg} Колко грама чисто злато има в ${mass} g злато ${K} карата?`,
      ),
      correct: num(pure),
      distractors: [
        num((mass * 24) / K, 1),
        num((mass * K) / 100, 1),
        num(mass - pure),
        num(pure + K),
      ],
      fallback: nearby(pure, 3),
    })
  }
  if (kind === 1) {
    // m1·K1 + m2·K2 = (m1 + m2)·K with an integer K
    let m1, m2, K1, K2, K
    do {
      K1 = pick([9, 10, 12, 14])
      K2 = pick([18, 20, 22])
      m1 = 10 * randInt(1, 8)
      m2 = 10 * randInt(1, 8)
      K = (m1 * K1 + m2 * K2) / (m1 + m2)
    } while (!Number.isInteger(K))
    return mcq({
      question: L(
        `${intro.en} A jeweller melted ${m1} g of ${K1}-karat gold with ${m2} g of ${K2}-karat gold. How many karats is the new alloy?`,
        `${intro.bg} Златар смесил ${m1} g злато ${K1} карата и ${m2} g злато ${K2} карата. Колко карата е получената сплав?`,
      ),
      correct: num(K),
      distractors: [num((K1 + K2) / 2, 1), num(K1 + K2), num(K + 1), num(K - 2)],
      fallback: nearby(K, 1),
    })
  }
  // Dilute K1 gold with silver down to K2: total = m·K1/K2
  let m, K1, K2, total
  do {
    K1 = pick([18, 20, 22])
    K2 = pick([9, 12, 14, 15, 16])
    m = pick([7, 10.5, 14, 21, 28])
    total = (m * K1) / K2
  } while (!Number.isInteger(total * 2))
  return mcq({
    question: L(
      `${intro.en} A ${m} g bar of ${K1}-karat gold is made into a bracelet by adding silver until the gold is ${K2} karats. How many grams will the bracelet weigh?`,
      `${intro.bg} От плочка злато ${K1} карата с маса ${m} g направили гривна, като добавили сребро така, че златото да стане ${K2} карата. Колко грама ще тежи гривната?`,
    ),
    correct: num(total),
    distractors: [num(total - m), num((m * K2) / K1, 2), num(m + K1 - K2), num(total + m)],
    fallback: nearby(total, 1.5),
  })
}

export const ALGEBRA_GENERATORS = [
  orderOfOperations,
  linearEquation,
  absoluteValueEquation,
  linearInequality,
  powerFraction,
  probabilityDivisible,
  percentProblem,
  jointWork,
  factoringIdentity,
  quadraticRoots,
  smartSubstitution,
  monthlyAverage,
  seatsProblem,
  isoscelesPerimeter,
  normalForm,
  absInequalityCheck,
  karatProblem,
]
