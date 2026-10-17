import { useUserStore } from 'src/stores/user'
import { usePortfolioStore } from 'src/stores/portfolio'
import { useBankStore } from 'src/stores/bank'
import { useCryptoStore } from 'src/stores/crypto'
import { deleteUser, logout } from 'src/services/storage/user'
import { numericIdOf } from 'src/services/auth/token'

const userStore = useUserStore()
const portfolioStore = usePortfolioStore()
const bankStore = useBankStore()
const cryptoStore = useCryptoStore()

const resetStores = () => {
  userStore.signOut()
  portfolioStore.$reset()
  bankStore.$reset()
  cryptoStore.$reset()
}

/** Local-only sign-out, used when the server says the session is no longer valid. */
export const expireSession = () => resetStores()

export const signOut = async () => {
  try {
    await logout()
    return true
  } catch (error) {
    console.error('Logout request failed:', error)
    return false
  } finally {
    resetStores()
  }
}
export const deleteAccount = async () => {
  try {
    await deleteUser(numericIdOf(userStore.user))
    return true
  } catch (error) {
    console.error('Delete account request failed:', error)
    return false
  } finally {
    resetStores()
  }
}
