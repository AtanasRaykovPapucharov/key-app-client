<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import bitcoinPublication from 'src/assets/pdf/e15350.pdf'
import Resources from 'src/components/ResourcesView.vue'

const { tm } = useI18n({ useScope: 'global' })

const links = [
  {
    url: 'coingecko.com',
    description: 'Crypto prices, market caps and trading volumes for nearly every coin.',
    rating: 5,
  },
  {
    url: 'rootdata.com',
    description: 'Web3 project database with funding rounds and team info.',
    rating: 4,
  },
  {
    url: 'skynet.certik.com',
    description: 'Security audits and risk scores for blockchain projects.',
    rating: 4,
  },
  {
    url: 'icodrops.com',
    description: 'Calendar and tracker for upcoming ICOs and IDOs.',
    rating: 3,
  },
  {
    url: 'defillama.com',
    description: 'DeFi TVL rankings and protocol analytics across chains.',
    rating: 5,
  },
  {
    url: 'etherscan.io',
    description: 'Ethereum blockchain explorer for transactions and contracts.',
    rating: 5,
  },
  {
    url: 'cryptorank.io',
    description: 'Market data, fundraising rounds and token unlock schedules.',
    rating: 4,
  },
  {
    url: 'messari.io',
    description: 'In-depth crypto research reports and on-chain data.',
    rating: 5,
  },
]

// books come straight from the active locale's messages,
// so switching language swaps both UI strings and book content
const books = computed(() => {
  const localizedBooks = tm('crypto_books')
  return Array.isArray(localizedBooks) ? localizedBooks : []
})
</script>

<template>
  <div>
    <Resources
      :text-color="'orange-5'"
      :books="books"
      :links="links"
      from="Crypto"
      title="Resources"
    />
    <iframe :src="bitcoinPublication" width="100%" height="720px" />
  </div>
</template>
