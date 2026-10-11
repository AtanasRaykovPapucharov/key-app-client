// nvoQuizzes.js
// Quiz builders for the НВО (7th grade national assessment) style quizzes.

import { shuffle, pick } from './quizUtils.js'
import * as alg from './nvoAlgebraQuestions.js'
import * as geo from './nvoGeometryQuestions.js'

const number = (questions) => questions.map((q, i) => ({ ...q, id: i + 1 }))

/** Draw `count` questions, cycling through every generator before repeating one. */
function drawFrom(generators, count) {
  const out = []
  let pool = []
  while (out.length < count) {
    if (!pool.length) pool = shuffle(generators)
    out.push(pool.pop()())
  }
  return out
}

export const generateNvoAlgebra = (count) => number(drawFrom(alg.ALGEBRA_GENERATORS, count))

export const generateNvoGeometry = (count) => number(drawFrom(geo.GEOMETRY_GENERATORS, count))

/**
 * Full mock exam in the order of the real paper (part one, tasks 1–21):
 * 1–9 algebra, 10–14 geometry, 15–21 short-answer tasks.
 */
export function generateNvoMockExam() {
  const order = [
    alg.orderOfOperations,
    alg.linearEquation,
    alg.absoluteValueEquation,
    alg.linearInequality,
    alg.powerFraction,
    alg.probabilityDivisible,
    alg.percentProblem,
    alg.jointWork,
    alg.factoringIdentity,
    geo.parallelogramVertex,
    geo.bisectorAndHeight,
    geo.parallelLinesAngle,
    geo.perpendicularBisector30,
    geo.parallelogramIsosceles,
    alg.quadraticRoots,
    alg.smartSubstitution,
    pick([alg.monthlyAverage, alg.karatProblem]),
    alg.seatsProblem,
    geo.medianToHypotenuse,
    geo.bisectorsIntersection,
    alg.isoscelesPerimeter,
  ]
  return number(order.map((build) => build()))
}
