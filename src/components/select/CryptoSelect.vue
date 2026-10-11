<script setup>
const emit = defineEmits(['update:selectedSymbol'])
defineProps({
  topCoins: {
    type: Array,
    required: true,
  },
  selectedSymbol: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <q-list bordered separator>
    <q-item
      v-for="(coin, i) in topCoins"
      :key="i"
      clickable
      v-ripple
      :active="selectedSymbol === coin.symbol"
      active-class="bg-grey-8"
      @click="emit('update:selectedSymbol', coin.symbol)"
    >
      <q-item-section>
        <q-item-label class="text-bold text-grey-3">{{
          coin.symbol.replace('USDC', ' / USDC')
        }}</q-item-label>
        <q-item-label caption class="text-white">{{ coin.price }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <div :class="coin.change >= 0 ? 'text-green' : 'text-red'">
          {{ coin.change?.toFixed(2) }}%
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>
