<script setup>
import { useQuasar } from 'quasar'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from 'src/stores/user'
import { login, register } from 'src/services/storage/user'
import { extractToken } from 'src/services/auth/token'

const $q = useQuasar()
const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n({ useScope: 'global' })
const { user } = storeToRefs(userStore)
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const logIn = ref(true)

const submitting = ref(false)

const notifyError = (message) => {
  $q.notify({
    type: 'negative',
    message,
    position: 'top',
  })
}

/** Turn an API error into a message the user can act on. */
const authErrorMessage = (err) => {
  const kind = err?.kind || 'unknown'
  // Prefer the server's own wording for credential/validation problems
  if (['unauthorized', 'validation', 'conflict'].includes(kind) && err.serverMessage) {
    return err.serverMessage
  }
  const key = `app.layout.auth.errors.${kind}`
  return t(key) !== key ? t(key) : t('app.layout.auth.errors.unknown')
}

const usernameRules = computed(() =>
  logIn.value ? [] : [(v) => (v || '').trim().length >= 3 || t('app.layout.auth.usernameRule')],
)
const passwordRules = computed(() =>
  logIn.value ? [] : [(v) => (v || '').length >= 8 || t('app.layout.auth.passwordRule')],
)

const finishAuth = (data) => {
  const usr = { ...(data?.user || {}), isAuthenticated: true }
  userStore.setUser(usr, extractToken(data))
}

const userRegister = async () => {
  try {
    const data = await register(username.value.trim(), password.value)
    finishAuth(data)
    username.value = ''
    password.value = ''
    $q.notify({ type: 'positive', message: t('app.layout.auth.registered'), position: 'top' })
    await router.push('/crypto-trader')
  } catch (err) {
    notifyError(authErrorMessage(err))
  }
}

const userLogin = async () => {
  try {
    const data = await login(username.value.trim(), password.value)
    finishAuth(data)
    username.value = ''
    await router.push('/crypto-trader')
  } catch (err) {
    notifyError(authErrorMessage(err))
  } finally {
    password.value = ''
  }
}

const submitAuth = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    if (logIn.value) await userLogin()
    else await userRegister()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <q-card
    v-if="!user.isAuthenticated"
    dark
    class="text-center"
    style="width: 100%; max-width: 360px; margin: 0 auto"
  >
    <q-form @submit.prevent="submitAuth">
      <q-card-section>
        <div class="text-h5 text-center text-secondary">
          {{ !logIn ? t('common.actions.register') : t('common.actions.login') }}
        </div>
        <q-input
          dark
          class="text-secondary"
          v-bind="{ ...$defaults.input, ...$attrs }"
          v-model="username"
          autocomplete="username"
          autocapitalize="none"
          autocorrect="off"
          spellcheck="false"
          enterkeyhint="next"
          :rules="usernameRules"
          lazy-rules
          :label="t('common.auth.username')"
        />
        <q-input
          dark
          v-bind="{ ...$defaults.input, ...$attrs }"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :autocomplete="logIn ? 'current-password' : 'new-password'"
          autocapitalize="none"
          autocorrect="off"
          spellcheck="false"
          enterkeyhint="go"
          :rules="passwordRules"
          lazy-rules
          :label="t('common.auth.password')"
          class="text-secondary"
        >
          <template #append>
            <q-btn
              flat
              round
              dense
              size="sm"
              :icon="showPassword ? 'visibility' : 'visibility_off'"
              color="secondary"
              :aria-label="
                showPassword ? t('app.layout.auth.hidePassword') : t('app.layout.auth.showPassword')
              "
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right" class="wrap">
        <span class="text-secondary">{{ t('common.auth.switchTo') }}</span>
        <q-btn
          class="q-ml-xs"
          dense
          flat
          :label="!logIn ? t('common.actions.login') : t('common.actions.register')"
          :color="!logIn ? 'positive' : 'info'"
          @click="logIn = !logIn"
        />
        <q-space />
        <q-btn
          v-if="!logIn"
          type="submit"
          :loading="submitting"
          dense
          class="q-ma-sm text-secondary"
          :label="t('common.actions.register')"
          color="info"
        />
        <q-btn
          v-else
          type="submit"
          :loading="submitting"
          dense
          class="q-ma-sm text-secondary"
          :label="t('common.actions.login')"
          color="positive"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>
