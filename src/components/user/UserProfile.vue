<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useUserStore } from 'src/stores/user'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const uploadedImage = ref(null)
const showAvatarBuilder = ref(false)
const profile = reactive({
  username: '',
  uid: '',
  avatar: null,
  admin: false,
  isAuthenticated: false,
})

const avatar = reactive({
  skin: '#f2c39b',
  hair: 'short',
  hairColor: '#2f2118',
  eyes: 'calm',
  eyeColor: '#1b1b1b',
  nose: 'soft',
  mouth: 'smile',
  ears: true,
  accessory: 'none',
  background: '#263238',
})

const skinOptions = ['#f7d7bc', '#f2c39b', '#c8865d', '#8d5524']
const hairColors = ['#2f2118', '#6f4e37', '#b36b24', '#f0d06a', '#121212']
const eyeColors = ['#1b1b1b', '#5b3a29', '#1f5f8b', '#2e7d32', '#7e57c2']
const backgroundOptions = ['#263238', '#1e3a5f', '#355e3b', '#6b2f3b', '#4a3d75']
const hairOptions = [
  { label: 'Short', value: 'short' },
  { label: 'Wave', value: 'wave' },
  { label: 'Long', value: 'long' },
  { label: 'Bald', value: 'bald' },
]
const eyeOptions = [
  { label: 'Calm', value: 'calm' },
  { label: 'Bright', value: 'bright' },
  { label: 'Focus', value: 'focus' },
]
const noseOptions = [
  { label: 'Soft', value: 'soft' },
  { label: 'Round', value: 'round' },
  { label: 'Sharp', value: 'sharp' },
]
const mouthOptions = [
  { label: 'Smile', value: 'smile' },
  { label: 'Line', value: 'line' },
  { label: 'Open', value: 'open' },
]
const accessoryOptions = [
  { label: 'None', value: 'none' },
  { label: 'Cap', value: 'cap' },
  { label: 'Halo', value: 'halo' },
  { label: 'Glasses', value: 'glasses' },
]

const avatarSvg = computed(() => {
  const hair = {
    short: `<path d="M40 88c5-35 27-55 60-55s55 20 60 55c-23-18-82-18-120 0z" fill="${avatar.hairColor}"/>`,
    wave: `<path d="M39 91c-1-38 26-61 61-61 28 0 50 15 59 42-14-8-24-5-35-15-14-13-41-7-59 4-10 6-17 17-26 30z" fill="${avatar.hairColor}"/>`,
    long: `<path d="M43 86c2-35 25-57 57-57s55 22 57 57c8 28 2 63-13 86-5-25-4-54-10-74-20-13-47-13-68 0-6 20-5 49-10 74-15-23-21-58-13-86z" fill="${avatar.hairColor}"/>`,
    bald: '',
  }[avatar.hair]

  const eyes = {
    calm: `<path d="M76 99h18M106 99h18" stroke="${avatar.eyeColor}" stroke-width="5" stroke-linecap="round"/>`,
    bright: `<circle cx="84" cy="98" r="5" fill="${avatar.eyeColor}"/><circle cx="116" cy="98" r="5" fill="${avatar.eyeColor}"/><circle cx="86" cy="96" r="1.6" fill="#fff"/><circle cx="118" cy="96" r="1.6" fill="#fff"/>`,
    focus: `<path d="M75 94c7-4 14-4 20 0M105 94c7-4 14-4 20 0" stroke="${avatar.eyeColor}" stroke-width="4" stroke-linecap="round"/><circle cx="85" cy="101" r="4" fill="${avatar.eyeColor}"/><circle cx="115" cy="101" r="4" fill="${avatar.eyeColor}"/>`,
  }[avatar.eyes]

  const nose = {
    soft: '<path d="M101 104c-4 9-2 15 5 16" stroke="#9b6043" stroke-width="4" stroke-linecap="round" fill="none"/>',
    round: '<ellipse cx="101" cy="116" rx="6" ry="4" fill="#d69a76"/>',
    sharp:
      '<path d="M101 101l-7 19h12" stroke="#9b6043" stroke-width="4" stroke-linejoin="round" fill="none"/>',
  }[avatar.nose]

  const mouth = {
    smile:
      '<path d="M84 132c10 12 24 12 34 0" stroke="#7d2f2f" stroke-width="5" stroke-linecap="round" fill="none"/>',
    line: '<path d="M87 134h28" stroke="#7d2f2f" stroke-width="5" stroke-linecap="round"/>',
    open: '<ellipse cx="101" cy="134" rx="11" ry="7" fill="#7d2f2f"/>',
  }[avatar.mouth]

  const ears = avatar.ears
    ? `<circle cx="48" cy="105" r="11" fill="${avatar.skin}"/><circle cx="152" cy="105" r="11" fill="${avatar.skin}"/>`
    : ''

  const accessory = {
    none: '',
    cap: `<path d="M55 65c10-22 79-22 90 0v13H55z" fill="#1f5eff"/><path d="M138 73h30c-8 10-18 14-30 12z" fill="#1746bd"/>`,
    halo: '<ellipse cx="100" cy="37" rx="36" ry="10" fill="none" stroke="#ffd54f" stroke-width="6"/>',
    glasses:
      '<circle cx="84" cy="102" r="13" fill="none" stroke="#111" stroke-width="4"/><circle cx="116" cy="102" r="13" fill="none" stroke="#111" stroke-width="4"/><path d="M97 102h6" stroke="#111" stroke-width="4"/>',
  }[avatar.accessory]

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="36" fill="${avatar.background}"/><circle cx="100" cy="112" r="55" fill="${avatar.skin}"/>${ears}${hair}${eyes}${nose}${mouth}${accessory}<path d="M60 177c10-21 70-21 80 0" fill="#455a64"/></svg>`
})

const generatedAvatar = computed(() => `data:image/svg+xml;base64,${window.btoa(avatarSvg.value)}`)
const avatarPreview = computed(() => profile.avatar || generatedAvatar.value)

const userFields = computed(() => [
  { label: 'Username', value: user.value.username || 'Unknown' },
  { label: 'User ID', value: user.value.uid || user.value.id || 'Not available' },
  { label: 'Admin', value: user.value.admin ? 'Yes' : 'No' },
  { label: 'Authenticated', value: user.value.isAuthenticated ? 'Yes' : 'No' },
])

const syncProfile = () => {
  profile.username = user.value.username || 'Unknown'
  profile.uid = user.value.uid || user.value.id || ''
  profile.avatar = user.value.avatar || null
  profile.admin = Boolean(user.value.admin)
  profile.isAuthenticated = Boolean(user.value.isAuthenticated)
}

const uploadAvatar = (file) => {
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    profile.avatar = reader.result
  }
  reader.readAsDataURL(file)
}

const useGeneratedAvatar = () => {
  profile.avatar = generatedAvatar.value
  uploadedImage.value = null
  showAvatarBuilder.value = false
}

const clearAvatar = () => {
  profile.avatar = null
  uploadedImage.value = null
}

const toggleAvatarBuilder = () => {
  showAvatarBuilder.value = !showAvatarBuilder.value
}

const saveProfile = () => {
  userStore.setUser({
    ...user.value,
    username: profile.username,
    avatar: avatarPreview.value,
  })
}

watch(user, syncProfile, { immediate: true })
watch(uploadedImage, uploadAvatar)
</script>

<template>
  <div class="user-profile">
    <section class="profile-hero">
      <div>
        <!-- <div class="text-overline text-secondary">User profile</div> -->
        <h1>{{ profile.username }}</h1>
        <!-- <div class="text-grey-5">Manage your local profile fields and avatar.</div> -->
      </div>
      <div class="avatar-control">
        <q-avatar
          size="118px"
          class="profile-avatar clickable"
          role="button"
          tabindex="0"
          @click="toggleAvatarBuilder"
          @keydown.enter="toggleAvatarBuilder"
          @keydown.space.prevent="toggleAvatarBuilder"
        >
          <img :src="avatarPreview" alt="User avatar" />
        </q-avatar>
        <q-btn
          round
          dense
          unelevated
          color="primary"
          icon="edit"
          aria-label="Edit avatar"
          class="avatar-edit-btn"
          @click="toggleAvatarBuilder"
        />
      </div>
    </section>

    <div class="profile-grid">
      <q-card flat bordered class="profile-card bg-grey-10 text-grey-2">
        <q-card-section>
          <div class="text-h6 text-secondary q-mb-md">Profile fields</div>
          <q-input
            v-model="profile.username"
            dark
            outlined
            dense
            color="secondary"
            label="Username"
          />
          <q-input
            v-model="profile.uid"
            dark
            outlined
            dense
            readonly
            color="secondary"
            label="User ID"
            class="q-mt-md"
          />

          <div class="field-list q-mt-lg">
            <div v-for="field in userFields" :key="field.label" class="field-row">
              <span>{{ field.label }}</span>
              <strong>{{ field.value }}</strong>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="profile-card bg-grey-10 text-grey-2">
        <q-card-section>
          <div class="text-h6 text-secondary q-mb-md">Avatar image</div>
          <q-file
            v-model="uploadedImage"
            dark
            outlined
            dense
            clearable
            accept="image/*"
            color="secondary"
            label="Upload image"
          >
            <template #prepend>
              <q-icon name="image" />
            </template>
          </q-file>

          <q-input
            v-model="profile.avatar"
            dark
            outlined
            dense
            color="secondary"
            label="Image URL or data URL"
            class="q-mt-md"
          />

          <div class="row q-col-gutter-sm q-mt-md">
            <div class="col-6">
              <q-btn
                class="full-width"
                color="positive"
                no-caps
                label="Use custom avatar"
                @click="useGeneratedAvatar"
              />
            </div>
            <div class="col-6">
              <q-btn
                class="full-width"
                color="grey-8"
                no-caps
                label="Clear image"
                @click="clearAvatar"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog
      v-model="showAvatarBuilder"
      transition-show="scale"
      transition-hide="scale"
      transition-duration="500"
    >
      <q-card flat bordered class="profile-card avatar-builder-dialog bg-grey-10 text-grey-2">
        <q-card-section>
          <div class="builder-head">
            <div>
              <div class="text-h6 text-secondary">Avatar builder</div>
              <div class="text-caption text-grey-5">
                Customize the generated avatar, then save it to your profile.
              </div>
            </div>
            <div class="builder-preview" style="padding-right: 30%">
              <q-avatar size="86px" class="profile-avatar small">
                <img :src="generatedAvatar" alt="Generated avatar" />
              </q-avatar>
              <q-btn
                round
                dense
                unelevated
                size="sm"
                color="primary"
                icon="close"
                aria-label="Hide avatar builder"
                class="builder-close-btn"
                @click="showAvatarBuilder = false"
                style="position: absolute; top: 18px; right: 18px"
              />
            </div>
          </div>

          <div class="color-controls q-mt-lg">
            <div class="color-control">
              <div class="control-label">Skin</div>
              <div class="swatches">
                <button
                  v-for="color in skinOptions"
                  :key="color"
                  type="button"
                  class="swatch"
                  :class="{ active: avatar.skin === color }"
                  :style="{ backgroundColor: color }"
                  @click="avatar.skin = color"
                />
              </div>
            </div>

            <div class="color-control">
              <div class="control-label">Hair</div>
              <div class="swatches">
                <button
                  v-for="color in hairColors"
                  :key="color"
                  type="button"
                  class="swatch"
                  :class="{ active: avatar.hairColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="avatar.hairColor = color"
                />
              </div>
            </div>

            <div class="color-control">
              <div class="control-label">Eyes</div>
              <div class="swatches">
                <button
                  v-for="color in eyeColors"
                  :key="color"
                  type="button"
                  class="swatch"
                  :class="{ active: avatar.eyeColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="avatar.eyeColor = color"
                />
              </div>
            </div>

            <div class="color-control">
              <div class="control-label">Background</div>
              <div class="swatches">
                <button
                  v-for="color in backgroundOptions"
                  :key="color"
                  type="button"
                  class="swatch"
                  :class="{ active: avatar.background === color }"
                  :style="{ backgroundColor: color }"
                  @click="avatar.background = color"
                />
              </div>
            </div>
          </div>

          <div class="builder-grid q-mt-lg">
            <q-select
              v-model="avatar.hair"
              dark
              outlined
              dense
              emit-value
              map-options
              :options="hairOptions"
              label="Hair"
            />
            <q-select
              v-model="avatar.eyes"
              dark
              outlined
              dense
              emit-value
              map-options
              :options="eyeOptions"
              label="Eyes"
            />
            <q-select
              v-model="avatar.nose"
              dark
              outlined
              dense
              emit-value
              map-options
              :options="noseOptions"
              label="Nose"
            />
            <q-select
              v-model="avatar.mouth"
              dark
              outlined
              dense
              emit-value
              map-options
              :options="mouthOptions"
              label="Mouth"
            />
            <q-select
              v-model="avatar.accessory"
              dark
              outlined
              dense
              emit-value
              map-options
              :options="accessoryOptions"
              label="Hat / accessory"
            />
            <q-toggle v-model="avatar.ears" color="secondary" label="Ears" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat color="grey-5" label="Close" no-caps @click="showAvatarBuilder = false" />
          <q-btn
            color="positive"
            icon="check"
            label="Use avatar"
            no-caps
            @click="useGeneratedAvatar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div class="profile-actions">
      <q-btn color="positive" icon="save" label="Save profile" no-caps @click="saveProfile" />
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 24px;
  color: #eceff1;
  background:
    radial-gradient(circle at top left, rgba(0, 188, 212, 0.16), transparent 32rem),
    linear-gradient(135deg, #0b0f12 0%, #15191d 48%, #090909 100%);
}

.profile-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto 18px;
}

.profile-hero h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0;
}

.profile-avatar {
  border: 2px solid #26c6da;
  box-shadow: 0 0 0 6px rgba(38, 198, 218, 0.1);
}

.avatar-control {
  position: relative;
  flex: 0 0 auto;
}

.profile-avatar.clickable {
  cursor: pointer;
}

.avatar-edit-btn {
  position: absolute;
  right: -4px;
  bottom: -4px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}

.profile-avatar img {
  object-fit: cover;
}

.profile-avatar.small {
  flex: 0 0 auto;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto 16px;
}

.profile-card {
  border-color: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
}

.field-list {
  display: grid;
  gap: 8px;
}

.field-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: #b0bec5;
}

.field-row strong {
  color: #eceff1;
  text-align: right;
  overflow-wrap: anywhere;
}

.avatar-builder-dialog {
  width: min(920px, calc(100vw - 32px));
  max-width: 920px;
  border-color: rgba(38, 198, 218, 0.28);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
  background:
    radial-gradient(circle at top right, rgba(38, 198, 218, 0.16), transparent 24rem), #101417;
}

.builder-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.builder-preview {
  display: flex;
  align-items: center;
  gap: 14px;
}

.color-controls {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.color-control {
  flex: 0 0 auto;
}

.builder-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: end;
}

.control-label {
  margin-bottom: 8px;
  color: #b0bec5;
  font-size: 0.8rem;
}

.swatches {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
}

.swatch {
  width: 32px;
  height: 32px;
  border: 2px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  cursor: pointer;
}

.swatch.active {
  border-color: #26c6da;
  box-shadow: 0 0 0 3px rgba(38, 198, 218, 0.16);
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  max-width: 1100px;
  margin: 16px auto 0;
}

@media (max-width: 800px) {
  .user-profile {
    padding: 16px;
  }

  .profile-hero,
  .builder-head {
    align-items: flex-start;
  }

  .profile-grid,
  .builder-grid {
    grid-template-columns: 1fr;
  }
}
</style>
