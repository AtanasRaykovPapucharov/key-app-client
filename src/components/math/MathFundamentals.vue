<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import PageTitle from 'src/components/PageTitleFactory.vue'

import concepts from './concepts.js'
import tileMaps from './tileMaps.js'

const themeAliases = {
  numbers: 'number_concepts',
}

const normalizeTheme = (theme) => themeAliases[theme] || theme?.replace(/-/g, '_')

const conceptFromImage = (image) => {
  const legacyMatch = image?.match(/^\.\/([^/]+)\/(bg|en)\/([^/]+)\.svg$/)
  if (legacyMatch) {
    return {
      theme: normalizeTheme(legacyMatch[1]),
      language: legacyMatch[2],
      id: legacyMatch[3],
    }
  }

  const conceptMatch = image?.match(/^\.\/concepts\/(bg|en)\/([^/]+)\/([^/]+)\.svg$/)
  return {
    theme: normalizeTheme(conceptMatch?.[2]),
    language: conceptMatch?.[1],
    id: conceptMatch?.[3],
  }
}

const imageUrl = (image) => {
  const { theme, language } = conceptFromImage(image)
  return concepts?.[theme]?.[language]
}

const panelPositions = [
  [20, 130],
  [420, 130],
  [820, 130],
  [20, 530],
  [420, 530],
  [820, 530],
  [20, 930],
  [420, 930],
  [820, 930],
  [20, 1330],
  [420, 1330],
  [820, 1330],
  [20, 1730],
  [420, 1730],
  [820, 1730],
]

// const imageCrop = (image, positionIndex) => {
//   const { theme, language, id } = conceptFromImage(image)
//   const tile = tileMaps[`${theme}:${language}`]?.[id]
//   if (!tile) {
//     const [x, y] = panelPositions[positionIndex]
//     return {
//       transform: `translate(${-((x / 1220) * 100)}%, ${-((y / 1730) * 100)}%)`,
//     }
//   }

//   const width = tile.width || 1220
//   const height = tile.height || 1730
//   const tileSize = tile.tileSize || 380
//   return {
//     width: `${(width / tileSize) * 100}%`,
//     transform: `translate(${-(tile.x / width) * 100}%, ${-(tile.y / height) * 100}%)`,
//   }
// }

const SHEET_MARGIN = 20 // outer margin used by the poster SVGs
const sheetSizes = new Map()

const sheetSize = (key, tiles) => {
  if (!sheetSizes.has(key)) {
    const boxes = Object.values(tiles)
    const size = boxes[0]?.tileSize ?? 380
    const left = Math.min(...boxes.map((t) => t.x))
    sheetSizes.set(key, {
      width: Math.max(...boxes.map((t) => t.x)) + size + left,
      height: Math.max(...boxes.map((t) => t.y)) + size + SHEET_MARGIN,
    })
  }
  return sheetSizes.get(key)
}

const imageCrop = (image, positionIndex) => {
  const { theme, language, id } = conceptFromImage(image)
  const key = `${theme}:${language}`
  const tiles = tileMaps[key]
  const tile = tiles?.[id]

  const tileSize = tile?.tileSize ?? 380
  const { width, height } = tiles ? sheetSize(key, tiles) : { width: 1220, height: 1730 }
  const [x, y] = tile ? [tile.x, tile.y] : panelPositions[positionIndex]

  return {
    width: `${(width / tileSize) * 100}%`,
    height: `${(height / tileSize) * 100}%`,
    maxWidth: 'none',
    transform: `translate(${-(x / width) * 100}%, ${-(y / height) * 100}%)`,
  }
}

const $q = useQuasar()
const { tm } = useI18n({ useScope: 'global' })

const math = computed(() => tm('math'))
const topicKey = (item, themeKey, itemIndex) => {
  if (item.id) return item.id

  const imageId = item.image?.match(/\/([^/]+)\.svg$/)?.[1]
  return imageId || `${themeKey}-${itemIndex}`
}

const categories = computed(() =>
  math.value.themes.map((theme, themeIndex) => ({
    ...theme,
    key: theme.id || `theme-${themeIndex}`,
    topics: theme.list.map((item, itemIndex) => ({
      ...item,
      key: topicKey(item, theme.id || themeIndex, itemIndex),
      positionIndex: itemIndex,
    })),
  })),
)

const tab = ref('numbers')
const topic = ref('natural_numbers')
const splitterModel = ref(22)

watch(tab, (categoryKey) => {
  const category = categories.value.find((item) => item.key === categoryKey)
  if (category && !category.topics.some((item) => item.key === topic.value)) {
    topic.value = category.topics[0].key
  }
})
</script>
<template>
  <div class="guide q-pa-md">
    <div class="guide__tabs-row">
      <PageTitle from="Math" title="Fundamentals" />
      <q-tabs
        v-model="tab"
        dense
        align="left"
        inline-label
        no-caps
        outside-arrows
        :mobile-arrows="false"
        class="guide__tabs"
        active-color="blue-5"
        indicator-color="blue-5"
      >
        <q-tab
          v-for="category in categories"
          :key="category.key"
          :name="category.key"
          :label="category.title"
        />
      </q-tabs>
    </div>
    <q-separator />

    <q-tab-panels v-model="tab" animated keep-alive class="guide__panels">
      <q-tab-panel
        v-for="category in categories"
        :key="category.key"
        :name="category.key"
        class="q-pa-none"
      >
        <q-splitter
          v-model="splitterModel"
          unit="%"
          :limits="[18, 46]"
          :horizontal="$q.screen.lt.md"
          class="guide__splitter"
        >
          <template #before>
            <q-tabs
              v-model="topic"
              :vertical="!$q.screen.lt.md"
              dense
              no-caps
              inline-label
              class="guide__subtabs"
              active-color="blue-5"
              indicator-color="blue-5"
            >
              <q-tab
                v-for="item in category.topics"
                :key="item.key"
                :name="item.key"
                :label="item.title"
              />
            </q-tabs>
          </template>

          <template #after>
            <q-tab-panels
              v-model="topic"
              animated
              keep-alive
              transition-prev="fade"
              transition-next="fade"
              class="guide__subpanels"
            >
              <q-tab-panel v-for="item in category.topics" :key="item.key" :name="item.key">
                <div class="learning-grid">
                  <div class="learning-cell image-cell">
                    <div class="text-caption text-grey-5 q-mb-sm">
                      {{ category.title }}
                    </div>
                    <div class="concept-image">
                      <img
                        :src="imageUrl(item.image)"
                        :alt="item.title"
                        :style="imageCrop(item.image, item.positionIndex)"
                      />
                    </div>
                  </div>

                  <div class="learning-details">
                    <div v-if="item.description" class="learning-cell">
                      <div class="learning-title">Description</div>
                      <div class="learning-body">{{ item.description }}</div>
                    </div>

                    <div v-if="item.formula" class="learning-cell formula-cell">
                      <div class="learning-title">Formula</div>
                      <div class="formula">{{ item.formula }}</div>
                    </div>
                  </div>

                  <div v-if="item.list.length" class="learning-cell list-cell">
                    <div class="learning-title">Topics</div>
                    <q-list dense separator class="guide__list">
                      <q-item
                        v-for="(child, childIndex) in item.list"
                        :key="child.id || childIndex"
                      >
                        <q-item-section>{{ child.title }}</q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </template>
        </q-splitter>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<style scoped>
.guide {
  --guide-blue: #42a5f5;
  --guide-cyan: #26c6da;
  --guide-amber: #ffca28;
  min-height: 100%;
  color: #f5f5f5;
  background: var(--q-dark-page);
}

.guide__tabs {
  flex: 1;
  min-width: 0;
  border-bottom: 2px solid rgba(66, 165, 245, 0.3);
}

.guide__tabs-row {
  display: flex;
  align-items: center;
  min-width: 0;
}

.guide__tabs :deep(.q-tab) {
  color: rgba(255, 255, 255, 0.72);
  transition:
    color 160ms ease,
    background-color 160ms ease;
}

.guide__tabs :deep(.q-tab:hover) {
  color: #ffffff;
  background: rgba(66, 165, 245, 0.08);
}

.guide__panels {
  background: var(--q-dark-page);
}

.guide__subtabs {
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.guide__subtabs :deep(.q-tab) {
  color: rgba(255, 255, 255, 0.7);
}

.guide__subtabs :deep(.q-tab--active) {
  color: #ffffff;
  background: rgba(66, 165, 245, 0.08);
}

.guide__subpanels {
  background: var(--q-dark-page);
}

.learning-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 16px;
  color: #e0e0e0;
  line-height: 1.55;
}

.learning-cell {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  padding: 14px;
}

.learning-title {
  color: var(--guide-amber);
  font-weight: 700;
  margin-bottom: 7px;
}

.learning-body {
  color: rgba(255, 255, 255, 0.82);
}

.formula {
  font-family: monospace;
  font-size: 0.95rem;
  color: #e0f7fa;
}

.list-cell {
  grid-column: 1 / -1;
}

.learning-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.concept-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
}

.concept-image img {
  position: absolute;
  inset: 0 auto auto 0;
  display: block;
  max-width: none;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.guide__list {
  background: transparent;
}

.guide__list :deep(.q-item) {
  margin-left: 25%;
  aspect-ratio: 1;
  overflow: hidden;
  background: transparent;
}

.concept-image img {
  display: block;
  width: 321.0526%;
  max-width: none;
}

@media (max-width: 900px) {
  .concept-image {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .learning-grid {
    grid-template-columns: 1fr;
  }

  .list-cell {
    grid-column: auto;
  }
}
</style>
