import companyMetrics from './companyMetrics'
import common from './common'
import pageTitles from './pageTitles'
import bondsFundamentals from './bondsFundamentals'
import faq from './faq'
import booksTrading from './trading-books.en.json'
import booksInvesting from './investing_books.en.json'
import booksRealEstate from './realestate_books.en.json'
import booksBonds from './bonds_books.en.json'
import booksCrypto from './crypto_books.en.json'
import math from './math.json'

export default {
  trading: {
    description: 'Description',
    keyPoints: 'Key points',
    formula: 'Formula',
    example: 'Worked example',
    dataPoints: 'Data',
    noContent: 'No content for this theme.',
  },
  crypto: {
    breadcrumb: 'Crypto / Fundamentals',
    language: 'Language',
    overview: 'Overview',
    description: 'Description',
    keyPoints: 'Key points',
    formula: 'Formula',
    example: 'Example',
    dataPoints: 'Data',
    glossary: 'Glossary',
    term: 'Term',
    definition: 'Definition',
    noContent: 'No content for this theme.',
  },
  ui: {
    guideTitle: 'Real estate investing',
    language: 'Language',
    overview: 'Overview',
    description: 'Description',
    keyPoints: 'Key points',
    formula: 'Formula',
    example: 'Example',
    dataPoints: 'Data',
    glossary: 'Glossary',
    term: 'Term',
    definition: 'Definition',
    subThemes: 'Sub-themes',
    noContent: 'No content for this theme.',
  },
  bookList: {
    title: 'Trading Psychology Reading List',
    subtitle: '5 books every trader should read',
    by: 'by',
    buy: 'View on Amazon',
    langSwitch: 'Език: Български',
  },
  trading_books: booksTrading.books,
  investing_books: booksInvesting.books,
  realestate_books: booksRealEstate.books,
  math: math.math,
  crypto_books: booksCrypto.books,
  bonds_books: booksBonds.books,
  bonds_fundamentals: bondsFundamentals,
  transactions_fee: 'Transaction fee:',
  fee_accumulated: 'Accumulated from transaction fees:',
  articles: 'articles',
  points: 'points',
  bank: 'bank',
  metrics: 'metrics',
  categories: 'categories',
  home: 'home',
  profile: 'profile',
  settings: 'settings',
  logout: 'logout',
  failed: 'Action failed',
  success: 'Action was successful',
  common,
  pageTitles,
  faq,
  education: {
    crypto: {
      label: 'Crypto',
      resources: 'Resources',
      fundamentals: 'Fundamentals',
    },
    stocks: {
      label: 'Stocks',
      resources: 'Resources',
      fundamentals: 'Fundamentals',
    },
    bonds: {
      label: 'Bonds',
      resources: 'Resources',
      fundamentals: 'Fundamentals',
    },
    trading: {
      label: 'Trading',
      resources: 'Resources',
      fundamentals: 'Fundamentals',
    },
    realEstate: {
      label: 'Real Estate',
      resources: 'Resources',
      fundamentals: 'Fundamentals',
    },
    statistics: {
      label: 'Statistics',
      resources: 'Resources',
      fundamentals: 'Fundamentals',
    },
    mindset: {
      label: 'Mindset',
      resources: 'Resources',
      fundamentals: 'Fundamentals',
    },
    health: {
      label: 'Health',
      resources: 'Resources',
      fundamentals: 'Fundamentals',
    },
    companyAnalysis: { ...companyMetrics },
  },
}
