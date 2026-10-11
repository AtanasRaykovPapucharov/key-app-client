<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDaily } from 'src/services/storage/crypto'

const daily = ref(null)
const total = computed(() => {
  let sum = 0
  if (daily.value)
    for (const val of daily.value) {
      sum += parseFloat(val.pnl)
    }
  return `${'TOTAL PNL:   ' + sum.toFixed(2)} €`
})

onMounted(async () => {
  daily.value = await getDaily()
})
</script>

<template>
  <q-card class="bg-black">
    <q-card-section class="q-pt-none">
      <div>
        <div class="text-h4">{{ total }}</div>
        <q-list bordered separator class="row">
          <q-item clickable v-ripple style="width: 100px; margin: 0; padding: 0">
            <q-item-section
              class="bg-grey-9 q-pa-xs text-center q-ma-none"
              style="width: 100px; margin: 0; padding: 0; border: 1px solid black"
            />
          </q-item>
          <q-item
            v-for="d in daily"
            clickable
            v-ripple
            :key="d.date"
            style="width: 100px; margin: 0; padding: 0; border: 1px solid black"
          >
            <q-item-section
              :class="`
                q-pa-xs
                text-grey-5
                text-center
                q-ma-none
                bg-${!d.id.includes('01') ? (parseFloat(d.pnl) < 0 ? 'primary' : 'green-8') : 'grey-9'}
              `"
            >
              <div>{{ d.id.toString().split('T')[0] }}</div>
              <strong
                :class="`text-${!d.id.includes('01') ? 'grey-5' : parseFloat(d.pnl) < 0 ? 'primary' : 'green-8'}`"
              >
                {{ d.pnl }}
              </strong>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-card-section>
  </q-card>
</template>
