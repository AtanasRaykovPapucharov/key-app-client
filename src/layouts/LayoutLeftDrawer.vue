<script setup>
import { useQuasar } from 'quasar'
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import FinanceExp from './expansions/FinanceExp.vue'
import PhysicsExp from './expansions/PhysicsExp.vue'
import AppExp from './expansions/AppExp.vue'
import FaqExp from './expansions/FaqExp.vue'

const emit = defineEmits(['close'])
const $q = useQuasar()
const route = useRoute()
const props = defineProps({
  drawerLeft: {
    type: Boolean,
    default: () => false,
  },
  tag: {
    type: String,
    default: () => 'finance',
  },
  appHeaderClick: {
    type: Number,
    default: 0,
  },
  faqHeaderClick: {
    type: Number,
    default: 0,
  },
})

const drawer = ref(false)
const scrollArea = ref(null)

const closeDrawer = () => {
  emit('close')
}

const scrollToTop = async () => {
  await nextTick()
  const target = scrollArea.value?.getScrollTarget()
  target?.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToBottom = async () => {
  await nextTick()
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  })
  const target = scrollArea.value?.getScrollTarget()
  target?.scrollTo({ top: target.scrollHeight, behavior: 'smooth' })
}

watch(
  () => props.drawerLeft,
  (val) => {
    drawer.value = val
  },
  {
    immediate: true,
  },
)

watch(
  () => props.appHeaderClick,
  () => {
    scrollToTop()
  },
)

watch(
  () => props.faqHeaderClick,
  () => {
    scrollToTop()
  },
)

watch(
  () => route.path,
  () => {
    if (drawer.value) {
      closeDrawer()
    }
  },
)
</script>

<template>
  <q-drawer
    v-model="drawer"
    bordered
    overlay
    :breakpoint="500"
    :width="360"
    :class="'bg-grey-10'"
    style="border-right: 2px solid #b30000"
  >
    <q-btn
      v-if="$q.screen.lt.sm"
      flat
      round
      dense
      icon="close"
      color="grey-4"
      aria-label="Close menu"
      class="absolute-top-right q-ma-sm"
      style="z-index: 2"
      @click="emit('close')"
    />
    <q-scroll-area ref="scrollArea" class="fit" :horizontal-thumb-style="{ opacity: 0 }">
      <div
        class="q-pa-md"
        :style="{
          paddingTop: $q.screen.lt.sm ? '40px' : undefined,
          paddingBottom: $q.screen.lt.sm ? '80px' : undefined,
        }"
      >
        <q-list dark dense>
          <!-- "math" reuses physics-exp, which already contains the Math & Probability group -->
          <physics-exp v-if="tag === 'math' || tag === 'physics'" />
          <finance-exp v-else-if="tag === 'finance'" />
          <app-exp v-else-if="tag === 'app'" @drawer="closeDrawer" @hobby-open="scrollToBottom" />
          <faq-exp v-else />
        </q-list>
      </div>
    </q-scroll-area>

    <div v-if="!$q.screen.lt.sm" class="absolute" style="top: 3px; right: -17px">
      <q-btn class="mini-toggle-btn" dense round unelevated size="md" @click="closeDrawer">
        <q-icon
          class="mini-toggle-icon bg-red-11"
          size="xs"
          :name="`${drawer ? 'chevron_left' : 'chevron_right'}`"
        />
      </q-btn>
    </div>
  </q-drawer>
</template>

<style scoped>
:deep(.q-expansion-item[class*='text-'] .q-item__label),
:deep(.q-btn[class*='text-'] .q-btn__content) {
  color: inherit;
}

@media (max-width: 599px) {
  :deep(.q-expansion-item__content .q-btn__content) {
    font-size: 18px;
  }
}
</style>
