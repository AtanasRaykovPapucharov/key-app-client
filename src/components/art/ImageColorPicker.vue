<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const imageUrl = ref(null)
let objectUrl = null

const onFileAdded = (files) => {
  const file = files[0]
  if (!file) return

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }

  objectUrl = URL.createObjectURL(file)
  imageUrl.value = objectUrl
}

onBeforeUnmount(() => {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }
})
</script>

<template>
  <div class="q-gutter-md" style="height: 600px">
    <!-- File selector only -->
    <q-uploader
      :label="t('app.common.actions.uploadImage')"
      accept="image/*"
      auto-upload="false"
      no-thumbnails
      :max-files="1"
      @added="onFileAdded"
      @removed="imageUrl = null"
    />

    <!-- Resizable image -->
    <div v-if="imageUrl" class="image-container">
      <img :src="imageUrl" :alt="t('app.components.art.uploadedImage')" />
    </div>
  </div>
</template>

<style scoped>
.image-container {
  width: 100%;
  height: auto;
  min-width: 320px;
  max-width: 800px;
  border: 1px solid #ccc;
  padding: 8px;
  resize: horizontal;
  overflow: auto;
  position: absolute;
  top: 100px;
}

.image-container img {
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
  user-select: none;
}
</style>
