<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useBinanceStore } from 'src/stores/binance'
import { useUserStore } from 'src/stores/user'
import { addOrder } from 'src/services/storage/crypto'
import DialogForm from 'src/components/DialogForm.vue'
import SetOrderForm from 'src/components/forms/SetWatcherForm.vue'
import CryptoConverter from './CryptoConverter.vue'
import CryptoConverterToggle from './CryptoConverterToggle.vue'
import { fee } from 'src/services/storage/calc'

const emit = defineEmits(['newOrder'])

const props = defineProps({
  selectedSymbol: {
    type: String,
    required: true,
  },
  buy: {
    type: Boolean,
    default: true,
  },
})

const $q = useQuasar()
const store = useBinanceStore()
const userStore = useUserStore()
const tab = ref(props.buy ? 'buy' : 'sell')
const amount = ref(1)
const isLoading = ref(false)

const selectedAsset = computed(() => props.selectedSymbol?.replace('USDC', '') || '')
const currentPrice = computed(() => store.tickers[props.selectedSymbol]?.price ?? null)

const isFormValid = computed(() => {
  return (
    selectedAsset.value && amount.value > 0 && currentPrice.value !== null && userStore.user?.uid
  )
})

watch(
  () => props.buy,
  (newBuy) => {
    tab.value = newBuy ? 'buy' : 'sell'
    amount.value = 1
  },
)

watch(
  () => props.selectedSymbol,
  (newSymbol) => {
    if (!newSymbol) return
    amount.value = 1
  },
)

function changeTab(side) {
  tab.value = side.toLowerCase()
}

function validateOrder() {
  if (!selectedAsset.value) {
    $q.notify({
      type: 'negative',
      message: 'Please select a valid trading pair.',
      position: 'top-left',
    })
    return false
  }

  if (!currentPrice.value || currentPrice.value <= 0) {
    $q.notify({
      type: 'negative',
      message: 'Invalid price data. Please try again.',
      position: 'top-left',
    })
    return false
  }

  if (amount.value <= 0) {
    $q.notify({
      type: 'negative',
      message: 'Amount must be greater than 0.',
      position: 'top-left',
    })
    return false
  }

  if (!userStore.user?.uid) {
    $q.notify({
      type: 'negative',
      message: 'User session is invalid. Please log in again.',
      position: 'top-left',
    })
    return false
  }

  return true
}

function resetForm() {
  amount.value = 1
  isLoading.value = false
}

async function handleOrderConfirmed() {
  if (!validateOrder()) return

  isLoading.value = true

  try {
    // uid should be a UUID string, not a number
    const userId = userStore.user?.uid
    if (!userId) {
      throw new Error('User ID is missing or invalid')
    }

    const dataView = {
      order_type: tab.value,
      is_crypto: true,
      crypto_id: selectedAsset.value.toLowerCase(),
      curr_price: parseFloat(currentPrice.value),
      amount: parseFloat(amount.value),
      uid: userId, // Pass UUID string directly
    }

    console.log('Submitting order with User UID:', userId)
    console.log('Order data:', dataView)

    const resp = await addOrder(dataView)
    if (resp?.message) {
      console.log('Order created successfully:', resp)
      $q.notify({
        type: 'positive',
        message: resp.message,
        position: 'top-left',
      })
      emit('newOrder', resp)
      resetForm()
    } else {
      throw new Error('No response message from server')
    }
  } catch (err) {
    console.error('Order submission error:', err)
    const errorMsg = err?.response?.data?.error || err?.message || 'Unknown error'
    $q.notify({
      type: 'negative',
      message: `Order failed: ${errorMsg}`,
      position: 'top-left',
    })
  } finally {
    isLoading.value = false
  }
}

async function newOrder() {
  if (!validateOrder()) return

  const orderSummary = {
    order_type: tab.value,
    symbol: props.selectedSymbol,
    price: currentPrice.value,
    amount: amount.value,
    fee: fee(Number(currentPrice.value) * Number(amount.value)),
    readOnly: true,
  }

  $q.dialog({
    component: DialogForm,
    componentProps: {
      component: SetOrderForm,
      persistent: true,
      close: true,
      modelValue: orderSummary,
      ok: 'Confirm',
    },
  })
    .onOk(handleOrderConfirmed)
    .onCancel(() => {
      // User cancelled - form state remains
    })
}
</script>

<template>
  <q-card class="bg-grey-9 q-mb-sm q-pt-sm">
    <q-card-actions>
      <q-btn
        :style="{
          width: '105px',
          borderBottom: `${tab == 'buy' ? '3px solid white' : ''}`,
        }"
        class="q-ml-sm"
        color="green"
        icon="trending_up"
        :label="`BUY`"
        :disable="isLoading"
        @click="changeTab('buy')"
      />

      <q-btn
        :style="{
          width: '110px',
          borderBottom: `${tab == 'sell' ? '3px solid white' : ''}`,
        }"
        color="red"
        icon="trending_down"
        :label="`SELL`"
        :disable="isLoading"
        @click="changeTab('sell')"
      />
      <q-space />
      <div class="q-pr-sm q-pt-sm">
        <CryptoConverterToggle />
      </div>
    </q-card-actions>
    <q-tab-panels v-model="tab" animated swipeable>
      <q-tab-panel name="buy" class="bg-grey-9">
        <CryptoConverter
          hide-price
          no-swap
          :from="selectedAsset"
          to="USDC"
          :amount="amount"
          :amount-from="true"
          @update:amount="amount = $event"
          :disable="isLoading"
          disable-from
          disable-to
        />

        <q-btn
          style="width: auto; display: block; margin: 0 auto; margin-top: 15px"
          color="green"
          icon="trending_up"
          :label="`BUY ${selectedAsset}`"
          :disable="!isFormValid || isLoading"
          :loading="isLoading"
          @click="newOrder"
        />
      </q-tab-panel>

      <q-tab-panel name="sell" class="bg-grey-9">
        <CryptoConverter
          hide-price
          no-swap
          :from="selectedAsset"
          to="USDC"
          :amount="amount"
          :amount-from="true"
          @update:amount="amount = $event"
          :disable="isLoading"
          disable-from
          disable-to
        />

        <q-btn
          style="width: auto; display: block; margin: 0 auto; margin-top: 15px"
          color="red"
          icon="trending_down"
          :label="`SELL ${selectedAsset}`"
          :disable="!isFormValid || isLoading"
          :loading="isLoading"
          @click="newOrder"
        />
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>
