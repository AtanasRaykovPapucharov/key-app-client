import { defineStore } from 'pinia'

import { getLocalUser } from 'src/services/storage/local'
import { getToken, numericIdOf } from 'src/services/auth/token'
import { WS_URL, isServerConfigured } from 'src/config'

// Reconnect with exponential backoff: 1s, 2s, 4s … capped at 30s.
const BASE_DELAY = 1000
const MAX_DELAY = 30000
const backoff = (attempt) => Math.min(MAX_DELAY, BASE_DELAY * 2 ** Math.max(0, attempt - 1))

// Phones drop sockets when the tab is backgrounded or the network changes.
let lifecycleBound = false

export const useBinanceStore = defineStore('binance', {
  state: () => ({
    tickers: {}, // { BTCUSDC: { price, change, high, low, volume } }
    holdings: [], // [{ asset, free, locked }]
    connected: false,
    balanceLoaded: false,
    ws: null,
    reconnectTimer: null,
    connectionAttempts: 0,
    shouldReconnect: true,
    cryptoSymbol: 'BTC',
  }),

  getters: {
    sortedHoldings: (state) => [...state.holdings].sort((a, b) => b.asset.localeCompare(a.asset)),

    portfolioAssets: (state) => state.holdings.filter((h) => !['USDC'].includes(h.asset)),

    stablecoins: (state) =>
      state.holdings.filter((h) => ['USDT', 'BUSD', 'USDC'].includes(h.asset)),
  },

  actions: {
    connect(isReconnect = false) {
      if (!isServerConfigured) return
      if (!isReconnect) {
        this.shouldReconnect = true
        this.connectionAttempts = 0
      }
      this.bindLifecycle()

      if (!this.shouldReconnect) return
      if (
        this.ws &&
        (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
      )
        return
      // Don't burn attempts while offline or hidden; lifecycle events resume us
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return

      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
      this.connectionAttempts += 1

      let ws
      try {
        ws = new WebSocket(WS_URL)
      } catch {
        this.scheduleReconnect()
        return
      }
      this.ws = ws

      ws.onopen = () => {
        this.connected = true
        this.connectionAttempts = 0
        const user = getLocalUser()
        ws.send(JSON.stringify({ type: 'auth', userId: numericIdOf(user), token: getToken() }))
      }

      ws.onclose = () => {
        if (this.ws === ws) this.ws = null
        this.connected = false
        this.scheduleReconnect()
      }

      ws.onerror = () => ws.close()

      ws.onmessage = ({ data }) => {
        try {
          const msg = JSON.parse(data)
          if (msg.type === 'tickers') {
            for (const m of msg.data) {
              if (m)
                this.tickers[m.symbol] = {
                  price: parseFloat(m.price),
                  change: parseFloat(m.change),
                  high: parseFloat(m.high),
                  low: parseFloat(m.low),
                  volume: parseFloat(m.volume),
                }
            }
          }

          if (msg.type === 'balance') {
            this.holdings = msg.holdings
            this.balanceLoaded = true
          }
        } catch (error) {
          console.warn('[ws] ignored malformed message', error)
        }
      }
    },

    scheduleReconnect() {
      if (!this.shouldReconnect || this.reconnectTimer) return
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null
        this.connect(true)
      }, backoff(this.connectionAttempts))
    },

    /** Reconnect right away when the phone comes back online or the tab is shown again. */
    bindLifecycle() {
      if (lifecycleBound || typeof window === 'undefined') return
      lifecycleBound = true
      const resume = () => {
        if (!this.shouldReconnect || this.connected) return
        this.connectionAttempts = 0
        this.connect(true)
      }
      window.addEventListener('online', resume)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') resume()
      })
    },

    setCryptoSymbol(asset) {
      if (asset && this.cryptoSymbol !== asset) this.cryptoSymbol = asset
    },

    disconnect() {
      this.shouldReconnect = false
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
      this.ws?.close()
      this.ws = null
    },
  },
})
