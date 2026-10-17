<script setup>
/** Reminds logged-in users to confirm or add their email (dismissible per session). */
import { computed, ref } from 'vue'
import { useUserStore } from 'src/stores/user'
import { useLocalized } from 'src/composables/useLocalized'
import { useAccountActions } from 'src/composables/useAccountActions'
import { useServerConfig } from 'src/composables/useServerConfig'

const DISMISS_KEY = 'keyapp:email-banner-dismissed'
const { t } = useLocalized()
const userStore = useUserStore()
const { openEmailDialog, resend } = useAccountActions()
const serverConfig = useServerConfig()

const dismissed = ref(sessionStorage.getItem(DISMISS_KEY) === '1')
const user = computed(() => userStore.user || {})

const status = computed(() => {
  // Nothing to confirm or recover while the server can't send email
  if (!serverConfig.emailEnabled || !user.value.isAuthenticated || dismissed.value) return null
  if (!user.value.email) return 'missing'
  if (!user.value.emailVerified) return 'unverified'
  return null
})

function dismiss() {
  dismissed.value = true
  try {
    sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    /* storage unavailable */
  }
}
</script>

<template>
  <q-banner v-if="status" dense class="email-banner text-white" role="status">
    <template #avatar>
      <q-icon
        :name="status === 'missing' ? 'alternate_email' : 'mark_email_unread'"
        color="amber-4"
      />
    </template>
    <span v-if="status === 'missing'">{{ t('app.auth.banner.noEmail') }}</span>
    <span v-else>{{ t('app.auth.banner.unverified', { email: user.email }) }}</span>
    <template #action>
      <q-btn
        v-if="status === 'missing'"
        flat
        dense
        no-caps
        color="amber-4"
        :label="t('app.auth.actions.addEmail')"
        @click="openEmailDialog"
      />
      <template v-else>
        <q-btn
          flat
          dense
          no-caps
          color="amber-4"
          :label="t('app.auth.actions.resend')"
          @click="resend"
        />
        <q-btn
          flat
          dense
          no-caps
          color="grey-4"
          :label="t('app.auth.actions.changeEmail')"
          @click="openEmailDialog"
        />
      </template>
      <q-btn
        flat
        dense
        round
        icon="close"
        color="grey-5"
        :aria-label="t('app.auth.actions.dismiss')"
        @click="dismiss"
      />
    </template>
  </q-banner>
</template>

<style scoped>
.email-banner {
  background: #2a2416;
  border-bottom: 1px solid rgba(255, 193, 7, 0.35);
}
</style>
