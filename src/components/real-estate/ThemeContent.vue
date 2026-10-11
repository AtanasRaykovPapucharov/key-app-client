<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ThemeContent' })

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
})

const { t } = useI18n()

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

const childKeys = computed(() => Object.keys(props.node.subsections || {}))
const child = ref(childKeys.value[0] ?? null)

// Keys are identical across locales, so this only fires on a real node change.
watch(childKeys, (keys) => {
  if (!keys.includes(child.value)) child.value = keys[0] ?? null
})
</script>

<template>
  <div class="theme-content">
    <header class="theme-content__head">
      <h3 class="theme-content__title">{{ node.title }}</h3>
      <p v-if="node.overview" class="theme-content__overview">{{ node.overview }}</p>
    </header>

    <div v-if="hasBlocks" class="theme-content__list">
      <template
        v-if="
          node.title === 'Core reasons to invest in real estate' ||
          node.title === 'Основни причини за инвестиране в имоти'
        "
      >
        <div class="theme-content__reasons-grid theme-content__reasons-grid--top">
          <div class="theme-content__reasons-column">
            <div v-if="node.description" class="theme-content__panel theme-content__panel--hero">
              <div class="theme-content__panel-head">
                <span class="theme-content__panel-icon">✦</span>
                <span>{{ t('ui.description') }}</span>
              </div>
              <div class="theme-content__panel-body">
                <p class="theme-content__prose">{{ node.description }}</p>
              </div>
            </div>

            <div v-if="node.example" class="theme-content__panel">
              <div class="theme-content__panel-head">
                <span class="theme-content__panel-icon">✎</span>
                <span>{{ t('ui.example') }}</span>
              </div>
              <div class="theme-content__panel-body">
                <div class="theme-content__prose theme-content__example">{{ node.example }}</div>
              </div>
            </div>
          </div>

          <div class="theme-content__reasons-column">
            <div v-if="node.key_points?.length" class="theme-content__panel">
              <div class="theme-content__panel-head">
                <span class="theme-content__panel-icon">✓</span>
                <span>{{ t('ui.keyPoints') }}</span>
              </div>
              <div class="theme-content__panel-body">
                <ul
                  v-if="node.key_points?.length && !Number.isInteger(+node.key_points[0][0])"
                  class="theme-content__points"
                >
                  <li v-for="(point, i) in node.key_points" :key="i">{{ point }}</li>
                </ul>
                <div v-else class="theme-content__points">
                  <div
                    v-for="(point, i) in node.key_points"
                    :key="i"
                    :class="`${Number.isInteger(+point[0]) ? 'q-ml-md' : ''}`"
                  >
                    {{ point }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="node.data_points?.length || node.blocks?.length"
          class="theme-content__reasons-grid theme-content__reasons-grid--bottom"
        >
          <div
            v-if="node.data_points?.length"
            class="theme-content__panel theme-content__panel--data"
          >
            <div class="theme-content__panel-head">
              <span class="theme-content__panel-icon">▣</span>
              <span>{{ t('ui.dataPoints') }}</span>
            </div>
            <div class="theme-content__panel-body">
              <ul class="theme-content__points">
                <li v-for="(point, i) in node.data_points" :key="i">{{ point }}</li>
              </ul>
            </div>
          </div>

          <div class="theme-content__reasons-group-column">
            <div
              v-for="(block, i) in node.blocks.slice(0, 2)"
              :key="`block-${i}`"
              class="theme-content__panel theme-content__reasons-group"
            >
              <div class="theme-content__panel-head">
                <span class="theme-content__panel-icon">▤</span>
                <span>{{ block.title }}</span>
              </div>
              <div class="theme-content__panel-body">
                <ul class="theme-content__points">
                  <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-if="node.description" class="theme-content__panel theme-content__panel--hero">
          <div class="theme-content__panel-head">
            <span class="theme-content__panel-icon">✦</span>
            <span>{{ t('ui.description') }}</span>
          </div>
          <div class="theme-content__panel-body">
            <p class="theme-content__prose">{{ node.description }}</p>
          </div>
        </div>

        <div v-if="node.key_points?.length" class="theme-content__panel">
          <div class="theme-content__panel-head">
            <span class="theme-content__panel-icon">✓</span>
            <span>{{ t('ui.keyPoints') }}</span>
          </div>
          <div class="theme-content__panel-body">
            <ul
              v-if="node.key_points?.length && !Number.isInteger(+node.key_points[0][0])"
              class="theme-content__points"
            >
              <li v-for="(point, i) in node.key_points" :key="i">{{ point }}</li>
            </ul>
            <div v-else class="theme-content__points">
              <div
                v-for="(point, i) in node.key_points"
                :key="i"
                :class="`${Number.isInteger(+point[0]) ? 'q-ml-md' : ''}`"
              >
                {{ point }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="node.formula" class="theme-content__panel">
          <div class="theme-content__panel-head">
            <span class="theme-content__panel-icon">ƒ</span>
            <span>{{ t('ui.formula') }}</span>
          </div>
          <div class="theme-content__panel-body">
            <pre class="theme-content__formula">{{ node.formula }}</pre>
          </div>
        </div>

        <div v-if="node.example" class="theme-content__panel">
          <div class="theme-content__panel-head">
            <span class="theme-content__panel-icon">✎</span>
            <span>{{ t('ui.example') }}</span>
          </div>
          <div class="theme-content__panel-body">
            <div class="theme-content__prose theme-content__example">{{ node.example }}</div>
          </div>
        </div>

        <div v-if="node.data_points?.length" class="theme-content__panel">
          <div class="theme-content__panel-head">
            <span class="theme-content__panel-icon">▣</span>
            <span>{{ t('ui.dataPoints') }}</span>
          </div>
          <div class="theme-content__panel-body">
            <ul class="theme-content__points">
              <li v-for="(point, i) in node.data_points" :key="i">{{ point }}</li>
            </ul>
          </div>
        </div>

        <div
          v-for="(block, i) in node.blocks || []"
          :key="`block-${i}`"
          class="theme-content__panel"
        >
          <div class="theme-content__panel-head">
            <span class="theme-content__panel-icon">▤</span>
            <span>{{ block.title }}</span>
          </div>
          <div class="theme-content__panel-body">
            <ul class="theme-content__points">
              <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div v-if="node.glossary?.length" class="theme-content__panel">
          <div class="theme-content__panel-head">
            <span class="theme-content__panel-icon">⌂</span>
            <span>{{ t('ui.glossary') }}</span>
          </div>
          <div class="theme-content__panel-body">
            <q-markup-table dark flat dense wrap-cells class="theme-content__glossary">
              <thead>
                <tr>
                  <th class="text-left">{{ t('ui.term') }}</th>
                  <th class="text-left">{{ t('ui.definition') }}</th>
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
      </template>
    </div>

    <div v-else class="text-grey-4 q-pa-sm">{{ t('ui.noContent') }}</div>

    <!-- A node can carry its own sub-themes; they get their own horizontal tabs. -->
    <section v-if="childKeys.length" class="theme-content__children">
      <q-tabs
        v-model="child"
        dense
        align="left"
        inline-label
        no-caps
        outside-arrows
        :mobile-arrows="false"
        class="theme-content__childtabs"
        indicator-color="secondary"
        active-color="secondary"
      >
        <q-tab
          v-for="key in childKeys"
          :key="key"
          :name="key"
          :label="node.subsections[key].title"
        />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="child" animated keep-alive class="theme-content__childpanels">
        <q-tab-panel v-for="key in childKeys" :key="key" :name="key" class="q-px-none">
          <ThemeContent :node="node.subsections[key]" :depth="depth + 1" />
        </q-tab-panel>
      </q-tab-panels>
    </section>
  </div>
</template>

<style scoped>
.theme-content {
  --content-blue: #42a5f5;
  --content-cyan: #26c6da;
  --content-amber: #ffca28;
  --content-green: #66bb6a;
}

.theme-content__head {
  padding: 4px 0 4px 16px;
  margin-bottom: 16px;
  border-left: 3px solid var(--content-blue);
}

.theme-content__title {
  margin: 0;
  color: #ffffff;
  font-size: 1.25rem;
  line-height: 1.3;
  font-weight: 600;
}

.theme-content__overview {
  margin: 6px 0 0;
  max-width: 68ch;
  color: rgba(255, 255, 255, 0.82);
}

.theme-content__list {
  display: grid;
  gap: 14px;
  width: 100%;
  max-width: none;
}

.theme-content__panel {
  overflow: hidden;
  border: 1px solid rgba(96, 165, 250, 0.22);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(17, 18, 24, 0.96));
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.theme-content__reasons-grid {
  display: grid;
  gap: 14px;
}

.theme-content__reasons-grid--top {
  grid-template-columns: 1fr 1fr;
}

.theme-content__reasons-grid--bottom {
  grid-template-columns: 1fr 1fr;
  margin-top: 14px;
}

.theme-content__reasons-column {
  display: grid;
  gap: 14px;
}

.theme-content__reasons-group-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.theme-content__panel--hero {
  border-color: rgba(125, 211, 252, 0.38);
  background: linear-gradient(135deg, rgba(8, 47, 73, 0.82), rgba(18, 25, 34, 0.96));
}

.theme-content__panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(59, 130, 246, 0.1);
  color: #dbeafe;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.theme-content__panel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.14);
  color: #93c5fd;
  font-size: 0.8rem;
}

.theme-content__panel-body {
  padding: 16px;
}

.theme-content__prose {
  margin: 0;
  white-space: pre-line;
  line-height: 1.7;
  color: #f3f3f3;
  max-width: none;
}

.theme-content__example {
  border-left: 3px solid #7dd3fc;
  padding-left: 16px;
  background: rgba(125, 211, 252, 0.05);
  border-radius: 8px;
}

.theme-content__points {
  margin: 0;
  padding-left: 18px;
  line-height: 1.7;
  color: #f5f5f5;
}

.theme-content__points li + li {
  margin-top: 8px;
}

.theme-content__formula {
  margin: 0;
  padding: 14px 16px;
  border: 1px solid rgba(147, 197, 253, 0.2);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.1), rgba(255, 255, 255, 0.03));
  color: #e0f2fe;
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-x: auto;
}

.theme-content__glossary {
  width: 100%;
}

.theme-content__glossary td {
  vertical-align: top;
}

.theme-content__children {
  margin-top: 28px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.theme-content__childtabs {
  border-bottom: 2px solid rgba(96, 165, 250, 0.3);
}

.theme-content__childtabs :deep(.q-tab) {
  color: rgba(255, 255, 255, 0.64);
}

.theme-content__childtabs :deep(.q-tab--active) {
  color: var(--content-blue);
}

.theme-content__childpanels {
  background: var(--q-dark-page);
}

@media (max-width: 599px) {
  .theme-content__childpanels,
  .theme-content__childpanels :deep(.q-tab-panel) {
    height: auto;
    min-height: 0;
    overflow: visible;
  }

  .theme-content__reasons-grid--top,
  .theme-content__reasons-grid--bottom,
  .theme-content__reasons-group-column {
    grid-template-columns: 1fr;
  }
}
</style>
