<script setup>
import PageTitle from 'src/components/PageTitleFactory.vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ICON from 'src/helpers/icons'

const props = defineProps({
  books: {
    type: Array,
    default: () => [],
  },
  links: {
    type: Array,
    default: () => [],
  },
  textColor: {
    type: String,
    default: 'green-5',
  },
  linkColor: {
    type: String,
    default: 'green-5',
  },
  from: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  i18nPrefix: {
    type: String,
    default: 'bookList',
  },
})

const { t } = useI18n({ useScope: 'global' })
const visibleDescriptions = ref(new Set())

const sortedLinks = computed(() =>
  [...props.links].sort((a, b) => (b.rating || 0) - (a.rating || 0)),
)

function toggleDescription(index) {
  const nextVisibleDescriptions = new Set(visibleDescriptions.value)

  if (nextVisibleDescriptions.has(index)) {
    nextVisibleDescriptions.delete(index)
  } else {
    nextVisibleDescriptions.add(index)
  }

  visibleDescriptions.value = nextVisibleDescriptions
}
</script>

<template>
  <div class="q-pa-md">
    <PageTitle :from="from" :title="title" />
  </div>

  <div class="resource-list q-pa-md q-ml-lg">
    <q-expansion-item
      :content-inset-level="1"
      icon="link"
      :class="`text-${textColor}`"
      label="Links"
      default-opened
    >
      <div class="link-row q-mt-sm">
        <q-card v-for="link in sortedLinks" :key="link.url" class="link-card bg-dark" flat bordered>
          <q-card-section class="column items-center q-pb-none">
            <a
              :href="`https://${link.url}`"
              target="_blank"
              rel="noopener"
              class="text-decoration-none"
            >
              <q-chip clickable icon="link" :color="linkColor" text-color="white">
                {{ link.url }}
              </q-chip>
            </a>
            <q-rating
              v-model="link.rating"
              readonly
              size="1em"
              color="amber"
              icon="star"
              class="q-mt-xs"
            />
          </q-card-section>
          <q-card-section class="text-caption text-secondary q-pt-sm">
            {{ link.description }}
          </q-card-section>
        </q-card>
      </div>
    </q-expansion-item>
    <br />
    <q-expansion-item
      :content-inset-level="1"
      :icon="ICON.RESOURCES"
      :class="`text-${textColor}`"
      label="Books"
      default-opened
    >
      <div class="resource-row q-mt-sm">
        <div v-for="(book, index) in books" :key="book.name" class="resource-column">
          <q-card class="resource-card full-height column q-ml-md">
            <div class="resource-face">
              <q-img
                :src="book.image"
                fit="contain"
                :class="[
                  'resource-cover',
                  { 'resource-layer-front': !visibleDescriptions.has(index) },
                ]"
              >
                <template #error>
                  <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                    {{ book.name }}
                  </div>
                </template>
              </q-img>

              <q-card-section
                :class="[
                  'resource-description',
                  { 'resource-layer-front': visibleDescriptions.has(index) },
                ]"
              >
                <div class="text-subtitle1 text-weight-bold">{{ index + 1 }}. {{ book.name }}</div>
                <div v-if="book.author" class="text-caption text-grey-7 q-mb-sm">
                  {{ t(`${i18nPrefix}.by`) }} {{ book.author }}
                </div>
                <div class="text-body2">{{ book.description }}</div>
              </q-card-section>

              <q-btn
                round
                dense
                unelevated
                color="primary"
                text-color="white"
                icon="swap_vert"
                class="resource-switch"
                :aria-label="book.name"
                @click="toggleDescription(index)"
              >
                <q-tooltip>{{ book.name }}</q-tooltip>
              </q-btn>
            </div>

            <q-separator />

            <q-card-actions align="right">
              <q-btn
                v-if="book.link"
                flat
                color="primary"
                no-caps
                :label="t(`${i18nPrefix}.buy`)"
                :href="book.link"
                target="_blank"
                rel="noopener"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </q-expansion-item>
  </div>
</template>

<style scoped>
.resource-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
}

.resource-column {
  flex: 0 0 min(240px, calc(100vw - 48px));
}

.resource-card {
  display: flex;
}

.resource-face {
  position: relative;
  width: 100%;
  height: 360px;
  aspect-ratio: 2 / 3;
  overflow: hidden;
}

.resource-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.resource-description {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow-y: auto;
  background: white;
  overflow-wrap: anywhere;
}

.resource-layer-front {
  z-index: 2;
}

.resource-switch {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 3;
}

.text-decoration-none {
  text-decoration: none;
}

.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.link-card {
  flex: 0 0 260px;
}
</style>
