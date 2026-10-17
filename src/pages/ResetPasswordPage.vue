<script setup>
/** Opened from the password-reset email: /reset-password?token=… */
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useLocalized } from 'src/composables/useLocalized'
import { resetPassword } from 'src/services/auth/account'
import { apiErrorMessage } from 'src/services/auth/errors'

const { t } = useLocalized()
const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const token = ref('')
const password = ref('')
const confirm = ref('')
const show = ref(false)
const submitting = ref(false)
const done = ref(false)

onMounted(() => {
  token.value = String(route.query.token || '')
  // Keep the token out of the address bar and browser history
  router.replace({ path: route.path })
})

const rules = {
  password: [(v) => (v || '').length >= 8 || t('app.auth.rules.password')],
  confirm: [(v) => v === password.value || t('app.auth.rules.match')],
}

async function submit() {
  if (submitting.value) return
  submitting.value = true
  try {
    await resetPassword(token.value, password.value)
    done.value = true
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: apiErrorMessage(t, err),
      position: 'top',
      timeout: 6000,
    })
  } finally {
    submitting.value = false
    password.value = ''
    confirm.value = ''
  }
}

function openLogin() {
  router.push('/crypto-fundamentals')
  window.setTimeout(() => window.dispatchEvent(new CustomEvent('cryptool:open-auth')))
}
</script>

<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card dark flat bordered class="status-card q-pa-lg">
      <div class="text-h6 text-secondary q-mb-sm text-center">{{ t('app.auth.reset.title') }}</div>

      <div v-if="done" class="text-center">
        <q-icon name="lock_reset" color="positive" size="48px" />
        <p class="text-secondary q-mt-md" role="status">{{ t('app.auth.reset.success') }}</p>
        <q-btn
          unelevated
          color="positive"
          :label="t('app.auth.actions.login')"
          @click="openLogin"
        />
      </div>

      <div v-else-if="!token" class="text-center">
        <q-icon name="link_off" color="negative" size="48px" />
        <p class="text-secondary q-mt-md" role="alert">{{ t('app.auth.reset.missing') }}</p>
        <q-btn flat color="info" :label="t('app.auth.actions.backToLogin')" @click="openLogin" />
      </div>

      <q-form v-else greedy @submit.prevent="submit">
        <p class="text-grey-5 text-body2">{{ t('app.auth.reset.intro') }}</p>
        <q-input
          v-model="password"
          dark
          filled
          :type="show ? 'text' : 'password'"
          autocomplete="new-password"
          autocapitalize="none"
          :label="t('app.auth.fields.newPassword')"
          :rules="rules.password"
          lazy-rules
        >
          <template #append>
            <q-btn
              flat
              round
              dense
              size="sm"
              :icon="show ? 'visibility' : 'visibility_off'"
              :aria-label="
                show ? t('app.auth.actions.hidePassword') : t('app.auth.actions.showPassword')
              "
              @click="show = !show"
            />
          </template>
        </q-input>
        <q-input
          v-model="confirm"
          dark
          filled
          :type="show ? 'text' : 'password'"
          autocomplete="new-password"
          autocapitalize="none"
          :label="t('app.auth.fields.confirmPassword')"
          :rules="rules.confirm"
          lazy-rules
        />
        <q-btn
          type="submit"
          unelevated
          color="positive"
          class="full-width q-mt-sm"
          :loading="submitting"
          :label="t('app.auth.actions.save')"
        />
      </q-form>
    </q-card>
  </q-page>
</template>

<style scoped>
.status-card {
  width: 100%;
  max-width: 420px;
}
</style>
