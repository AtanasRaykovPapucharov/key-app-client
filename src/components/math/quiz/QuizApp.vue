<template>
  <q-page class="q-pa-md dark-page">
    <!-- MENU: quiz selection cards -->
    <div v-if="!activeQuizId" style="max-width: 960px; margin: 0 auto;">
      <div class="text-h5 text-white q-mb-xs">Choose a Quiz</div>
      <div class="text-body2 text-grey-5 q-mb-lg">
        Pick a quiz to begin. Each one has its own time limit and difficulty.
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="quiz in QUIZ_CATALOG" :key="quiz.id" class="col-12 col-md-4">
          <q-card flat bordered dark class="bg-dark text-white full-height quiz-card">
            <q-card-section class="text-center">
              <q-icon :name="quiz.icon" :color="quiz.color" size="48px" class="q-mb-sm" />
              <div class="text-h6">{{ quiz.title }}</div>
              <q-badge :color="quiz.color" class="q-mt-xs">{{ quiz.difficulty }}</q-badge>
            </q-card-section>

            <q-card-section class="text-body2 text-grey-5 text-center">
              {{ quiz.description }}
            </q-card-section>

            <q-card-section class="row justify-center text-caption text-grey-6 q-gutter-md">
              <div class="row items-center q-gutter-xs">
                <q-icon name="quiz" size="16px" />
                {{ quiz.questionCount }} questions
              </div>
              <div class="row items-center q-gutter-xs">
                <q-icon name="schedule" size="16px" />
                {{ quiz.timeLimitMinutes }} min
              </div>
            </q-card-section>

            <q-card-actions class="q-pa-md">
              <q-btn
                :color="quiz.color"
                label="Start Quiz"
                icon="play_arrow"
                unelevated
                class="full-width"
                @click="activeQuizId = quiz.id"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- ACTIVE QUIZ -->
    <QuizRunner
      v-else
      :key="activeQuizId"
      :quiz-id="activeQuizId"
      @exit="activeQuizId = null"
    />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import QuizRunner from './QuizRunner.vue'
import { QUIZ_CATALOG } from './quizFactory.js'

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
