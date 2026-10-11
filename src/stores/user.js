import { defineStore, acceptHMRUpdate } from 'pinia'
import { setLocalUser, deleteLocalUser } from 'src/services/storage/local'

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
    setUser(user) {
      this.user = user
      setLocalUser(user)
      localStorage.setItem('token', user.uid)
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
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
