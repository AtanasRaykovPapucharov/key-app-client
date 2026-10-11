<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const faqKeys = [
  'about',
  'realTrading',
  'blockchain',
  'crypto',
  'bitcoin',
  'ethereum',
  'stablecoin',
  'whyCrypto',
  'wallet',
  'exchange',
  'marketData',
  'live',
  'tradingSimulator',
  'pnl',
  'risk',
  'security',
  'fees',
  'learning',
  'support',
  'contact',
]
</script>

<template>
  <div class="text-purple-4">
    <div class="q-ma-sm q-pl-sm">
      <q-icon size="sm" name="contact_support" />
      <span class="text-h6 q-ml-lg">{{ t('faq.title') }}</span>
    </div>
    <q-expansion-item
      v-for="faqKey in faqKeys"
      :key="faqKey"
      group="faq"
      dense
      :content-inset-level="0"
      class="text-grey-5"
      :label="t(`faq.questions.${faqKey}.question`)"
    >
      <q-card class="bg-grey-9">
        <q-card-section>
          <div class="text-subtitle1 faq-answer">
            {{ t(`faq.questions.${faqKey}.answer`) }}
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<style scoped>
.faq-answer {
  font-size: 14px;
  line-height: 1.5;
  white-space: normal;
  color: #b0bec5;
}
</style>
