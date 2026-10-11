<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import diagrams from './crypto-diagrams.js'

defineOptions({ name: 'TopicContent' })

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
})

const { t, locale } = useI18n({ useScope: 'global' })

const hasBlocks = computed(() => {
  const n = props.node
  return Boolean(
    n.description ||
    n.key_points?.length ||
    n.formula ||
    n.example ||
    n.data_points?.length ||
    n.blocks?.length ||
    n.glossary?.length,
  )
})

// Only the nodes that carry a `diagram.src` render one; the rest are unchanged.
// The drawing is localized too, so it follows the active locale and falls back
// to English if a translation of that diagram is ever missing.
const lang = computed(() => locale.value.split('-')[0])
const diagram = computed(() => {
  const src = props.node.diagram?.src
  if (!src) return null
  return (diagrams[lang.value] ?? diagrams.en)[src] ?? diagrams.en[src] ?? null
})

const childKeys = computed(() => Object.keys(props.node.subsections || {}))
const child = ref(childKeys.value[0] ?? null)

// Keys are identical across locales, so this only fires on a real node change.
watch(childKeys, (keys) => {
  if (!keys.includes(child.value)) child.value = keys[0] ?? null
})
</script>

<template>
  <div class="topic-content">
    <header class="topic-content__head">
      <!-- <div class="text-caption text-grey-5">{{ t('crypto.breadcrumb') }}</div> -->
      <h3 class="topic-content__title text-orange-5">{{ node.title }}</h3>
      <p v-if="node.overview" class="topic-content__overview">{{ node.overview }}</p>
    </header>

    <q-separator dark class="q-my-md" />

    <div v-if="hasBlocks" class="topic-content__list">
      <div
        v-if="node.description || diagram"
        class="topic-content__panel topic-content__panel--hero"
      >
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">✦</span>
          <span>{{ t('crypto.description') }}</span>
        </div>

        <div v-if="diagram" class="topic-content__hero-grid">
          <div class="topic-content__hero-copy">
            <p v-if="node.description" class="topic-content__prose">{{ node.description }}</p>
          </div>

          <figure class="topic-content__figure">
            <!-- Local, build-time assets: no user content reaches v-html here. -->
            <div class="topic-content__diagram" v-html="diagram"></div>
            <figcaption v-if="node.diagram.caption" class="topic-content__figcaption">
              {{ node.diagram.caption }}
            </figcaption>
          </figure>
        </div>

        <div v-else class="topic-content__panel-body">
          <p v-if="node.description" class="topic-content__prose">{{ node.description }}</p>
        </div>
      </div>

      <div v-if="node.key_points?.length" class="topic-content__panel">
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">✓</span>
          <span>{{ t('crypto.keyPoints') }}</span>
        </div>
        <div class="topic-content__panel-body">
          <ul class="topic-content__points">
            <li v-for="(point, i) in node.key_points" :key="i">{{ point }}</li>
          </ul>
        </div>
      </div>

      <div v-if="node.formula" class="topic-content__panel">
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">ƒ</span>
          <span>{{ t('crypto.formula') }}</span>
        </div>
        <div class="topic-content__panel-body">
          <pre class="topic-content__formula">{{ node.formula }}</pre>
        </div>
      </div>

      <div v-if="node.example" class="topic-content__panel">
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">✎</span>
          <span>{{ t('crypto.example') }}</span>
        </div>
        <div class="topic-content__panel-body">
          <div class="topic-content__prose topic-content__example">{{ node.example }}</div>
        </div>
      </div>

      <div v-if="node.data_points?.length" class="topic-content__panel">
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">▣</span>
          <span>{{ t('crypto.dataPoints') }}</span>
        </div>
        <div class="topic-content__panel-body">
          <ul class="topic-content__points">
            <li v-for="(point, i) in node.data_points" :key="i">{{ point }}</li>
          </ul>
        </div>
      </div>

      <div v-for="(block, i) in node.blocks || []" :key="`block-${i}`" class="topic-content__panel">
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">▤</span>
          <span>{{ block.title }}</span>
        </div>
        <div class="topic-content__panel-body">
          <ul class="topic-content__points">
            <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
          </ul>
        </div>
      </div>

      <div v-if="node.glossary?.length" class="topic-content__panel">
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">⌂</span>
          <span>{{ t('crypto.glossary') }}</span>
        </div>
        <div class="topic-content__panel-body">
          <q-markup-table dark flat dense wrap-cells>
            <thead>
              <tr>
                <th class="text-left">{{ t('crypto.term') }}</th>
                <th class="text-left">{{ t('crypto.definition') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in node.glossary" :key="entry.term">
                <td class="text-left text-weight-medium">{{ entry.term }}</td>
                <td class="text-left">{{ entry.definition }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </div>
    </div>

    <div v-else class="text-grey-5 q-pa-sm">{{ t('crypto.noContent') }}</div>

    <!-- A topic can carry its own sub-topics; they get their own horizontal tabs. -->
    <section v-if="childKeys.length" class="topic-content__children">
      <q-tabs
        v-model="child"
        dense
        align="left"
        no-caps
        outside-arrows
        :mobile-arrows="false"
        inline-label
        class="topic-content__childtabs"
        active-color="orange-5"
        indicator-color="orange-5"
      >
        <q-tab
          v-for="key in childKeys"
          :key="key"
          :name="key"
          :label="node.subsections[key].title"
        />
      </q-tabs>
      <q-separator dark />

      <q-tab-panels v-model="child" animated keep-alive class="bg-transparent text-white">
        <q-tab-panel v-for="key in childKeys" :key="key" :name="key" class="q-px-none">
          <TopicContent :node="node.subsections[key]" :depth="depth + 1" />
        </q-tab-panel>
      </q-tab-panels>
    </section>
  </div>
</template>

<style scoped>
.topic-content {
  width: 100%;
}

.topic-content__title {
  margin: 4px 0 0;
  font-size: 1.5rem;
  line-height: 1.25;
  font-weight: 600;
}

.topic-content__overview {
  margin: 8px 0 0;
  max-width: 68ch;
  color: #bdbdbd;
}

.topic-content__figure {
  margin: 0 0 20px;
  max-width: 78ch;
}

.topic-content__diagram {
  /* The SVG reads these two, and inherits everything else from `color`. */
  --diagram-accent: #ffa726;
  --diagram-accent-2: #eac168;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.88);
}

.topic-content__diagram :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

.topic-content__figcaption {
  margin-top: 10px;
  line-height: 1.5;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.62);
}

.topic-content__list {
  display: grid;
  gap: 14px;
  width: 100%;
  max-width: none;
}

.topic-content__panel {
  overflow: hidden;
  border: 1px solid rgba(255, 167, 38, 0.2);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(27, 29, 35, 0.92), rgba(17, 18, 24, 0.96));
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.topic-content__panel--hero {
  border-color: rgba(255, 193, 7, 0.35);
  background: linear-gradient(135deg, rgba(41, 26, 9, 0.82), rgba(18, 25, 34, 0.96));
}

.topic-content__panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 167, 38, 0.08);
  color: #ffdca0;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.topic-content__panel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 167, 38, 0.15);
  color: #ffb74d;
  font-size: 0.8rem;
}

.topic-content__panel-body {
  padding: 16px;
}

.topic-content__hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 1.92fr);
  gap: 18px;
  align-items: start;
  padding: 16px;
}

@media (max-width: 768px) {
  .topic-content__hero-grid {
    grid-template-columns: 1fr;
  }
}

.topic-content__hero-copy {
  min-width: 0;
}

.topic-content__figure {
  margin: 0;
  max-width: 100%;
}

.topic-content__diagram {
  --diagram-accent: #ffa726;
  --diagram-accent-2: #eac168;
  padding: 12px 14px;
  border: 1px solid rgba(255, 167, 38, 0.28);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 167, 38, 0.03));
  color: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.topic-content__diagram :deep(svg) {
  display: block;
  width: 100%;
  height: auto;
}

.topic-content__figcaption {
  margin-top: 10px;
  line-height: 1.5;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.62);
}

.topic-content__prose {
  margin: 0;
  white-space: pre-line;
  line-height: 1.7;
  color: #f3f3f3;
  max-width: none;
}

.topic-content__example {
  border-left: 3px solid #ffb74d;
  padding-left: 16px;
  background: rgba(255, 167, 38, 0.05);
  border-radius: 8px;
}

.topic-content__points {
  margin: 0;
  padding-left: 18px;
  line-height: 1.7;
  color: #f5f5f5;
}

.topic-content__points li + li {
  margin-top: 8px;
}

.topic-content__formula {
  margin: 0;
  padding: 14px 16px;
  border: 1px solid rgba(130, 205, 255, 0.18);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(119, 187, 255, 0.08), rgba(255, 255, 255, 0.03));
  color: #dfeaff;
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-x: auto;
}

.topic-content__panel :deep(table) {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.01);
}

.topic-content__panel :deep(th),
.topic-content__panel :deep(td) {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.86);
}

.topic-content__panel :deep(th) {
  background: rgba(255, 167, 38, 0.08);
  color: #ffdca0;
}

.topic-content__children {
  margin-top: 28px;
}

/* Same treatment as the theme tabs one level up. */
.topic-content__childtabs {
  border-bottom: 2px solid rgba(255, 167, 38, 0.3);
}

.topic-content__childtabs :deep(.q-tab) {
  color: rgba(255, 255, 255, 0.72);
  transition:
    color 160ms ease,
    background-color 160ms ease;
}

.topic-content__childtabs :deep(.q-tab:hover) {
  color: #ffffff;
  background: rgba(255, 167, 38, 0.08);
}

.topic-content__children :deep(.q-separator) {
  background: rgba(255, 255, 255, 0.14);
}
</style>
