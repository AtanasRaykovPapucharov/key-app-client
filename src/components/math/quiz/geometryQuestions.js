// geometryQuestions.js
// Harder quiz: 3 SVG-illustrated geometry problems + numeric filler questions.
// Demonstrates the optional `media` field on a question:
//   media: { type: 'svg', content: '<svg>...</svg>' }
//   media: { type: 'image', content: 'https://example.com/diagram.png' }

import { randInt, shuffle, buildOptions } from './quizUtils.js'
import { generateHardArithmetic } from './arithmeticQuestions.js'

const STROKE = '#90caf9'
const LABEL = '#e0e0e0'

/* ---------------- SVG task 1: right-triangle area ------------------ */

function svgRightTriangleArea(id) {
  const a = randInt(6, 16) // vertical leg
  const b = randInt(4, 14) // horizontal leg
  const correctAnswer = (a * b) / 2

  const content = `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <polygon points="30,150 30,20 210,150" fill="none" stroke="${STROKE}" stroke-width="3"/>
      <rect x="30" y="134" width="16" height="16" fill="none" stroke="${LABEL}" stroke-width="1.5"/>
      <text x="4" y="90" fill="${LABEL}" font-size="16" font-family="sans-serif">${a}</text>
      <text x="115" y="172" fill="${LABEL}" font-size="16" font-family="sans-serif">${b}</text>
    </svg>
  `.trim()

  return {
    id,
    question: 'Find the area of this right triangle (not to scale).',
    correctAnswer,
    options: buildOptions(correctAnswer),
    media: { type: 'svg', content }
  }
}

/* ---------------- SVG task 2: missing triangle angle ---------------- */

function svgMissingAngle(id) {
  const angleA = randInt(35, 75)
  const angleB = randInt(35, 75)
  const correctAnswer = 180 - angleA - angleB

  const content = `
    <svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,160 220,160 120,20" fill="none" stroke="${STROKE}" stroke-width="3"/>
      <text x="30" y="145" fill="${LABEL}" font-size="15" font-family="sans-serif">${angleA}°</text>
      <text x="175" y="145" fill="${LABEL}" font-size="15" font-family="sans-serif">${angleB}°</text>
      <text x="112" y="45" fill="${LABEL}" font-size="15" font-family="sans-serif">?</text>
    </svg>
  `.trim()

  return {
    id,
    question: 'What is the missing angle in this triangle?',
    correctAnswer,
    options: buildOptions(correctAnswer),
    media: { type: 'svg', content }
  }
}

/* ---------------- SVG task 3: rectangle perimeter -------------------- */

function svgRectanglePerimeter(id) {
  const length = randInt(8, 24)
  const width = randInt(4, 16)
  const correctAnswer = 2 * (length + width)

  const content = `
    <svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="30" width="180" height="90" fill="none" stroke="${STROKE}" stroke-width="3"/>
      <text x="100" y="20" fill="${LABEL}" font-size="16" font-family="sans-serif">${length}</text>
      <text x="4" y="80" fill="${LABEL}" font-size="16" font-family="sans-serif">${width}</text>
    </svg>
  `.trim()

  return {
    id,
    question: 'Find the perimeter of this rectangle.',
    correctAnswer,
    options: buildOptions(correctAnswer),
    media: { type: 'svg', content }
  }
}

const SVG_TASK_BUILDERS = [svgRightTriangleArea, svgMissingAngle, svgRectanglePerimeter]

/**
 * Build a geometry quiz: 3 SVG-illustrated tasks + numeric filler,
 * shuffled together, re-numbered 1..count.
 */
export function generateGeometryQuiz(count) {
  const svgTasks = SVG_TASK_BUILDERS.map((build) => build(0))
  const fillerCount = Math.max(count - svgTasks.length, 0)
  const filler = generateHardArithmetic(fillerCount)

  const combined = shuffle([...svgTasks, ...filler])
  return combined.map((q, i) => ({ ...q, id: i + 1 }))
}
