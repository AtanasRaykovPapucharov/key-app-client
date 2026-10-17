<script setup>
/**
 * Log in (username or email), create an account (username + email + password)
 * and request a password-reset link — three modes of one compact form.
 */
import { useQuasar } from 'quasar'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from 'src/stores/user'
import { useLocalized } from 'src/composables/useLocalized'
import {
  login,
  register,
  forgotPassword,
  resendVerificationPublic,
} from 'src/services/auth/account'
import { extractToken } from 'src/services/auth/token'
import { apiErrorMessage, EMAIL_RE } from 'src/services/auth/errors'
import { useServerConfig } from 'src/composables/useServerConfig'

const $q = useQuasar()
const userStore = useUserStore()
const router = useRouter()
const { t, locale } = useLocalized()
const { user } = storeToRefs(userStore)
const serverConfig = useServerConfig()

const mode = ref('login') // 'login' | 'register' | 'forgot'
const identifier = ref('') // login: username or email
const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitting = ref(false)
const pendingVerificationEmail = ref('') // set when login is blocked until the email is confirmed
const formRef = ref(null)

watch(mode, () => {
  password.value = ''
  pendingVerificationEmail.value = ''
  formRef.value?.resetValidation()
})

const title = computed(() => t(`app.auth.titles.${mode.value}`))

const rules = {
  username: [(v) => /^[^\s@]{3,50}$/.test((v || '').trim()) || t('app.auth.rules.username')],
  email: [(v) => EMAIL_RE.test((v || '').trim()) || t('app.auth.rules.email')],
  // While the server can't send email, the address is optional at sign-up
  emailOptional: [
    (v) => !(v || '').trim() || EMAIL_RE.test(v.trim()) || t('app.auth.rules.emailOptional'),
  ],
  password: [(v) => (v || '').length >= 8 || t('app.auth.rules.password')],
  required: [(v) => !!(v || '').trim() || t('app.common.validation.required')],
}

const notify = (type, message) => $q.notify({ type, message, position: 'top', timeout: 6000 })

function finishAuth(data) {
  userStore.setUser({ ...(data?.user || {}), isAuthenticated: true }, extractToken(data))
}

async function doLogin() {
  try {
    const data = await login(identifier.value.trim(), password.value)
    finishAuth(data)
    identifier.value = ''
    await router.push('/crypto-trader')
  } catch (err) {
    if (err?.serverCode === 'EMAIL_NOT_VERIFIED' && identifier.value.includes('@')) {
      pendingVerificationEmail.value = identifier.value.trim()
    }
    notify('negative', apiErrorMessage(t, err))
  } finally {
    password.value = ''
  }
}

async function doRegister() {
  const address = email.value.trim()
  try {
    const data = await register({
      username: username.value.trim(),
      email: address || undefined,
      password: password.value,
      locale: locale.value,
    })
    if (data?.token) {
      finishAuth(data)
      notify(
        'positive',
        address && data.emailSent
          ? t('app.auth.notify.registered', { email: address })
          : t('app.auth.notify.registeredSimple'),
      )
      await router.push('/crypto-trader')
    } else {
      // Server requires a confirmed email before the first login
      notify('positive', t('app.auth.notify.registeredVerify', { email: address }))
      identifier.value = address
      mode.value = 'login'
    }
    username.value = ''
    email.value = ''
    password.value = ''
  } catch (err) {
    notify('negative', apiErrorMessage(t, err))
  }
}

async function doForgot() {
  try {
    await forgotPassword(email.value.trim())
    notify('positive', t('app.auth.notify.linkSent'))
    mode.value = 'login'
  } catch (err) {
    notify('negative', apiErrorMessage(t, err))
  }
}

async function resendForBlockedLogin() {
  try {
    await resendVerificationPublic(pendingVerificationEmail.value)
    notify(
      'positive',
      t('app.auth.notify.verificationSent', { email: pendingVerificationEmail.value }),
    )
    pendingVerificationEmail.value = ''
  } catch (err) {
    notify('negative', apiErrorMessage(t, err))
  }
}

async function submit() {
  if (submitting.value) return
  submitting.value = true
  try {
    if (mode.value === 'login') await doLogin()
    else if (mode.value === 'register') await doRegister()
    else await doForgot()
  } finally {
    submitting.value = false
  }
}

// No debounce here: password managers autofill and submit instantly, and a
// debounced value would still be empty at that moment.
const inputAttrs = {
  autocapitalize: 'none',
  autocorrect: 'off',
  spellcheck: 'false',
  debounce: 0,
}
</script>

<template>
  <q-card v-if="!user.isAuthenticated" dark class="auth-card">
    <q-form ref="formRef" greedy @submit.prevent="submit">
      <q-card-section class="q-pb-none">
        <div class="text-h5 text-center text-secondary q-mb-sm">{{ title }}</div>

        <!-- LOGIN -->
        <template v-if="mode === 'login'">
          <q-input
            v-model="identifier"
            dark
            v-bind="{ ...$defaults.input, ...inputAttrs }"
            autocomplete="username"
            enterkeyhint="next"
            :label="t('app.auth.fields.identifier')"
            :rules="rules.required"
            lazy-rules
          />
        </template>

        <!-- REGISTER -->
        <template v-else-if="mode === 'register'">
          <q-input
            v-model="username"
            dark
            v-bind="{ ...$defaults.input, ...inputAttrs }"
            autocomplete="username"
            enterkeyhint="next"
            maxlength="50"
            :label="t('app.auth.fields.username')"
            :hint="t('app.auth.rules.username')"
            :rules="rules.username"
            lazy-rules
          />
          <q-input
            v-model="email"
            dark
            type="email"
            inputmode="email"
            v-bind="{ ...$defaults.input, ...inputAttrs }"
            autocomplete="email"
            enterkeyhint="next"
            :label="
              serverConfig.emailEnabled
                ? t('app.auth.fields.email')
                : t('app.auth.fields.emailOptional')
            "
            :rules="serverConfig.emailEnabled ? rules.email : rules.emailOptional"
            lazy-rules
          />
        </template>

        <!-- FORGOT -->
        <template v-else>
          <q-input
            v-model="email"
            dark
            type="email"
            inputmode="email"
            v-bind="{ ...$defaults.input, ...inputAttrs }"
            autocomplete="email"
            enterkeyhint="send"
            :label="t('app.auth.fields.email')"
            :rules="rules.email"
            lazy-rules
          />
        </template>

        <q-input
          v-if="mode !== 'forgot'"
          v-model="password"
          dark
          v-bind="{ ...$defaults.input, ...inputAttrs }"
          :type="showPassword ? 'text' : 'password'"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          enterkeyhint="go"
          :label="t('app.auth.fields.password')"
          :rules="mode === 'register' ? rules.password : rules.required"
          lazy-rules
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
                showPassword
                  ? t('app.auth.actions.hidePassword')
                  : t('app.auth.actions.showPassword')
              "
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <div v-if="mode === 'login' && serverConfig.emailEnabled" class="text-right">
          <q-btn
            flat
            dense
            no-caps
            size="sm"
            color="info"
            :label="t('app.auth.actions.forgot')"
            @click="mode = 'forgot'"
          />
        </div>

        <q-banner
          v-if="pendingVerificationEmail"
          dense
          rounded
          class="bg-grey-9 text-secondary q-mt-sm"
        >
          {{ t('app.auth.codes.EMAIL_NOT_VERIFIED') }}
          <template #action>
            <q-btn
              flat
              dense
              color="info"
              :label="t('app.auth.actions.resend')"
              @click="resendForBlockedLogin"
            />
          </template>
        </q-banner>
      </q-card-section>

      <q-card-actions class="column items-stretch q-px-md q-pb-md">
        <q-btn
          type="submit"
          unelevated
          :loading="submitting"
          :color="mode === 'register' ? 'info' : 'positive'"
          class="text-secondary q-mb-sm"
          :label="
            mode === 'login'
              ? t('app.auth.actions.login')
              : mode === 'register'
                ? t('app.auth.actions.register')
                : t('app.auth.actions.sendLink')
          "
        />
        <div class="row items-center justify-center text-secondary text-caption">
          <template v-if="mode === 'login'">
            <span>{{ t('app.auth.actions.noAccount') }}</span>
            <q-btn
              flat
              dense
              no-caps
              color="info"
              :label="t('app.auth.actions.register')"
              @click="mode = 'register'"
            />
          </template>
          <template v-else-if="mode === 'register'">
            <span>{{ t('app.auth.actions.haveAccount') }}</span>
            <q-btn
              flat
              dense
              no-caps
              color="positive"
              :label="t('app.auth.actions.login')"
              @click="mode = 'login'"
            />
          </template>
          <q-btn
            v-else
            flat
            dense
            no-caps
            color="positive"
            icon="arrow_back"
            :label="t('app.auth.actions.backToLogin')"
            @click="mode = 'login'"
          />
        </div>
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
}
</style>
