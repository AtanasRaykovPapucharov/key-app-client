import { defineStore } from 'pinia'

import { getLocalUser } from 'src/services/storage/local'

const server = 'http://localhost:3000'
const MAX_CONNECTION_ATTEMPTS = 5

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
      if (!isReconnect) {
        this.shouldReconnect = true
        this.connectionAttempts = 0
      }

      if (!this.shouldReconnect || this.connectionAttempts >= MAX_CONNECTION_ATTEMPTS) return

      this.connectionAttempts += 1
      const wsUrl = `${server.replace(/^http/, 'ws')}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.connected = true
        this.connectionAttempts = 0
        this.ws.send(JSON.stringify({ type: 'auth', userId: getLocalUser()?.id || null }))
      }
      this.ws.onclose = () => {
        this.connected = false
        if (!this.shouldReconnect) return
        if (this.connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
          console.error('Server is not available.')
          console.log('Server is not available.')
          return
        }

        this.reconnectTimer = setTimeout(() => this.connect(true), 3000)
      }
      this.ws.onerror = () => this.ws.close()

      this.ws.onmessage = ({ data }) => {
        const msg = JSON.parse(data)

        try {
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
          console.log(error)
        }
      }
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
