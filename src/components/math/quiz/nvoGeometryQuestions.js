// nvoGeometryQuestions.js
// Exam-style geometry problems (НВО, 7th grade) with schematic SVG figures.
// Figures are "not to scale": the numbers on them come from the generator.

import { randInt, pick, L, num, mcq, MINUS } from './quizUtils.js'

const STROKE = '#90caf9'
const LABEL = '#e0e0e0'
const ACCENT = '#ffb74d'

const svg = (w, h, body) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">${body}</svg>`
const line = (x1, y1, x2, y2, extra = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${STROKE}" stroke-width="2.5" ${extra}/>`
const dashed = (x1, y1, x2, y2) => line(x1, y1, x2, y2, 'stroke-dasharray="6 5"')
const poly = (pts) => `<polygon points="${pts}" fill="none" stroke="${STROKE}" stroke-width="2.5"/>`
const text = (x, y, s, size = 15, color = LABEL, weight = 'normal') =>
  `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}">${s}</text>`
const vertex = (x, y, s) => text(x, y, s, 16, LABEL, 'bold')
const value = (x, y, s) => text(x, y, s, 14, ACCENT)
const rightMark = (x, y, dx, dy) =>
  `<path d="M ${x + dx} ${y} L ${x + dx} ${y + dy} L ${x} ${y + dy}" fill="none" stroke="${LABEL}" stroke-width="1.5"/>`
const media = (content) => ({ type: 'svg', content })
const deg = (v) => num(v).en + '°'
const degL = (v) => L(`${num(v).en}°`, `${num(v).bg}°`)
const cm = (v) => L(`${num(v).en} cm`, `${num(v).bg} cm`)
const notToScale = L('(Figure not to scale.)', '(Чертежът не е в мащаб.)')

/* 10. Fourth vertex of a parallelogram in a coordinate system */
export function parallelogramVertex() {
  let A, B, C
  do {
    A = [randInt(-2, 3), randInt(-2, 3)]
    B = [A[0] + randInt(2, 5), A[1] + randInt(-1, 1)]
    C = [randInt(A[0], B[0]), A[1] + randInt(2, 4)]
  } while ((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) === 0)
  const add = (p, q, r) => [p[0] + q[0] - r[0], p[1] + q[1] - r[1]]
  const valid = [add(B, C, A), add(A, C, B), add(A, B, C)]
  const key = (p) => p.join(',')
  const validKeys = new Set(valid.map(key))
  const correct = pick(valid)
  const pt = (p) => `(${p.map((v) => (v < 0 ? `${MINUS}${-v}` : v)).join('; ')})`
  const candidates = [
    [correct[0], correct[1] + 1],
    [correct[0] - 2, correct[1]],
    [-correct[0], correct[1]],
    [correct[1], correct[0]],
    [correct[0] + 1, correct[1] - 1],
    [C[0], -C[1]],
  ].filter((p) => !validKeys.has(key(p)))
  return mcq({
    question: L(
      `Given A${pt(A)}, B${pt(B)} and C${pt(C)}. Which point forms a parallelogram together with A, B and C?`,
      `Дадени са точките A${pt(A)}, B${pt(B)} и C${pt(C)}. Коя точка определя с тях върхове на успоредник?`,
    ),
    correct: pt(correct),
    distractors: candidates.map(pt),
  })
}

/* 11. Height BH and bisector BL: given ∠LBH and ∠C, find ∠A */
export function bisectorAndHeight() {
  let d, c, B, A
  do {
    c = randInt(55, 85)
    d = randInt(4, 15)
    B = 2 * (d + 90 - c)
    A = 180 - B - c
  } while (A < 25 || B < 20)
  // A(20,150) B(240,150) C(200,25); H = foot of the perpendicular from B on AC,
  // L lies on AC between A and H (coordinates precomputed).
  const figure = svg(
    260,
    170,
    poly('20,150 240,150 200,25') +
      line(240, 150, 168.4, 46.9) + // height BH
      line(240, 150, 131.6, 72.5) + // bisector BL
      '<path d="M 161 52 L 166.1 59.4 L 173.5 54.3" fill="none" stroke="#e0e0e0" stroke-width="1.5"/>' +
      vertex(5, 162, 'A') +
      vertex(244, 162, 'B') +
      vertex(203, 20, 'C') +
      vertex(156, 40, 'H') +
      vertex(116, 66, 'L') +
      value(188, 64, deg(c)) +
      value(196, 120, deg(d)),
  )
  return mcq({
    question: L(
      `In △ABC, BH is the height and BL bisects ∠ABC. If ∠LBH = ${d}° and ∠HCB = ${c}°, what is ∠BAC? ${notToScale.en}`,
      `В △ABC отсечката BH е височина, а BL е ъглополовяща на ∠ABC. Ако ∠LBH = ${d}° и ∠HCB = ${c}°, то мярката на ∠BAC е: ${notToScale.bg}`,
    ),
    correct: degL(A),
    distractors: [degL(B), degL(B / 2), degL(90 - c + d), degL(A + d)],
    fallback: (k) => degL(A + 10 * (k + 1)),
    media: media(figure),
  })
}

/* 12. Parallel lines a ∥ b and a broken line B–C–A: ∠ACB = (180 − α) + (180 − β) */
export function parallelLinesAngle() {
  let alpha, beta, answer
  do {
    alpha = randInt(110, 160)
    beta = randInt(120, 170)
    answer = 360 - alpha - beta
  } while (answer < 25 || answer > 120)
  const figure = svg(
    260,
    160,
    line(20, 30, 250, 30) +
      line(20, 135, 250, 135) +
      line(80, 30, 190, 95) +
      line(190, 95, 80, 135) +
      vertex(70, 22, 'B') +
      vertex(72, 155, 'A') +
      vertex(196, 98, 'C') +
      text(240, 22, 'b', 15) +
      text(240, 152, 'a', 15) +
      value(36, 52, deg(alpha)) +
      value(36, 124, deg(beta)),
  )
  return mcq({
    question: L(
      `Lines a and b are parallel. Using the angles marked on the figure (${alpha}° at B and ${beta}° at A), find ∠ACB. ${notToScale.en}`,
      `Правите a и b са успоредни. По данните на чертежа (${alpha}° и ${beta}°) мярката на ∠ACB е: ${notToScale.bg}`,
    ),
    correct: degL(answer),
    distractors: [
      degL(180 - alpha),
      degL(180 - beta),
      degL(alpha + beta - 180),
      degL(Math.abs(alpha - beta)),
    ],
    fallback: (k) => degL(answer + 10 * (k + 1)),
    media: media(figure),
  })
}

/* 13. Right △ with ∠A = 30°: perpendicular bisector of AB meets AC at M → CM = AC/3 */
export function perpendicularBisector30() {
  const CM = randInt(3, 12)
  const AC = 3 * CM
  const figure = svg(
    260,
    160,
    poly('20,140 200,40 240,140') +
      dashed(130, 20, 130, 155) +
      rightMark(200, 40, -10, 10) +
      vertex(5, 152, 'A') +
      vertex(244, 152, 'B') +
      vertex(198, 32, 'C') +
      vertex(112, 72, 'M') +
      value(48, 132, '30°') +
      text(134, 156, 's', 13),
  )
  return mcq({
    question: L(
      `In right △ABC (∠C = 90°) the perpendicular bisector of the hypotenuse AB meets the leg AC at M. If AC = ${AC} cm and ∠BAC = 30°, how long is CM?`,
      `Симетралата на хипотенузата AB на правоъгълния △ABC (∠C = 90°) пресича катета AC в точка M. Ако AC = ${AC} cm и ∠BAC = 30°, то дължината на CM е:`,
    ),
    correct: cm(CM),
    distractors: [cm(AC / 2), cm(2 * CM), cm(AC / 4), cm(CM + 2)],
    media: media(figure),
  })
}

/* 14. Parallelogram ABCD, M on AB with AD = AM, ∠MDC = φ → ∠BCD = 180 − 2φ */
export function parallelogramIsosceles() {
  const phi = randInt(40, 70)
  const answer = 180 - 2 * phi
  const figure = svg(
    270,
    130,
    poly('20,110 200,110 250,20 70,20') +
      line(70, 20, 120, 110) +
      vertex(5, 124, 'A') +
      vertex(196, 124, 'B') +
      vertex(252, 16, 'C') +
      vertex(60, 15, 'D') +
      vertex(114, 124, 'M') +
      value(84, 44, deg(phi)) +
      text(38, 66, '=', 14, ACCENT) +
      text(64, 106, '=', 14, ACCENT),
  )
  return mcq({
    question: L(
      `M is a point on side AB of parallelogram ABCD. If AD = AM and ∠MDC = ${phi}°, what is ∠BCD?`,
      `Точка M е от страната AB на успоредника ABCD. Ако AD = AM и ∠MDC = ${phi}°, то мярката на ∠BCD е:`,
    ),
    correct: degL(answer),
    distractors: [degL(phi / 2), degL(90 - phi), degL(phi), degL(180 - phi)],
    fallback: (k) => degL(answer + 7 * (k + 1)),
    media: media(figure),
  })
}

/* 19. Median to the hypotenuse: CM = AB/2 and ∠CMB = 2∠A */
export function medianToHypotenuse() {
  const AB = 2 * randInt(5, 20)
  const alpha = randInt(15, 40)
  const figure = svg(
    260,
    150,
    poly('20,130 240,130 180,30') +
      line(180, 30, 130, 130) +
      rightMark(180, 30, -8, 9) +
      vertex(5, 145, 'A') +
      vertex(244, 145, 'B') +
      vertex(178, 22, 'C') +
      vertex(124, 147, 'M') +
      value(52, 124, deg(alpha)),
  )
  if (Math.random() < 0.5) {
    return mcq({
      question: L(
        `In right △ABC the hypotenuse AB = ${AB} cm, ∠CAB = ${alpha}° and M is the midpoint of AB. How long is CM?`,
        `В правоъгълния △ABC хипотенузата AB = ${AB} cm, ∠CAB = ${alpha}° и M е средата на AB. Намерете дължината на CM.`,
      ),
      correct: cm(AB / 2),
      distractors: [cm(AB), cm(AB / 4), cm(AB / 2 + alpha / 5), cm(AB / 3)],
      fallback: (k) => cm(AB / 2 + k + 1),
      media: media(figure),
    })
  }
  return mcq({
    question: L(
      `In right △ABC (∠C = 90°), ∠CAB = ${alpha}° and M is the midpoint of the hypotenuse AB. What is ∠CMB?`,
      `В правоъгълния △ABC (∠C = 90°) ∠CAB = ${alpha}° и M е средата на хипотенузата AB. Намерете мярката на ∠CMB.`,
    ),
    correct: degL(2 * alpha),
    distractors: [
      degL(alpha),
      degL(90 - alpha),
      degL(180 - 2 * alpha),
      degL(90 + alpha),
      degL(3 * alpha),
    ],
    fallback: (k) => degL(2 * alpha + 10 * (k + 1)),
    media: media(figure),
  })
}

/* 20. Angle bisectors of ∠A and ∠B meet at O: ∠AOB = 90 + ∠C/2 */
export function bisectorsIntersection() {
  const C = 2 * randInt(15, 50)
  const aob = 90 + C / 2
  const figure = svg(
    240,
    170,
    poly('20,150 220,150 160,20') +
      line(20, 150, 189, 85) +
      line(220, 150, 92, 86) +
      vertex(5, 164, 'A') +
      vertex(224, 164, 'B') +
      vertex(158, 14, 'C') +
      vertex(124, 104, 'O') +
      value(112, 132, deg(aob)),
  )
  return mcq({
    question: L(
      `The bisectors of ∠BAC and ∠ABC meet at O and ∠AOB = ${aob}°. What is ∠ACB?`,
      `Ъглополовящите на ∠BAC и ∠ABC се пресичат в точка O, като ∠AOB = ${aob}°. Намерете мярката на ∠ACB.`,
    ),
    correct: degL(C),
    distractors: [
      degL(180 - aob),
      degL(aob - 90),
      degL(2 * (180 - aob)),
      degL(C + 20),
      degL(C - 10),
    ],
    fallback: (k) => degL(C + 15 * (k + 1)),
    media: media(figure),
  })
}

/* 24Г. Rectangle with ∠DBC = 2∠ABD → 30°/60° angles, AQ : AB = 1 : 3 */
export function rectangleThirds() {
  const AQ = randInt(2, 12)
  const figure = svg(
    260,
    150,
    poly('20,130 240,130 240,20 20,20') +
      line(20, 20, 240, 130) +
      line(20, 20, 93, 130) +
      vertex(5, 146, 'A') +
      vertex(244, 146, 'B') +
      vertex(244, 16, 'C') +
      vertex(5, 16, 'D') +
      vertex(88, 147, 'Q'),
  )
  return mcq({
    question: L(
      `In rectangle ABCD, ∠DBC = 2·∠ABD. The bisector of ∠ADB meets AB at Q and AQ = ${AQ} cm. How long is AB?`,
      `В правоъгълника ABCD ∠DBC = 2·∠ABD. Ъглополовящата на ∠ADB пресича AB в точка Q и AQ = ${AQ} cm. Намерете дължината на AB.`,
    ),
    correct: cm(3 * AQ),
    distractors: [cm(2 * AQ), cm(4 * AQ), cm(AQ * 1.5), cm(6 * AQ)],
    media: media(figure),
  })
}

/* 24В. Two triangles inside a rectangle always cover half of its area */
export function rectangleHalfArea() {
  const a = randInt(6, 18)
  const b = randInt(4, 12)
  const aq = randInt(1, a - 1)
  return mcq({
    question: L(
      `Rectangle ABCD has AB = ${a} cm and AD = ${b} cm. Q is on AB with AQ = ${aq} cm and P is any point on CD. What is S(ADQ) + S(QBP)?`,
      `Правоъгълникът ABCD има AB = ${a} cm и AD = ${b} cm. Точка Q е от AB, като AQ = ${aq} cm, а P е произволна точка от CD. Намерете S(ADQ) + S(QBP).`,
    ),
    correct: L(`${num((a * b) / 2).en} cm²`, `${num((a * b) / 2).bg} cm²`),
    distractors: [
      L(`${num(a * b).en} cm²`, `${num(a * b).bg} cm²`),
      L(`${num((aq * b) / 2).en} cm²`, `${num((aq * b) / 2).bg} cm²`),
      L(`${num(((a - aq) * b) / 2).en} cm²`, `${num(((a - aq) * b) / 2).bg} cm²`),
      L(`${num((a * b) / 4).en} cm²`, `${num((a * b) / 4).bg} cm²`),
    ],
    fallback: (k) => L(`${num((a * b) / 2 + k + 1).en} cm²`, `${num((a * b) / 2 + k + 1).bg} cm²`),
  })
}

/* Exterior angle theorem: exterior angle at C = ∠A + ∠B */
export function exteriorAngle() {
  const A = randInt(25, 70)
  const B = randInt(25, 70)
  const ext = A + B
  return mcq({
    question: L(
      `In △ABC, ∠BAC = ${A}° and the exterior angle at vertex C is ${ext}°. What is ∠ABC?`,
      `В △ABC ∠BAC = ${A}°, а външният ъгъл при върха C е ${ext}°. Намерете мярката на ∠ABC.`,
    ),
    correct: degL(B),
    distractors: [degL(180 - ext), degL(180 - A), degL(ext), degL(B + 10)],
    fallback: (k) => degL(B + 5 * (k + 2)),
  })
}

export const GEOMETRY_GENERATORS = [
  parallelogramVertex,
  bisectorAndHeight,
  parallelLinesAngle,
  perpendicularBisector30,
  parallelogramIsosceles,
  medianToHypotenuse,
  bisectorsIntersection,
  rectangleThirds,
  rectangleHalfArea,
  exteriorAngle,
]
