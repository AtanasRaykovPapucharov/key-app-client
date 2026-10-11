import { api } from 'boot/axios'

export const getCoinmarketcapPrices = async () => {
  try {
    let res = await api.get('/coinmarketcap/prices', {}, { withCredentials: true })
    return res?.data || []
  } catch (err) {
    console.error('Error fetching coinmarketcap prices:', err)
    return []
  }
}
