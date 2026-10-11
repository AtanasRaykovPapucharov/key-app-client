<template>
  <q-page class="q-pa-md dark-page">
    <!-- MENU: quiz selection cards -->
    <div v-if="!activeQuizId" style="max-width: 1080px; margin: 0 auto">
      <div class="text-h5 text-white q-mb-xs">{{ t('app.math.quiz.choose') }}</div>
      <div class="text-body2 text-grey-5 q-mb-lg">
        {{ t('app.math.quiz.intro') }}
      </div>

      <template v-for="group in groups" :key="group.key">
        <div v-if="group.title" class="q-mt-xl q-mb-md">
          <div class="text-h6 text-white">{{ group.title }}</div>
          <div class="text-body2 text-grey-5">{{ group.note }}</div>
        </div>
        <div class="row q-col-gutter-md">
          <div v-for="quiz in group.quizzes" :key="quiz.id" class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered dark class="bg-dark text-white full-height quiz-card">
              <q-card-section class="text-center">
                <q-icon :name="quiz.icon" :color="quiz.color" size="48px" class="q-mb-sm" />
                <div class="text-h6">{{ tx(quiz.title) }}</div>
                <q-badge :color="quiz.color" class="q-mt-xs">{{ tx(quiz.difficulty) }}</q-badge>
              </q-card-section>

              <q-card-section class="text-body2 text-grey-5 text-center col-grow">
                {{ tx(quiz.description) }}
              </q-card-section>

              <q-card-section class="row justify-center text-caption text-grey-6 q-gutter-md">
                <div class="row items-center q-gutter-xs">
                  <q-icon name="quiz" size="16px" />
                  <span>{{ quiz.questionCount }} {{ t('app.math.quiz.questions') }}</span>
                </div>
                <div class="row items-center q-gutter-xs">
                  <q-icon name="schedule" size="16px" />
                  <span>{{ quiz.timeLimitMinutes }} {{ t('app.math.quiz.min') }}</span>
                </div>
              </q-card-section>

              <q-card-actions class="q-pa-md">
                <q-btn
                  :color="quiz.color"
                  :label="t('app.math.quiz.start')"
                  icon="play_arrow"
                  unelevated
                  class="full-width"
                  @click="activeQuizId = quiz.id"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </template>
    </div>

    <!-- ACTIVE QUIZ -->
    <QuizRunner v-else :key="activeQuizId" :quiz-id="activeQuizId" @exit="activeQuizId = null" />
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import QuizRunner from './QuizRunner.vue'
import { QUIZ_CATALOG } from './quizFactory.js'
import { useLocalized } from 'src/composables/useLocalized'

const { t, tx } = useLocalized()

const groups = computed(() => [
  { key: 'practice', title: '', note: '', quizzes: QUIZ_CATALOG.filter((q) => !q.nvo) },
  {
    key: 'nvo',
    title: t('app.math.quiz.nvoSection'),
    note: t('app.math.quiz.nvoNote'),
    quizzes: QUIZ_CATALOG.filter((q) => q.nvo),
  },
])

const $q = useQuasar()
$q.dark.set(true)

const activeQuizId = ref(null)
</script>

<style scoped>
.dark-page {
  background: #121212;
  min-height: 100vh;
}
.quiz-card {
  display: flex;
  flex-direction: column;
}
.full-height {
  height: 100%;
}
</style>
