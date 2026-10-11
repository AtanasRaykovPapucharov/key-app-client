/**
 * Binance Kline WebSocket Service
 *
 * @param {string[]} wanted - Array of trading pair symbols to track (e.g. ['BTCUSDC', 'ETHUSDC'])
 */

export function createBinanceWs(wanted = [], interval = '1h') {
  let ws = null

  /**
   * Connect (or reconnect) to the kline stream for a given symbol.
   *
   * @param {string}   symbol         - Trading pair, e.g. 'BTCUSDC'
   * @param {Function} onCandle       - Called with a normalised candle object on every message
   * @param {Function} [onPrice]      - Optional: called with the latest close price (string, 4dp)
   * @param {string}   [streamInterval] - Optional: kline stream interval (e.g. '1h', '1d')
   */
  function connect(symbol, onCandle, onPrice, streamInterval) {
    if (!wanted.includes(symbol)) {
      console.warn(`[binanceWs] "${symbol}" is not in the wanted list.`)
    }

    if (ws) ws.close()

    const kInterval = streamInterval || interval || '1h'
    ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${kInterval}`,
    )

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const k = data.k

      const candle = {
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v),
      }

      onCandle(candle)

      if (typeof onPrice === 'function') {
        onPrice(parseFloat(k.c).toFixed(4))
      }
    }

    ws.onerror = (err) => console.error('[binanceWs] WebSocket error:', err)
  }

  /** Close the active connection (safe to call even if already closed). */
  function disconnect() {
    ws?.close()
    ws = null
  }

  return { connect, disconnect, wanted }
}

// --- Fetch top 10 USDC pairs by volume ---
export async function fetchBinanceTopCoins(wanted = [], to = 'USDC') {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr')
    const all = await res.json()
    const curr =
      !wanted || !Array.isArray(wanted) || wanted.length == 0
        ? all
        : all.filter(
            (c) =>
              c.symbol.endsWith(to) &&
              (wanted?.includes(c.symbol?.toLowerCase()) ||
                wanted?.includes(c.symbol?.toUpperCase())),
          )
    const sorted = curr
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 10)
      .map((c) => ({
        ...c,
        price: parseFloat(c.lastPrice).toFixed(4),
        change: parseFloat(c.priceChangePercent),
      }))
    return sorted
  } catch (err) {
    console.error(err)
  }
}

// --- Load candles for symbol (supports full interval up to 1000 candles) ---
export async function candlesBinanceHistory(symbol, interval = '1h', limit = 1000) {
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
  )
  const data = await res.json()
  return data?.map((c) => ({
    time: Math.floor(c[0] / 1000),
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4]),
    volume: parseFloat(c[5]),
  }))
  // series.setData(candles)
}
