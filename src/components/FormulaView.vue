<script setup>
defineProps({
  a: [String, Number, Function],
  b: [String, Number, Function],
  c: [String, Number, Function],
})
</script>

<template>
  <span style="display: inline-flex; align-items: center">
    {{ a }} =
    <span
      style="display: inline-flex; flex-direction: column; align-items: center; margin-left: 4px"
    >
      <span style="border-bottom: 1px solid currentColor; padding: 0 2px">{{ b }}</span>
      <span>{{ c }}</span>
    </span>
  </span>
</template>
