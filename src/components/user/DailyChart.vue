<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { getDaily } from 'src/services/storage/crypto'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

const daily = ref([])
const chartCanvas = ref(null)
let chartInstance = null

// Prepare chart data
const chartData = computed(() => {
  return {
    labels: daily.value.map((d) => d.id.toString().split('T')[0]),
    datasets: [
      {
        label: 'Daily PNL',
        data: daily.value.map((d) => d.pnl),
        backgroundColor: daily.value.map((d) => (d.pnl >= 0 ? 'green' : 'red')),
      },
    ],
  }
})

// Create chart
const renderChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: chartData.value,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
    },
  })
}

watch(chartData, () => {
  if (daily.value.length) renderChart()
})

onMounted(async () => {
  daily.value = await getDaily()
  renderChart()
})
</script>

<template>
  <q-card class="bg-black text-white">
    <q-card-section>
      <canvas ref="chartCanvas"></canvas>
    </q-card-section>
  </q-card>
</template>
