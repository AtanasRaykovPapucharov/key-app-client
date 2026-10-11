import { defineStore, acceptHMRUpdate } from 'pinia'
import { getBank, getBankTransactions } from 'src/services/storage/bank'

export const useBankStore = defineStore('bank', {
  state: () => ({
    bank: {
      fee: 0.0095,
      fee_accumulated: 0,
      transactions: [],
    },
  }),

  actions: {
    setBank(bank) {
      try {
        this.bank = bank
      } catch (err) {
        console.error(err)
      }
    },
    async loadTransactions() {
      try {
        this.bank.transactions = await getBankTransactions()
      } catch (err) {
        console.error(err)
      }
    },
    async refresh() {
      try {
        this.setBank(await getBank())
        await this.loadTransactions()
      } catch (err) {
        console.error(err)
      }
    },
    deleteBank() {
      try {
        this.bank = {}
      } catch (err) {
        console.error(err)
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBankStore, import.meta.hot))
}
