<script setup>
import { ref, onBeforeUnmount } from 'vue'

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
      label="Upload image"
      accept="image/*"
      auto-upload="false"
      no-thumbnails
      :max-files="1"
      @added="onFileAdded"
      @removed="imageUrl = null"
    />

    <!-- Resizable image -->
    <div v-if="imageUrl" class="image-container">
      <img :src="imageUrl" alt="Uploaded image" />
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
