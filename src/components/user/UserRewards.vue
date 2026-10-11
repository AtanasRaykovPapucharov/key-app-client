constm
<script setup>
import { ref, computed } from 'vue'

import usdcIcon from 'src/assets/icons/usd-coin.png'
import bitcoinIcon from 'src/assets/icons/bitcoin.png'
import ethereumIcon from 'src/assets/icons/ethereum-eth.svg'
import bnbIcon from 'src/assets/icons/bnb.png'
import solanaIcon from 'src/assets/icons/solana.png'
import cardanoIcon from 'src/assets/icons/cardano.png'
import chainlinkIcon from 'src/assets/icons/chainlink.png'
import dogecoinIcon from 'src/assets/icons/dogecoin.png'
import xrpIcon from 'src/assets/icons/xrp.png'

const sectionState = ref({
  crypto: true,
  math: true,
  chess: true,
})

const toggleSection = (section) => {
  sectionState.value[section] = !sectionState.value[section]
}

const cryptoRewards = ref([
  {
    title: 'Self-Trader',
    aim: 'Complete 1st trade',
    details: 'Execute your first crypto buy or sell order.',
    icon: bitcoinIcon,
    color: 'blue',
    unlocked: true,
    badge: 1,
  },
  {
    title: 'BTC Boss',
    aim: 'Hold 1 BTC',
    details: 'Reach a full Bitcoin balance in your portfolio.',
    icon: bitcoinIcon,
    color: 'orange',
    unlocked: true,
    badge: 7,
  },
  {
    title: 'ETH Architect',
    aim: 'Hold 10 ETH',
    details: 'Build a strong Ethereum position.',
    icon: ethereumIcon,
    color: 'blue',
    unlocked: true,
    badge: 10,
  },
  {
    title: 'Stable Captain',
    aim: 'Save 10,000 USDC',
    details: 'Keep a stable reserve ready for opportunities.',
    icon: usdcIcon,
    color: 'teal',
    unlocked: true,
    badge: 1,
  },
  {
    title: 'Altcoin Scout',
    aim: 'Own 5 crypto assets',
    details: 'Diversify across multiple tracked coins.',
    icon: bnbIcon,
    color: 'purple',
    unlocked: true,
    badge: 5,
  },
  {
    title: 'SOL Sprinter',
    aim: 'Hold 25 SOL',
    details: 'Grow a dedicated Solana position.',
    icon: solanaIcon,
    color: 'green',
    unlocked: true,
    badge: 25,
  },
  {
    title: 'BNB Builder',
    aim: 'Hold 15 BNB',
    details: 'Accumulate a Binance ecosystem stake.',
    icon: bnbIcon,
    color: 'gold',
    unlocked: true,
    badge: 15,
  },
  {
    title: 'ADA Scholar',
    aim: 'Hold 1,000 ADA',
    details: 'Commit to a long-term Cardano target.',
    icon: cardanoIcon,
    color: 'indigo',
    unlocked: false,
  },
  {
    title: 'LINK Oracle',
    aim: 'Hold 100 LINK',
    details: 'Reach a Chainlink oracle allocation.',
    icon: chainlinkIcon,
    color: 'blue',
    unlocked: true,
    badge: 4,
  },
  {
    title: 'Risk Tamer',
    aim: 'Stay 7 days positive',
    details: 'Finish a full week with positive daily PNL.',
    icon: usdcIcon,
    color: 'green',
    unlocked: true,
    badge: 7,
  },
  {
    title: 'Market Explorer',
    aim: 'Watch 10 coins',
    details: 'Create a wide crypto watchlist.',
    icon: dogecoinIcon,
    color: 'red',
    unlocked: false,
  },
  {
    title: 'XRP Pioneer',
    aim: 'Hold 500 XRP',
    details: 'Build a solid cross-border payments position.',
    icon: xrpIcon,
    color: 'teal',
    unlocked: false,
  },
])

const cryptoUnlockedCount = computed(
  () => cryptoRewards.value.filter((reward) => reward.unlocked).length,
)
</script>

<template>
  <div class="user-rewards">
    <div class="rewards-container">
      <!-- Crypto Block -->
      <section class="reward-block">
        <div class="block-banner" @click="toggleSection('crypto')">
          <div class="banner-title row items-center no-wrap">
            <q-icon name="currency_bitcoin" size="22px" class="q-mr-xs text-orange-5" />
            <span class="text-bold">Crypto Achievements</span>
            <span class="banner-count">({{ cryptoUnlockedCount }}/{{ cryptoRewards.length }})</span>
          </div>
          <q-icon
            :name="sectionState.crypto ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            size="24px"
            class="text-grey-5"
          />
        </div>

        <div v-show="sectionState.crypto" class="reward-grid">
          <div v-for="reward in cryptoRewards" :key="reward.title" class="achievement-item">
            <div
              class="badge-box"
              :class="
                reward.unlocked ? `badge-box--${reward.color || 'blue'}` : 'badge-box--locked'
              "
            >
              <template v-if="reward.unlocked">
                <img v-if="reward.icon" :src="reward.icon" class="badge-icon" alt="" />
                <q-icon
                  v-else-if="reward.iconName"
                  :name="reward.iconName"
                  size="36px"
                  color="white"
                />
                <div v-if="reward.badge" class="badge-count">{{ reward.badge }}</div>
              </template>
              <template v-else>
                <q-icon name="lock" size="28px" class="lock-icon" />
              </template>

              <q-tooltip
                anchor="top middle"
                self="bottom middle"
                :offset="[0, 8]"
                class="bg-grey-9 text-white shadow-10 q-pa-sm rounded-borders"
              >
                <div class="text-bold text-subtitle2">{{ reward.title }}</div>
                <div
                  :class="reward.unlocked ? 'text-green-4' : 'text-grey-5'"
                  class="text-caption text-bold"
                >
                  {{ reward.unlocked ? 'UNLOCKED' : 'LOCKED' }}
                </div>
                <div class="text-caption text-amber-4 q-mt-xs">{{ reward.aim }}</div>
                <div class="text-caption text-grey-4">{{ reward.details }}</div>
              </q-tooltip>
            </div>
            <div class="badge-title" :class="{ 'badge-title--locked': !reward.unlocked }">
              {{ reward.title }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.user-rewards {
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 24px;
  color: #c3c1c0;
  background: #21201d;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.rewards-container {
  max-width: 920px;
  margin: 0 auto;
}

.rewards-header {
  margin-bottom: 20px;
}

.reward-block {
  margin-bottom: 24px;
}

.block-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #262421;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;

  &:hover {
    background: #2d2a26;
  }
}

.banner-title {
  font-size: 15px;
  color: #ffffff;
}

.banner-count {
  margin-left: 6px;
  color: #a09e9c;
  font-weight: 500;
}

.reward-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px 14px;
  padding: 16px 8px 8px;
}

.achievement-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.badge-box {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  }
}

.badge-icon {
  width: 52%;
  height: 52%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.badge-count {
  position: absolute;
  bottom: 6px;
  right: 6px;
  min-width: 22px;
  height: 22px;
  padding: 0 4px;
  border-radius: 50%;
  background: #ffffff;
  color: #21201d;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.badge-box--locked {
  background: #2b2926;
  border: 1px solid #363431;

  .lock-icon {
    color: #6a6866;
  }
}

/* Unlocked color themes matching chess.com badge palettes */
.badge-box--blue {
  background: linear-gradient(135deg, #1e6ad2, #124ea4);
}

.badge-box--green {
  background: linear-gradient(135deg, #5da028, #3b7414);
}

.badge-box--orange {
  background: linear-gradient(135deg, #e69110, #b86d04);
}

.badge-box--red {
  background: linear-gradient(135deg, #d33838, #9e1f1f);
}

.badge-box--gold {
  background: linear-gradient(135deg, #cca028, #967812);
}

.badge-box--sky {
  background: linear-gradient(135deg, #229ed9, #156d9a);
}

.badge-box--teal {
  background: linear-gradient(135deg, #0d9488, #0a5c55);
}

.badge-box--purple {
  background: linear-gradient(135deg, #8b31d0, #5c189b);
}

.badge-box--indigo {
  background: linear-gradient(135deg, #4f46e5, #3730a3);
}

.badge-box--grey-light {
  background: linear-gradient(135deg, #cbd5e1, #64748b);
}

.badge-box--grey {
  background: linear-gradient(135deg, #475569, #334155);
}

.badge-title {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
  color: #c3c1c0;
  word-break: break-word;
}

.badge-title--locked {
  color: #6a6866;
}

@media (max-width: 600px) {
  .user-rewards {
    padding: 16px 12px;
  }

  .reward-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 16px 10px;
  }

  .badge-title {
    font-size: 11px;
  }
}
</style>
