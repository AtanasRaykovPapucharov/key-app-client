export const getSessionUser = () => {
  const data = sessionStorage.getItem('user')
  if (!data) return undefined
  return JSON.parse(data)
}

export const setSessionUser = (user) => {
  try {
    sessionStorage.setItem('user', JSON.stringify(user))
  } catch (err) {
    console.error(err)
  }
}

export const deleteSessionUser = () => {
  try {
    sessionStorage.removeItem('user')
  } catch (err) {
    console.error(err)
  }
}
