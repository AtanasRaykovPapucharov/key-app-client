<script setup>
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { signOut, deleteAccount } from 'src/services/user'
import { useLocalized } from 'src/composables/useLocalized'

const $q = useQuasar()
const router = useRouter()
const { t } = useLocalized()

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
