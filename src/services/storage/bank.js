import { api } from 'boot/axios'
import { getLocalUser } from 'src/services/storage/local'

export const getBank = async () => {
  const res = await api.get('/bank', { withCredentials: true })
  return res?.data || {}
}

export const getBankTransactions = async () => {
  const uid = getLocalUser()?.uid
  if (!uid) return []

  const res = await api.get('/bank/transactions', {
    withCredentials: true,
    headers: { 'x-uid': uid },
  })
  return res?.data || []
}
