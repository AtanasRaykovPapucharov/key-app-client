<script setup>
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { signOut, deleteAccount } from 'src/services/user'
import { computed } from 'vue'
import { useLocalized } from 'src/composables/useLocalized'
import { useUserStore } from 'src/stores/user'
import { useAccountActions } from 'src/composables/useAccountActions'
import { useServerConfig } from 'src/composables/useServerConfig'

const $q = useQuasar()
const router = useRouter()
const { t } = useLocalized()
const userStore = useUserStore()
const { openEmailDialog, openPasswordDialog } = useAccountActions()
const serverConfig = useServerConfig()
const emailCaption = computed(() => {
  const u = userStore.user || {}
  if (!u.email) return t('app.auth.dialog.none')
  if (!serverConfig.emailEnabled) return u.email
  return `${u.email} · ${u.emailVerified ? t('app.auth.dialog.verified') : t('app.auth.dialog.unverified')}`
})

const signOutHandler = async () => {
  const success = await signOut()
  if (success) await router.push('/')
}

const deleteHandler = () => {
  $q.dialog({
    title: t('app.layout.settings.deleteConfirmTitle'),
    message: t('app.layout.settings.deleteConfirmMessage'),
    cancel: { label: t('app.common.actions.cancel'), flat: true, color: 'secondary' },
    ok: { label: t('app.layout.settings.deleteAccount'), color: 'negative' },
    persistent: true,
    dark: true,
  }).onOk(async () => {
    const success = await deleteAccount()
    if (success) await router.push('/')
  })
}
</script>

<template>
  <div>
    <q-expansion-item
      :content-inset-level="0.8"
      class="text-red-5 text-h6"
      header-class="text-red-5"
      expand-icon-class="text-red-5"
      :label="t('app.layout.settings.crypto')"
      dense
      dense-toggle
      default-opened
    >
      <q-btn
        to="crypto-list"
        dense
        flat
        icon="list"
        align="left"
        :label="t('app.layout.settings.watchList')"
        color="secondary"
        class="full-width"
      />
    </q-expansion-item>
    <q-expansion-item
      :content-inset-level="0.8"
      class="text-red-5 text-h6"
      header-class="text-red-5"
      expand-icon-class="text-red-5"
      :label="t('app.layout.settings.user')"
      dense
      dense-toggle
      default-opened
    >
      <q-btn
        dense
        flat
        no-caps
        icon="alternate_email"
        align="left"
        color="secondary"
        class="full-width"
        @click="openEmailDialog"
      >
        <div class="column items-start q-ml-sm text-left">
          <span>{{
            userStore.user?.email
              ? t('app.auth.actions.changeEmail')
              : t('app.auth.actions.addEmail')
          }}</span>
          <span class="text-caption text-grey-5 ellipsis" style="max-width: 260px">{{
            emailCaption
          }}</span>
        </div>
      </q-btn>
      <q-btn
        dense
        flat
        icon="password"
        :label="t('app.auth.actions.changePassword')"
        align="left"
        color="secondary"
        class="full-width"
        @click="openPasswordDialog"
      />
      <q-btn
        dense
        flat
        icon="logout"
        :label="t('app.layout.settings.logOut')"
        align="left"
        color="secondary"
        class="full-width"
        @click="signOutHandler"
      />
      <q-btn
        dense
        flat
        icon="person_off"
        :label="t('app.layout.settings.deleteAccount')"
        align="left"
        color="secondary"
        class="full-width"
        @click="deleteHandler"
      />
    </q-expansion-item>
  </div>
</template>
