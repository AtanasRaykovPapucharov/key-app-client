<script setup>
/** Add or change the account email (confirmed with the current password). */
import { ref, computed } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user'
import { useLocalized } from 'src/composables/useLocalized'
import { changeEmail } from 'src/services/auth/account'
import { apiErrorMessage, EMAIL_RE } from 'src/services/auth/errors'
import { useServerConfig } from 'src/composables/useServerConfig'

defineEmits([...useDialogPluginComponent.emits])
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const { t } = useLocalized()
const $q = useQuasar()
const userStore = useUserStore()
const serverConfig = useServerConfig()

const current = computed(() => userStore.user || {})
const email = ref(current.value.email || '')
const password = ref('')
const saving = ref(false)

const statusLabel = computed(() =>
  !current.value.email
    ? t('app.auth.dialog.none')
    : current.value.emailVerified
      ? t('app.auth.dialog.verified')
      : t('app.auth.dialog.unverified'),
)

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    const data = await changeEmail(email.value.trim(), password.value)
    userStore.setUser({ ...userStore.user, ...data.user, isAuthenticated: true })
    $q.notify({
      type: 'positive',
      message: data.emailSent
        ? t('app.auth.notify.emailChanged', { email: data.user.email })
        : t('app.auth.notify.emailSaved'),
      position: 'top',
    })
    onDialogOK(data.user)
  } catch (err) {
    $q.notify({ type: 'negative', message: apiErrorMessage(t, err), position: 'top' })
  } finally {
    saving.value = false
    password.value = ''
  }
}
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card dark class="account-dialog">
      <q-form greedy @submit.prevent="save">
        <q-card-section>
          <div class="text-h6">{{ t('app.auth.dialog.emailTitle') }}</div>
          <div
            v-if="current.email && serverConfig.emailEnabled"
            class="text-caption text-grey-5 q-mt-xs"
          >
            {{ current.email }} · {{ t('app.auth.dialog.status') }}:
            <span :class="current.emailVerified ? 'text-positive' : 'text-warning'">{{
              statusLabel
            }}</span>
          </div>
          <p class="text-body2 text-grey-5 q-mt-sm q-mb-none">
            {{
              serverConfig.emailEnabled
                ? t('app.auth.dialog.emailIntro')
                : t('app.auth.dialog.emailIntroNoMail')
            }}
          </p>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="email"
            dark
            filled
            type="email"
            inputmode="email"
            autocomplete="email"
            autocapitalize="none"
            :label="t('app.auth.fields.email')"
            :rules="[(v) => EMAIL_RE.test((v || '').trim()) || t('app.auth.rules.email')]"
            lazy-rules
          />
          <q-input
            v-model="password"
            dark
            filled
            type="password"
            autocomplete="current-password"
            :label="t('app.auth.fields.currentPassword')"
            :rules="[(v) => !!v || t('app.common.validation.required')]"
            lazy-rules
          />
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
