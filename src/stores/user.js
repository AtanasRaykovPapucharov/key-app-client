import { defineStore, acceptHMRUpdate } from 'pinia'
import { setLocalUser, deleteLocalUser } from 'src/services/storage/local'
import { setToken, clearToken } from 'src/services/auth/token'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      username: 'Unknown',
      avatar: null,
      admin: false,
      isAuthenticated: false,
      uid: null,
    },
  }),

  actions: {
    /**
     * @param user  profile returned by the server (never contains the token)
     * @param token auth token from login/register; omit when restoring a session
     */
    setUser(user, token) {
      // never persist a token or password inside the profile object
      const profile = { ...(user || {}) }
      for (const key of ['token', 'accessToken', 'access_token', 'password']) delete profile[key]
      this.user = profile
      setLocalUser(profile)
      if (token) setToken(token)
    },

    signOut() {
      this.user = {
        username: 'Unknown',
        avatar: null,
        admin: false,
        isAuthenticated: false,
        uid: null,
      }

      deleteLocalUser()
      clearToken()
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
