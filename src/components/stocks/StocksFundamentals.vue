<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PageTitle from 'src/components/PageTitleFactory.vue'
import StocksCommon from './StocksCommon.vue'

const tab = ref('common_metrics')
const splitterModel = ref(22)
const { locale } = useI18n({ useScope: 'global' })
const lang = () => locale.value.split('-')[0]
const section = computed(() => {
  if (tab.value === 'income_statement') return { en: 'Income Statement', bg: 'Отчет за приходите' }
  if (tab.value === 'balance_sheet') return { en: 'Balance Sheet', bg: 'Балансов отчет' }
  return { en: 'Cash Flow Statement', bg: 'Отчет за паричните потоци' }
})

const tabs = [
  {
    name: 'common_metrics',
    label: { en: 'Common Metrics', bg: 'Общи метрики' },
  },
  { name: 'income_statement', label: { en: 'Income Statement', bg: 'Отчет за приходите' } },
  { name: 'balance_sheet', label: { en: 'Balance Sheet', bg: 'Балансов отчет' } },
  { name: 'cash_flow', label: { en: 'Cash Flow Statement', bg: 'Отчет за паричните потоци' } },
  {
    name: 'dividend_fundamentals',
    label: { en: 'Dividend', bg: 'Дивидент' },
  },
]

const bondTab = ref('what_is_dividend')
const dividendGroups = [
  {
    name: 'what_is_dividend',
    label: { en: 'What is a dividend', bg: 'Какво е дивидент' },
    content: {
      en: "A dividend is a distribution of part of a company's profit to its shareholders.",
      bg: 'Дивидентът е разпределение на част от печалбата на компанията към нейните акционери.',
    },
    children: [
      {
        name: 'why_dividends_paid',
        label: {
          en: 'Why some companies pay dividends and others do not',
          bg: 'Защо едни компании изплащат дивиденти, а други не',
        },
        content: {
          en: 'Companies often pay dividends when they have stable cash flows and fewer opportunities to reinvest profit. Growth companies may retain earnings to fund expansion.',
          bg: 'Компаниите често изплащат дивиденти, когато имат стабилни парични потоци и по-малко възможности за реинвестиране. Растящите компании могат да задържат печалбата за развитие.',
        },
      },
      {
        name: 'buybacks_vs_dividends',
        label: {
          en: 'Share buybacks versus dividend payments',
          bg: 'Обратни изкупувания на акции срещу изплащането на дивидент',
        },
        content: {
          en: 'Buybacks reduce the number of shares outstanding, while dividends distribute cash directly. The better choice depends on valuation, taxes and capital allocation.',
          bg: 'Обратните изкупувания намаляват броя на акциите, докато дивидентите разпределят парични средства директно. Изборът зависи от оценката, данъците и разпределението на капитала.',
        },
      },
    ],
  },
  {
    name: 'dividend_kings_aristocrats',
    label: {
      en: 'Dividend Kings and Dividend Aristocrats',
      bg: 'Дивидентни крале и дивидентни аристократи',
    },
    content: {
      en: 'Dividend Kings have increased their dividend for at least 50 consecutive years. Dividend Aristocrats have increased it for at least 25 years.',
      bg: 'Дивидентните крале са увеличавали дивидента си поне 50 последователни години. Дивидентните аристократи са го увеличавали поне 25 години.',
    },
    children: [
      {
        name: 'dividend_kings',
        label: { en: 'Dividend Kings', bg: 'Дивидентни крале' },
        content: {
          en: 'Dividend Kings are companies that have increased their dividend for at least 50 consecutive years.',
          bg: 'Дивидентните крале са компании, които са увеличавали дивидента си поне 50 последователни години.',
        },
      },
      {
        name: 'dividend_aristocrats',
        label: { en: 'Dividend Aristocrats', bg: 'Дивидентни аристократи' },
        content: {
          en: 'Dividend Aristocrats are companies that have increased their dividend for at least 25 consecutive years.',
          bg: 'Дивидентните аристократи са компании, които са увеличавали дивидента си поне 25 последователни години.',
        },
      },
    ],
  },
  {
    name: 'dividend_analysis',
    label: { en: 'Dividend analysis', bg: 'Анализ на дивидента' },
    content: {
      en: "Dividend analysis compares yield, payout ratio, growth and the company's ability to sustain future payments.",
      bg: 'Анализът на дивидента сравнява доходността, коефициента на изплащане, растежа и способността на компанията да поддържа бъдещи плащания.',
    },
    children: [
      {
        name: 'dividend_yield',
        label: { en: 'Dividend Yield', bg: 'Дивидентна доходност' },
        content: {
          en: 'Dividend yield measures annual dividend payments relative to the current share price.',
          bg: 'Дивидентната доходност измерва годишните дивидентни плащания спрямо текущата цена на акцията.',
        },
      },
      {
        name: 'dividend_payout_ratio',
        label: { en: 'Dividend Payout Ratio', bg: 'Коефициент на изплащане на дивидента' },
        content: {
          en: 'The payout ratio shows what share of net income is paid as dividends.',
          bg: 'Коефициентът на изплащане показва каква част от нетната печалба се изплаща като дивидент.',
        },
      },
      {
        name: 'payout_from_net_income',
        label: {
          en: 'Dividend payout from net income',
          bg: 'Изплащане на дивидент чрез чисти печалби',
        },
        content: {
          en: 'A net-income payout ratio compares dividends with accounting profit and should be checked against earnings quality.',
          bg: 'Коефициентът спрямо чистата печалба сравнява дивидентите със счетоводната печалба и трябва да се оценява спрямо качеството на печалбата.',
        },
      },
      {
        name: 'payout_from_free_cash_flow',
        label: {
          en: 'Dividend payout from free cash flow',
          bg: 'Изплащане на дивидент чрез свободни парични потоци',
        },
        content: {
          en: 'A free-cash-flow payout ratio compares dividends with the cash left after capital expenditures.',
          bg: 'Коефициентът спрямо свободния паричен поток сравнява дивидентите с паричните средства след капиталовите разходи.',
        },
      },
      {
        name: 'dividend_growth_rate',
        label: { en: 'Dividend Growth Rate', bg: 'Растеж на дивидента' },
        content: {
          en: 'The dividend growth rate tracks how quickly a company has increased its dividend over time.',
          bg: 'Растежът на дивидента показва с каква скорост компанията е увеличавала дивидента си във времето.',
        },
      },
      {
        name: 'dividend_yield_chart',
        label: {
          en: 'Investing with a Dividend Yield Chart',
          bg: 'Инвестиране на базата на дивидентната доходност',
        },
        content: {
          en: 'A dividend yield chart helps compare the current yield with its historical range to assess relative valuation.',
          bg: 'Графиката на дивидентната доходност помага да се сравни текущата доходност с историческия диапазон и да се оцени относителната стойност.',
        },
      },
      {
        name: 'gordon_growth_model',
        label: { en: 'Gordon Growth Model', bg: 'Метод за оценка на Гордън' },
        content: {
          en: 'The Gordon Growth Model estimates value from the next dividend, required return and perpetual dividend growth.',
          bg: 'Моделът на Гордън оценява стойността чрез следващия дивидент, изискваната доходност и постоянния растеж на дивидента.',
        },
      },
    ],
  },
]
const dividendTabs = dividendGroups.flatMap((group) => [group, ...group.children])

// Learning content is intentionally bilingual. Values below are the values from the
// supplied cash-flow example; the teaching text explains the accounting concept.
// Each field is authored as an [en, bg] pair and converted to { en, bg } here so it
// can be looked up as education.field[lang()] in the template.
const pair = ([en, bg]) => ({ en, bg })
const learn = (definition, description, example, interpretation, why, formula = ['', '']) => ({
  definition: pair(definition),
  description: pair(description),
  example: pair(example),
  interpretation: pair(interpretation),
  why: pair(why),
  formula: pair(formula),
})

const income = [
  [
    'revenue',
    'Revenue',
    'Оборот',
    [
      'Income earned from selling goods or providing services.',
      'Приходът, получен от продажба на стоки или предоставяне на услуги.',
    ],
    [
      'Usually the top line of the income statement. It measures sales before expenses.',
      'Обикновено е най-горната основна позиция в отчета. Показва продажбите преди разходите.',
    ],
    [
      'Sell 10,000 units at $25: revenue = $250,000.',
      'Продажба на 10 000 единици по $25: приход = $250 000.',
    ],
    [
      'Look for sustainable growth, not growth caused only by discounts or acquisitions.',
      'Търсете устойчив ръст, а не ръст само от отстъпки или придобивания.',
    ],
    [
      'Revenue shows the scale of the business and is the base for many margins.',
      'Приходите показват мащаба на бизнеса и са база за много маржове.',
    ],
    ['Revenue = price × quantity sold.', 'Приход = цена × продадено количество.'],
  ],
  [
    'revenue_cost',
    'Cost of Revenue',
    'Цена на оборота',
    [
      'Direct costs associated with producing or delivering the goods or services sold.',
      'Преките разходи за производство или предоставяне на продадените стоки или услуги.',
    ],
    [
      'May include materials, direct labor and other costs directly tied to sales.',
      'Може да включва материали, пряк труд и други разходи, пряко свързани с продажбите.',
    ],
    [
      'Revenue $250,000 and direct costs $150,000: cost of revenue = $150,000.',
      'Приход $250 000 и преки разходи $150 000: цената на оборота = $150 000.',
    ],
    [
      'If it rises faster than revenue, gross margin can fall.',
      'Ако расте по-бързо от приходите, брутният марж може да спадне.',
    ],
    [
      'It explains how efficiently sales become gross profit.',
      'Показва колко ефективно продажбите се превръщат в брутна печалба.',
    ],
    ['Gross income = Revenue − Cost of Revenue.', 'Брутен доход = Приходи − Цена на оборота.'],
  ],
  [
    'gross_income',
    'Gross Income',
    'Брутен доход',
    [
      'Revenue remaining after direct costs are deducted.',
      'Приходът, който остава след приспадане на преките разходи.',
    ],
    [
      'It measures profitability before operating expenses.',
      'Измерва рентабилността преди оперативните разходи.',
    ],
    [
      '$250,000 revenue − $150,000 direct costs = $100,000 gross income.',
      '$250 000 приходи − $150 000 преки разходи = $100 000 брутен доход.',
    ],
    [
      'Higher gross income is generally positive, especially if it grows faster than sales.',
      'По-високият брутен доход обикновено е положителен, особено ако расте по-бързо от продажбите.',
    ],
    [
      'It shows what is available to cover operating costs and generate profit.',
      'Показва какво остава за покриване на оперативните разходи и формиране на печалба.',
    ],
    ['Gross income = Revenue − Cost of Revenue.', 'Брутен доход = Приходи − Цена на оборота.'],
  ],
  [
    'gross_margin',
    'Gross Margin',
    'Брутен марж',
    [
      'Gross income expressed as a percentage of revenue.',
      'Брутният доход, изразен като процент от приходите.',
    ],
    [
      'It shows how much of each revenue unit remains after direct costs.',
      'Показва каква част от всеки лев приход остава след преките разходи.',
    ],
    [
      '$100,000 gross income ÷ $250,000 revenue = 40%.',
      '$100 000 брутен доход ÷ $250 000 приходи = 40%.',
    ],
    [
      'Falling margin may indicate pricing pressure or higher input costs.',
      'Спадът може да показва ценови натиск или по-високи разходи за ресурси.',
    ],
    [
      'It is useful for comparing profitability over time.',
      'Полезен е за сравнение на рентабилността във времето.',
    ],
    ['Gross margin = Gross income ÷ Revenue × 100.', 'Брутен марж = Брутен доход ÷ Приходи × 100.'],
  ],
  [
    'operating_expenses',
    'Operating Expenses',
    'Оперативни разходи',
    [
      'Costs of running the business that are not direct production costs.',
      'Разходите за управление и функциониране на бизнеса, които не са преки производствени разходи.',
    ],
    [
      'Examples include selling, general and administrative, and research costs.',
      'Примери са разходи за продажби, администрация и научноизследователска дейност.',
    ],
    [
      '$100,000 gross income − $60,000 operating expenses leaves $40,000 operating income.',
      '$100 000 брутен доход − $60 000 оперативни разходи оставят $40 000 оперативен доход.',
    ],
    [
      'Rapid growth in these costs can reduce operating margin.',
      'Бързият ръст на тези разходи може да намали оперативния марж.',
    ],
    [
      'They reveal cost discipline in the core business.',
      'Показват контрола върху разходите в основната дейност.',
    ],
  ],
  [
    'operating_income',
    'Operating Income',
    'Оперативен доход',
    [
      'Profit generated by core operations before interest and income taxes.',
      'Печалбата от основната дейност преди лихви и данъци върху дохода.',
    ],
    [
      'It connects gross profit with the costs of running the business.',
      'Свързва брутната печалба с разходите за управление на бизнеса.',
    ],
    [
      '$100,000 gross income − $60,000 operating expenses = $40,000.',
      '$100 000 брутен доход − $60 000 оперативни разходи = $40 000.',
    ],
    [
      'Positive, growing operating income usually indicates stronger core profitability.',
      'Положителният и растящ оперативен доход обикновено показва по-добра основна рентабилност.',
    ],
    [
      'It separates operating performance from financing and tax effects.',
      'Отделя оперативното представяне от ефектите на финансиране и данъци.',
    ],
    [
      'Operating income = Gross income − Operating expenses.',
      'Оперативен доход = Брутен доход − Оперативни разходи.',
    ],
  ],
  [
    'operating_margin',
    'Operating Margin',
    'Оперативен марж',
    [
      'Operating income expressed as a percentage of revenue.',
      'Оперативният доход, изразен като процент от приходите.',
    ],
    [
      'It measures profit retained from each unit of revenue after operating costs.',
      'Показва печалбата, оставаща от всеки лев приход след оперативните разходи.',
    ],
    [
      '$40,000 operating income ÷ $250,000 revenue = 16%.',
      '$40 000 оперативен доход ÷ $250 000 приходи = 16%.',
    ],
    [
      'A rising margin can signal better pricing, productivity or cost control.',
      'Растящият марж може да показва по-добро ценообразуване, производителност или контрол.',
    ],
    [
      'It is a key measure of the economics of the core business.',
      'Това е ключов показател за икономиката на основната дейност.',
    ],
    [
      'Operating margin = Operating income ÷ Revenue × 100.',
      'Оперативен марж = Оперативен доход ÷ Приходи × 100.',
    ],
  ],
  [
    'tax_expenses',
    'Tax Expenses',
    'Данъчни разходи',
    [
      'Income-tax expense recognized for the reporting period.',
      'Признатият разход за данък върху дохода за отчетния период.',
    ],
    [
      'Accounting tax expense can differ from cash taxes paid because of timing differences.',
      'Счетоводният данъчен разход може да се различава от платените данъци заради времеви разлики.',
    ],
    [
      'Pre-tax income $50,000 and tax expense $10,000 leaves $40,000, ignoring other items.',
      'Доход преди данъци $50 000 и данъчен разход $10 000 оставят $40 000, без други позиции.',
    ],
    [
      'Compare it with pre-tax income to understand the effective tax burden.',
      'Сравнявайте го с дохода преди данъци, за да разберете ефективната данъчна тежест.',
    ],
    [
      'It explains part of the bridge from pre-tax profit to net income.',
      'Обяснява част от прехода от печалба преди данъци към чист доход.',
    ],
    [
      'Net income ≈ Pre-tax income − Tax expense.',
      'Чист доход ≈ Доход преди данъци − Данъчен разход.',
    ],
  ],
  [
    'net_income',
    'Net Income',
    'Чист доход',
    [
      'Profit remaining after recognized revenues, expenses, gains, losses, interest and taxes.',
      'Печалбата след признатите приходи, разходи, печалби, загуби, лихви и данъци.',
    ],
    [
      'It is the bottom-line result and the starting point for an indirect cash-flow reconciliation.',
      'Това е крайният резултат и начална точка при косвения метод на отчета за паричните потоци.',
    ],
    [
      'If recognized income is $300,000 and recognized expenses are $230,000, net income is $70,000.',
      'Ако признатите приходи са $300 000, а разходите $230 000, чистият доход е $70 000.',
    ],
    [
      'Positive net income does not guarantee positive cash flow.',
      'Положителният чист доход не гарантира положителен паричен поток.',
    ],
    [
      'It is a major measure of accounting profitability and links statements.',
      'Това е основен показател за счетоводна рентабилност и свързва отчетите.',
    ],
    [
      'Net income = Revenue − applicable expenses + applicable gains.',
      'Чист доход = Приходи − приложими разходи + приложими печалби.',
    ],
  ],
]

const incomeMetrics = income.map(
  ([key, en, bg, definition, description, example, interpretation, why, formula]) => ({
    key,
    label: { en, bg },
    education: learn(definition, description, example, interpretation, why, formula),
  }),
)

const innerTabIncomeStatement = ref(incomeMetrics[0].key)

/* BALANCE SHEET */
const balanceGroups = [
  {
    key: 'current_assets',
    label: ['Current Assets', 'Текущи активи'],
    items: [
      [
        'cash',
        'Cash & Cash Equivalents',
        'Парични средства и еквиваленти',
        [
          'Cash plus highly liquid short-term investments.',
          'Парични средства и високоликвидни краткосрочни инвестиции.',
        ],
        [
          'The most liquid resources available for daily operations.',
          'Най-ликвидните ресурси за ежедневната дейност.',
        ],
        [
          '$100,000 in bank accounts and qualifying cash equivalents.',
          '$100 000 по банкови сметки и допустими парични еквиваленти.',
        ],
        [
          'More liquidity improves flexibility; excessive idle cash may signal unused capital.',
          'Повече ликвидност дава гъвкавост; прекомерните свободни пари могат да показват неизползван капитал.',
        ],
        [
          'It is a first indicator of short-term liquidity.',
          'Това е основен индикатор за краткосрочната ликвидност.',
        ],
        [
          'Cash & equivalents = Bank balances + Instruments maturing in 90 days or less.',
          'Пари и еквиваленти = Банкови салда + Инструменти с падеж до 90 дни.',
        ],
      ],
      [
        'securities',
        'Marketable Securities',
        'Търгуеми ценни книжа',
        [
          'Short-term investments that can generally be sold readily in an active market.',
          'Краткосрочни инвестиции, които обикновено могат лесно да бъдат продадени на активен пазар.',
        ],
        [
          'They can earn a return while remaining relatively liquid.',
          'Могат да носят доходност, като остават сравнително ликвидни.',
        ],
        [
          'Invest $50,000 of excess cash in liquid short-term securities.',
          'Инвестиране на $50 000 свободни пари във високоликвидни краткосрочни ценни книжа.',
        ],
        [
          'Check the security type, valuation risk and accounting treatment.',
          'Проверявайте вида на ценната книга, риска от промяна в стойността и счетоводното третиране.',
        ],
        [
          'They show how excess liquidity is temporarily invested.',
          'Показват как свободната ликвидност е временно инвестирана.',
        ],
        [
          'Marketable securities = Fair value of short-term tradable investments.',
          'Търгуеми ценни книжа = Справедлива стойност на краткосрочните ликвидни инвестиции.',
        ],
      ],
    ],
  },
  {
    key: 'non_current_assets',
    label: ['Non-current Assets', 'Нетекущи активи'],
    items: [
      [
        'property_plant_equipment',
        'Property, Plant & Equipment',
        'Имоти, машини и съоръжения',
        [
          'Tangible long-lived assets used in the business.',
          'Материални дълготрайни активи, използвани в бизнеса.',
        ],
        [
          'Includes buildings, machinery and equipment used over multiple periods.',
          'Включва сгради, машини и оборудване, използвани през няколко периода.',
        ],
        [
          'A $300,000 machine may be capitalized and depreciated over its useful life.',
          'Машина за $300 000 може да бъде капитализирана и амортизирана през полезния си живот.',
        ],
        [
          'Growth can indicate expansion; decline can reflect depreciation or disposals.',
          'Ръстът може да показва разширяване; спадът — амортизация или продажби.',
        ],
        [
          'It shows the physical capital base supporting operations.',
          'Показва материалната капиталова база на дейността.',
        ],
        [
          'Net PP&E = Gross PP&E − accumulated depreciation − impairments.',
          'Нетно PP&E = Брутно PP&E − натрупана амортизация − обезценки.',
        ],
      ],
      [
        'intangibles',
        'Intangible Assets',
        'Нематериални активи',
        [
          'Identifiable non-physical assets such as patents, licenses and certain acquired technology.',
          'Идентифицируеми нефизически активи като патенти, лицензи и определени придобити технологии.',
        ],
        [
          'They can provide future economic benefits without physical form.',
          'Могат да носят бъдещи икономически ползи без физическа форма.',
        ],
        [
          'An acquired patent costing $80,000 may be recognized as an intangible asset.',
          'Придобит патент за $80 000 може да бъде признат като нематериален актив.',
        ],
        [
          'Review amortization and impairment risk, especially after acquisitions.',
          'Проверявайте амортизацията и риска от обезценка, особено след придобивания.',
        ],
        [
          'They capture important economic resources that are not physical.',
          'Отразяват важни икономически ресурси без физическа форма.',
        ],
        [
          'Net intangibles = Cost − Accumulated amortization.',
          'Нетни нематериални активи = Стойност − Натрупана амортизация.',
        ],
      ],
    ],
  },
  {
    key: 'current_liabilities',
    label: ['Current Liabilities', 'Текущи задължения'],
    items: [
      [
        'accounts_payable',
        'Accounts Payable',
        'Задължения към доставчици',
        [
          'Amounts owed to suppliers for goods or services already received.',
          'Суми, дължими на доставчици за вече получени стоки или услуги.',
        ],
        [
          'Usually settled in the normal operating cycle.',
          'Обикновено се уреждат в рамките на нормалния оперативен цикъл.',
        ],
        [
          'A $28,000 supplier invoice received on credit creates $28,000 payable.',
          'Фактура от доставчик за $28 000 на кредит създава задължение $28 000.',
        ],
        [
          'A rising balance can preserve cash, but may also indicate payment pressure.',
          'Растящото салдо може да пази пари, но може и да показва напрежение при плащанията.',
        ],
        [
          'It is central to working-capital and liquidity analysis.',
          'Ключово е за анализа на оборотния капитал и ликвидността.',
        ],
        [
          'Accounts payable = Amount owed to suppliers for goods or services already received.',
          'Задължения към доставчици = Дължима сума за получени стоки или услуги.',
        ],
      ],
      [
        'deferred_revenue',
        'Deferred Revenue',
        'Отложени приходи',
        [
          'Cash received before the related goods or services are earned under the accounting rules.',
          'Пари, получени преди свързаните стоки или услуги да са спечелени според счетоводните правила.',
        ],
        [
          'It is initially a liability because the company still owes performance to the customer.',
          'Първоначално е задължение, защото компанията все още дължи изпълнение на клиента.',
        ],
        [
          'A customer prepays $12,000 for a one-year service contract.',
          'Клиент предплаща $12 000 за едногодишен договор за услуга.',
        ],
        [
          'Growing deferred revenue can indicate customer prepayments and future revenue.',
          'Ръстът може да показва предплащания от клиенти и бъдещи приходи.',
        ],
        [
          'It explains why cash receipt and revenue recognition can occur in different periods.',
          'Обяснява защо получаването на пари и признаването на приходи могат да са в различни периоди.',
        ],
        [
          'Deferred revenue = Cash collected for goods or services not yet delivered.',
          'Отложени приходи = Получени пари за недоставени стоки или услуги.',
        ],
      ],
    ],
  },
  {
    key: 'non_current_liabilities',
    label: ['Non-current Liabilities', 'Нетекущи задължения'],
    items: [
      [
        'long_term_debt',
        'Long-term Debt',
        'Дългосрочен дълг',
        [
          'Borrowing not expected to be settled within the next year or normal operating cycle.',
          'Заемно финансиране, което не се очаква да бъде погасено през следващата година или нормалния цикъл.',
        ],
        [
          'Can include long-term bank loans and bonds.',
          'Може да включва дългосрочни банкови заеми и облигации.',
        ],
        [
          'A company issues $200,000 of long-term debt to finance a facility.',
          'Компания емитира $200 000 дългосрочен дълг за финансиране на съоръжение.',
        ],
        [
          'Debt can fund growth but increases future principal and interest obligations.',
          'Дългът може да финансира растеж, но увеличава бъдещите задължения за главница и лихви.',
        ],
        [
          'It is essential for leverage and solvency analysis.',
          'Ключов е за анализа на задлъжнялостта и платежоспособността.',
        ],
        [
          'Long-term debt = Principal on borrowings due in more than 12 months.',
          'Дългосрочен дълг = Главница по заеми с падеж над 12 месеца.',
        ],
      ],
    ],
  },
  {
    key: 'equity',
    label: ["Shareholders' Equity", 'Собствен капитал'],
    items: [
      [
        'shareholders_equity',
        "Shareholders' Equity",
        'Собствен капитал на акционерите',
        [
          'The residual interest in assets after liabilities are deducted.',
          'Остатъчният интерес в активите след приспадане на задълженията.',
        ],
        [
          'Can include contributed capital, retained earnings and other equity components.',
          'Може да включва внесен капитал, неразпределена печалба и други компоненти.',
        ],
        [
          'Assets $1,000,000 − liabilities $600,000 = equity $400,000.',
          'Активи $1 000 000 − задължения $600 000 = капитал $400 000.',
        ],
        [
          'Profits and new capital can increase equity; losses, dividends and buybacks can reduce it.',
          'Печалби и нов капитал увеличават капитала; загуби, дивиденти и обратно изкупуване могат да го намалят.',
        ],
        [
          'It represents the owners’ residual claim and completes the balance-sheet equation.',
          'Представлява остатъчния интерес на собствениците и завършва балансовото уравнение.',
        ],
        ['Assets = Liabilities + Shareholders’ Equity.', 'Активи = Задължения + Собствен капитал.'],
      ],
    ],
  },
]

const balanceGroupsReady = balanceGroups.map((group) => ({
  ...group,
  label: { en: group.label[0], bg: group.label[1] },
  items: group.items.map(
    ([key, en, bg, definition, description, example, interpretation, why, formula]) => ({
      key,
      label: { en, bg },
      education: learn(definition, description, example, interpretation, why, formula),
    }),
  ),
}))
const balanceMetrics = balanceGroupsReady.flatMap((g) => g.items)
const innerTabBalanceSheet = ref(balanceMetrics[0].key)

/* CASH FLOW STATEMENT */
const cashFlowGroups = [
  {
    key: 'operating',
    label: ['Cash Flows from Operating Activities', 'Парични потоци от оперативна дейност'],
    items: [
      [
        'cf_net_income',
        'Net Income',
        'Чист доход',
        '$ 230,000',
        false,
        [
          'Accounting profit for the period; the starting point of the indirect cash-flow reconciliation.',
          'Счетоводната печалба за периода; начална точка при косвеното съгласуване на паричните потоци.',
        ],
        [
          'It is adjusted for non-cash items and working-capital changes to reach operating cash flow.',
          'Коригира се за непарични позиции и промени в оборотния капитал, за да се получи оперативният паричен поток.',
        ],
        [
          'The supplied statement starts operating cash flow with $230,000.',
          'Предоставеният отчет започва оперативния паричен поток с $230 000.',
        ],
        [
          'Compare it with operating cash flow to judge how well profit converts into cash.',
          'Сравнете го с оперативния паричен поток, за да видите доколко печалбата се превръща в пари.',
        ],
        [
          'It links the income statement to the cash-flow statement.',
          'Свързва отчета за приходите с отчета за паричните потоци.',
        ],
        [
          'Starting point of CFO = Net income (from the income statement).',
          'Начална точка на CFO = Чист доход (от отчета за приходите).',
        ],
      ],
      [
        'cf_depreciation',
        'Depreciation and Amortization',
        'Амортизация',
        '61,000',
        false,
        [
          'Non-cash allocation of long-lived asset cost over useful lives.',
          'Непарично разпределение на стойността на дълготрайни активи през полезния им живот.',
        ],
        [
          'It reduces accounting profit but is added back under the indirect method.',
          'Намалява счетоводната печалба, но се добавя обратно при косвения метод.',
        ],
        [
          '$61,000 depreciation is shown in the supplied statement.',
          'В предоставения отчет е показана амортизация $61 000.',
        ],
        [
          'It helps explain why operating cash flow can exceed net income.',
          'Помага да се разбере защо оперативният паричен поток може да надвишава чистия доход.',
        ],
        [
          'It is a classic example of a non-cash expense.',
          'Класически пример е за непаричен разход.',
        ],
        [
          'Non-cash add-back = + Depreciation and amortization.',
          'Непарична корекция = + Амортизация.',
        ],
      ],
      [
        'cf_loss_sale',
        'Loss on Sale of Equipment',
        'Загуба от продажба на оборудване',
        '15,000',
        false,
        [
          'Accounting loss when equipment is sold below its carrying amount.',
          'Счетоводна загуба при продажба на оборудване под балансовата му стойност.',
        ],
        [
          'The loss affects net income but is not the cash proceeds; proceeds belong in investing activities.',
          'Загубата влияе на чистия доход, но не е паричната сума от продажбата; постъпленията са инвестиционен поток.',
        ],
        [
          'Carrying value $55,000 and sale price $40,000 create a $15,000 loss.',
          'Балансова стойност $55 000 и продажна цена $40 000 създават загуба $15 000.',
        ],
        [
          'Add the loss back in operating reconciliation; show actual proceeds in investing.',
          'Добавете загубата обратно при оперативното съгласуване; покажете реалните постъпления при инвестициите.',
        ],
        [
          'It teaches the difference between accounting loss and cash received.',
          'Показва разликата между счетоводна загуба и получени пари.',
        ],
        [
          'Non-cash add-back = + Loss on sale of equipment.',
          'Непарична корекция = + Загуба от продажба на оборудване.',
        ],
      ],
      [
        'cf_ar',
        'Increase in Accounts Receivable',
        'Увеличение на вземанията',
        '(21,000)',
        false,
        [
          'An increase means more customer balances are still outstanding.',
          'Увеличението означава, че клиентите дължат повече неполучени суми.',
        ],
        [
          'Under the indirect method it is subtracted because recognized revenue has not yet become cash.',
          'При косвения метод се изважда, защото признатият приход все още не е превърнат в пари.',
        ],
        ['The statement shows an increase of $21,000.', 'Отчетът показва увеличение с $21 000.'],
        [
          'Persistent growth can indicate slower collections or weaker cash conversion.',
          'Продължителният ръст може да показва по-бавно събиране или по-слабо превръщане на печалбата в пари.',
        ],
        ['It is a key working-capital adjustment.', 'Ключова корекция на оборотния капитал е.'],
        [
          'Cash effect of AR = − (Ending AR − Beginning AR).',
          'Паричен ефект от вземанията = − (Крайни вземания − Начални вземания).',
        ],
      ],
      [
        'cf_prepaid',
        'Decrease in Prepaid Expenses',
        'Намаление на предплатените разходи',
        '1,000',
        false,
        [
          'A reduction in costs paid in advance, such as prepaid insurance or rent.',
          'Намаление на предварително платени разходи, например застраховка или наем.',
        ],
        [
          'Under the indirect method, a decrease in a prepaid asset is generally added back.',
          'При косвения метод намалението на предплатен актив обикновено се добавя обратно.',
        ],
        ['The statement shows a $1,000 decrease.', 'Отчетът показва намаление от $1 000.'],
        [
          'A decrease generally releases working capital; an increase generally consumes it.',
          'Намалението обикновено освобождава оборотен капитал; увеличението го използва.',
        ],
        [
          'It connects balance-sheet changes with cash flow.',
          'Свързва промените в баланса с паричния поток.',
        ],
        [
          'Cash effect of prepaid expenses = + (Beginning − Ending prepaid).',
          'Паричен ефект от предплатените разходи = + (Начални − Крайни предплатени разходи).',
        ],
      ],
      [
        'cf_ap',
        'Decrease in Accounts Payable',
        'Намаление на задълженията към доставчици',
        '(28,000)',
        false,
        [
          'A decrease means the company owes suppliers less than before.',
          'Намалението означава, че компанията дължи по-малко на доставчиците.',
        ],
        [
          'It is subtracted under the indirect method because cash was used to settle supplier obligations.',
          'Изважда се при косвения метод, защото са използвани пари за плащане на задължения.',
        ],
        ['The statement shows a $28,000 decrease.', 'Отчетът показва намаление от $28 000.'],
        [
          'It can indicate faster supplier payments or use of cash to reduce obligations.',
          'Може да показва по-бързо плащане към доставчици или използване на пари за намаляване на дълга.',
        ],
        [
          'It is an important cash-conversion signal.',
          'Важен сигнал за превръщането на оборотния капитал в пари.',
        ],
        [
          'Cash effect of AP = Ending AP − Beginning AP (a decrease subtracts cash).',
          'Паричен ефект от задълженията = Крайни задължения − Начални задължения (намалението намалява паричния поток).',
        ],
      ],
      [
        'cf_cfo',
        'Net Cash Provided by Operating Activities',
        'Нетни парични средства от оперативна дейност',
        '262,000',
        true,
        [
          'Net cash generated or used by core operating activities.',
          'Нетните пари, генерирани или използвани от основната дейност.',
        ],
        [
          'The indirect method reconciles net income to this amount.',
          'Косвеният метод съгласува чистия доход до тази сума.',
        ],
        ['The supplied statement reports $262,000.', 'Предоставеният отчет показва $262 000.'],
        [
          'Consistently positive CFO is generally a favorable sign of cash-generating operations.',
          'Постоянно положителният CFO обикновено е добър знак за генерираща пари дейност.',
        ],
        [
          'It is one of the most important measures of operating cash generation.',
          'Един от най-важните показатели за генериране на оперативни пари е.',
        ],
        [
          'CFO = Net income + non-cash adjustments + working-capital adjustments.',
          'CFO = Чист доход + непарични корекции + корекции на оборотния капитал.',
        ],
      ],
    ],
  },
  {
    key: 'investing',
    label: ['Cash Flows from Investing Activities', 'Парични потоци от инвестиционна дейност'],
    items: [
      [
        'cf_capex',
        'Capital Expenditures',
        'Капиталови разходи',
        '(300,000)',
        false,
        [
          'Cash spent to acquire, build or improve long-lived assets.',
          'Пари за придобиване, изграждане или подобряване на дълготрайни активи.',
        ],
        [
          'CapEx is an investing cash outflow because it invests in productive capacity.',
          'CapEx е инвестиционен отток, защото инвестира в производствен капацитет.',
        ],
        [
          'The statement reports $300,000 of capital expenditures.',
          'Отчетът показва $300 000 капиталови разходи.',
        ],
        [
          'Large CapEx can reduce current cash but support future growth.',
          'Големият CapEx може да намали текущите пари, но да подпомогне бъдещия растеж.',
        ],
        [
          'It shows how much cash is reinvested in the asset base.',
          'Показва колко пари се реинвестират в активната база.',
        ],
        [
          'CapEx = Cash paid to purchase or improve property, plant and equipment.',
          'Капиталови разходи = Платени пари за придобиване или подобряване на дълготрайни активи.',
        ],
      ],
      [
        'cf_sale_equipment',
        'Proceeds from Sale of Equipment',
        'Постъпления от продажба на оборудване',
        '40,000',
        false,
        [
          'Cash received from selling equipment or another long-lived asset.',
          'Получени пари от продажба на оборудване или друг дълготраен актив.',
        ],
        [
          'Actual cash proceeds are investing cash flow, separate from accounting gain or loss.',
          'Реалните постъпления са инвестиционен поток, отделно от счетоводната печалба или загуба.',
        ],
        ['The statement reports $40,000 of proceeds.', 'Отчетът показва $40 000 постъпления.'],
        [
          'Compare proceeds with CapEx to understand asset expansion or disposal.',
          'Сравнявайте постъпленията с CapEx, за да разберете разширяване или освобождаване на активи.',
        ],
        [
          'It illustrates the difference between cash proceeds and accounting gain/loss.',
          'Илюстрира разликата между пари от продажба и счетоводна печалба/загуба.',
        ],
        [
          'Proceeds from sale = Cash received from disposing of equipment.',
          'Постъпления от продажба = Получени пари от продажба на оборудване.',
        ],
      ],
      [
        'cf_cfi',
        'Net Cash Used for Investing Activities',
        'Нетни парични средства за инвестиционна дейност',
        '(260,000)',
        true,
        [
          'Combined cash effect of investing inflows and outflows.',
          'Комбинираният паричен ефект от инвестиционни постъпления и плащания.',
        ],
        [
          'Negative investing cash flow often reflects purchases of long-lived assets.',
          'Отрицателният инвестиционен поток често отразява покупки на дълготрайни активи.',
        ],
        [
          '$300,000 CapEx − $40,000 sale proceeds = $(260,000).',
          '$300 000 CapEx − $40 000 постъпления = $(260 000).',
        ],
        [
          'Negative is not automatically bad; evaluate the expected return on investment.',
          'Отрицателният поток не е автоматично лош; оценете очакваната възвръщаемост.',
        ],
        [
          'It shows how management deploys cash into long-term assets.',
          'Показва как ръководството насочва пари към дългосрочни активи.',
        ],
        [
          'CFI = investing inflows − investing outflows.',
          'CFI = инвестиционни постъпления − инвестиционни плащания.',
        ],
      ],
    ],
  },
  {
    key: 'financing',
    label: ['Cash Flows from Financing Activities', 'Парични потоци от финансова дейност'],
    items: [
      [
        'cf_debt',
        'Proceeds from Issuing Debt',
        'Постъпления от емитиране на дълг',
        '200,000',
        false,
        [
          'Cash received from borrowing or issuing debt instruments.',
          'Пари, получени от заемане или емитиране на дългови инструменти.',
        ],
        [
          'It is a financing inflow because it changes capital structure and creates repayment obligations.',
          'Финансов приток е, защото променя структурата на капитала и създава задължения за погасяване.',
        ],
        [
          'The statement reports $200,000 of debt proceeds.',
          'Отчетът показва $200 000 постъпления от дълг.',
        ],
        [
          'Debt can fund growth but increases fixed financial obligations.',
          'Дългът може да финансира растеж, но увеличава фиксираните финансови задължения.',
        ],
        [
          'It explains how the company raises cash through borrowing.',
          'Показва как компанията набира пари чрез заемно финансиране.',
        ],
        [
          'Proceeds from debt = Cash received from new borrowings.',
          'Постъпления от дълг = Получени пари от нови заеми.',
        ],
      ],
      [
        'cf_dividends',
        'Dividends Paid',
        'Изплатени дивиденти',
        '(110,000)',
        false,
        ['Cash distributions made to shareholders.', 'Парични разпределения към акционерите.'],
        [
          'They are financing outflows because cash is transferred to owners.',
          'Финансови оттоци са, защото парите се прехвърлят към собствениците.',
        ],
        ['The statement reports $(110,000).', 'Отчетът показва $(110 000).'],
        [
          'Higher dividends return more cash to shareholders but leave less for reinvestment.',
          'По-високите дивиденти връщат повече пари към акционерите, но оставят по-малко за реинвестиране.',
        ],
        [
          'They help explain the company’s capital-return policy.',
          'Помагат да се разбере политиката за връщане на капитал.',
        ],
        [
          'Dividends paid = Cash distributed to shareholders.',
          'Изплатени дивиденти = Пари, разпределени на акционерите.',
        ],
      ],
      [
        'cf_cff',
        'Net Cash Provided by Financing Activities',
        'Нетни парични средства от финансова дейност',
        '90,000',
        true,
        [
          'Combined cash effect of debt, equity and distributions.',
          'Комбинираният паричен ефект от дълг, капитал и разпределения.',
        ],
        [
          'It shows whether financing supplied cash to the company or returned cash to investors.',
          'Показва дали финансирането е внесло пари или е върнало пари на инвеститорите.',
        ],
        [
          '$200,000 debt proceeds − $110,000 dividends = $90,000.',
          '$200 000 дълг − $110 000 дивиденти = $90 000.',
        ],
        [
          'Repeated positive financing flow may indicate external funding dependence.',
          'Продължително положителният поток може да показва зависимост от външно финансиране.',
        ],
        [
          'It explains how capital-structure decisions affect cash.',
          'Показва как решенията за структурата на капитала влияят на парите.',
        ],
        [
          'CFF = financing inflows − financing outflows.',
          'CFF = финансови постъпления − финансови плащания.',
        ],
      ],
    ],
  },
  {
    key: 'summary',
    label: ['Cash Summary', 'Обобщение на паричните средства'],
    items: [
      [
        'cf_net_change',
        'Net Increase in Cash During the Year',
        'Нетно увеличение на паричните средства през годината',
        '92,000',
        true,
        [
          'Total change in cash from operating, investing and financing activities.',
          'Общата промяна в парите от оперативна, инвестиционна и финансова дейност.',
        ],
        [
          'It bridges beginning cash to ending cash.',
          'Свързва началните с крайните парични средства.',
        ],
        [
          'The statement reports a $92,000 net increase.',
          'Отчетът показва нетно увеличение $92 000.',
        ],
        [
          'Positive means ending cash is higher than beginning cash, assuming the figures are complete.',
          'Положително означава по-високи крайни спрямо начални пари, ако данните са пълни.',
        ],
        [
          'It is the final result of the three cash-flow sections.',
          'Крайният резултат от трите раздела на паричния поток е.',
        ],
        ['Net change = CFO + CFI + CFF.', 'Нетна промяна = CFO + CFI + CFF.'],
      ],
      [
        'cf_beginning_cash',
        'Cash at the Beginning of the Year',
        'Парични средства в началото на годината',
        '101,000',
        false,
        [
          'Cash and cash equivalents available at the start of the period.',
          'Парите и еквивалентите в началото на периода.',
        ],
        [
          'It is the starting point for the cash reconciliation.',
          'Началната точка на съгласуването на парите е.',
        ],
        [
          'The statement shows $101,000 beginning cash.',
          'Отчетът показва $101 000 начални парични средства.',
        ],
        [
          'Compare it with ending cash to assess the direction of liquidity.',
          'Сравнете го с крайните пари, за да оцените посоката на ликвидността.',
        ],
        ['It links consecutive reporting periods.', 'Свързва последователните отчетни периоди.'],
        [
          'Ending cash = Beginning cash + Net change.',
          'Крайни пари = Начални пари + Нетна промяна.',
        ],
      ],
    ],
  },
]

const makeCashItem = ([
  key,
  en,
  bg,
  value,
  total,
  definition,
  description,
  example,
  interpretation,
  why,
  formula,
]) => ({
  key,
  label: { en, bg },
  value,
  total,
  education: learn(definition, description, example, interpretation, why, formula),
})
const cashGroupsReady = cashFlowGroups.map((group) => ({
  ...group,
  label: { en: group.label[0], bg: group.label[1] },
  items: group.items.map(makeCashItem),
}))
const cashFlowMetrics = cashGroupsReady.flatMap((g) => g.items)
const innerTabCashFlow = ref(cashFlowMetrics[0].key)
</script>

<template>
  <div class="q-pa-md">
    <div class="guide">
      <div class="guide__tabs-row">
        <PageTitle from="Stocks" title="Fundamentals" />
        <q-tabs
          v-model="tab"
          dense
          inline-label
          no-caps
          outside-arrows
          :mobile-arrows="false"
          class="guide__tabs"
          active-color="green-5"
          indicator-color="green-5"
          align="left"
        >
          <q-tab
            v-for="item in tabs"
            :key="item.name"
            :name="item.name"
            :label="item.label[lang()]"
          />
        </q-tabs>
      </div>
      <q-separator />

      <q-tab-panels v-model="tab" animated class="guide__panels">
        <q-tab-panel name="income_statement" class="q-pa-none bg-dark">
          <q-splitter v-model="splitterModel">
            <template #before>
              <q-tabs v-model="innerTabIncomeStatement" dense vertical class="text-green-5">
                <q-tab
                  v-for="metric in incomeMetrics"
                  :key="metric.key"
                  no-caps
                  :name="metric.key"
                  :label="metric.label[lang()]"
                />
              </q-tabs>
            </template>
            <template #after>
              <q-tab-panels
                v-model="innerTabIncomeStatement"
                animated
                transition-prev="slide-down"
                transition-next="slide-up"
              >
                <q-tab-panel
                  v-for="metric in incomeMetrics"
                  :key="metric.key"
                  :name="metric.key"
                  class="bg-dark"
                >
                  <div>
                    <div class="text-caption text-grey-5">{{ section[lang()] }}</div>
                    <div class="text-h5 text-green-5 q-mt-xs">{{ metric.label[lang()] }}</div>
                    <div v-if="metric.value" class="text-h6 q-mt-sm">{{ metric.value }}</div>
                    <q-separator class="q-my-md" />
                    <div class="learning-grid">
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Определение' : 'Definition' }}
                        </div>
                        <div class="learning-body">{{ metric.education.definition[lang()] }}</div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Описание' : 'Description' }}
                        </div>
                        <div class="learning-body">
                          {{ metric.education.description[lang()] }}
                        </div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Пример' : 'Example' }}
                        </div>
                        <div class="learning-body">{{ metric.education.example[lang()] }}</div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Как да го тълкуваме' : 'How to interpret it' }}
                        </div>
                        <div class="learning-body">
                          {{ metric.education.interpretation[lang()] }}
                        </div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Защо е важно' : 'Why it matters' }}
                        </div>
                        <div class="learning-body">{{ metric.education.why[lang()] }}</div>
                      </div>
                      <div
                        v-if="metric.education.formula[lang()]"
                        class="learning-cell formula-cell"
                      >
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Формула' : 'Formula' }}
                        </div>
                        <div class="formula">{{ metric.education.formula[lang()] }}</div>
                      </div>
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </template>
          </q-splitter>
        </q-tab-panel>

        <q-tab-panel name="common_metrics" class="q-pt-md bg-dark">
          <StocksCommon />
        </q-tab-panel>

        <q-tab-panel name="balance_sheet" class="q-pa-none bg-dark">
          <q-splitter v-model="splitterModel">
            <template #before>
              <q-tabs v-model="innerTabBalanceSheet" dense vertical class="text-green-5">
                <q-expansion-item
                  v-for="group in balanceGroupsReady"
                  :key="group.key"
                  :label="group.label[lang()]"
                  :content-inset-level="0"
                  class="text-green-5"
                >
                  <q-tab
                    v-for="metric in group.items"
                    :key="metric.key"
                    no-caps
                    :name="metric.key"
                    :label="metric.label[lang()]"
                  />
                </q-expansion-item>
              </q-tabs>
            </template>
            <template #after>
              <q-tab-panels
                v-model="innerTabBalanceSheet"
                animated
                transition-prev="slide-down"
                transition-next="slide-up"
              >
                <q-tab-panel
                  v-for="metric in balanceMetrics"
                  :key="metric.key"
                  :name="metric.key"
                  class="bg-dark"
                >
                  <div>
                    <div class="text-caption text-grey-5">{{ section[lang()] }}</div>
                    <div class="text-h5 text-green-5 q-mt-xs">{{ metric.label[lang()] }}</div>
                    <div v-if="metric.value" class="text-h6 q-mt-sm">{{ metric.value }}</div>
                    <q-separator class="q-my-md" />
                    <div class="learning-grid">
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Определение' : 'Definition' }}
                        </div>
                        <div class="learning-body">{{ metric.education.definition[lang()] }}</div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Описание' : 'Description' }}
                        </div>
                        <div class="learning-body">
                          {{ metric.education.description[lang()] }}
                        </div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Пример' : 'Example' }}
                        </div>
                        <div class="learning-body">{{ metric.education.example[lang()] }}</div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Как да го тълкуваме' : 'How to interpret it' }}
                        </div>
                        <div class="learning-body">
                          {{ metric.education.interpretation[lang()] }}
                        </div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Защо е важно' : 'Why it matters' }}
                        </div>
                        <div class="learning-body">{{ metric.education.why[lang()] }}</div>
                      </div>
                      <div
                        v-if="metric.education.formula[lang()]"
                        class="learning-cell formula-cell"
                      >
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Формула' : 'Formula' }}
                        </div>
                        <div class="formula">{{ metric.education.formula[lang()] }}</div>
                      </div>
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </template>
          </q-splitter>
        </q-tab-panel>

        <q-tab-panel name="cash_flow" class="q-pa-none bg-dark">
          <q-splitter v-model="splitterModel">
            <template #before>
              <q-tabs v-model="innerTabCashFlow" dense vertical class="text-green-5">
                <q-expansion-item
                  v-for="group in cashGroupsReady"
                  :key="group.key"
                  :label="group.label[lang()]"
                  :content-inset-level="0"
                  class="text-green-5"
                >
                  <q-tab
                    v-for="metric in group.items"
                    :key="metric.key"
                    no-caps
                    :name="metric.key"
                    :label="metric.label[lang()]"
                  />
                </q-expansion-item>
              </q-tabs>
            </template>
            <template #after>
              <q-tab-panels
                v-model="innerTabCashFlow"
                animated
                transition-prev="slide-down"
                transition-next="slide-up"
              >
                <q-tab-panel
                  v-for="metric in cashFlowMetrics"
                  :key="metric.key"
                  :name="metric.key"
                  class="bg-dark"
                >
                  <div>
                    <div class="text-caption text-grey-5">{{ section[lang()] }}</div>
                    <div class="text-h5 text-green-5 q-mt-xs">{{ metric.label[lang()] }}</div>
                    <!-- <div v-if="metric.value" class="text-h6 q-mt-sm">{{ metric.value }}</div> -->
                    <q-separator class="q-my-md" />
                    <div class="learning-grid">
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Определение' : 'Definition' }}
                        </div>
                        <div class="learning-body">{{ metric.education.definition[lang()] }}</div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Описание' : 'Description' }}
                        </div>
                        <div class="learning-body">
                          {{ metric.education.description[lang()] }}
                        </div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Пример' : 'Example' }}
                        </div>
                        <div class="learning-body">{{ metric.education.example[lang()] }}</div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Как да го тълкуваме' : 'How to interpret it' }}
                        </div>
                        <div class="learning-body">
                          {{ metric.education.interpretation[lang()] }}
                        </div>
                      </div>
                      <div class="learning-cell">
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Защо е важно' : 'Why it matters' }}
                        </div>
                        <div class="learning-body">{{ metric.education.why[lang()] }}</div>
                      </div>
                      <div
                        v-if="metric.education.formula[lang()]"
                        class="learning-cell formula-cell"
                      >
                        <div class="learning-title">
                          {{ lang() === 'bg' ? 'Формула' : 'Formula' }}
                        </div>
                        <div class="formula">{{ metric.education.formula[lang()] }}</div>
                      </div>
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </template>
          </q-splitter>
        </q-tab-panel>

        <q-tab-panel name="dividend_fundamentals" class="q-pa-none bg-dark">
          <q-splitter v-model="splitterModel">
            <template #before>
              <q-tabs
                v-model="bondTab"
                dense
                vertical
                no-caps
                class="text-grey-5"
                active-color="green-5"
              >
                <q-expansion-item
                  v-for="group in dividendGroups"
                  :key="group.name"
                  :label="group.label[lang()]"
                  :content-inset-level="0"
                  class="text-grey-5"
                  @click="bondTab = group.name"
                >
                  <q-tab :name="group.name" :label="group.label[lang()]" />
                  <q-tab
                    v-for="item in group.children"
                    :key="item.name"
                    :name="item.name"
                    :label="item.label[lang()]"
                  />
                </q-expansion-item>
              </q-tabs>
            </template>
            <template #after>
              <q-tab-panels v-model="bondTab" animated class="bg-dark text-white">
                <q-tab-panel v-for="item in dividendTabs" :key="item.name" :name="item.name">
                  <div class="text-h5 text-green-5 q-mb-md">{{ item.label[lang()] }}</div>
                  <q-separator class="q-mb-md" />
                  <div class="text-body1">{{ item.content[lang()] }}</div>
                </q-tab-panel>
              </q-tab-panels>
            </template>
          </q-splitter>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<style scoped>
.guide {
  --guide-green: #81c784;
  --guide-rail: rgba(255, 255, 255, 0.14);
  color: #f5f5f5;
  background: var(--q-dark-page);
}

.guide__tabs-row {
  display: flex;
  align-items: center;
  min-width: 0;
}

.guide__tabs {
  flex: 1;
  min-width: 0;
  border-bottom: 2px solid rgba(129, 199, 132, 0.3);
}

.guide__tabs :deep(.q-tab) {
  color: rgba(255, 255, 255, 0.72);
  transition:
    color 160ms ease,
    background-color 160ms ease;
}

.guide__tabs :deep(.q-tab:hover) {
  color: #ffffff;
  background: rgba(129, 199, 132, 0.08);
}

.guide__panels {
  background: var(--q-dark-page);
}

.guide :deep(.q-separator) {
  background: var(--guide-rail);
}

.learning-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  justify-content: center;
  justify-items: center;
  gap: 16px;
  color: #e0e0e0;
  line-height: 1.55;
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}
.learning-cell {
  width: 100%;
  max-width: 460px;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  background: #252525;
  padding: 14px;
}
.learning-body {
  color: #e0e0e0;
}
.formula-cell {
  padding: 14px;
}
.learning-title {
  color: #66bb6a;
  font-weight: 700;
  margin-bottom: 7px;
}
.formula {
  font-family: monospace;
  font-size: 0.95rem;
}
@media (max-width: 900px) {
  .learning-grid {
    grid-template-columns: 1fr;
  }
}
</style>
