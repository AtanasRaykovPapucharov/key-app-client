<script setup>
import { useRouter } from 'vue-router'
import { signOut, deleteAccount } from 'src/services/user'

const router = useRouter()

const signOutHandler = async () => {
  const success = await signOut()
  if (success) await router.push('/')
}

const deleteHandler = async () => {
  const success = await deleteAccount()
  if (success) await router.push('/')
}
</script>

<template>
  <div>
    <q-expansion-item
      :content-inset-level="0.8"
      class="text-red-5 text-h6"
      header-class="text-red-5"
      expand-icon-class="text-red-5"
      label="Crypto"
      caption=""
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
        label="Watch List"
        color="secondary"
        style="width: 100%"
      />
    </q-expansion-item>
    <q-expansion-item
      :content-inset-level="0.8"
      class="text-red-5 text-h6"
      header-class="text-red-5"
      expand-icon-class="text-red-5"
      label="User"
      caption=""
      dense
      dense-toggle
      default-opened
    >
      <q-btn
        dense
        flat
        icon="logout"
        label="Log Out"
        align="left"
        color="secondary"
        @click="signOutHandler"
        style="width: 100%"
      />
      <q-btn
        dense
        flat
        icon="person_off"
        label="Delete Account"
        align="left"
        color="secondary"
        @click="deleteHandler"
        style="width: 100%"
      />
    </q-expansion-item>
  </div>
</template>
