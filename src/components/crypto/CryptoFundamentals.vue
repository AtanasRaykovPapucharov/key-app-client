<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

import PageTitle from 'src/components/PageTitleFactory.vue'
import TopicContent from './TopicContent.vue'
import { cryptoContentByLocale as c } from 'src/i18n/index.js'

const $q = useQuasar()
const { locale } = useI18n({ useScope: 'global' })

// bg / en share an identical key tree, so switching the language swaps the
// strings while every open tab and panel stays exactly where it was.
const contentLocale = computed(() => locale.value.split('-')[0])
const tree = computed(() => c[contentLocale.value] ?? c.en)

const themeKeys = computed(() => Object.keys(tree.value))
const theme = ref(themeKeys.value[0])
const introOpen = ref(true)

const splitter = ref(26)

const hasSubs = (key) => Boolean(tree.value[key]?.subsections)
const subKeys = (key) => Object.keys(tree.value[key]?.subsections || {})

// One remembered sub-theme per theme, so going back to a theme returns you
// to where you left off.
const sub = reactive(
  Object.fromEntries(themeKeys.value.map((key) => [key, subKeys(key)[0] ?? null])),
)

watch(themeKeys, (keys) => {
  if (!keys.includes(theme.value)) theme.value = keys[0]
  keys.forEach((key) => {
    const available = subKeys(key)
    if (!available.includes(sub[key])) sub[key] = available[0] ?? null
  })
})
</script>

<template>
  <div class="q-pa-md">
    <div class="guide">
      <div class="guide__tabs-row">
        <PageTitle from="Crypto" title="Fundamentals" />
        <q-btn
          flat
          round
          dense
          size="sm"
          color="orange-5"
          :icon="introOpen ? 'expand_less' : 'expand_more'"
          :aria-label="introOpen ? 'Hide theme introduction' : 'Show theme introduction'"
          @click="introOpen = !introOpen"
        />
        <q-tabs
          v-model="theme"
          dense
          align="left"
          inline-label
          no-caps
          outside-arrows
          :mobile-arrows="false"
          class="guide__tabs"
          active-color="orange-5"
          indicator-color="orange-5"
        >
          <q-tab v-for="key in themeKeys" :key="key" :name="key" :label="tree[key].title" />
        </q-tabs>
        <q-btn
          flat
          round
          dense
          size="sm"
          color="orange-5"
          :icon="introOpen ? 'expand_less' : 'expand_more'"
          :aria-label="introOpen ? 'Hide theme introduction' : 'Show theme introduction'"
          @click="introOpen = !introOpen"
        />
      </div>
      <q-separator />

      <q-tab-panels v-model="theme" animated keep-alive class="guide__panels">
        <q-tab-panel v-for="key in themeKeys" :key="key" :name="key" class="q-pa-none">
          <q-slide-transition>
            <div v-show="introOpen" class="guide__intro">
              <p class="guide__overview">{{ tree[key].overview }}</p>
              <p class="guide__description">{{ tree[key].description }}</p>
              <ul v-if="tree[key].key_points?.length" class="guide__intro-points">
                <li v-for="(point, i) in tree[key].key_points" :key="i">{{ point }}</li>
              </ul>
            </div>
          </q-slide-transition>

          <q-separator />

          <q-splitter
            v-if="hasSubs(key)"
            v-model="splitter"
            unit="%"
            :limits="[18, 46]"
            :horizontal="$q.screen.lt.md"
            class="guide__splitter"
          >
            <template #before>
              <q-tabs
                v-model="sub[key]"
                :vertical="!$q.screen.lt.md"
                dense
                no-caps
                inline-label
                class="guide__subtabs"
                active-color="orange-5"
                indicator-color="orange-5"
              >
                <q-tab
                  v-for="subKey in subKeys(key)"
                  :key="subKey"
                  :name="subKey"
                  :label="tree[key].subsections[subKey].title"
                />
              </q-tabs>
            </template>

            <template #after>
              <q-tab-panels
                v-model="sub[key]"
                animated
                keep-alive
                transition-prev="fade"
                transition-next="fade"
                class="guide__subpanels"
              >
                <q-tab-panel v-for="subKey in subKeys(key)" :key="subKey" :name="subKey">
                  <TopicContent :node="tree[key].subsections[subKey]" :depth="1" />
                </q-tab-panel>
              </q-tab-panels>
            </template>
          </q-splitter>

          <div v-else class="q-pa-md">
            <TopicContent :node="tree[key]" :depth="0" />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<style scoped>
.guide {
  --guide-orange: #ffa726;
  --guide-gold: #eac168;
  --guide-rail: rgba(255, 255, 255, 0.14);
  color: #f5f5f5;
  background: var(--q-dark-page);
}

.guide__tabs-row {
  display: flex;
  align-items: center;
  min-width: 0;
}

.guide__tabs {
  flex: 1;
  min-width: 0;
  border-bottom: 2px solid rgba(255, 167, 38, 0.3);
}

.guide__tabs :deep(.q-tab) {
  color: rgba(255, 255, 255, 0.72);
  transition:
    color 160ms ease,
    background-color 160ms ease;
}

.guide__tabs :deep(.q-tab:hover) {
  color: #ffffff;
  background: rgba(255, 167, 38, 0.08);
}

.guide__tabs-row :deep(.q-btn) {
  color: var(--guide-gold);
  background: rgba(234, 193, 104, 0.08);
}

.guide__panels {
  background: var(--q-dark-page);
}

.guide__intro {
  padding: 20px 20px 16px;
  /* max-width: 82ch; */
  border-left: 3px solid var(--guide-gold);
  background: rgba(234, 193, 104, 0.06);
}

.guide__overview {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.45;
  font-weight: 500;
}

.guide__description {
  margin: 10px 0 0;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.82);
}

.guide__intro-points {
  margin: 12px 0 0;
  padding-left: 20px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.82);
}

.guide__intro-points li + li {
  margin-top: 6px;
}

.guide :deep(.q-separator) {
  background: var(--guide-rail);
}

.guide__subtabs {
  padding: 8px 0;
}

/* Vertical tab labels hold full section titles, so let them wrap left-aligned. */
.guide__subtabs :deep(.q-tab) {
  justify-content: flex-start;
  min-height: 40px;
  padding: 6px 14px;
  color: rgba(255, 255, 255, 0.72);
  border-left: 2px solid transparent;
  transition:
    color 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.guide__subtabs :deep(.q-tab__content) {
  min-width: 0;
}

.guide__subtabs :deep(.q-tab__label) {
  white-space: normal;
  text-align: left;
  line-height: 1.35;
  font-size: 0.875rem;
}

.guide__subtabs :deep(.q-tab:hover) {
  color: #ffffff;
  background: rgba(255, 167, 38, 0.08);
}

.guide__subtabs :deep(.q-tab--active) {
  border-left-color: var(--guide-orange);
  background: rgba(255, 167, 38, 0.12);
}

.guide__subpanels {
  background: var(--q-dark-page);
}

@media (max-width: 1023px) {
  .guide__subtabs :deep(.q-tab__label) {
    white-space: nowrap;
  }
}
</style>
