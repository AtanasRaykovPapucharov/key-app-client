<script setup>
import { useQuasar, QSpinnerFacebook } from 'quasar'
import { ref, onBeforeMount, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePortfolioStore } from 'src/stores/portfolio'
import { useUserStore } from 'src/stores/user'
import cryptoMapper from 'src/helpers/crypto-mapper'
import { getCoinmarketcapPrices } from 'src/services/web/coinmarketcap'
import { getLocalUser, setLocalCrypto } from 'src/services/storage/local'
import { updatePortfolioWatchList } from 'src/services/storage/user'
import { getCrypto } from 'src/services/storage/crypto'

const $q = useQuasar()
const router = useRouter()
const cryptoList = ref([])
const selected = ref([])
const hasChanged = ref(false)
const coinmarketcapPrices = ref([])
const portfolioStore = usePortfolioStore()
const userStore = useUserStore()
const { portfolio } = storeToRefs(portfolioStore)

const isAuthenticated = () => {
  const localUser = getLocalUser()
  return userStore.user.isAuthenticated || Boolean(localUser?.uid || localUser?.id)
}

onBeforeMount(() => {
  if (!isAuthenticated()) {
    void router.replace('/crypto-watcher').then(() => {
      window.dispatchEvent(new CustomEvent('cryptool:open-auth'))
    })
  }
})

onMounted(async () => {
  if (!isAuthenticated()) return

  try {
    $q.loading.show({
      spinner: QSpinnerFacebook,
      spinnerSize: 140,
    })

    coinmarketcapPrices.value = await getCoinmarketcapPrices()
    cryptoList.value = await getCrypto()

    const localSelected =
      portfolio?.value?.watch_list?.map((item) => item?.replace('usdc', '')) || []

    if (rows.value?.length > 0)
      selected.value = rows.value?.filter((row) =>
        localSelected?.includes(row?.symbol?.toLowerCase()),
      )

    watch(
      () => selected.value,
      (newSelected, oldSelected) => {
        const symbols = newSelected?.map((item) => item?.symbol)
        if (oldSelected) hasChanged.value = true
        setLocalCrypto(symbols)
      },
    )
  } catch (err) {
    console.error(err)
  } finally {
    setTimeout(() => {
      $q.loading.hide()
    }, 1500)
  }
})

const rows = computed(() => {
  return cryptoList.value?.map((crypto) => {
    const priceData = coinmarketcapPrices.value?.find(
      (item) => item?.symbol === crypto?.id?.toUpperCase(),
    )
    const mapperData = Object.values(cryptoMapper)?.find(
      (item) => item?.symbol === crypto?.id?.toUpperCase(),
    )

    return {
      ...(crypto || {}),
      ...(priceData || {}),
      ...(mapperData || {}),
    }
  })
})

const columns = [
  { name: 'logo', label: '', field: 'logo', align: 'left' },
  { name: 'symbol', label: 'Symbol', field: 'symbol', sortable: true, align: 'left' },
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  {
    name: 'no',
    label: 'No',
    field: 'no',
    sortable: true,
    format: (val) => `#${val}`,
    align: 'left',
  },
  { name: 'short_descr', label: 'Consensus', field: 'short_descr', align: 'left' },
  {
    name: 'infinite_supply',
    label: 'Infinite Supply',
    field: 'infinite_supply',
    sortable: true,
    align: 'left',
  },
  { name: 'max_supply', label: 'Max Supply', field: 'max_supply', sortable: true, align: 'left' },
  {
    name: 'total_supply',
    label: 'Total Supply',
    field: 'total_supply',
    sortable: true,
    align: 'left',
  },
  { name: 'marketCap', label: 'Market Cap', field: 'marketCap', sortable: true, align: 'left' },
  // { name: 'description', label: 'Description', field: 'description', align: 'left' },
]

async function saveList() {
  try {
    const watch_list = selected.value?.map((item) => `${item?.symbol?.toLowerCase()}usdc`)

    console.log(userStore.user?.id, watch_list)

    const res = await updatePortfolioWatchList(userStore.user?.uid, watch_list)
    portfolioStore.setPortfolio(res)
    hasChanged.value = false
    $q.notify({
      type: 'positive',
      message: 'List successfully saved',
      position: 'top-left',
    })
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div class="q-pa-md">
    <!-- {{ portfolio?.watch_list }}
    <br />
    {{ selected?.map((item) => (!item?.symbol ? null : `${item?.symbol?.toLowerCase()}usdc`)) }} -->
    <q-table
      title="Crypto Watch List"
      row-key="symbol"
      :rows="rows"
      :columns="columns"
      :rows-per-page-options="[0]"
      v-model:selected="selected"
      selection="multiple"
      flat
      dark
      bordered
      class="text-secondary"
      :style="{ height: `${$q.screen.height - 102}px` }"
    >
      <template #top-right>
        <q-btn
          :disable="!hasChanged"
          flat
          color="secondary"
          label="Save"
          icon="save"
          @click="saveList"
        />
      </template>
      <template #body-cell-logo="props">
        <q-td :props="props">
          <q-img
            class="bg-grey-3"
            :src="props.row.logo"
            style="width: 32px; height: 32px; border: 1px solid grey; border-radius: 50%"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<style scoped></style>
