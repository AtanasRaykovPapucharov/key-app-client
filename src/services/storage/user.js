import { api } from 'boot/axios'

// sign in/sign up
export const login = async (username, password) => {
  const res = await api.post('/login', { username, password }, { withCredentials: true })
  return res.data
}

export const register = async (username, password) => {
  const res = await api.post('/register', { username, password }, { withCredentials: true })
  return res.data
}

export const logout = async () => {
  const res = await api.post('/logout', {}, { withCredentials: true })
  return res.data
}

export const deleteUser = async (id) => {
  const res = await api.delete(`/user/${id}`, {
    withCredentials: true,
    headers: { 'x-auth-token': localStorage.getItem('token') },
  })
  return res.data
}

export const portfolio = async (uid) => {
  const res = await api.get('/portfolio', {
    withCredentials: true,
    headers: { 'x-uid': uid },
  })
  console.log('portfolio res.data:', res.data)
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
