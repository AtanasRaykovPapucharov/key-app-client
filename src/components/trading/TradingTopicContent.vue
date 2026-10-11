<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'TradingTopicContent' })

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
})

const { t } = useI18n({ useScope: 'global' })

// Each instance owns its accordion group, so opening a panel inside a nested
// sub-topic never collapses its parent's panel.
// let counter = 0
// const group = `trading-topic-${(counter += 1)}-${Math.random().toString(36).slice(2, 8)}`

const hasBlocks = computed(() => {
  const n = props.node
  return Boolean(
    n.description ||
    n.key_points?.length ||
    n.formula ||
    n.example ||
    n.data_points?.length ||
    n.blocks?.length,
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
  <div class="topic-content">
    <header class="topic-content__head">
      <h3 class="topic-content__title text-purple-4">{{ node.title }}</h3>
      <p v-if="node.overview" class="topic-content__overview">{{ node.overview }}</p>
    </header>

    <q-separator dark class="q-my-md" />

    <div v-if="hasBlocks" class="topic-content__list">
      <div v-if="node.description" class="topic-content__panel topic-content__panel--hero">
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">✦</span>
          <span>{{ t('trading.description') }}</span>
        </div>
        <div class="topic-content__panel-body">
          <p class="topic-content__prose">{{ node.description }}</p>
        </div>
      </div>

      <div v-if="node.key_points?.length" class="topic-content__panel">
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">✓</span>
          <span>{{ t('trading.keyPoints') }}</span>
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
          <span>{{ t('trading.formula') }}</span>
        </div>
        <div class="topic-content__panel-body">
          <pre class="topic-content__formula">{{ node.formula }}</pre>
        </div>
      </div>

      <div v-if="node.example" class="topic-content__panel">
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">✎</span>
          <span>{{ t('trading.example') }}</span>
        </div>
        <div class="topic-content__panel-body">
          <div class="topic-content__prose topic-content__example">{{ node.example }}</div>
        </div>
      </div>

      <div v-if="node.data_points?.length" class="topic-content__panel">
        <div class="topic-content__panel-head">
          <span class="topic-content__panel-icon">▣</span>
          <span>{{ t('trading.dataPoints') }}</span>
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
    </div>

    <div v-else class="text-grey-5 q-pa-sm">{{ t('trading.noContent') }}</div>

    <!-- A topic can carry its own sub-topics; they get their own horizontal tabs. -->
    <section v-if="childKeys.length" class="topic-content__children">
      <q-tabs
        v-model="child"
        dense
        align="left"
        no-caps
        inline-label
        outside-arrows
        :mobile-arrows="false"
        class="topic-content__childtabs"
        active-color="purple-4"
        indicator-color="purple-4"
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
          <TradingTopicContent :node="node.subsections[key]" :depth="depth + 1" />
        </q-tab-panel>
      </q-tab-panels>
    </section>
  </div>
</template>

<style scoped>
.topic-content {
  width: 100%;
}

.topic-content__head {
  margin-bottom: 16px;
}

.topic-content__title {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.3;
  font-weight: 600;
}

.topic-content__overview {
  margin: 8px 0 0;
  max-width: 68ch;
  color: rgba(255, 255, 255, 0.72);
}

.topic-content__list {
  display: grid;
  gap: 14px;
  width: 100%;
  max-width: none;
}

.topic-content__panel {
  overflow: hidden;
  border: 1px solid rgba(192, 132, 252, 0.22);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(28, 24, 40, 0.94), rgba(17, 18, 24, 0.96));
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.topic-content__panel--hero {
  border-color: rgba(216, 180, 254, 0.38);
  background: linear-gradient(135deg, rgba(49, 25, 68, 0.82), rgba(18, 25, 34, 0.96));
}

.topic-content__panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(168, 85, 247, 0.08);
  color: #e9d5ff;
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
  background: rgba(168, 85, 247, 0.14);
  color: #d8b4fe;
  font-size: 0.8rem;
}

.topic-content__panel-body {
  padding: 16px;
}

.topic-content__prose {
  margin: 0;
  white-space: pre-line;
  line-height: 1.7;
  color: #f3f3f3;
  max-width: none;
}

/* Worked examples are mostly arithmetic, so they read better monospaced. */
.topic-content__example {
  border-left: 3px solid #d8b4fe;
  padding-left: 16px;
  background: rgba(168, 85, 247, 0.05);
  border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.875rem;
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
  border: 1px solid rgba(196, 181, 253, 0.18);
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(147, 51, 234, 0.1), rgba(255, 255, 255, 0.03));
  color: #f3e8ff;
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-x: auto;
}

.topic-content__children {
  margin-top: 28px;
}

.topic-content__childtabs {
  border-bottom: 2px solid rgba(196, 181, 253, 0.35);
}

.topic-content__childtabs :deep(.q-tab) {
  color: rgba(255, 255, 255, 0.72);
  transition:
    color 160ms ease,
    background-color 160ms ease;
}

.topic-content__childtabs :deep(.q-tab:hover) {
  color: #ffffff;
  background: rgba(168, 85, 247, 0.08);
}

.topic-content__children :deep(.q-separator) {
  background: rgba(255, 255, 255, 0.14);
}
</style>
