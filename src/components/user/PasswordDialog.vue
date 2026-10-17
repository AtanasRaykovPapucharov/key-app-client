<script setup>
/** Change password; this device stays signed in with the new token. */
import { ref } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user'
import { useLocalized } from 'src/composables/useLocalized'
import { changePassword } from 'src/services/auth/account'
import { extractToken } from 'src/services/auth/token'
import { apiErrorMessage } from 'src/services/auth/errors'

defineEmits([...useDialogPluginComponent.emits])
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const { t } = useLocalized()
const $q = useQuasar()
const userStore = useUserStore()

const current = ref('')
const next = ref('')
const confirm = ref('')
const show = ref(false)
const saving = ref(false)

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    const data = await changePassword(current.value, next.value)
    userStore.setUser(
      { ...userStore.user, ...data.user, isAuthenticated: true },
      extractToken(data),
    )
    $q.notify({ type: 'positive', message: t('app.auth.notify.passwordChanged'), position: 'top' })
    onDialogOK()
  } catch (err) {
    $q.notify({ type: 'negative', message: apiErrorMessage(t, err), position: 'top' })
  } finally {
    saving.value = false
    current.value = ''
    next.value = ''
    confirm.value = ''
  }
}
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card dark class="account-dialog">
      <q-form greedy @submit.prevent="save">
        <q-card-section>
          <div class="text-h6">{{ t('app.auth.dialog.passwordTitle') }}</div>
          <p class="text-body2 text-grey-5 q-mt-sm q-mb-none">
            {{ t('app.auth.dialog.passwordIntro') }}
          </p>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="current"
            dark
            filled
            :type="show ? 'text' : 'password'"
            autocomplete="current-password"
            :label="t('app.auth.fields.currentPassword')"
            :rules="[(v) => !!v || t('app.common.validation.required')]"
            lazy-rules
          />
          <q-input
            v-model="next"
            dark
            filled
            :type="show ? 'text' : 'password'"
            autocomplete="new-password"
            :label="t('app.auth.fields.newPassword')"
            :rules="[(v) => (v || '').length >= 8 || t('app.auth.rules.password')]"
            lazy-rules
          />
          <q-input
            v-model="confirm"
            dark
            filled
            :type="show ? 'text' : 'password'"
            autocomplete="new-password"
            :label="t('app.auth.fields.confirmPassword')"
            :rules="[(v) => v === next || t('app.auth.rules.match')]"
            lazy-rules
          />
          <q-toggle v-model="show" dense :label="t('app.auth.actions.showPassword')" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('app.auth.actions.cancel')" @click="onDialogCancel" />
          <q-btn
            unelevated
            color="positive"
            type="submit"
            :loading="saving"
            :label="t('app.auth.actions.save')"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.account-dialog {
  width: 100%;
  max-width: 440px;
}
</style>
