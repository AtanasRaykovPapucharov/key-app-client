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
import { useLocalized } from 'src/composables/useLocalized'

const { t } = useLocalized()

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
    get title() {
      return t('app.user.rewards.selfTrader.title')
    },
    get aim() {
      return t('app.user.rewards.selfTrader.aim')
    },
    get details() {
      return t('app.user.rewards.selfTrader.details')
    },
    icon: bitcoinIcon,
    color: 'blue',
    unlocked: true,
    badge: 1,
  },
  {
    get title() {
      return t('app.user.rewards.btcBoss.title')
    },
    get aim() {
      return t('app.user.rewards.btcBoss.aim')
    },
    get details() {
      return t('app.user.rewards.btcBoss.details')
    },
    icon: bitcoinIcon,
    color: 'orange',
    unlocked: true,
    badge: 7,
  },
  {
    get title() {
      return t('app.user.rewards.ethArchitect.title')
    },
    get aim() {
      return t('app.user.rewards.ethArchitect.aim')
    },
    get details() {
      return t('app.user.rewards.ethArchitect.details')
    },
    icon: ethereumIcon,
    color: 'blue',
    unlocked: true,
    badge: 10,
  },
  {
    get title() {
      return t('app.user.rewards.stableCaptain.title')
    },
    get aim() {
      return t('app.user.rewards.stableCaptain.aim')
    },
    get details() {
      return t('app.user.rewards.stableCaptain.details')
    },
    icon: usdcIcon,
    color: 'teal',
    unlocked: true,
    badge: 1,
  },
  {
    get title() {
      return t('app.user.rewards.altcoinScout.title')
    },
    get aim() {
      return t('app.user.rewards.altcoinScout.aim')
    },
    get details() {
      return t('app.user.rewards.altcoinScout.details')
    },
    icon: bnbIcon,
    color: 'purple',
    unlocked: true,
    badge: 5,
  },
  {
    get title() {
      return t('app.user.rewards.solSprinter.title')
    },
    get aim() {
      return t('app.user.rewards.solSprinter.aim')
    },
    get details() {
      return t('app.user.rewards.solSprinter.details')
    },
    icon: solanaIcon,
    color: 'green',
    unlocked: true,
    badge: 25,
  },
  {
    get title() {
      return t('app.user.rewards.bnbBuilder.title')
    },
    get aim() {
      return t('app.user.rewards.bnbBuilder.aim')
    },
    get details() {
      return t('app.user.rewards.bnbBuilder.details')
    },
    icon: bnbIcon,
    color: 'gold',
    unlocked: true,
    badge: 15,
  },
  {
    get title() {
      return t('app.user.rewards.adaScholar.title')
    },
    get aim() {
      return t('app.user.rewards.adaScholar.aim')
    },
    get details() {
      return t('app.user.rewards.adaScholar.details')
    },
    icon: cardanoIcon,
    color: 'indigo',
    unlocked: false,
  },
  {
    get title() {
      return t('app.user.rewards.linkOracle.title')
    },
    get aim() {
      return t('app.user.rewards.linkOracle.aim')
    },
    get details() {
      return t('app.user.rewards.linkOracle.details')
    },
    icon: chainlinkIcon,
    color: 'blue',
    unlocked: true,
    badge: 4,
  },
  {
    get title() {
      return t('app.user.rewards.riskTamer.title')
    },
    get aim() {
      return t('app.user.rewards.riskTamer.aim')
    },
    get details() {
      return t('app.user.rewards.riskTamer.details')
    },
    icon: usdcIcon,
    color: 'green',
    unlocked: true,
    badge: 7,
  },
  {
    get title() {
      return t('app.user.rewards.marketExplorer.title')
    },
    get aim() {
      return t('app.user.rewards.marketExplorer.aim')
    },
    get details() {
      return t('app.user.rewards.marketExplorer.details')
    },
    icon: dogecoinIcon,
    color: 'red',
    unlocked: false,
  },
  {
    get title() {
      return t('app.user.rewards.xrpPioneer.title')
    },
    get aim() {
      return t('app.user.rewards.xrpPioneer.aim')
    },
    get details() {
      return t('app.user.rewards.xrpPioneer.details')
    },
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
            <span class="text-bold">{{ t('app.user.achievements') }}</span>
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
