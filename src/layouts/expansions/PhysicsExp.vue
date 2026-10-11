<script setup>
import { useLocalized } from 'src/composables/useLocalized'
import ICON from 'src/helpers/icons'

const { t } = useLocalized()
</script>
<template>
  <q-expansion-item
    group="physics"
    :content-inset-level="0.9"
    icon="fa fa-chart-line"
    class="text-secondary text-h6"
    header-class="text-secondary"
    expand-icon-class="text-secondary"
    :label="t('app.layout.nav.schoolMath')"
  >
    <q-btn
      to="/math-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-secondary"
      text-color="secondary"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/math-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-secondary"
      text-color="secondary"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/math-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-secondary"
      text-color="secondary"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>

  <q-expansion-item
    group="physics"
    :content-inset-level="0.9"
    icon="fa fa-meteor"
    class="text-green-5 text-h6"
    expand-icon-class="text-green-5"
    :label="t('app.layout.nav.mechanics')"
  >
    <q-btn
      to="/mechanics-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-green-5"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/mechanics-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-green-5"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/mechanics-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-green-5"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>

  <q-expansion-item
    group="physics"
    :content-inset-level="0.9"
    icon="fa fa-temperature-low"
    class="text-red-5 text-h6"
    expand-icon-class="text-red-5"
    :label="t('app.layout.nav.thermo')"
  >
    <q-btn
      to="/termodynamics-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-red-5"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/termodynamics-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-red-5"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/termodynamics-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-red-5"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>

  <q-expansion-item
    group="physics"
    :content-inset-level="0.9"
    icon="fa fa-microscope"
    class="text-blue-5 text-h6"
    expand-icon-class="text-blue-5"
    :label="t('app.layout.nav.electro')"
  >
    <q-btn
      to="/electrodynamics-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-blue-5"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/electrodynamics-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-blue-5"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/electrodynamics-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-blue-5"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>

  <q-expansion-item
    group="physics"
    :content-inset-level="0.9"
    icon="fa fa-atom"
    class="text-purple-5 text-h6"
    expand-icon-class="text-purple-5"
    :label="t('app.layout.nav.atomic')"
  >
    <q-btn
      to="atom-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-purple-5"
      :label="t('app.layout.nav.fundamentals')"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/atom-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-purple-5"
      :label="t('app.layout.nav.analysis')"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/atom-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-purple-5"
      :label="t('app.layout.nav.resources')"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>
</template>
