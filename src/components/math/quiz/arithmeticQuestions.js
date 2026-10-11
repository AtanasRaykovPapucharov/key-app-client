// arithmeticQuestions.js
// Plain numeric question generators. Each question has the shape:
// { id, question, correctAnswer, options, media? }
// `media` is optional and, when present, looks like:
//   { type: 'svg',   content: '<svg>...</svg>' }
//   { type: 'image', content: 'https://...' }

import { randInt, buildOptions } from './quizUtils.js'

/* ---------------------------- Easy set ---------------------------- */

function makeEasyQuestion(id) {
  const ops = ['+', '-', '×', '÷']
  const op = ops[randInt(0, 3)]
  let a, b, correctAnswer, question

  switch (op) {
    case '+':
      a = randInt(2, 99)
      b = randInt(2, 99)
      correctAnswer = a + b
      question = `${a} + ${b}`
      break
    case '-':
      a = randInt(10, 99)
      b = randInt(1, a)
      correctAnswer = a - b
      question = `${a} - ${b}`
      break
    case '×':
      a = randInt(2, 12)
      b = randInt(2, 12)
      correctAnswer = a * b
      question = `${a} × ${b}`
      break
    case '÷':
      b = randInt(2, 12)
      correctAnswer = randInt(2, 12)
      a = b * correctAnswer
      question = `${a} ÷ ${b}`
      break
  }

  return {
    id,
    question: `${question} = ?`,
    correctAnswer,
    options: buildOptions(correctAnswer)
  }
}

export function generateEasyArithmetic(count) {
  return Array.from({ length: count }, (_, i) => makeEasyQuestion(i + 1))
}

/* ---------------------------- Hard set ----------------------------- */
// Bigger numbers and the occasional two-step expression.

function makeHardQuestion(id) {
  const kind = randInt(0, 4)
  let question, correctAnswer

  switch (kind) {
    case 0: {
      const a = randInt(100, 999)
      const b = randInt(100, 999)
      correctAnswer = a + b
      question = `${a} + ${b}`
      break
    }
    case 1: {
      const a = randInt(200, 999)
      const b = randInt(1, a)
      correctAnswer = a - b
      question = `${a} - ${b}`
      break
    }
    case 2: {
      const a = randInt(11, 25)
      const b = randInt(11, 20)
      correctAnswer = a * b
      question = `${a} × ${b}`
      break
    }
    case 3: {
      const b = randInt(11, 20)
      correctAnswer = randInt(11, 25)
      const a = b * correctAnswer
      question = `${a} ÷ ${b}`
      break
    }
    case 4: {
      // two-step: (a + b) × c
      const a = randInt(2, 20)
      const b = randInt(2, 20)
      const c = randInt(2, 12)
      correctAnswer = (a + b) * c
      question = `(${a} + ${b}) × ${c}`
      break
    }
  }

  return {
    id,
    question: `${question} = ?`,
    correctAnswer,
    options: buildOptions(correctAnswer)
  }
}

export function generateHardArithmetic(count) {
  return Array.from({ length: count }, (_, i) => makeHardQuestion(i + 1))
}
