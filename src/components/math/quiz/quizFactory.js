// quizFactory.js
// Central catalog of available quizzes + a factory function to instantiate one.
// Add a new quiz by adding an entry here and pointing `generate` at a
// question-generator function — the UI (QuizApp/QuizRunner) needs no changes.
//
// Text fields (title, description, difficulty) are { en, bg } objects;
// questions and option labels may be plain strings or { en, bg } objects.

import { generateEasyArithmetic, generateHardArithmetic } from './arithmeticQuestions.js'
import { generateGeometryQuiz } from './geometryQuestions.js'
import { generateNvoAlgebra, generateNvoGeometry, generateNvoMockExam } from './nvoQuizzes.js'
import { L } from './quizUtils.js'

const EASY = L('Easy', 'Лесно')
const MEDIUM = L('Medium', 'Средно')
const HARD = L('Hard', 'Трудно')
const EXAM = L('Exam level', 'Изпитно ниво')

export const QUIZ_CATALOG = [
  {
    id: 'arithmetic-basics',
    title: L('Arithmetic basics', 'Основи на аритметиката'),
    description: L(
      '20 quick +, −, ×, ÷ questions to warm up.',
      '20 бързи задачи с +, −, ×, ÷ за загрявка.',
    ),
    icon: 'calculate',
    color: 'primary',
    difficulty: EASY,
    questionCount: 20,
    timeLimitMinutes: 30,
    generate: () => generateEasyArithmetic(20),
  },
  {
    id: 'mixed-operations',
    title: L('Mixed operations', 'Смесени действия'),
    description: L(
      '20 tougher problems: bigger numbers and two-step expressions.',
      '20 по-трудни задачи: по-големи числа и изрази с две действия.',
    ),
    icon: 'functions',
    color: 'deep-orange',
    difficulty: MEDIUM,
    questionCount: 20,
    timeLimitMinutes: 45,
    generate: () => generateHardArithmetic(20),
  },
  {
    id: 'geometry-challenge',
    title: L('Geometry challenge', 'Геометрично предизвикателство'),
    description: L(
      '17 numeric problems plus 3 illustrated geometry puzzles.',
      '17 числови задачи и 3 геометрични задачи с чертеж.',
    ),
    icon: 'change_history',
    color: 'purple',
    difficulty: HARD,
    questionCount: 20,
    timeLimitMinutes: 60,
    generate: () => generateGeometryQuiz(20),
  },
  {
    id: 'nvo-algebra',
    nvo: true,
    title: L('NVO: algebra & word problems', 'НВО: алгебра и текстови задачи'),
    description: L(
      'Equations with absolute value, inequalities, factoring, powers, probability, percentages, joint work and karat-gold problems.',
      'Уравнения с модул, неравенства, разлагане, степени, вероятност, проценти, задачи за съвместна работа и за карати злато.',
    ),
    icon: 'school',
    color: 'teal',
    difficulty: EXAM,
    questionCount: 20,
    timeLimitMinutes: 50,
    generate: () => generateNvoAlgebra(20),
  },
  {
    id: 'nvo-geometry',
    nvo: true,
    title: L('NVO: geometry', 'НВО: геометрия'),
    description: L(
      'Bisectors and heights, parallel lines, parallelograms, the median to the hypotenuse, 30° triangles and coordinates — with figures.',
      'Ъглополовящи и височини, успоредни прави, успоредници, медиана към хипотенузата, триъгълници с ъгъл 30° и координати — с чертежи.',
    ),
    icon: 'architecture',
    color: 'indigo',
    difficulty: EXAM,
    questionCount: 15,
    timeLimitMinutes: 45,
    generate: () => generateNvoGeometry(15),
  },
  {
    id: 'nvo-mock-exam',
    nvo: true,
    title: L('NVO mock exam — part one', 'Пробно НВО — първа част'),
    description: L(
      'All 21 tasks of part one in the order of the real paper, with the real 90-minute limit.',
      'Всички 21 задачи от първата част в реда на истинския изпит, с реалните 90 минути.',
    ),
    icon: 'assignment',
    color: 'red-6',
    difficulty: EXAM,
    questionCount: 21,
    timeLimitMinutes: 90,
    generate: () => generateNvoMockExam(),
  },
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
    questions: def.generate(),
  }
}
