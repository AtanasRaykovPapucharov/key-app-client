import { api } from 'boot/axios'

let eurUsdcCache = null
let eurUsdcCachedAt = 0
let eurUsdcRequest = null

export async function getEurUsdcPrice() {
  const now = Date.now()
  if (eurUsdcCache && now - eurUsdcCachedAt < 60_000) return eurUsdcCache
  if (eurUsdcRequest) return eurUsdcRequest

  eurUsdcRequest = fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=eur',
  )
    .then((res) => {
      if (!res.ok) throw new Error(`CoinGecko request failed: ${res.status}`)
      return res.json()
    })
    .then((data) => {
      const usdcInEur = Number(data?.['usd-coin']?.eur)
      if (!Number.isFinite(usdcInEur) || usdcInEur <= 0) return null

      eurUsdcCache = 1 / usdcInEur
      eurUsdcCachedAt = Date.now()
      return eurUsdcCache
    })
    .catch((err) => {
      console.error('Error fetching EUR/USDC price:', err)
      return null
    })
    .finally(() => {
      eurUsdcRequest = null
    })

  return eurUsdcRequest
}

export async function getBTCPrice() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
  )
  const data = await res.json()
  console.log(data.bitcoin.usd)
}

export const getLongTermChart = async (coinId, days = 'max', vs = 'usd', source = 'auto') => {
  try {
    const res = await api.get(`/price-history/${coinId}`, { params: { days, vs, source } })
    return res?.data || null
  } catch (err) {
    console.error('Error fetching long term chart:', err)
    return { error: err?.response?.data?.error || err.message }
  }
}

export const getLongTermCandles = async (coinId, days = 'max', interval) => {
  try {
    const res = await api.get(`/price-history/${coinId}/candles`, {
      params: { days, ...(interval ? { interval } : {}) },
    })
    return res?.data || null
  } catch (err) {
    console.error('Error fetching long term candles:', err)
    return { error: err?.response?.data?.error || err.message, candles: [] }
  }
}

export const getLongTermOhlc = async (coinId, days = '365', vs = 'usd') => {
  try {
    const res = await api.get(`/coingecko/ohlc/${coinId}`, { params: { days, vs } })
    return res?.data?.candles || []
  } catch (err) {
    console.error('Error fetching long term ohlc:', err)
    return []
  }
}

export const getCoingeckoMarkets = async (ids = [], vs = 'usd') => {
  try {
    const res = await api.get('/coingecko/markets', {
      params: { ids: Array.isArray(ids) ? ids.join(',') : ids, vs },
    })
    return res?.data || []
  } catch (err) {
    console.error('Error fetching coingecko markets:', err)
    return []
  }
}
