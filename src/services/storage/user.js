import { api } from 'boot/axios'

// sign in/sign up
// Credentials (Authorization / x-auth-token) are attached by the axios interceptor.

export const login = async (username, password) => {
  const res = await api.post('/login', { username, password })
  return res.data
}

export const register = async (username, password) => {
  const res = await api.post('/register', { username, password })
  return res.data
}

export const logout = async () => {
  const res = await api.post('/logout', {})
  return res.data
}

export const deleteUser = async (id) => {
  const res = await api.delete(`/user/${id}`)
  return res.data
}

export const portfolio = async (uid) => {
  const res = await api.get('/portfolio', {
    withCredentials: true,
    headers: { 'x-uid': uid },
  })
  return res.data
}

export const updatePortfolioWatchList = async (uid, watch_list) => {
  const res = await api.put(
    '/portfolio',
    { watch_list },
    {
      withCredentials: true,
      headers: { 'x-uid': uid },
    },
  )
  return res.data
}

export const startGame = async (uid, game) => {
  const res = await api.post(
    '/portfolio/game',
    { game },
    {
      withCredentials: true,
      headers: { 'x-uid': uid },
    },
  )
  return res.data
}
