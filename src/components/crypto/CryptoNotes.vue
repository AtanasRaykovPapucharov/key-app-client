<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

const $q = useQuasar()
const STORAGE_KEY = 'cryptool:trader:notes'

const notes = ref([])
const query = ref('')
const listOpen = ref(false)
const deleteCandidate = ref(null)
const deleteDialogOpen = ref(false)
const form = ref({
  id: null,
  title: '',
  content: '',
})

const createLocalId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

const loadNotes = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    notes.value = Array.isArray(raw) ? raw : []
  } catch (error) {
    console.error('Failed to load notes', error)
    notes.value = []
  }
}

const persistNotes = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.value))
}

const resetForm = () => {
  form.value = {
    id: null,
    title: '',
    content: '',
  }
}

const upsertNote = () => {
  const title = form.value.title?.trim()
  const content = form.value.content?.trim()

  if (!title && !content) {
    $q.notify({ type: 'negative', message: t('app.crypto.notes.emptyError') })
    return
  }

  const item = {
    id: form.value.id || createLocalId(),
    title: title || 'Untitled note',
    content: content || '',
    createdAt: form.value.id
      ? notes.value.find((note) => note.id === form.value.id)?.createdAt || new Date().toISOString()
      : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const index = notes.value.findIndex((note) => note.id === item.id)
  if (index >= 0) {
    notes.value.splice(index, 1, item)
  } else {
    notes.value.unshift(item)
  }

  persistNotes()
  resetForm()
  $q.notify({
    type: 'positive',
    message: index >= 0 ? 'Note updated.' : 'Note added.',
    position: 'top-left',
  })
}

const editNote = (entry) => {
  form.value = {
    id: entry.id,
    title: entry.title || '',
    content: entry.content || '',
  }
  listOpen.value = false
}

const requestDelete = (entry) => {
  deleteCandidate.value = entry
  deleteDialogOpen.value = true
}

const confirmDelete = () => {
  const entry = deleteCandidate.value
  deleteDialogOpen.value = false
  deleteCandidate.value = null
  if (!entry) return

  notes.value = notes.value.filter((note) => note.id !== entry.id)
  persistNotes()

  if (form.value.id === entry.id) {
    resetForm()
  }
}

const filteredNotes = computed(() => {
  const value = query.value.trim().toLowerCase()
  return notes.value.filter((entry) => {
    if (!value) return true
    return `${entry.title} ${entry.content}`.toLowerCase().includes(value)
  })
})

const formatDate = (timestamp) => {
  if (!timestamp) return 'No date'
  return new Date(timestamp).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

onMounted(() => {
  loadNotes()
})
</script>

<template>
  <div class="notes q-pa-md">
    <div class="notes__intro q-mb-md">
      <div>
        <div class="text-overline text-primary">{{ t('app.crypto.notes.heading') }}</div>
      </div>
      <q-chip
        dense
        clickable
        :color="!listOpen ? 'grey-8' : 'green-6'"
        text-color="grey-3"
        :icon="listOpen ? 'visibility' : 'visibility_off'"
        @click="listOpen = !listOpen"
      >
        {{ notes.length }} {{ t('app.common.labels.savedLower') }}
      </q-chip>
    </div>

    <div class="column q-col-gutter-md">
      <q-card v-if="!listOpen" class="notes-card notes-card--form q-pa-md">
        <div class="row items-center justify-between q-mb-md">
          <div>
            <div class="text-subtitle1 text-weight-bold text-white">
              {{ form.id ? 'Edit note' : 'New note' }}
            </div>
            <div class="text-caption text-grey-5">{{ t('app.crypto.notes.intro') }}</div>
          </div>
          <q-icon name="edit_note" color="primary" size="sm" />
        </div>

        <q-input
          v-model="form.title"
          :label="t('app.common.labels.title')"
          dense
          outlined
          dark
          class="q-mb-sm"
        />

        <q-input
          v-model="form.content"
          type="textarea"
          :label="t('app.crypto.notes.body')"
          autogrow
          outlined
          dark
        />

        <div class="row justify-end q-gutter-sm q-mt-sm">
          <q-btn flat :label="t('app.common.actions.reset')" color="secondary" @click="resetForm" />
          <q-btn color="primary" :label="form.id ? 'Save note' : 'Add note'" @click="upsertNote" />
        </div>
      </q-card>

      <q-card v-else class="notes-card q-pa-md">
        <div class="row items-center justify-between q-mb-sm">
          <div>
            <div class="text-subtitle1 text-weight-bold text-white">
              {{ t('app.crypto.notes.saved') }}
            </div>
            <div class="text-caption text-grey-5">
              {{ filteredNotes.length }} {{ t('app.common.labels.shownLower') }}
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
          <q-item v-for="entry in filteredNotes" :key="entry.id" class="q-py-md">
            <q-item-section>
              <div class="row items-start justify-between q-gutter-sm">
                <div class="col">
                  <div class="text-weight-medium text-white">
                    {{ entry.title || 'Untitled note' }}
                  </div>

                  <div class="text-caption text-grey-5 q-mt-xs">
                    {{ formatDate(entry.updatedAt || entry.createdAt) }}
                  </div>

                  <div class="text-body2 text-grey-3 q-mt-sm">
                    {{ entry.content || 'No content saved yet.' }}
                  </div>
                </div>

                <div class="row q-gutter-xs">
                  <q-btn flat round dense icon="edit" color="secondary" @click="editNote(entry)" />
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

          <q-item v-if="!filteredNotes.length">
            <q-item-section class="text-grey-5">
              {{ t('app.crypto.notes.noMatch') }}
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
              {{ t('app.crypto.notes.deleteConfirm') }}
            </div>
            <div class="text-body2 text-grey-5 q-mt-xs">
              {{ t('app.common.confirm.deleteMessage') }}
            </div>
          </div>
          <q-btn flat round dense icon="close" color="grey-5" v-close-popup />
        </q-card-section>

        <q-card-section class="delete-dialog__summary q-mx-md q-mb-md">
          <div class="text-weight-medium text-white">
            {{ deleteCandidate?.title || 'Untitled note' }}
          </div>
          <div class="text-caption text-grey-5 q-mt-xs">
            {{
              deleteCandidate
                ? formatDate(deleteCandidate.updatedAt || deleteCandidate.createdAt)
                : ''
            }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md q-gutter-sm">
          <q-btn flat :label="t('app.crypto.notes.keep')" color="grey-4" v-close-popup />
          <q-btn
            unelevated
            :label="t('app.crypto.notes.delete')"
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
.notes {
  min-height: 100%;
  background: radial-gradient(circle at 100% 0%, rgba(179, 0, 0, 0.14), transparent 34%), #1b1d20;
}

.notes__intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.notes-card {
  width: calc(100% - 16px);
  margin: 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(34, 36, 40, 0.94);
  border-radius: 8px;
}

.notes-card--form {
  border-top: 2px solid var(--q-primary, #b30000);
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
  .notes__intro,
  .notes-card {
    width: calc(100% - 32px);
    max-width: 1240px;
    margin-right: auto;
    margin-left: auto;
  }
}
</style>
