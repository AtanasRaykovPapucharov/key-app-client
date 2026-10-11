import { ref, onBeforeUnmount } from 'vue'
import Stockfish from 'stockfish'

export function useStockfish() {
  const ready = ref(false)
  const thinking = ref(false)

  let engine = null
  let resolveBestMove = null

  function init() {
    if (engine) return

    engine = Stockfish()

    engine.onmessage = (event) => {
      const line = typeof event === 'string' ? event : event?.data || ''

      if (line === 'uciok') {
        engine.postMessage('isready')
        return
      }

      if (line === 'readyok') {
        ready.value = true
        return
      }

      if (line.startsWith('bestmove')) {
        const parts = line.split(' ')
        const bestMove = parts[1]

        thinking.value = false

        if (resolveBestMove) {
          resolveBestMove(bestMove)
          resolveBestMove = null
        }
      }
    }

    engine.postMessage('uci')
  }

  function getBestMove(fen, depth = 16) {
    init()

    return new Promise((resolve) => {
      resolveBestMove = resolve
      thinking.value = true

      engine.postMessage('stop')
      engine.postMessage(`position fen ${fen}`)
      engine.postMessage(`go depth ${depth}`)
    })
  }

  function stop() {
    engine?.postMessage('stop')
    thinking.value = false
  }

  onBeforeUnmount(() => {
    stop()
    engine?.postMessage('quit')
    engine = null
  })

  return {
    ready,
    thinking,
    init,
    getBestMove,
    stop,
  }
}
