<script setup>
import { reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import PageTitle from 'src/components/PageTitleFactory.vue'

const $q = useQuasar()
const { tm } = useI18n({ useScope: 'global' })
const bondTab = ref('introduction_to_bonds')
const splitterModel = ref(22)
const bondChapters = [
  'introduction_to_bonds',
  'key_bond_terminology',
  'how_bonds_work',
  'bond_pricing_fundamentals',
  'understanding_bond_yields',
  'interest_rates_and_bonds',
  'bond_risks',
  'credit_quality_and_ratings',
  'types_of_bonds',
  'bond_market_basics',
  'practical_bond_analysis',
  'putting_it_all_together',
]
const topicTabs = reactive(Object.fromEntries(bondChapters.map((chapter) => [chapter, 0])))
const getTopics = (chapter) => {
  return tm(`bonds_fundamentals.chapters.${chapter}.topics`)
}
const getTopicTitles = (chapter) => getTopics(chapter).map((topic) => topic.title)
</script>

<template>
  <div class="guide q-pa-md">
    <div class="guide__tabs-row">
      <PageTitle from="Bonds" title="Fundamentals" />
      <q-tabs
        v-model="bondTab"
        dense
        align="left"
        inline-label
        no-caps
        outside-arrows
        :mobile-arrows="false"
        class="guide__tabs"
        active-color="red-5"
        indicator-color="red-5"
      >
        <q-tab
          v-for="chapter in bondChapters"
          :key="chapter"
          :name="chapter"
          :label="$t(`bonds_fundamentals.chapters.${chapter}.title`)"
        />
      </q-tabs>
    </div>
    <q-separator />

    <q-tab-panels v-model="bondTab" animated keep-alive class="guide__panels">
      <q-tab-panel v-for="chapter in bondChapters" :key="chapter" :name="chapter" class="q-pa-none">
        <q-splitter
          v-model="splitterModel"
          unit="%"
          :limits="[18, 46]"
          :horizontal="$q.screen.lt.md"
          class="guide__splitter"
        >
          <template #before>
            <q-tabs
              v-model="topicTabs[chapter]"
              :vertical="!$q.screen.lt.md"
              dense
              no-caps
              inline-label
              class="guide__subtabs"
              active-color="red-5"
              indicator-color="red-5"
            >
              <q-tab
                v-for="(title, index) in getTopicTitles(chapter)"
                :key="`${chapter}-${index}`"
                :name="index"
                :label="title"
              />
            </q-tabs>
          </template>

          <template #after>
            <q-tab-panels v-model="topicTabs[chapter]" animated keep-alive class="guide__subpanels">
              <q-tab-panel
                v-for="(topic, index) in getTopics(chapter)"
                :key="`${chapter}-${index}`"
                :name="index"
              >
                <div class="text-h5 text-grey-5 q-mb-md">
                  {{ topic.title }}
                </div>
                <q-separator class="q-mb-md" />
                <div class="learning-body">
                  {{ topic.content }}
                </div>
                <div v-if="topic.formula" class="formula q-mt-md">
                  {{ topic.formula }}
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
  --guide-rail: rgba(255, 255, 255, 0.14);
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

.learning-body {
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.82);
  white-space: pre-line;
}

.formula {
  padding: 12px 14px;
  border-left: 3px solid var(--guide-cyan);
  background: rgba(38, 198, 218, 0.08);
  color: #e0f7fa;
  font-family: monospace;
  border-radius: 4px;
}
</style>
