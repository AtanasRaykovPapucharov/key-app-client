<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useUserStore } from 'src/stores/user'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const $q = useQuasar()
const userStore = useUserStore()

const schedulerTypes = [
  {
    value: 'user',
    get label() {
      return t('app.crypto.scheduler.reminder')
    },
  },
  {
    value: 'system',
    get label() {
      return t('app.crypto.scheduler.system')
    },
  },
  {
    value: 'strategy',
    get label() {
      return t('app.crypto.scheduler.strategyEvent')
    },
  },
]

const availableSchedulerTypes = computed(() =>
  schedulerTypes.filter((type) => type.value !== 'system' || userStore.user?.admin === true),
)

const recurrenceOptions = [
  {
    value: 'date-time',
    get label() {
      return t('app.crypto.scheduler.dateTime')
    },
  },
  {
    value: 'minutes',
    get label() {
      return t('app.crypto.scheduler.minutes')
    },
  },
  {
    value: 'hours',
    get label() {
      return t('app.crypto.scheduler.hours')
    },
  },
  {
    value: 'daily',
    get label() {
      return t('app.crypto.scheduler.daily')
    },
  },
  {
    value: 'weekly',
    get label() {
      return t('app.crypto.scheduler.weekly')
    },
  },
  {
    value: 'monthly',
    get label() {
      return t('app.crypto.scheduler.monthly')
    },
  },
  {
    value: 'cron',
    get label() {
      return t('app.crypto.scheduler.cronAdvanced')
    },
  },
]

const cronPresets = [
  {
    get label() {
      return t('app.crypto.scheduler.every5')
    },
    value: '*/5 * * * *',
  },
  {
    get label() {
      return t('app.crypto.scheduler.weekdays9')
    },
    value: '0 9 * * 1-5',
  },
  {
    get label() {
      return t('app.crypto.scheduler.sunday20')
    },
    value: '0 20 * * 0',
  },
  {
    get label() {
      return t('app.crypto.scheduler.firstDay')
    },
    value: '0 0 1 * *',
  },
]

const getDefaultDate = () => new Date().toISOString().slice(0, 10)
const getDefaultTime = () => '09:00'

const mapEntry = (entry) => ({
  id: entry.id,
  title: entry.title || '',
  type: entry.schedule_type || entry.type || 'user',
  recurrence: entry.recurrence || 'date-time',
  cronExpression: entry.cron_expression || entry.cronExpression || '',
  intervalValue: Number(entry.interval_value ?? entry.intervalValue ?? 1),
  date: entry.schedule_date || '',
  time: entry.schedule_time || '',
  condition: entry.trigger_condition || '',
  details: entry.details || '',
  enabled: entry.enabled !== false,
  createdAt: entry.created_at,
  updatedAt: entry.updated_at,
})

const scheduleListOpen = ref(false)
const entries = ref([])
const query = ref('')
const now = ref(Date.now())
const lastCheckedAt = ref(now.value)
const deleteCandidate = ref(null)
const deleteDialogOpen = ref(false)
let countdownTimer
const form = ref({
  id: null,
  title: '',
  type: 'user',
  recurrence: 'date-time',
  cronExpression: '',
  intervalValue: 15,
  date: getDefaultDate(),
  time: getDefaultTime(),
  condition: '',
  details: '',
  enabled: true,
})
const selectedCronPreset = ref(null)

const loadEntries = async () => {
  try {
    const uid = userStore.user?.uid
    if (!uid) {
      entries.value = []
      return
    }

    const { data } = await api.get('/scheduler', {
      withCredentials: true,
      headers: { 'x-uid': uid },
    })
    entries.value = Array.isArray(data) ? data.map(mapEntry) : []
  } catch (error) {
    console.error('Failed to load scheduler entries', error)
    entries.value = []
    $q.notify({
      type: 'negative',
      message: t('app.crypto.scheduler.loadFailed'),
      position: 'top-left',
    })
  }
}

const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    type: 'user',
    recurrence: 'date-time',
    cronExpression: '',
    intervalValue: 15,
    date: getDefaultDate(),
    time: getDefaultTime(),
    condition: '',
    details: '',
    enabled: true,
  }
  selectedCronPreset.value = null
}

const upsertEntry = async () => {
  const title = form.value.title?.trim()
  if (!title) {
    $q.notify({
      type: 'negative',
      message: t('app.crypto.scheduler.titleRequired'),
      position: 'top-left',
    })
    return
  }

  const uid = userStore.user?.uid
  if (!uid) {
    $q.notify({
      type: 'negative',
      message: t('app.crypto.scheduler.sessionRequired'),
      position: 'top-left',
    })
    return
  }

  if (form.value.recurrence === 'cron' && !validateCronInput()) return

  const payload = {
    title,
    schedule_type: form.value.type,
    recurrence: form.value.recurrence,
    cron_expression: form.value.recurrence === 'cron' ? form.value.cronExpression.trim() : null,
    interval_value: Number(form.value.intervalValue) || 1,
    schedule_date:
      form.value.recurrence === 'date-time' ? form.value.date || getDefaultDate() : null,
    schedule_time:
      form.value.recurrence === 'date-time' ? form.value.time || getDefaultTime() : null,
    trigger_condition: form.value.condition?.trim() || '',
    details: form.value.details?.trim() || '',
    enabled: Boolean(form.value.enabled),
  }

  try {
    const isUpdate = Boolean(form.value.id)
    let response
    if (isUpdate) {
      response = await api.put(`/scheduler/${form.value.id}`, payload, {
        withCredentials: true,
        headers: { 'x-uid': uid },
      })
    } else {
      response = await api.post('/scheduler', payload, {
        withCredentials: true,
        headers: { 'x-uid': uid },
      })
    }

    const saved = mapEntry(response?.data?.data || response?.data)
    const index = entries.value.findIndex((entry) => entry.id === saved.id)
    if (index >= 0) {
      entries.value.splice(index, 1, saved)
    } else {
      entries.value.unshift(saved)
    }

    resetForm()
    $q.notify({
      type: 'positive',
      message: isUpdate ? 'Scheduler updated.' : 'Scheduler created.',
      position: 'top-left',
    })
  } catch (error) {
    console.error('Failed to save scheduler entry', error)
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.error || 'Unable to save scheduler entry.',
      position: 'top-left',
    })
  }
}

const editEntry = (entry) => {
  form.value = {
    id: entry.id,
    title: entry.title || '',
    type: entry.type || 'user',
    recurrence: entry.recurrence || 'date-time',
    cronExpression: entry.cronExpression || '',
    intervalValue: Number(entry.intervalValue) || 1,
    date: entry.date || getDefaultDate(),
    time: entry.time || getDefaultTime(),
    condition: entry.condition || '',
    details: entry.details || '',
    enabled: entry.enabled !== false,
  }
  selectedCronPreset.value = entry.cronExpression || null
  scheduleListOpen.value = false
}

const requestDelete = (entry) => {
  deleteCandidate.value = entry
  deleteDialogOpen.value = true
}

const confirmDelete = async () => {
  const entry = deleteCandidate.value
  deleteDialogOpen.value = false
  deleteCandidate.value = null
  if (entry) await deleteEntry(entry.id)
}

const deleteEntry = async (entryId) => {
  const uid = userStore.user?.uid
  if (!uid) return

  try {
    await api.delete(`/scheduler/${entryId}`, {
      withCredentials: true,
      headers: { 'x-uid': uid },
    })

    entries.value = entries.value.filter((entry) => entry.id !== entryId)

    if (form.value.id === entryId) {
      resetForm()
    }
  } catch (error) {
    console.error('Failed to delete scheduler entry', error)
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.error || 'Unable to delete scheduler entry.',
      position: 'top-left',
    })
  }
}

const filteredEntries = computed(() => {
  const text = query.value.trim().toLowerCase()
  return entries.value.filter((entry) => {
    if (!text) return true
    return [
      entry.title,
      entry.type,
      entry.recurrence,
      entry.cronExpression,
      entry.details,
      entry.condition,
    ]
      .join(' ')
      .toLowerCase()
      .includes(text)
  })
})

const formatEntryLabel = (entry) => {
  if (entry.recurrence === 'cron') return `Cron: ${entry.cronExpression || 'not configured'}`
  if (entry.recurrence === 'date-time') {
    return `${entry.date || getDefaultDate()} ${entry.time || getDefaultTime()}`
  }

  if (entry.recurrence === 'minutes') return `Every ${entry.intervalValue || 1} minute(s)`
  if (entry.recurrence === 'hours') return `Every ${entry.intervalValue || 1} hour(s)`
  if (entry.recurrence === 'daily') return 'Daily'
  if (entry.recurrence === 'weekly') return 'Weekly'
  if (entry.recurrence === 'monthly') return 'Monthly'

  return 'Scheduled'
}

const parseCronPart = (value, min, max) => {
  const values = new Set()
  for (const token of value.split(',')) {
    const [rangePart, stepPart] = token.split('/')
    const step = Number(stepPart || 1)
    if (!Number.isInteger(step) || step < 1) return null

    let start = min
    let end = max
    if (rangePart !== '*') {
      const range = rangePart.split('-').map(Number)
      if (range.some((item) => !Number.isInteger(item))) return null
      start = range[0]
      end = range[1] ?? start
    }

    if (start < min || end > max || start > end) return null
    for (let item = start; item <= end; item += step) values.add(item)
  }
  return values
}

const getCronParts = (expression) => {
  if (!expression.trim()) return null
  const fields = expression.trim().split(/\s+/)
  if (fields.length !== 5) return null

  const ranges = [
    [0, 59],
    [0, 23],
    [1, 31],
    [1, 12],
    [0, 7],
  ]
  const parts = fields.map((field, index) => parseCronPart(field, ...ranges[index]))
  return parts.some((part) => !part) ? null : parts
}

const cronValidation = computed(() => {
  const expression = form.value.cronExpression.trim()
  const suggestion = cronPresets[0].value
  if (!expression) {
    return {
      valid: false,
      message: t('app.crypto.scheduler.fiveFields'),
      suggestion,
    }
  }

  if (!getCronParts(expression)) {
    return {
      valid: false,
      message: t('app.crypto.scheduler.validFields'),
      suggestion,
    }
  }

  const preset = cronPresets.find((item) => item.value === expression)
  if (preset) return { valid: true, message: preset.label }

  const [minute, hour, day, month, weekday] = expression.split(/\s+/)
  const c = (key, value) => t(`app.crypto.scheduler.cronParts.${key}`, { value })
  const minuteMeaning = minute === '*' ? c('everyMinute') : c('atMinute', minute)
  const hourMeaning = hour === '*' ? c('everyHour') : c('atHour', hour)
  const dayMeaning = day === '*' ? c('everyDay') : c('onDay', day)
  const monthMeaning = month === '*' ? c('everyMonth') : c('inMonth', month)
  const weekdayMeaning = weekday === '*' ? '' : c('weekday', weekday)

  return {
    valid: true,
    message: `${minuteMeaning}, ${hourMeaning}, ${dayMeaning}, ${monthMeaning}${weekdayMeaning}`,
  }
})

const validateCronInput = ({ silent = false } = {}) => {
  if (cronValidation.value.valid) return true
  if (silent) return false

  $q.notify({
    type: 'negative',
    position: 'top-left',
    message: t('app.crypto.scheduler.invalidCron'),
    caption: t('app.crypto.scheduler.suggested', {
      message: cronValidation.value.message,
      suggestion: cronValidation.value.suggestion,
    }),
    actions: [
      {
        get label() {
          return t('app.crypto.scheduler.useSuggestion')
        },
        color: 'white',
        handler: () => {
          form.value.cronExpression = cronValidation.value.suggestion
        },
      },
    ],
  })
  return false
}

const getNextCronRun = (expression, from) => {
  const parts = getCronParts(expression)
  if (!parts) return null

  const candidate = new Date(from)
  candidate.setSeconds(0, 0)
  candidate.setMinutes(candidate.getMinutes() + 1)

  for (let minute = 0; minute < 366 * 24 * 60; minute += 1) {
    const dayOfWeek = candidate.getDay()
    const cronDay = dayOfWeek === 0 ? 7 : dayOfWeek
    const dayMatches = parts[4].has(dayOfWeek) || parts[4].has(cronDay)
    if (
      parts[0].has(candidate.getMinutes()) &&
      parts[1].has(candidate.getHours()) &&
      parts[2].has(candidate.getDate()) &&
      parts[3].has(candidate.getMonth() + 1) &&
      dayMatches
    ) {
      return candidate
    }
    candidate.setMinutes(candidate.getMinutes() + 1)
  }
  return null
}

const getNextRun = (entry, timestamp = now.value) => {
  if (!entry.enabled) return null
  const current = new Date(timestamp)

  if (entry.recurrence === 'cron') return getNextCronRun(entry.cronExpression, current)

  if (entry.recurrence === 'minutes') {
    const interval = entry.intervalValue || 1
    const currentMinute = Math.floor(timestamp / 60000)
    return new Date((Math.floor(currentMinute / interval) + 1) * interval * 60000)
  }

  if (entry.recurrence === 'hours') {
    const interval = entry.intervalValue || 1
    const currentHour = Math.floor(timestamp / 3600000)
    return new Date((Math.floor(currentHour / interval) + 1) * interval * 3600000)
  }

  const next = new Date(current)
  const [hours, minutes] = (entry.time || '09:00').split(':').map(Number)
  next.setHours(hours || 0, minutes || 0, 0, 0)

  if (entry.recurrence === 'date-time') {
    const scheduled = new Date(
      `${entry.date || getDefaultDate()}T${entry.time || getDefaultTime()}`,
    )
    return scheduled > current ? scheduled : null
  }

  if (entry.recurrence === 'daily') {
    if (next <= current) next.setDate(next.getDate() + 1)
    return next
  }

  if (entry.recurrence === 'weekly') {
    const daysUntilMonday = (8 - next.getDay()) % 7
    next.setDate(next.getDate() + daysUntilMonday)
    if (next <= current) next.setDate(next.getDate() + 7)
    return next
  }

  if (entry.recurrence === 'monthly') {
    next.setDate(1)
    if (next <= current) next.setMonth(next.getMonth() + 1)
    return next
  }

  return null
}

const formatCountdown = (entry) => {
  if (!entry.enabled) return 'Paused'
  const nextRun = getNextRun(entry)
  if (!nextRun) return 'Completed'

  const seconds = Math.max(0, Math.ceil((nextRun.getTime() - now.value) / 1000))
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  const clock = [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
  return days > 0 ? `${days}d ${clock}` : clock
}

const notifyDueEntries = (previousTimestamp, currentTimestamp) => {
  entries.value.forEach((entry) => {
    if (!entry.enabled) return

    const nextRun = getNextRun(entry, previousTimestamp)
    if (!nextRun) return

    const dueAt = nextRun.getTime()
    if (dueAt <= previousTimestamp || dueAt > currentTimestamp) return

    $q.notify({
      type: entry.type === 'strategy' ? 'warning' : 'positive',
      position: 'top-left',
      icon: 'alarm',
      message: t('app.crypto.scheduler.eventFired', { title: entry.title }),
      caption: entry.details || formatEntryLabel(entry),
      timeout: 6000,
    })
  })
}

const cronPreview = computed(() => {
  if (!form.value.cronExpression.trim()) return 'Choose a preset or enter a cron expression.'
  return cronValidation.value.message
})

onMounted(() => {
  void loadEntries()
  countdownTimer = window.setInterval(() => {
    const currentTimestamp = Date.now()
    notifyDueEntries(lastCheckedAt.value, currentTimestamp)
    lastCheckedAt.value = currentTimestamp
    now.value = currentTimestamp
  }, 1000)
})

onUnmounted(() => {
  window.clearInterval(countdownTimer)
})
</script>

<template>
  <div class="scheduler q-pa-md">
    <div class="scheduler__intro q-mb-md">
      <div>
        <div class="text-overline text-primary">{{ t('app.crypto.scheduler.heading') }}</div>
        <!-- <div class="text-h5 text-white text-weight-bold">Schedule an action</div>
        <div class="text-body2 text-grey-5">
          Build quick reminders or precise recurring jobs without losing the context of when they
          run.
        </div> -->
      </div>
      <q-chip
        dense
        clickable
        :color="!scheduleListOpen ? 'grey-8' : 'green-6'"
        text-color="grey-3"
        :icon="scheduleListOpen ? 'visibility' : 'visibility_off'"
        @click="scheduleListOpen = !scheduleListOpen"
      >
        {{ entries.filter((entry) => entry.enabled).length }} active
      </q-chip>
    </div>

    <div class="column q-col-gutter-md">
      <q-card v-if="!scheduleListOpen" class="scheduler-card scheduler-card--form q-pa-md">
        <div class="row items-center justify-between q-mb-md">
          <div>
            <div class="text-subtitle1 text-weight-bold text-white">
              {{ form.id ? 'Edit schedule' : 'New schedule' }}
            </div>
            <div class="text-caption text-grey-5">{{ t('app.crypto.scheduler.intro') }}</div>
          </div>
          <q-icon
            :name="form.recurrence === 'cron' ? 'tune' : 'event_repeat'"
            color="primary"
            size="sm"
          />
        </div>

        <div class="row q-gutter-sm">
          <div class="col-12 col-md">
            <q-input
              v-model="form.title"
              :label="t('app.common.labels.title')"
              dense
              outlined
              dark
              class="q-mb-sm"
            />
          </div>
          <div class="col-12 col-md">
            <q-select
              v-model="form.type"
              :options="availableSchedulerTypes"
              emit-value
              map-options
              popup-content-class="scheduler-select-menu"
              behavior="menu"
              :menu-offset="[0, 4]"
              :label="t('app.crypto.scheduler.source')"
              dense
              outlined
              dark
              class="q-mb-sm"
            />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <q-input
            v-if="['minutes', 'hours'].includes(form.recurrence)"
            v-model.number="form.intervalValue"
            type="number"
            min="1"
            :label="t('app.common.labels.every')"
            dense
            outlined
            dark
            class="col-12 col-md-6"
          />
          <div v-else class="col-12 col-md-6" />
          <q-select
            v-model="form.recurrence"
            :options="recurrenceOptions"
            emit-value
            map-options
            popup-content-class="scheduler-select-menu"
            behavior="menu"
            :menu-offset="[0, 4]"
            :label="t('app.crypto.scheduler.mode')"
            dense
            outlined
            dark
            class="col-12 col-md-6"
          />
        </div>

        <div v-if="form.recurrence === 'cron'" class="cron-builder q-mt-sm">
          <q-select
            v-model="selectedCronPreset"
            :options="cronPresets"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            popup-content-class="scheduler-select-menu"
            behavior="menu"
            :menu-offset="[0, 4]"
            :label="t('app.crypto.scheduler.preset')"
            dense
            outlined
            dark
            clearable
            @update:model-value="(preset) => (form.cronExpression = preset || '')"
          />
          <q-input
            v-model="form.cronExpression"
            :label="t('app.crypto.scheduler.cron')"
            placeholder="*/5 * * * *"
            :hint="t('app.crypto.scheduler.cronHint')"
            :error="form.recurrence === 'cron' && !cronValidation.valid"
            :error-message="form.recurrence === 'cron' ? cronValidation.message : ''"
            @blur="form.recurrence === 'cron' && form.cronExpression.trim() && validateCronInput()"
            dense
            outlined
            dark
            class="q-mt-sm"
          />
          <div class="cron-preview q-mt-sm">
            <q-icon name="bolt" :color="cronValidation.valid ? 'amber' : 'negative'" size="xs" />
            <span>{{ cronPreview }}</span>
          </div>
        </div>

        <div v-if="form.recurrence === 'date-time'" class="row q-col-gutter-sm q-mt-none">
          <q-input
            v-model="form.date"
            type="date"
            :label="t('app.common.labels.date')"
            dense
            outlined
            dark
            class="col"
          />
          <q-input
            v-model="form.time"
            type="time"
            :label="t('app.common.labels.time')"
            dense
            outlined
            dark
            class="col"
          />
        </div>

        <q-input
          v-model="form.condition"
          :label="t('app.crypto.scheduler.condition')"
          dense
          outlined
          dark
          class="q-mt-sm"
          :hint="t('app.crypto.scheduler.conditionHint')"
        />

        <q-input
          v-model="form.details"
          type="textarea"
          :label="t('app.crypto.scheduler.details')"
          autogrow
          outlined
          dark
          class="q-mt-sm"
        />

        <q-toggle
          v-model="form.enabled"
          :label="t('app.common.labels.enabled')"
          color="primary"
          class="q-mt-sm"
        />

        <div class="row justify-end q-gutter-sm q-mt-sm">
          <q-btn flat :label="t('app.common.actions.reset')" color="secondary" @click="resetForm" />
          <q-btn
            color="primary"
            :label="form.id ? 'Update' : 'Add scheduler'"
            @click="upsertEntry"
          />
        </div>
      </q-card>

      <q-card v-else class="scheduler-card q-pa-md">
        <div class="row items-center justify-between q-mb-sm">
          <div>
            <div class="text-subtitle1 text-weight-bold text-white">
              {{ t('app.crypto.scheduler.yours') }}
            </div>
            <div class="text-caption text-grey-5">
              {{ filteredEntries.length }} {{ t('app.common.labels.shownLower') }}
            </div>
          </div>
          <q-input
            v-model="query"
            dense
            outlined
            dark
            clearable
            :label="t('app.common.actions.search')"
            style="min-width: 180px"
          />
        </div>

        <q-list separator dark>
          <q-item v-for="entry in filteredEntries" :key="entry.id">
            <q-item-section>
              <div class="row items-start justify-between q-gutter-sm scheduler-entry-row">
                <div class="col">
                  <div class="row items-center q-gutter-sm">
                    <span class="text-weight-medium text-white">{{ entry.title }}</span>
                    <q-badge :color="entry.enabled ? 'positive' : 'grey-7'" rounded>
                      {{ entry.type }}
                    </q-badge>
                  </div>

                  <div class="text-caption text-grey-5 q-mt-xs">
                    {{ formatEntryLabel(entry) }}
                  </div>

                  <div
                    class="scheduler-countdown q-mt-sm"
                    :class="{ 'scheduler-countdown--paused': !entry.enabled }"
                  >
                    <q-icon name="timer" size="xs" />
                    <span>{{ entry.enabled ? 'Next run in' : 'Schedule paused' }}</span>
                    <strong v-if="entry.enabled">{{ formatCountdown(entry) }}</strong>
                  </div>

                  <div v-if="entry.condition" class="text-body2 text-blue-3 q-mt-xs">
                    {{ t('app.crypto.scheduler.conditionColon') }} {{ entry.condition }}
                  </div>

                  <div v-if="entry.details" class="text-body2 text-grey-3 q-mt-xs">
                    {{ entry.details }}
                  </div>
                </div>

                <div class="row q-gutter-xs scheduler-entry-actions">
                  <q-btn flat round dense icon="edit" color="secondary" @click="editEntry(entry)" />
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    color="negative"
                    @click="requestDelete(entry)"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>

          <q-item v-if="!filteredEntries.length">
            <q-item-section class="text-grey-5">
              {{ t('app.crypto.scheduler.noMatch') }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <q-dialog
      v-model="deleteDialogOpen"
      persistent
      transition-duration="500"
      @hide="deleteCandidate = null"
    >
      <q-card class="delete-dialog">
        <div class="delete-dialog__accent" />
        <q-card-section class="row items-start no-wrap q-gutter-md">
          <div class="delete-dialog__icon">
            <q-icon name="delete_forever" size="24px" />
          </div>
          <div class="col">
            <div class="text-h6 text-white text-weight-bold">
              {{ t('app.crypto.scheduler.deleteConfirm') }}
            </div>
            <div class="text-body2 text-grey-5 q-mt-xs">
              {{ t('app.common.confirm.deleteMessage') }}
            </div>
          </div>
          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </q-card-section>

        <q-card-section class="delete-dialog__summary q-mx-md q-mb-md">
          <div class="text-weight-medium text-white">
            {{ deleteCandidate?.title || 'Untitled schedule' }}
          </div>
          <div class="text-caption text-grey-5 q-mt-xs">
            {{ deleteCandidate ? formatEntryLabel(deleteCandidate) : '' }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md q-gutter-sm">
          <q-btn flat :label="t('app.crypto.scheduler.keep')" color="grey-4" v-close-popup />
          <q-btn
            unelevated
            :label="t('app.crypto.scheduler.delete')"
            color="negative"
            icon="delete"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.scheduler {
  min-height: 100%;
  background: radial-gradient(circle at 100% 0%, rgba(179, 0, 0, 0.14), transparent 34%), #1b1d20;
}

:global(.scheduler-select-menu) {
  z-index: 7000 !important;
  max-height: min(320px, calc(100vh - 180px));
}

.scheduler__intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.scheduler-card {
  width: calc(100% - 16px);
  margin: 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(34, 36, 40, 0.94);
  border-radius: 8px;
}

.scheduler-card--form {
  border-top: 2px solid var(--q-primary, #b30000);
}

.cron-builder {
  padding: 12px;
  border: 1px solid rgba(156, 39, 176, 0.35);
  border-radius: 6px;
  background: rgba(156, 39, 176, 0.08);
}

.cron-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e0c2ea;
  font-size: 12px;
}

.scheduler-countdown {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid rgba(23, 150, 175, 0.35);
  border-radius: 4px;
  color: #9fdce6;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.scheduler-countdown strong {
  color: #ffffff;
  letter-spacing: 0.04em;
}

.scheduler-countdown--paused {
  border-color: rgba(255, 255, 255, 0.12);
  color: #898d92;
}

.scheduler-entry-actions {
  flex-shrink: 0;
}

/* native date/time picker icon defaults to black, invisible on dark inputs */
.scheduler-card :deep(input[type='date'])::-webkit-calendar-picker-indicator,
.scheduler-card :deep(input[type='time'])::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  transform: scale(1.6);
}

@media (max-width: 599px) {
  .scheduler-entry-row {
    flex-wrap: wrap;
  }

  .scheduler-entry-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

.delete-dialog {
  width: min(420px, calc(100vw - 32px));
  overflow: hidden;
  border: 1px solid rgba(255, 82, 82, 0.38);
  border-radius: 10px;
  background: #24262a;
}

.delete-dialog__accent {
  height: 3px;
  background: #ff5252;
}

.delete-dialog__icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  place-items: center;
  border: 1px solid rgba(255, 82, 82, 0.35);
  border-radius: 50%;
  color: #ff7676;
  background: rgba(255, 82, 82, 0.1);
}

.delete-dialog__summary {
  padding: 12px;
  border-left: 3px solid #ff5252;
  background: rgba(255, 82, 82, 0.07);
}

@media (min-width: 900px) {
  .scheduler__intro,
  .scheduler-card {
    width: calc(100% - 32px);
    max-width: 1240px;
    margin-right: auto;
    margin-left: auto;
  }
}
</style>
