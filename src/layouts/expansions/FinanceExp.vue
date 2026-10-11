<script setup>
import { useLocalized } from 'src/composables/useLocalized'
import ICON from 'src/helpers/icons'

const { t } = useLocalized()

// const points = [{ name: 'stocks', icon: 'bar_chart', color: 'text-red-5', link: 'stock' }]
// const subpoints = [{ name: 'fundamentals', label: 'Fundamentals', labelBg: 'Фундаменти' }]
</script>

<template>
  <!-- <q-expansion-item
    v-for="p in points"
    group="education"
    :key="p.name"
    :content-inset-level="1"
    :icon="p.icon"
    :class="p.color"
    :label="t(`education.${p.name}.label`)"
  >
    <q-btn
      v-for="subp in subpoints"
      :key="subp.name"
      :to="`/${p.stock}-fundamentals`"
      :label="field(subp, 'label')"
      :class="p.color"
      :style="{ width: subp.name !== 'fundamentals' ? '50%' : '100%' }"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      no-caps
    />
  </q-expansion-item> -->

  <q-expansion-item
    group="education"
    :content-inset-level="0.9"
    :icon="ICON.MATH"
    class="text-grey-5 text-h6"
    header-class="text-grey-5"
    expand-icon-class="text-grey-5"
    :label="t('app.layout.nav.schoolMath')"
  >
    <q-btn
      to="/math-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-grey-5"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/math-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-grey-5"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/math-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-grey-5"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>

  <!-- <q-expansion-item
    group="education"
    :content-inset-level="0.9"
    :icon="ICON.PROBABILITY"
    class="text-red-5 text-h6"
    header-class="text-red-5"
    expand-icon-class="text-red-5"
    :label="t('app.layout.nav.probabilityStatistics')"
  ></q-expansion-item> -->

  <q-expansion-item
    group="education"
    :content-inset-level="0.9"
    :icon="ICON.STOCKS"
    class="text-green-5 text-h6 q-mb-xs"
    header-class="text-green-5"
    expand-icon-class="text-green-5"
    :label="t('education.stocks.label')"
  >
    <q-btn
      to="/stocks-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-green-5"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/stocks-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-green-5"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/stocks-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-green-5"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>

  <q-expansion-item
    group="education"
    :content-inset-level="0.9"
    :icon="ICON.BONDS"
    class="text-red-5 text-h6 q-mb-xs"
    header-class="text-red-5"
    expand-icon-class="text-red-5"
    :label="t('education.bonds.label')"
  >
    <q-btn
      to="/bonds-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-red-5"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/bonds-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-red-5"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/bonds-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-red-5"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>

  <q-expansion-item
    group="education"
    :content-inset-level="0.9"
    :icon="ICON.CRYPTO"
    class="text-orange-5 text-h6 q-mb-xs"
    header-class="text-orange-5"
    expand-icon-class="text-orange-5"
    :label="t('education.crypto.label')"
  >
    <q-btn
      to="/crypto-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-orange-5"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/crypto-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-orange-5"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/crypto-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-orange-5"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>

  <q-expansion-item
    group="education"
    :content-inset-level="0.9"
    :icon="ICON.REAL_ESTATE"
    class="text-blue-5 text-h6 q-mb-xs"
    header-class="text-blue-5"
    expand-icon-class="text-blue-5"
    :label="t('education.realEstate.label')"
  >
    <q-btn
      to="/real-estate-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-blue-5"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/real-estate-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-blue-5"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/real-estate-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-blue-5"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>

  <q-expansion-item
    group="education"
    :content-inset-level="0.9"
    :icon="ICON.TRADING"
    class="text-purple-5 text-h6 q-mb-xs"
    header-class="text-purple-4"
    expand-icon-class="text-purple-4"
    :label="t('education.trading.label')"
  >
    <q-btn
      to="/trading-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-purple-4"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/trading-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-purple-4"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/trading-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-purple-4"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>

  <!-- <q-expansion-item
    group="education"
    :content-inset-level="0.9"
    :icon="ICON.MINDSET"
    class="text-purple-5 text-h6"
    header-class="text-purple-5"
    expand-icon-class="text-purple-5"
    :label="t('education.mindset.label')"
  >
    <q-btn
      to="/mindset-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-purple-5"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/mindset-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-purple-5"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/mindset-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-purple-5"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item> -->
</template>
