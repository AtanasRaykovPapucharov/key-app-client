import enUS from './en-US/index'
import bgBG from './bg-BG/index'

import enRealEstateContent from './en-US/real.estate.content.en.json'
import bgRealEstateContent from './bg-BG/real.estate.content.bg.json'

import enContent from './en-US/crypto_en.json'
import bgContent from './bg-BG/crypto_bg.json'

import tradingEn from './en-US/trading_en.json'
import tradingBg from './bg-BG/trading_bg.json'

import { appEn, appBg } from './app'

/** The content trees live outside vue-i18n messages: they are data, not
 *  interpolated strings. Both files share the same key structure. */
export const tradingContentByLocale = {
  bg: tradingBg,
  en: tradingEn,
}

export const cryptoContentByLocale = {
  en: enContent,
  bg: bgContent,
}
export const realEstateContentByLocale = {
  en: enRealEstateContent,
  bg: bgRealEstateContent,
}

export default {
  'en-US': { ...enUS, app: appEn },
  'bg-BG': { ...bgBG, app: appBg },
}
