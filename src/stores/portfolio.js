import { defineStore, acceptHMRUpdate } from 'pinia'
import { portfolio } from 'src/services/storage/user'
import { useUserStore } from 'src/stores/user'
import { fee } from 'src/services/storage/calc'

export const usePortfolioStore = defineStore('portfolio', {
  state: () => ({
    portfolio: {
      fiat_curr: 'EUR',
      fiat_amount: 10000,
      stable_amount: 0,
      stable_curr: 'USDC',
      crypto: [],
      watch_list: ['btcusdc', 'ethusdc', 'bnbusdc', 'solusdc'],
    },
  }),

  actions: {
    async initializePortfolio() {
      try {
        // const portfolio = {
        //   fiat_curr: 'EUR',
        //   fiat_amount: 1000,
        //   stable_amount: 100000,
        //   stable_curr: 'USDC',
        //   crypto: [{ curr: 'BTC', amount: 55 }],
        //   watch_list: ['btcusdc', 'ethusdc', 'bnbusdc', 'solusdc'],
        // }
        const userUid = useUserStore().user?.uid || useUserStore().user?.id
        if (!userUid) return

        const pf = await portfolio(userUid)
        this.portfolio = pf
      } catch (err) {
        console.error(err)
      }
    },
    applyTrade({ order_type, is_crypto, crypto_id, curr_price, amount }) {
      const tradeAmount = Number(amount) || 0
      const tradeTotal = (Number(curr_price) || 0) * tradeAmount
      const tradeFee = fee(tradeTotal)
      const cryptoSymbol = String(crypto_id || '').toUpperCase()

      if (order_type === 'buy' && is_crypto === false && cryptoSymbol === 'USDC') {
        this.portfolio = {
          ...this.portfolio,
          fiat_amount: Number(this.portfolio.fiat_amount || 0) - tradeAmount,
          stable_amount:
            Number(this.portfolio.stable_amount || 0) + tradeAmount * (Number(curr_price) || 1),
        }
        return
      }

      const cryptoAssets = Array.isArray(this.portfolio.crypto)
        ? this.portfolio.crypto.map((asset) => ({ ...asset }))
        : []
      const cryptoAsset = cryptoAssets.find(
        (asset) => String(asset.curr).toUpperCase() === cryptoSymbol,
      )

      if (order_type === 'buy') {
        if (cryptoAsset) {
          cryptoAsset.amount = Number(cryptoAsset.amount || 0) + tradeAmount
        } else {
          cryptoAssets.push({ curr: cryptoSymbol, amount: tradeAmount })
        }
      } else if (order_type === 'sell' && cryptoAsset) {
        cryptoAsset.amount = Number(cryptoAsset.amount || 0) - tradeAmount
      }

      this.portfolio = {
        ...this.portfolio,
        crypto: cryptoAssets,
        stable_amount:
          Number(this.portfolio.stable_amount || 0) +
          (order_type === 'buy'
            ? -(tradeTotal + tradeFee)
            : order_type === 'sell'
              ? tradeTotal - tradeFee
              : 0),
      }
    },
    setPortfolio(portfolio) {
      try {
        this.portfolio = portfolio
      } catch (err) {
        console.error(err)
      }
    },
    deletePortfolio() {
      try {
        this.portfolio = {}
      } catch (err) {
        console.error(err)
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePortfolioStore, import.meta.hot))
}
