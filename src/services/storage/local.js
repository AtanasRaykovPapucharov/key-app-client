export const getLocalCrypto = () => {
  const data = localStorage.getItem('crypto')
  if (!data) return ['BTC', 'ETH', 'SOL']
  return JSON.parse(data)
}

export const setLocalCrypto = (crypto) => {
  try {
    localStorage.setItem('crypto', JSON.stringify(crypto))
  } catch (err) {
    console.error(err)
  }
}

export const deleteLocalCrypto = () => {
  try {
    localStorage.removeItem('crypto')
  } catch (err) {
    console.error(err)
  }
}

// =========================================================

export const getLocalUser = () => {
  const data = localStorage.getItem('user')
  if (!data) return undefined
  return JSON.parse(data)
}

export const setLocalUser = (user) => {
  try {
    localStorage.setItem('user', JSON.stringify(user))
  } catch (err) {
    console.error(err)
  }
}

export const deleteLocalUser = () => {
  try {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('keyapp:token')
  } catch (err) {
    console.error(err)
  }
}

// =========================================================
