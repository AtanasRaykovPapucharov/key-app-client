import { defineStore, acceptHMRUpdate } from 'pinia'

export const useCryptoStore = defineStore('crypto', {
  state: () => ({
    crypto: [],
  }),

  actions: {
    setCrypto(crypto) {
      try {
        if (crypto) this.crypto = crypto
      } catch (err) {
        console.error(err)
      }
    },
    deleteCrypto() {
      try {
        this.crypto = []
      } catch (err) {
        console.error(err)
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCryptoStore, import.meta.hot))
}
