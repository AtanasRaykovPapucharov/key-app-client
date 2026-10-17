import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user'
import { useLocalized } from 'src/composables/useLocalized'
import { resendVerification } from 'src/services/auth/account'
import { apiErrorMessage } from 'src/services/auth/errors'
import EmailDialog from 'src/components/user/EmailDialog.vue'
import PasswordDialog from 'src/components/user/PasswordDialog.vue'

/** Shared account actions used by the settings panel and the email banner. */
export function useAccountActions() {
  const $q = useQuasar()
  const { t } = useLocalized()
  const userStore = useUserStore()

  const openEmailDialog = () => $q.dialog({ component: EmailDialog })
  const openPasswordDialog = () => $q.dialog({ component: PasswordDialog })

  async function resend() {
    try {
      await resendVerification()
      $q.notify({
        type: 'positive',
        message: t('app.auth.notify.verificationSent', { email: userStore.user?.email }),
        position: 'top',
      })
    } catch (err) {
      $q.notify({ type: 'negative', message: apiErrorMessage(t, err), position: 'top' })
    }
  }

  return { openEmailDialog, openPasswordDialog, resend }
}
