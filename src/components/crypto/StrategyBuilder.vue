<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { getCoingeckoMarkets } from 'src/services/web/coingecko'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  coinOptions: { type: Array, default: () => [] },
  coinId: { type: String, default: '' },
  symbol: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const $q = useQuasar()
const { locale } = useI18n({ useScope: 'global' })
const bg = computed(() => locale.value === 'bg-BG')
const t = (en, bgText) => (bg.value ? bgText : en)

const SLOTS = ['a', 'b', 'c']
const PERIODS_PER_YEAR = { daily: 365, weekly: 52, monthly: 12 }
const CONTEXT_FIELDS =
  'price, marketCap, volume, ath, atl, fromAth, change30d, change200d, change1y'
// Expressions run through `new Function`, so block the obvious escape hatches.
const BLOCKED_TOKENS =
  /\b(window|document|globalThis|localStorage|sessionStorage|fetch|XMLHttpRequest|import|require|eval|Function|constructor|setTimeout|setInterval|process|navigator|while|for)\b/

const strategies = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const draft = ref({
  name: '',
  type: 'dca',
  amount: 100,
  frequency: 'weekly',
  duration: 12,
  takeProfit: null,
  stopLoss: null,
  assets: ['bitcoin', 'ethereum'],
  expression: 'a.price > b.price * 10 && a.change30d > 0',
})

const conditionResults = ref({})
const draftResult = ref(null)

const isCustom = computed(() => draft.value.type === 'custom')

const types = computed(() => [
  { value: 'dca', label: t('DCA (recurring buy)', 'DCA (периодична покупка)') },
  { value: 'grid', label: t('Grid', 'Мрежа') },
  { value: 'hodl', label: t('Buy & hold', 'Купи и задръж') },
  { value: 'custom', label: t('Custom condition', 'Персонално условие') },
])

const frequencies = computed(() => [
  { value: 'daily', label: t('Daily', 'Дневно') },
  { value: 'weekly', label: t('Weekly', 'Седмично') },
  { value: 'monthly', label: t('Monthly', 'Месечно') },
])

const preview = computed(() => {
  const periods = Number(draft.value.duration) || 0
  const amount = Number(draft.value.amount) || 0
  const perYear = PERIODS_PER_YEAR[draft.value.frequency] || 12
  return { total: amount * periods, periods, span: periods / perYear }
})

const fmtMoney = (v) =>
  v == null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: v >= 1000 ? 0 : v >= 1 ? 2 : 6,
        notation: v >= 1_000_000 ? 'compact' : 'standard',
      }).format(v)

const fmtPct = (v) => (v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`)

function slotLabel(index) {
  const option = props.coinOptions.find((o) => o.value === draft.value.assets[index])
  return option ? `${SLOTS[index]} = ${option.symbol}` : null
}

function describe(strategy) {
  if (strategy.type === 'custom') return strategy.expression
  return `${strategy.symbol} · ${strategy.type.toUpperCase()} · ${fmtMoney(strategy.amount)} / ${strategy.frequency}`
}

function statusOf(strategy) {
  const result = conditionResults.value[strategy.id]
  if (strategy.type !== 'custom' || !result) return null
  if (!result.ok) return { color: 'negative', label: t('error', 'грешка') }
  return result.value
    ? { color: 'positive', label: t('met', 'изпълнено') }
    : { color: 'grey-8', label: t('waiting', 'чака') }
}

// ── Condition engine ──────────────────────────────────────────────────────────
function compileCondition(expression) {
  const source = String(expression || '').trim()
  if (!source) return { error: t('Condition is empty', 'Условието е празно') }
  if (BLOCKED_TOKENS.test(source))
    return {
      error: t(
        'Only comparisons on a, b, c and Math are allowed',
        'Разрешени са само сравнения по a, b, c и Math',
      ),
    }
  try {
    return { fn: new Function('a', 'b', 'c', 'Math', `"use strict"; return (${source});`) }
  } catch (err) {
    return { error: err.message }
  }
}

function toContext(row) {
  if (!row) return null
  return {
    symbol: row.symbol,
    price: row.price,
    marketCap: row.marketCap,
    volume: row.volume,
    ath: row.ath,
    atl: row.atl,
    fromAth: row.athChangePct,
    change30d: row.change30d,
    change200d: row.change200d,
    change1y: row.change1y,
  }
}

async function evaluateCondition(expression, assets) {
  const compiled = compileCondition(expression)
  if (compiled.error) return { ok: false, error: compiled.error }

  const ids = (assets || []).filter(Boolean).slice(0, 3)
  if (ids.length < 2)
    return { ok: false, error: t('Pick at least two assets', 'Изберете поне два актива') }

  const rows = await getCoingeckoMarkets(ids)
  const context = ids.map((id) => toContext(rows.find((r) => r.id === id)))
  if (context.some((c) => !c))
    return { ok: false, error: t('Market data unavailable', 'Няма пазарни данни') }

  try {
    const value = compiled.fn(context[0], context[1], context[2] ?? null, Math)
    return { ok: true, value: Boolean(value), context, at: Date.now() }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

async function testCondition() {
  draftResult.value = await evaluateCondition(draft.value.expression, draft.value.assets)
}

async function runCondition(strategy) {
  if (!strategy || strategy.type !== 'custom') return
  const previous = conditionResults.value[strategy.id]
  const result = await evaluateCondition(strategy.expression, strategy.assets)
  conditionResults.value = { ...conditionResults.value, [strategy.id]: result }

  if (result.ok && result.value && !previous?.value) {
    $q.notify({
      message: `${strategy.name}: ${t('condition met', 'условието е изпълнено')}`,
      icon: 'rule',
      color: 'positive',
      timeout: 8000,
    })
  }
}

async function runAll() {
  for (const strategy of strategies.value.filter((s) => s.type === 'custom')) {
    await runCondition(strategy)
  }
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
function save() {
  if (!draft.value.name.trim()) {
    $q.notify({ message: t('Name your strategy', 'Дайте име на стратегията'), color: 'negative' })
    return
  }
  if (isCustom.value) {
    const check = compileCondition(draft.value.expression)
    if (check.error) {
      $q.notify({ message: check.error, color: 'negative' })
      return
    }
  }

  const saved = {
    ...draft.value,
    assets: [...draft.value.assets],
    id: `${Date.now()}`,
    coinId: props.coinId,
    symbol: props.symbol,
  }
  strategies.value = [...strategies.value, saved]
  draft.value = { ...draft.value, name: '' }
  $q.notify({
    message: t('Strategy saved locally', 'Стратегията е запазена локално'),
    color: 'positive',
  })
  if (saved.type === 'custom') void runCondition(saved)
}

function remove(id) {
  strategies.value = strategies.value.filter((s) => s.id !== id)
  conditionResults.value = Object.fromEntries(
    Object.entries(conditionResults.value).filter(([key]) => key !== id),
  )
}

defineExpose({ runAll })
</script>

<template>
  <div class="column q-gutter-md">
    <q-banner dense rounded class="draft-banner">
      <template #avatar><q-icon name="info" color="cyan-5" /></template>
      {{
        t(
          'Design only — strategies are stored locally and are not executed.',
          'Само дизайн — стратегиите се пазят локално и не се изпълняват.',
        )
      }}
    </q-banner>

    <div class="setting-group column q-gutter-sm">
      <q-input
        v-model="draft.name"
        dense
        outlined
        dark
        color="orange-6"
        :label="t('Strategy name', 'Име на стратегията')"
      />
      <q-select
        v-model="draft.type"
        dense
        outlined
        dark
        emit-value
        map-options
        color="orange-6"
        :label="t('Type', 'Тип')"
        :options="types"
      />

      <!-- Recurring / passive plans -->
      <template v-if="!isCustom">
        <div class="row">
          <q-input
            v-model.number="draft.amount"
            class="col q-mr-xs"
            type="number"
            dense
            outlined
            dark
            color="orange-6"
            :label="`${t('Amount', 'Сума')} (USD)`"
          />
          <q-select
            v-model="draft.frequency"
            class="col q-ml-xs"
            dense
            outlined
            dark
            emit-value
            map-options
            color="orange-6"
            :label="t('Frequency', 'Честота')"
            :options="frequencies"
          />
        </div>
        <q-input
          v-model.number="draft.duration"
          type="number"
          dense
          outlined
          dark
          color="orange-6"
          :label="t('Number of buys', 'Брой покупки')"
        />
        <div class="row">
          <q-input
            v-model.number="draft.takeProfit"
            class="col q-mr-xs"
            type="number"
            dense
            outlined
            dark
            color="orange-6"
            :label="`${t('Take profit', 'Печалба')} %`"
          />
          <q-input
            v-model.number="draft.stopLoss"
            class="col q-ml-xs"
            type="number"
            dense
            outlined
            dark
            color="orange-6"
            :label="`${t('Stop loss', 'Стоп загуба')} %`"
          />
        </div>

        <q-card flat class="preview-card q-pa-sm">
          <div class="text-caption text-grey-6">{{ t('Planned outlay', 'Планирана сума') }}</div>
          <div class="text-subtitle1 text-white">{{ fmtMoney(preview.total) }}</div>
          <div class="text-caption text-grey-7">
            {{ preview.periods }} × {{ fmtMoney(draft.amount) }} · {{ preview.span.toFixed(1) }}
            {{ t('yrs', 'г.') }}
          </div>
        </q-card>
      </template>

      <!-- Custom multi asset condition -->
      <template v-else>
        <div class="row">
          <q-select
            v-for="(slot, index) in SLOTS"
            :key="slot"
            v-model="draft.assets[index]"
            :class="`col-12 col-sm ${index < 2 ? 'q-mr-xs' : 'q-ml-xs'} ${index === 1 ? 'q-ml-xs' : ''}`"
            dense
            outlined
            dark
            clearable
            emit-value
            map-options
            color="orange-6"
            :label="`${slot.toUpperCase()}${index === 2 ? ` (${t('optional', 'по избор')})` : ''}`"
            :options="coinOptions"
          />
        </div>

        <q-input
          v-model="draft.expression"
          type="textarea"
          autogrow
          dense
          outlined
          dark
          color="orange-6"
          class="condition-input"
          :label="t('Condition (JavaScript)', 'Условие (JavaScript)')"
        />

        <div class="text-caption text-grey-6">
          {{ t('Available fields', 'Налични полета') }}:
          <code class="condition-inline">{{ CONTEXT_FIELDS }}</code> · Math
        </div>
        <div class="row q-gutter-sm">
          <template v-for="(slot, index) in SLOTS" :key="slot">
            <q-badge v-if="slotLabel(index)" outline color="orange-6">
              {{ slotLabel(index) }}
            </q-badge>
          </template>
        </div>

        <q-btn
          outline
          no-caps
          color="cyan-5"
          icon="play_arrow"
          :label="t('Test condition', 'Тествай условието')"
          @click="testCondition"
        />

        <q-card v-if="draftResult" flat class="preview-card q-pa-sm">
          <template v-if="draftResult.ok">
            <div
              class="text-subtitle1 text-weight-bold"
              :class="draftResult.value ? 'text-positive' : 'text-grey-5'"
            >
              {{ draftResult.value ? 'TRUE' : 'FALSE' }}
            </div>
            <div
              v-for="(ctx, index) in draftResult.context"
              :key="index"
              class="text-caption text-grey-6"
            >
              {{ SLOTS[index] }} · {{ ctx.symbol }} · {{ fmtMoney(ctx.price) }} ·
              {{ t('30d', '30д') }} {{ fmtPct(ctx.change30d) }}
            </div>
          </template>
          <div v-else class="text-caption text-negative">{{ draftResult.error }}</div>
        </q-card>
      </template>

      <q-btn
        unelevated
        no-caps
        color="orange-7"
        text-color="grey-10"
        icon="save"
        :label="t('Save strategy', 'Запази стратегията')"
        @click="save"
      />
    </div>

    <q-list v-if="strategies.length" separator dark class="setting-group">
      <q-item v-for="strategy in strategies" :key="strategy.id">
        <q-item-section>
          <q-item-label class="text-white">
            {{ strategy.name }}
            <q-badge
              v-if="statusOf(strategy)"
              :color="statusOf(strategy).color"
              text-color="grey-10"
              class="q-ml-xs"
            >
              {{ statusOf(strategy).label }}
            </q-badge>
          </q-item-label>
          <q-item-label caption class="text-grey-6">
            <code v-if="strategy.type === 'custom'" class="condition-inline">
              {{ describe(strategy) }}
            </code>
            <template v-else>{{ describe(strategy) }}</template>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <div class="row items-center q-gutter-sm">
            <q-btn
              v-if="strategy.type === 'custom'"
              flat
              round
              dense
              icon="play_arrow"
              color="grey-6"
              @click="runCondition(strategy)"
            />
            <q-btn flat round dense icon="delete" color="grey-6" @click="remove(strategy.id)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <div v-else class="text-caption text-grey-7">
      {{ t('No strategies yet.', 'Все още няма стратегии.') }}
    </div>
  </div>
</template>

<style scoped>
.setting-group {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 10px;
}

.preview-card {
  background: rgba(242, 169, 0, 0.08);
  border: 1px solid rgba(242, 169, 0, 0.3);
  border-radius: 10px;
}

.draft-banner {
  background: rgba(0, 188, 212, 0.1);
  border: 1px solid rgba(0, 188, 212, 0.3);
  color: #b2ebf2;
}

.condition-input :deep(textarea) {
  font-family: 'Consolas', 'Menlo', monospace;
  font-size: 12px;
}

.condition-inline {
  font-family: 'Consolas', 'Menlo', monospace;
  font-size: 11px;
  color: #ffcc80;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 1px 4px;
}
</style>
