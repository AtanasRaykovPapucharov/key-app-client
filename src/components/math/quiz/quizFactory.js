// quizFactory.js
// Central catalog of available quizzes + a factory function to instantiate one.
// Add a new quiz by adding an entry here and pointing `generate` at a
// question-generator function — the UI (QuizApp/QuizRunner) needs no changes.

import { generateEasyArithmetic, generateHardArithmetic } from './arithmeticQuestions.js'
import { generateGeometryQuiz } from './geometryQuestions.js'

export const QUIZ_CATALOG = [
  {
    id: 'arithmetic-basics',
    title: 'Arithmetic Basics',
    description: '20 quick +, −, ×, ÷ questions to warm up.',
    icon: 'calculate',
    color: 'primary',
    difficulty: 'Easy',
    questionCount: 20,
    timeLimitMinutes: 30,
    generate: () => generateEasyArithmetic(20)
  },
  {
    id: 'mixed-operations',
    title: 'Mixed Operations',
    description: '20 tougher problems: bigger numbers and two-step expressions.',
    icon: 'functions',
    color: 'deep-orange',
    difficulty: 'Medium',
    questionCount: 20,
    timeLimitMinutes: 45,
    generate: () => generateHardArithmetic(20)
  },
  {
    id: 'geometry-challenge',
    title: 'Geometry Challenge',
    description: '17 numeric problems plus 3 SVG-illustrated geometry puzzles.',
    icon: 'change_history',
    color: 'purple',
    difficulty: 'Hard',
    questionCount: 20,
    timeLimitMinutes: 60,
    generate: () => generateGeometryQuiz(20)
  }
]

export function getQuizDefinition(id) {
  const def = QUIZ_CATALOG.find((q) => q.id === id)
  if (!def) throw new Error(`Unknown quiz id: ${id}`)
  return def
}

/**
 * Factory: build a ready-to-run quiz instance (definition + freshly
 * generated questions) from a quiz id.
 */
export function createQuiz(id) {
  const def = getQuizDefinition(id)
  return {
    ...def,
    questions: def.generate()
  }
}
