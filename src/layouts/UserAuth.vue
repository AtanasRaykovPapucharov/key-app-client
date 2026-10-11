<script setup>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from 'src/stores/user'
import { login, register } from 'src/services/storage/user'

const $q = useQuasar()
const userStore = useUserStore()
const router = useRouter()
const { t } = useI18n({ useScope: 'global' })
const { user } = storeToRefs(userStore)
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const logIn = ref(true)

const notifyError = (message) => {
  $q.notify({
    type: 'negative',
    message,
    position: 'top-right',
  })
}

const userRegister = async () => {
  try {
    const data = await register(username.value, password.value)
    let usr = data?.user
    usr = {
      ...usr,
      isAuthenticated: true,
    }

    console.log('User registered:', usr)
    username.value = ''
    password.value = ''
    userStore.setUser(usr)
  } catch (err) {
    console.error(err)
    notifyError('Registration not available')
  }
}
const userLogin = async () => {
  try {
    const data = await login(username.value, password.value)
    let usr = data?.user
    usr = {
      ...usr,
      isAuthenticated: true,
    }

    console.log('User logged in:', usr)
    userStore.setUser(usr)
    await router.push('/crypto-trader')
  } catch (err) {
    console.error(err)
    notifyError(err?.response?.data?.message || t('common.auth.incorrectCredentials'))
  } finally {
    username.value = ''
    password.value = ''
  }
}

const submitAuth = () => {
  if (logIn.value) return userLogin()
  return userRegister()
}
</script>

<template>
  <q-card v-if="!user.isAuthenticated" dark class="text-center" style="width: 300; max-width: 90vw">
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
          :label="t('common.auth.username')"
        />
        <q-input
          dark
          v-bind="{ ...$defaults.input, ...$attrs }"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          :label="t('common.auth.password')"
          class="text-secondary"
        >
          <template #append>
            <q-icon
              clickable
              dense
              size="xs"
              :name="showPassword ? 'visibility' : 'visibility_off'"
              color="secondary"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right">
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
          dense
          class="q-ma-sm text-secondary"
          :label="t('common.actions.register')"
          color="info"
        />
        <q-btn
          v-else
          type="submit"
          dense
          class="q-ma-sm text-secondary"
          :label="t('common.actions.login')"
          color="positive"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>
