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
