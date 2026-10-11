import companyMetrics from './companyMetrics'
import common from './common'
import pageTitles from './pageTitles'
import bondsFundamentals from './bondsFundamentals'
import faq from './faq'
import booksTrading from './trading-books.bg.json'
import booksInvesting from './investing_books.bg.json'
import booksRealEstate from './realestate_books.bg.json'
import booksBonds from './bonds_books.bg.json'
import booksCrypto from './crypto_books.bg.json'
import math from './math.json'

export default {
  trading: {
    description: 'Описание',
    keyPoints: 'Ключови точки',
    formula: 'Формула',
    example: 'Изчисление',
    dataPoints: 'Данни',
    noContent: 'Няма съдържание за тази тема.',
  },
  crypto: {
    breadcrumb: 'Crypto / Fundamentals',
    language: 'Език',
    overview: 'Накратко',
    description: 'Описание',
    keyPoints: 'Ключови точки',
    formula: 'Формула',
    example: 'Пример',
    dataPoints: 'Данни',
    glossary: 'Речник',
    term: 'Термин',
    definition: 'Определение',
    noContent: 'Няма съдържание за тази тема.',
  },
  ui: {
    guideTitle: 'Инвестиции в недвижими имоти',
    language: 'Език',
    overview: 'Накратко',
    description: 'Описание',
    keyPoints: 'Ключови точки',
    formula: 'Формула',
    example: 'Пример',
    dataPoints: 'Данни',
    glossary: 'Речник',
    term: 'Термин',
    definition: 'Определение',
    subThemes: 'Подтеми',
    noContent: 'Няма съдържание за тази тема.',
  },
  bookList: {
    title: 'Списък за четене по трейдинг психология',
    subtitle: '5 книги, които всеки трейдър трябва да прочете',
    by: 'от',
    buy: 'Виж в Amazon',
    langSwitch: 'Language: English',
  },
  trading_books: booksTrading.books,
  investing_books: booksInvesting.books,
  realestate_books: booksRealEstate.books,
  math: math.math,
  crypto_books: booksCrypto.books,
  bonds_books: booksBonds.books,
  bonds_fundamentals: bondsFundamentals,
  transactions_fee: 'Такса за транзакция:',
  fee_accumulated: 'Натрупани от транзакционни такси:',
  articles: 'артикула',
  points: 'точки',
  bank: 'банкa',
  metrics: 'метрики',
  categories: 'категории',
  home: 'начало',
  profile: 'профил',
  settings: 'настройки',
  logout: 'излез',
  failed: 'Action failed',
  success: 'Action was successful',
  common,
  pageTitles,
  faq,
  education: {
    crypto: {
      label: 'Крипто',
      resources: 'Ресурси',
      fundamentals: 'Фундаменти',
    },
    stocks: {
      label: 'Акции',
      resources: 'Ресурси',
      fundamentals: 'Фундаменти',
    },
    bonds: {
      label: 'Облигации',
      resources: 'Ресурси',
      fundamentals: 'Фундаменти',
    },
    trading: {
      label: 'Търговия',
      resources: 'Ресурси',
      fundamentals: 'Фундаменти',
    },
    realEstate: {
      label: 'Недвижими имоти',
      resources: 'Ресурси',
      fundamentals: 'Фундаменти',
    },
    statistics: {
      label: 'Статистика',
      resources: 'Ресурси',
      fundamentals: 'Фундаменти',
    },
    mindset: {
      label: 'Мисловна нагласа',
      resources: 'Ресурси',
      fundamentals: 'Фундаменти',
    },
    health: {
      label: 'Здраве',
      resources: 'Ресурси',
      fundamentals: 'Фундаменти',
    },
    companyAnalysis: { ...companyMetrics },
  },
}
