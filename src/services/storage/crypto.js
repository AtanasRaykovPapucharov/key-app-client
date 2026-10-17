import { api } from 'boot/axios'
import { getLocalUser } from 'src/services/storage/local'

export const getDaily = async () => {
  const res = await api.get('/daily', { withCredentials: true })
  return res?.data || []
}

export const getCrypto = async () => {
  const res = await api.get('/crypto', { withCredentials: true })
  return res?.data || []
}

export const getOrdersByCrypto = async (cryptoId, uid, watched = false) => {
  try {
    const resolvedUid = uid || getLocalUser()?.uid
    if (!resolvedUid) return []

    const res = await api.get(`/trader/order/${cryptoId}`, {
      withCredentials: true,
      headers: {
        'x-uid': resolvedUid,
        'x-watched': watched,
      },
    })

    return res?.data || []
  } catch (error) {
    console.error('Error fetching orders by crypto:', error)
    return []
  }
}

export const getWatcherOrders = async (cryptoId, uid) => {
  return getOrdersByCrypto(cryptoId, uid, true)
}

export const addOrder = async (data) => {
  const res = await api.post(`/trader/order`, data, { withCredentials: true })
  return res?.data || []
}

export const editOrder = async (data) => {
  const res = await api.put(`/trader/order`, data, { withCredentials: true })
  return res?.data || []
}

export const deleteOrder = async (data) => {
  const res = await api.delete(`/trader/order`, { data, withCredentials: true })
  return res?.data || []
}
