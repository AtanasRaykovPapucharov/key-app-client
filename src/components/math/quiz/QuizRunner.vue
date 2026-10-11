<template>
  <div style="max-width: 720px; width: 100%; margin: 0 auto">
    <!-- Sticky header with timer & progress -->
    <q-card flat bordered dark class="bg-dark text-white q-mb-md sticky-header">
      <q-card-section class="row items-center justify-between q-py-sm">
        <div class="row items-center q-gutter-sm">
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            :aria-label="t('app.math.quiz.exit')"
            @click="$emit('exit')"
          />
          <div class="text-h6">{{ tx(quiz.title) }}</div>
        </div>

        <div class="row items-center q-gutter-sm">
          <q-icon name="timer" size="24px" :color="timerColor" />
          <div class="text-h6" :class="`text-${timerColor}`">
            {{ formattedTime }}
          </div>
        </div>
      </q-card-section>

      <q-linear-progress :value="timeProgress" :color="timerColor" size="6px" dark />

      <q-card-section class="q-py-sm">
        <div class="row items-center justify-between">
          <div class="text-caption text-grey-5">
            {{ t('app.math.quiz.answered') }} {{ answeredCount }} / {{ questions.length }}
          </div>
          <q-linear-progress
            :value="answeredCount / questions.length"
            color="primary"
            size="8px"
            dark
            style="width: 60%; border-radius: 4px"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Result banner -->
    <q-banner
      v-if="submitted"
      class="q-mb-md text-white"
      :class="scorePercent >= 50 ? 'bg-green-10' : 'bg-red-10'"
      rounded
    >
      <template #avatar>
        <q-icon
          :name="scorePercent >= 50 ? 'emoji_events' : 'sentiment_dissatisfied'"
          :color="scorePercent >= 50 ? 'green-4' : 'red-4'"
        />
      </template>
      <div class="text-subtitle1">
        {{ t('app.math.quiz.finished') }} <strong>{{ score }} / {{ questions.length }}</strong> ({{
          scorePercent
        }}%)
      </div>
      <div v-if="autoSubmitted" class="text-caption text-grey-4">
        {{ t('app.math.quiz.timeout') }}
      </div>
    </q-banner>

    <!-- Question indicators -->
    <q-tabs
      v-model="slide"
      dense
      outside-arrows
      :mobile-arrows="false"
      active-color="primary"
      indicator-color="primary"
      class="bg-dark text-grey-5 rounded-borders q-mb-sm question-tabs"
    >
      <q-tab v-for="(q, index) in questions" :key="q.id" :name="index" :label="String(index + 1)" />
    </q-tabs>

    <!-- Question carousel -->
    <q-carousel
      v-model="slide"
      animated
      swipeable
      :navigation="false"
      :arrows="false"
      control-color="primary"
      transition-prev="slide-right"
      transition-next="slide-left"
      height="auto"
      class="bg-dark text-white rounded-borders q-mb-sm carousel-shell"
    >
      <q-carousel-slide
        v-for="(q, index) in questions"
        :key="q.id"
        :name="index"
        class="q-pa-md column no-wrap"
      >
        <div class="row items-start no-wrap q-mb-sm">
          <q-chip square color="primary" text-color="white" class="q-mr-sm" size="sm">
            {{ index + 1 }}
          </q-chip>
          <div class="text-subtitle1 q-mt-xs question-text">{{ tx(q.question) }}</div>
        </div>

        <!-- Optional media: image or inline SVG -->
        <div v-if="q.media" class="q-mb-md flex flex-center media-box">
          <q-img
            v-if="q.media.type === 'image'"
            :src="q.media.content"
            style="max-width: 260px"
            class="rounded-borders"
          />
          <div v-else-if="q.media.type === 'svg'" class="svg-wrap" v-html="q.media.content" />
        </div>

        <q-option-group
          v-model="answers[index]"
          :options="optionList(q)"
          type="radio"
          :disable="submitted"
          color="primary"
          dark
        >
          <template #label="opt">
            <span :class="optionClass(q, index, opt.value)">{{ opt.label }}</span>
          </template>
        </q-option-group>

        <div v-if="submitted" class="q-mt-sm">
          <q-icon
            :name="isCorrect(index) ? 'check_circle' : 'cancel'"
            :color="isCorrect(index) ? 'positive' : 'negative'"
            size="18px"
          />
          <span
            class="text-caption q-ml-xs"
            :class="isCorrect(index) ? 'text-positive' : 'text-negative'"
          >
            {{
              isCorrect(index)
                ? t('app.math.quiz.correct')
                : t('app.math.quiz.correctAnswer', { answer: correctLabel(q) })
            }}
          </span>
        </div>
      </q-carousel-slide>
    </q-carousel>

    <!-- Prev / Next navigation -->
    <div class="row items-center justify-between q-mb-lg">
      <q-btn
        flat
        color="grey-4"
        icon="chevron_left"
        :label="t('app.common.actions.previous')"
        :disable="slide === 0"
        @click="prevSlide"
      />
      <div class="text-caption text-grey-5">
        {{ t('app.common.labels.question') }} {{ slide + 1 }} / {{ questions.length }}
      </div>
      <q-btn
        flat
        color="grey-4"
        icon-right="chevron_right"
        :label="t('app.common.actions.next')"
        :disable="slide === questions.length - 1"
        @click="nextSlide"
      />
    </div>

    <!-- Actions -->
    <div class="row justify-between q-mb-xl">
      <q-btn
        v-if="!submitted"
        flat
        color="grey-5"
        :label="t('app.math.quiz.clear')"
        @click="clearAnswers"
      />
      <span v-else />

      <q-btn
        v-if="!submitted"
        color="primary"
        :label="
          t('app.math.quiz.submitCount', { answered: answeredCount, total: questions.length })
        "
        @click="submitQuiz(false)"
        unelevated
      />
      <div v-else class="row q-gutter-sm">
        <q-btn color="grey-8" :label="t('app.math.quiz.back')" @click="$emit('exit')" outline />
        <q-btn
          color="secondary"
          :label="t('app.math.quiz.restart')"
          @click="restartQuiz"
          unelevated
        />
      </div>
    </div>

    <!-- Confirm submit with unanswered questions -->
    <q-dialog v-model="confirmDialog" transition-duration="500">
      <q-card dark class="bg-dark text-white">
        <q-card-section class="text-subtitle1">
          {{ t('app.math.quiz.stillHave') }} {{ questions.length - answeredCount }}
          {{ t('app.math.quiz.unanswered') }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('app.math.quiz.keepWorking')" color="grey-5" v-close-popup />
          <q-btn
            flat
            :label="t('app.common.actions.submit')"
            color="primary"
            v-close-popup
            @click="submitQuiz(false, true)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { createQuiz } from './quizFactory.js'
import { useLocalized } from 'src/composables/useLocalized'

const { t, tx } = useLocalized()

const props = defineProps({
  quizId: { type: String, required: true },
})
// const emit = defineEmits(['exit'])

const $q = useQuasar()

/* -------------------------------------------------------------------- */
/* Quiz instance (built by the factory)                                 */
/* -------------------------------------------------------------------- */

let quiz = createQuiz(props.quizId)
const questions = reactive(quiz.questions)
const answers = reactive(Array(questions.length).fill(null))

/** Options are either primitives (older generators) or { value, label } with a bilingual label. */
function normalizeOption(opt) {
  return typeof opt === 'object' && opt !== null && 'value' in opt
    ? opt
    : { value: opt, label: String(opt) }
}

function optionList(q) {
  return q.options.map(normalizeOption).map((opt) => ({ value: opt.value, label: tx(opt.label) }))
}

function correctLabel(q) {
  const match = q.options.map(normalizeOption).find((opt) => opt.value === q.correctAnswer)
  return match ? tx(match.label) : String(q.correctAnswer)
}

/* -------------------------------------------------------------------- */
/* Carousel navigation                                                  */
/* -------------------------------------------------------------------- */

const slide = ref(0)

function prevSlide() {
  if (slide.value > 0) slide.value--
}

function nextSlide() {
  if (slide.value < questions.length - 1) slide.value++
}

/* -------------------------------------------------------------------- */
/* Timer                                                                 */
/* -------------------------------------------------------------------- */

const totalSeconds = ref(quiz.timeLimitMinutes * 60)
const remainingSeconds = ref(totalSeconds.value)
let timerHandle = null

const formattedTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const timeProgress = computed(() => remainingSeconds.value / totalSeconds.value)

const timerColor = computed(() => {
  if (remainingSeconds.value <= 60) return 'negative'
  if (remainingSeconds.value <= 300) return 'warning'
  return 'primary'
})

function startTimer() {
  if (timerHandle) clearInterval(timerHandle)
  timerHandle = setInterval(() => {
    if (submitted.value) {
      clearInterval(timerHandle)
      return
    }
    if (remainingSeconds.value > 0) remainingSeconds.value--
    if (remainingSeconds.value === 0) submitQuiz(true)
  }, 1000)
}

onMounted(() => startTimer())
onUnmounted(() => {
  if (timerHandle) clearInterval(timerHandle)
})

/* -------------------------------------------------------------------- */
/* Submission / scoring                                                 */
/* -------------------------------------------------------------------- */

const submitted = ref(false)
const autoSubmitted = ref(false)
const confirmDialog = ref(false)

const answeredCount = computed(() => answers.filter((a) => a !== null).length)

function isCorrect(index) {
  return answers[index] === questions[index].correctAnswer
}

const score = computed(() => questions.reduce((sum, _, idx) => sum + (isCorrect(idx) ? 1 : 0), 0))
const scorePercent = computed(() => Math.round((score.value / questions.length) * 100))

function submitQuiz(fromTimeout = false, skipConfirm = false) {
  if (!fromTimeout && !skipConfirm && answeredCount.value < questions.length) {
    confirmDialog.value = true
    return
  }
  submitted.value = true
  autoSubmitted.value = fromTimeout
  if (timerHandle) clearInterval(timerHandle)

  $q.notify({
    message: fromTimeout ? t('app.math.quiz.timeUp') : t('app.math.quiz.submitted'),
    color: fromTimeout ? 'negative' : 'positive',
    icon: fromTimeout ? 'alarm' : 'check_circle',
    position: 'top-left',
  })
}

function clearAnswers() {
  for (let i = 0; i < answers.length; i++) answers[i] = null
}

function restartQuiz() {
  quiz = createQuiz(props.quizId)
  questions.splice(0, questions.length, ...quiz.questions)
  clearAnswers()
  submitted.value = false
  autoSubmitted.value = false
  slide.value = 0
  totalSeconds.value = quiz.timeLimitMinutes * 60
  remainingSeconds.value = totalSeconds.value
  startTimer()
}

/* -------------------------------------------------------------------- */
/* Styling helpers                                                       */
/* -------------------------------------------------------------------- */

function optionClass(q, index, optionValue) {
  if (!submitted.value) return ''
  const isThisCorrect = optionValue === q.correctAnswer
  const isSelected = answers[index] === optionValue
  if (isThisCorrect) return 'text-positive text-weight-bold'
  if (isSelected && !isThisCorrect) return 'text-negative text-strike'
  return ''
}
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
}
.question-text {
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.text-strike {
  text-decoration: line-through;
}
.media-box {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 8px;
}
.svg-wrap :deep(svg) {
  max-width: 260px;
  width: 100%;
  height: auto;
}
.carousel-shell {
  border: 1px solid rgba(255, 255, 255, 0.12);
  min-height: 320px;
}
.carousel-shell :deep(.q-carousel__slide) {
  overflow-y: auto;
}
</style>
