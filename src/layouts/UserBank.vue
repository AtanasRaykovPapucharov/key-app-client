<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBankStore } from 'src/stores/bank'

const { t } = useI18n({ useScope: 'global' })
const bankStore = useBankStore()

const pagination = ref({ rowsPerPage: 5 })
const isOpen = ref(false)

const feeSum = computed(() => {
  return bankStore?.bank?.transactions?.reduce((acc, transaction) => {
    return acc + Number(transaction.amount)
  }, 0)
})

onMounted(() => {
  bankStore.loadTransactions()
})
</script>

<template>
  <div class="text-h6 text-red-5 q-mt-md q-ml-md">
    {{ t('transactions_fee') }} {{ bankStore?.bank?.fee || 0 }} %
  </div>
  <q-expansion-item
    v-model="isOpen"
    :content-inset-level="1"
    :label="`${t('fee_accumulated')} ${feeSum?.toFixed(2)} $`"
    caption=""
    class="text-purple-5 text-h6 q-mb-xs"
    expand-icon-class="text-purple-5"
  />

  <!-- <div class="text-h6 text-purple-4">Fee accumulated: {{ feeSum?.toFixed(4) }} USDC</div> -->
  <q-table
    v-if="isOpen"
    flat
    dark
    class="bank-table"
    :rows="bankStore?.bank?.transactions || []"
    :columns="[
      { name: 'date', label: 'Date', field: 'date', align: 'left' },
      // { name: 'order_id', label: 'Order', field: 'order_id', hide: true },
      { name: 'amount', label: 'Fee, USDC', field: 'amount', align: 'left' },
      {
        name: 'crypto_id',
        label: 'Crypto',
        field: 'crypto_id',
      },
      { name: 'curr_amount', label: 'Amount', field: 'curr_amount', align: 'left' },
      { name: 'curr_price', label: 'Price, USDC', field: 'curr_price', align: 'left' },
      { name: 'curr_usdc', label: 'Total, USDC', field: 'curr_usdc', align: 'left' },
    ]"
    row-key="bank_fee_id"
    v-model:pagination="pagination"
    :rows-per-page-options="[5, 10, 20, 0]"
  >
    <template #body-cell-date="props">
      <q-td :props="props">
        <div>
          <!-- <span>{{ new Date(props.row.date)?.toDateString()?.split(' ')?.[0] }}</span>
          <br /> -->
          <span>{{ new Date(props.row.date).getFullYear() }}</span>
          <br />
          <span
            >{{ new Date(props.row.date)?.toDateString()?.split(' ')?.[1] }}
            {{ new Date(props.row.date)?.toDateString()?.split(' ')?.[2] }}</span
          >
          <br />
          <span>{{
            new Date(props.row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }}</span>
        </div>
      </q-td>
    </template>
    <template #body-cell-amount="props">
      <q-td :props="props">
        <span class="text-purple-3">{{ Number(props.row.amount).toFixed(4) }}</span>
      </q-td>
    </template>
    <template #body-cell-crypto_id="props">
      <q-td :props="props">{{ props.row.crypto_id?.toUpperCase() }}</q-td>
    </template>
    <template #body-cell-curr_price="props">
      <q-td :props="props">{{ Number(props.row.curr_price).toFixed(2) }}</q-td>
    </template>
    <template #body-cell-curr_usdc="props">
      <q-td :props="props">{{ Number(props.row.curr_usdc).toFixed(2) }}</q-td>
    </template>
  </q-table>
</template>

<style scoped>
.bank-table {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

:deep(.q-table__middle) {
  max-width: 100%;
  overflow-x: auto;
}

:deep(table) {
  width: 100%;
  min-width: 0;
  table-layout: fixed;
}

:deep(th),
:deep(td) {
  padding: 6px 4px;
  white-space: normal;
  overflow-wrap: anywhere;
  font-size: 12px;
}
</style>
