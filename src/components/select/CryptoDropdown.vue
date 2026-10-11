<script setup>
import { computed } from 'vue'
import cryptoMapper from 'src/helpers/crypto-mapper'
const emit = defineEmits(['update:selectedSymbol'])
const props = defineProps({
  topCoins: {
    type: Array,
    required: true,
  },
  selectedSymbol: {
    type: String,
    required: true,
  },
})
const cryptosymbol = computed({
  // getter
  get() {
    return props.selectedSymbol
  },
  // setter
  set(newValue) {
    emit('update:selectedSymbol', newValue)
  },
})
</script>

<template>
  <q-select
    filled
    v-model="cryptosymbol"
    :options="topCoins"
    option-value="symbol"
    option-label="symbol"
    options-dark
    emit-value
    map-options
    hide-dropdown-icon
    hide-bottom-space
    style="background-color: #0e0e0e; min-width: 360px"
  >
    <!-- Selected item display -->
    <template #selected-item="scope">
      <q-avatar class="bg-secondary q-mr-lg" size="md">
        <q-img
          :src="cryptoMapper[scope.opt.symbol?.replace('USDC', '')]?.logo"
          fit="cover"
          spinner-color="primary"
          loading="eager"
        />
      </q-avatar>
      <div class="text-bold text-grey-4">
        {{ scope.opt.symbol ? scope.opt.symbol?.replace('USDC', ' / USDC') : '' }}
      </div>
      <q-space />
      <div class="text-grey-2 text-caption" style="font-size: 16px">
        <!-- {{ scope.opt }} -->
        {{ scope.opt.price ? `$ ${scope.opt.price?.toFixed(4)}` : '' }}
      </div>
      <q-space />
      <div :class="scope.opt.change >= 0 ? 'text-green' : 'text-red'">
        {{ scope.opt.change ? `${scope.opt.change?.toFixed(2)} %` : '' }}
      </div>
    </template>

    <!-- Dropdown options -->
    <template #option="scope">
      <q-item
        v-bind="scope.itemProps"
        :active="selectedSymbol === scope.opt.symbol"
        active-class="bg-grey-8"
      >
        <q-item-section>
          <q-item-label class="text-bold text-grey-3">
            {{ scope.opt.symbol?.replace('USDC', ' / USDC') }}
          </q-item-label>
          <q-item-label caption class="text-grey-2">
            {{ scope.opt.price }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div :class="scope.opt.change >= 0 ? 'text-green' : 'text-red'">
            {{ scope.opt.change?.toFixed(2) }}%
          </div>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>
