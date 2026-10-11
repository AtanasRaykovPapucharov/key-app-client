<script setup>
import { useI18n } from 'vue-i18n'
import ICON from 'src/helpers/icons'

const { locale } = useI18n()
</script>
<template>
  <q-expansion-item
    group="physics"
    :content-inset-level="0.9"
    icon="fa fa-chart-line"
    class="text-secondary text-h6"
    header-class="text-secondary"
    expand-icon-class="text-secondary"
    label="School Math"
    caption=""
  >
    <q-btn
      to="/math-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-secondary"
      text-color="secondary"
      :label="locale !== 'bg-BG' ? 'Fundamentals' : 'Фундаменти'"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/math-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-secondary"
      text-color="secondary"
      :label="locale !== 'bg-BG' ? 'Analysis' : 'Анализ'"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/math-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-secondary"
      text-color="secondary"
      :label="locale !== 'bg-BG' ? 'Resources' : 'Ресурси'"
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
    label="Mechanics & Astrophysics"
    caption=""
  >
    <q-btn
      to="/mechanics-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-green-5"
      :label="locale !== 'bg-BG' ? 'Fundamentals' : 'Фундаменти'"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/mechanics-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-green-5"
      :label="locale !== 'bg-BG' ? 'Analysis' : 'Анализ'"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/mechanics-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-green-5"
      :label="locale !== 'bg-BG' ? 'Resources' : 'Ресурси'"
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
    label="Termodynamics & Statistics"
    caption=""
  >
    <q-btn
      to="/termodynamics-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-red-5"
      :label="locale !== 'bg-BG' ? 'Fundamentals' : 'Фундаменти'"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/termodynamics-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-red-5"
      :label="locale !== 'bg-BG' ? 'Analysis' : 'Анализ'"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/termodynamics-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-red-5"
      :label="locale !== 'bg-BG' ? 'Resources' : 'Ресурси'"
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
    label="Electrodynamics & Optics"
    caption=""
  >
    <q-btn
      to="/electrodynamics-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-blue-5"
      :label="locale !== 'bg-BG' ? 'Fundamentals' : 'Фундаменти'"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/electrodynamics-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-blue-5"
      :label="locale !== 'bg-BG' ? 'Analysis' : 'Анализ'"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/electrodynamics-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-blue-5"
      :label="locale !== 'bg-BG' ? 'Resources' : 'Ресурси'"
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
    label="Atomic & Nuclear Physics"
    caption=""
  >
    <q-btn
      to="atom-fundamentals"
      :icon="ICON.FUNDAMENTALS"
      size="md"
      class="text-purple-5"
      :label="locale !== 'bg-BG' ? 'Fundamentals' : 'Фундаменти'"
      style="width: 100%"
      no-caps
    />
    <q-btn
      to="/atom-analysis"
      :icon="ICON.ANALYSIS"
      size="md"
      class="text-purple-5"
      :label="locale !== 'bg-BG' ? 'Analysis' : 'Анализ'"
      style="width: 50%"
      no-caps
    />
    <q-btn
      to="/atom-resources"
      :icon="ICON.RESOURCES"
      size="md"
      class="text-purple-5"
      :label="locale !== 'bg-BG' ? 'Resources' : 'Ресурси'"
      style="width: 50%"
      no-caps
    />
  </q-expansion-item>
</template>
