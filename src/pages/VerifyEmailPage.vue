<script setup>
/** Opened from the confirmation email: /verify-email?token=… */
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/user'
import { useLocalized } from 'src/composables/useLocalized'
import { verifyEmail, fetchMe } from 'src/services/auth/account'
import { getToken } from 'src/services/auth/token'
import { apiErrorMessage } from 'src/services/auth/errors'

const { t } = useLocalized()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const state = ref('checking') // checking | success | failed
const message = ref('')

onMounted(async () => {
  const token = String(route.query.token || '')
  // Remove the token from the address bar and history right away
  router.replace({ path: route.path })
  if (!token) {
    state.value = 'failed'
    message.value = t('app.auth.verify.missing')
    return
  }
  try {
    await verifyEmail(token)
    state.value = 'success'
    // If this browser is logged in, reload the profile from the server. (The
    // layout restores the stored profile after this page mounts, so updating
    // it from the verify response alone could be overwritten by stale data.)
    if (getToken()) {
      const me = await fetchMe().catch(() => null)
      if (me?.user) userStore.setUser({ ...userStore.user, ...me.user, isAuthenticated: true })
    }
  } catch (err) {
    state.value = 'failed'
    message.value = apiErrorMessage(t, err)
  }
})
</script>

<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card dark flat bordered class="status-card text-center q-pa-lg">
      <div class="text-h6 text-secondary q-mb-md">{{ t('app.auth.verify.title') }}</div>
      <template v-if="state === 'checking'">
        <q-spinner color="info" size="40px" />
        <p class="text-grey-5 q-mt-md" role="status">{{ t('app.auth.verify.checking') }}</p>
      </template>
      <template v-else-if="state === 'success'">
        <q-icon name="mark_email_read" color="positive" size="48px" />
        <p class="text-secondary q-mt-md" role="status">{{ t('app.auth.verify.success') }}</p>
        <q-btn
          unelevated
          color="positive"
          :label="t('app.auth.actions.continue')"
          to="/crypto-trader"
        />
      </template>
      <template v-else>
        <q-icon name="error_outline" color="negative" size="48px" />
        <p class="text-secondary q-mt-md" role="alert">{{ t('app.auth.verify.failed') }}</p>
        <p class="text-grey-5 text-body2">{{ message }}</p>
        <q-btn flat color="info" :label="t('app.auth.actions.continue')" to="/" />
      </template>
    </q-card>
  </q-page>
</template>

<style scoped>
.status-card {
  width: 100%;
  max-width: 420px;
}
</style>
