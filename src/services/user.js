import { useUserStore } from 'src/stores/user'
import { usePortfolioStore } from 'src/stores/portfolio'
import { useBankStore } from 'src/stores/bank'
import { useCryptoStore } from 'src/stores/crypto'
import { deleteUser, logout } from 'src/services/storage/user'

const userStore = useUserStore()
const portfolioStore = usePortfolioStore()
const bankStore = useBankStore()
const cryptoStore = useCryptoStore()

export const signOut = async () => {
  try {
    await logout()
    return true
  } catch (error) {
    console.error('Logout request failed:', error)
    return false
  } finally {
    userStore.signOut()
    portfolioStore.$reset()
    bankStore.$reset()
    cryptoStore.$reset()
  }
}
export const deleteAccount = async () => {
  try {
    await deleteUser(userStore.user.id)
    return true
  } catch (error) {
    console.error('Delete account request failed:', error)
    return false
  } finally {
    userStore.signOut()
    portfolioStore.$reset()
    bankStore.$reset()
    cryptoStore.$reset()
  }
}
