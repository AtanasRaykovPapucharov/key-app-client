export default {
  // 1. Business Basics
  businessBasics: {
    label: 'Business Basics',
    metrics: [
      {
        label: 'Industry',
        description: 'The sector or market the company operates in',
        formula: '',
        link: 'industry',
        fic: false,
      },
      {
        label: 'Business Model',
        description: 'The way the company creates value and generates revenue',
        formula: '',
        link: 'businessModel',
        fic: false,
      },
      {
        label: 'Products & Services',
        description: 'The goods and services offered by the company',
        formula: '',
        link: 'productsServices',
        fic: false,
      },
      {
        label: 'Geographic Exposure',
        description: 'The regions where the company operates',
        formula: '',
        link: 'geographicExposure',
        fic: false,
      },
      {
        label: 'Market Share',
        description: "The company's portion of the total market",
        formula: '',
        link: 'marketShare',
        fic: false,
      },
      {
        label: 'Competitive Advantages / Moat',
        description: "The company's sustainable competitive advantages",
        formula: '',
        link: 'competitiveAdvantagesMoat',
        fic: false,
      },
      {
        label: 'Management Quality',
        description: "The effectiveness and competence of the company's management team",
        formula: '',
        link: 'managementQuality',
        fic: false,
      },
      {
        label: 'Insider Ownership',
        description: 'The percentage of shares owned by company insiders',
        formula: '',
        link: 'insiderOwnership',
        fic: false,
      },
      {
        label: 'Institutional Ownership',
        description: 'The percentage of shares owned by institutional investors',
        formula: '',
        link: 'institutionalOwnership',
        fic: false,
      },
      {
        label: 'ESG Factors',
        description: 'Environmental, Social, and Governance factors',
        formula: '',
        link: 'esgFactors',
        fic: false,
      },
    ],
  },
  // 2. Size & Market Metrics
  sizeAndMarketMetrics: {
    label: 'Size & Market Metrics',
    metrics: [
      {
        label: 'Market Cap',
        description: 'The total market value of the company',
        formula: 'Share Price × Shares Outstanding',
        link: 'marketCap',
        fic: false,
      },
      {
        label: 'Enterprise Value',
        description: 'The total value of the company',
        formula: 'Market Cap + Total Debt − Cash',
        link: 'enterpriseValue',
        fic: false,
      },
      {
        label: 'Free Float',
        description: 'The number of shares available for public trading',
        formula: 'Publicly Tradable Shares',
        link: 'freeFloat',
        fic: false,
      },
      {
        label: 'Shares Outstanding',
        description: 'The total number of shares issued by the company',
        formula: 'Total Issued Shares',
        link: 'sharesOutstanding',
        fic: false,
      },
      {
        label: 'Beta',
        description: 'The volatility of the stock relative to the market',
        formula: 'Volatility vs Market',
        link: 'beta',
        fic: false,
      },
    ],
  },
  // 3. Revenue & Growth
  revenueAndGrowth: {
    label: 'Revenue & Growth',
    metrics: [
      {
        label: 'Revenue Growth YoY',
        description: 'Year-over-year percentage change in total revenue',
        formula: '(Revenue₍t₎ − Revenue₍t-1₎) / Revenue₍t-1₎',
        link: 'revenueGrowthYoy',
        fic: false,
      },
      {
        label: 'Revenue CAGR',
        description: 'Compound annual growth rate of revenue over multiple years',
        formula: 'Compound Annual Growth Rate',
        link: 'revenueCagr',
        fic: false,
      },
      {
        label: 'Organic Revenue Growth',
        description: 'Revenue growth excluding the effects of acquisitions and currency changes',
        formula: 'Growth excluding M&A and FX effects',
        link: 'organicRevenueGrowth',
        fic: false,
      },
      {
        label: 'Segment Growth',
        description: 'Revenue growth rate broken down by individual business segment',
        formula: 'Growth rate per business segment',
        link: 'segmentGrowth',
        fic: false,
      },
      {
        label: 'Geographic Growth',
        description: 'Revenue growth rate broken down by geographic region',
        formula: 'Growth rate per region',
        link: 'geographicGrowth',
        fic: false,
      },
      {
        label: 'Customer Growth',
        description: 'The rate at which the company is growing its customer base',
        formula: 'Change in customer count over time',
        link: 'customerGrowth',
        fic: false,
      },
      {
        label: 'Market Share Growth',
        description: "The change in the company's share of the total market over time",
        formula: 'Change in market share over time',
        link: 'marketShareGrowth',
        fic: false,
      },
      {
        label: 'EPS Growth',
        description: 'Year-over-year percentage change in earnings per share',
        formula: '(EPS₍t₎ − EPS₍t-1₎) / EPS₍t-1₎',
        link: 'epsGrowth',
        fic: false,
      },
      {
        label: 'FCF Growth',
        description: 'Year-over-year percentage change in free cash flow',
        formula: '(FCF₍t₎ − FCF₍t-1₎) / FCF₍t-1₎',
        link: 'fcfGrowth',
        fic: false,
      },
    ],
  },
  // 4. Profitability
  profitability: {
    label: 'Profitability',
    margins: {
      label: 'Margins',
      metrics: [
        {
          label: 'Gross Margin',
          description: 'The percentage of revenue remaining after deducting cost of goods sold',
          formula: 'Gross Profit / Revenue',
          link: 'grossMargin',
          fic: false,
        },
        {
          label: 'Operating Margin',
          description: 'The percentage of revenue remaining after operating expenses',
          formula: 'Operating Income / Revenue',
          link: 'operatingMargin',
          fic: false,
        },
        {
          label: 'EBITDA Margin',
          description:
            'Earnings before interest, taxes, depreciation and amortization as a percentage of revenue',
          formula: 'EBITDA / Revenue',
          link: 'ebitdaMargin',
          fic: false,
        },
        {
          label: 'Net Margin',
          description: 'The percentage of revenue that remains as net profit after all expenses',
          formula: 'Net Income / Revenue',
          link: 'netMargin',
          fic: false,
        },
        {
          label: 'FCF Margin',
          description: 'Free cash flow generated as a percentage of total revenue',
          formula: 'Free Cash Flow / Revenue',
          link: 'fcfMargin',
          fic: false,
        },
      ],
    },
    returns: {
      label: 'Returns',
      metrics: [
        {
          label: 'Return on Equity (ROE)',
          description: "How efficiently the company generates profit from shareholders' equity",
          formula: "Net Income / Shareholders' Equity",
          link: 'roe',
          fic: false,
        },
        {
          label: 'Return on Assets (ROA)',
          description: 'How efficiently the company uses its assets to generate profit',
          formula: 'Net Income / Total Assets',
          link: 'roa',
          fic: false,
        },
        {
          label: 'Return on Invested Capital (ROIC)',
          description:
            'How efficiently the company generates returns on capital invested in the business',
          formula: 'NOPAT / Invested Capital',
          link: 'roic',
          fic: false,
        },
        {
          label: 'Return on Capital Employed (ROCE)',
          description: 'How efficiently the company uses its capital employed to generate profits',
          formula: 'EBIT / Capital Employed',
          link: 'roce',
          fic: false,
        },
      ],
    },
  },
  // 5. Liquidity
  liquidity: {
    label: 'Liquidity',
    metrics: [
      {
        label: 'Current Ratio',
        description: "The company's ability to pay short-term obligations with current assets",
        formula: 'Current Assets / Current Liabilities',
        link: 'currentRatio',
        fic: false,
      },
      {
        label: 'Quick Ratio',
        description:
          "The company's ability to meet short-term obligations without selling inventory",
        formula: '(Cash + Receivables) / Current Liabilities',
        link: 'quickRatio',
        fic: false,
      },
      {
        label: 'Cash Ratio',
        description:
          "The company's ability to cover current liabilities with cash and equivalents only",
        formula: 'Cash / Current Liabilities',
        link: 'cashRatio',
        fic: false,
      },
    ],
  },
  // 6. Solvency & Debt
  solvencyAndDebt: {
    label: 'Solvency & Debt',
    metrics: [
      {
        label: 'Debt to Equity',
        description: 'The proportion of debt used to finance the company relative to equity',
        formula: "Total Debt / Shareholders' Equity",
        link: 'debtToEquity',
        fic: false,
      },
      {
        label: 'Debt to Assets',
        description: "The proportion of the company's assets financed by debt",
        formula: 'Total Debt / Total Assets',
        link: 'debtToAssets',
        fic: false,
      },
      {
        label: 'Debt to Capital',
        description: "The proportion of debt in the company's total capital structure",
        formula: 'Total Debt / (Total Debt + Equity)',
        link: 'debtToCapital',
        fic: false,
      },
      {
        label: 'Net Debt',
        description: 'Total debt minus cash and cash equivalents',
        formula: 'Total Debt − Cash',
        link: 'netDebt',
        fic: false,
      },
      {
        label: 'Net Debt to EBITDA',
        description: 'How many years of EBITDA it would take to pay off net debt',
        formula: 'Net Debt / EBITDA',
        link: 'netDebtToEbitda',
        fic: false,
      },
      {
        label: 'Interest Coverage',
        description: "The company's ability to pay interest on its outstanding debt",
        formula: 'EBIT / Interest Expense',
        link: 'interestCoverage',
        fic: false,
      },
      {
        label: 'Debt Service Coverage',
        description: "The company's ability to service all debt obligations from operating income",
        formula: 'Operating Income / Debt Service',
        link: 'debtServiceCoverage',
        fic: false,
      },
    ],
  },
  // 7. Efficiency
  efficiency: {
    label: 'Efficiency',
    metrics: [
      {
        label: 'Asset Turnover',
        description: 'How efficiently the company uses its assets to generate revenue',
        formula: 'Revenue / Total Assets',
        link: 'assetTurnover',
        fic: false,
      },
      {
        label: 'Inventory Turnover',
        description: 'How many times the company sells and replaces inventory per period',
        formula: 'COGS / Average Inventory',
        link: 'inventoryTurnover',
        fic: false,
      },
      {
        label: 'Receivables Turnover',
        description: 'How efficiently the company collects revenue owed by customers',
        formula: 'Revenue / Average Receivables',
        link: 'receivablesTurnover',
        fic: false,
      },
      {
        label: 'Payables Turnover',
        description: 'How quickly the company pays its suppliers',
        formula: 'COGS / Average Payables',
        link: 'payablesTurnover',
        fic: false,
      },
      {
        label: 'Working Capital Turnover',
        description: 'How efficiently the company uses working capital to generate revenue',
        formula: 'Revenue / Working Capital',
        link: 'workingCapitalTurnover',
        fic: false,
      },
      {
        label: 'Cash Conversion Cycle',
        description: 'The time it takes to convert investments in inventory into cash from sales',
        formula: 'DIO + DSO − DPO',
        link: 'cashConversionCycle',
        fic: false,
      },
      {
        label: 'Days Inventory Outstanding (DIO)',
        description: 'The average number of days the company holds inventory before selling it',
        formula: 'Average Inventory / COGS × 365',
        link: 'daysInventoryOutstanding',
        fic: false,
      },
      {
        label: 'Days Sales Outstanding (DSO)',
        description: 'The average number of days to collect payment after a sale',
        formula: 'Average Receivables / Revenue × 365',
        link: 'daysSalesOutstanding',
        fic: false,
      },
      {
        label: 'Days Payable Outstanding (DPO)',
        description: 'The average number of days the company takes to pay its suppliers',
        formula: 'Average Payables / COGS × 365',
        link: 'daysPayableOutstanding',
        fic: false,
      },
    ],
  },
  // 8. Cash Flow
  cashFlow: {
    label: 'Cash Flow',
    metrics: [
      {
        label: 'Operating Cash Flow',
        description: "Cash generated from the company's core business operations",
        formula: 'Cash generated from core operations',
        link: 'operatingCashFlow',
        fic: false,
      },
      {
        label: 'Operating Cash Flow Growth',
        description: 'Year-over-year percentage change in operating cash flow',
        formula: '(OCF₍t₎ − OCF₍t-1₎) / OCF₍t-1₎',
        link: 'operatingCashFlowGrowth',
        fic: false,
      },
      {
        label: 'Operating Cash Flow Margin',
        description: 'Operating cash flow as a percentage of total revenue',
        formula: 'Operating Cash Flow / Revenue',
        link: 'operatingCashFlowMargin',
        fic: false,
      },
      {
        label: 'Free Cash Flow',
        description:
          'Cash remaining after capital expenditures; available for shareholders and debt',
        formula: 'Operating Cash Flow − Capital Expenditures',
        link: 'freeCashFlow',
        fic: false,
      },
      {
        label: 'Free Cash Flow Growth',
        description: 'Year-over-year percentage change in free cash flow',
        formula: '(FCF₍t₎ − FCF₍t-1₎) / FCF₍t-1₎',
        link: 'freeCashFlowGrowth',
        fic: false,
      },
      {
        label: 'Free Cash Flow Margin',
        description: 'Free cash flow as a percentage of total revenue',
        formula: 'Free Cash Flow / Revenue',
        link: 'freeCashFlowMargin',
        fic: false,
      },
      {
        label: 'Free Cash Flow Yield',
        description: "Free cash flow relative to the company's market capitalization",
        formula: 'Free Cash Flow / Market Cap',
        link: 'freeCashFlowYield',
        fic: false,
      },
      {
        label: 'Cash Conversion',
        description: 'How effectively the company converts net income into operating cash flow',
        formula: 'Operating Cash Flow / Net Income',
        link: 'cashConversion',
        fic: false,
      },
      {
        label: 'Owner Earnings',
        description: "Buffett's measure of true cash earnings available to owners",
        formula: 'Net Income + Depreciation − Capex − Working Capital Changes',
        link: 'ownerEarnings',
        fic: false,
      },
    ],
  },
  // 9. Valuation
  valuation: {
    label: 'Valuation',
    earningsBased: {
      label: 'Earnings-Based',
      metrics: [
        {
          label: 'P/E Ratio',
          description: 'How much investors pay per dollar of earnings',
          formula: 'Share Price / EPS',
          link: 'peRatio',
          fic: false,
        },
        {
          label: 'Forward P/E',
          description: 'P/E ratio based on forecasted future earnings',
          formula: 'Share Price / Forecasted EPS',
          link: 'forwardPe',
          fic: false,
        },
        {
          label: 'PEG Ratio',
          description: 'P/E ratio adjusted for expected earnings growth rate',
          formula: 'P/E Ratio / Earnings Growth Rate',
          link: 'pegRatio',
          fic: false,
        },
        {
          label: 'Shiller P/E (CAPE)',
          description: 'P/E ratio using average inflation-adjusted earnings over 10 years',
          formula: 'Share Price / 10-Year Inflation-Adjusted Average EPS',
          link: 'shillerPe',
          fic: false,
        },
      ],
    },
    salesBased: {
      label: 'Sales-Based',
      metrics: [
        {
          label: 'Price to Sales',
          description: 'How much investors pay per dollar of revenue',
          formula: 'Market Cap / Revenue',
          link: 'priceToSales',
          fic: false,
        },
        {
          label: 'EV to Sales',
          description: 'Enterprise value relative to total revenue',
          formula: 'Enterprise Value / Revenue',
          link: 'evToSales',
          fic: false,
        },
      ],
    },
    cashflowBased: {
      label: 'Cash Flow-Based',
      metrics: [
        {
          label: 'Price to FCF',
          description: 'How much investors pay per dollar of free cash flow',
          formula: 'Market Cap / Free Cash Flow',
          link: 'priceToFcf',
          fic: false,
        },
        {
          label: 'EV to FCF',
          description: 'Enterprise value relative to free cash flow',
          formula: 'Enterprise Value / Free Cash Flow',
          link: 'evToFcf',
          fic: false,
        },
        {
          label: 'FCF Yield',
          description: 'Free cash flow as a percentage of market capitalization',
          formula: 'Free Cash Flow / Market Cap',
          link: 'fcfYield',
          fic: false,
        },
      ],
    },
    assetBased: {
      label: 'Asset-Based',
      metrics: [
        {
          label: 'Price to Book',
          description: "How much investors pay relative to the company's book value",
          formula: 'Market Cap / Book Value',
          link: 'priceToBook',
          fic: false,
        },
        {
          label: 'Price to Tangible Book',
          description: 'Price relative to book value excluding intangible assets',
          formula: 'Market Cap / Tangible Book Value',
          link: 'priceToTangibleBook',
          fic: false,
        },
      ],
    },
    enterpriseValueBased: {
      label: 'Enterprise Value-Based',
      metrics: [
        {
          label: 'EV to EBITDA',
          description:
            'Enterprise value relative to earnings before interest, taxes, depreciation and amortization',
          formula: 'Enterprise Value / EBITDA',
          link: 'evToEbitda',
          fic: false,
        },
        {
          label: 'EV to EBIT',
          description: 'Enterprise value relative to earnings before interest and taxes',
          formula: 'Enterprise Value / EBIT',
          link: 'evToEbit',
          fic: false,
        },
        {
          label: 'EV to NOPAT',
          description: 'Enterprise value relative to net operating profit after tax',
          formula: 'Enterprise Value / NOPAT',
          link: 'evToNopat',
          fic: false,
        },
      ],
    },
  },
  // 10. Dividends
  dividends: {
    label: 'Dividends',
    metrics: [
      {
        label: 'Dividend Yield',
        description: 'Annual dividend payments relative to the current share price',
        formula: 'Annual Dividend per Share / Share Price',
        link: 'dividendYield',
        fic: false,
      },
      {
        label: 'Dividend Growth Rate',
        description: 'The year-over-year percentage increase in dividend per share',
        formula: 'Year-over-year change in dividend per share',
        link: 'dividendGrowthRate',
        fic: false,
      },
      {
        label: 'Dividend CAGR',
        description: 'Compound annual growth rate of dividends over multiple years',
        formula: 'Compound annual growth rate of dividends',
        link: 'dividendCagr',
        fic: false,
      },
      {
        label: 'Payout Ratio',
        description: 'The proportion of earnings paid out as dividends',
        formula: 'Dividends / Net Income',
        link: 'payoutRatio',
        fic: false,
      },
      {
        label: 'Cash Payout Ratio',
        description: 'The proportion of free cash flow paid out as dividends',
        formula: 'Dividends / Free Cash Flow',
        link: 'cashPayoutRatio',
        fic: false,
      },
      {
        label: 'Dividend Coverage Ratio',
        description: 'How many times earnings can cover the dividend payment',
        formula: 'Earnings / Dividends',
        link: 'dividendCoverageRatio',
        fic: false,
      },
    ],
  },
  // 11. Shareholder Returns
  shareholderReturns: {
    label: 'Shareholder Returns',
    metrics: [
      {
        label: 'Buyback Yield',
        description:
          'The value returned to shareholders through share repurchases relative to market cap',
        formula: 'Share Reduction Value / Market Cap',
        link: 'buybackYield',
        fic: false,
      },
      {
        label: 'Share Count Reduction',
        description: 'The decrease in total shares outstanding over a given period',
        formula: 'Change in shares outstanding over time',
        link: 'shareCountReduction',
        fic: false,
      },
      {
        label: 'Dividend Yield',
        description: 'Annual dividend payments relative to the current share price',
        formula: 'Annual Dividend per Share / Share Price',
        link: 'dividendYield',
        fic: false,
      },
      {
        label: 'Total Shareholder Yield',
        description: 'Combined yield from dividends and buybacks minus share dilution',
        formula: 'Dividend Yield + Buyback Yield − Dilution Yield',
        link: 'totalShareholderYield',
        fic: false,
      },
    ],
  },
  // 12. Earnings Quality
  earningsQuality: {
    label: 'Earnings Quality',
    metrics: [
      {
        label: 'Accrual Ratio',
        description: 'Measures how much of net income is driven by accruals rather than cash',
        formula: '(Net Income − Free Cash Flow) / Total Assets',
        link: 'accrualRatio',
        fic: false,
      },
      {
        label: 'Cash Conversion Ratio',
        description: 'How effectively the company converts net income into operating cash flow',
        formula: 'Operating Cash Flow / Net Income',
        link: 'cashConversionRatio',
        fic: false,
      },
      {
        label: 'OCF to Net Income',
        description:
          'The ratio of operating cash flow to net income; high values indicate quality earnings',
        formula: 'Operating Cash Flow / Net Income',
        link: 'ocfToNetIncome',
        fic: false,
      },
      {
        label: 'FCF to Net Income',
        description:
          'The ratio of free cash flow to net income; shows how much earnings convert to free cash',
        formula: 'Free Cash Flow / Net Income',
        link: 'fcfToNetIncome',
        fic: false,
      },
    ],
  },
  // 13. Growth Quality
  growthQuality: {
    label: 'Growth Quality',
    metrics: [
      {
        label: 'Revenue CAGR',
        description: 'Compound annual growth rate of revenue over multiple years',
        formula: 'Compound Annual Growth Rate of Revenue',
        link: 'revenueCagr',
        fic: false,
      },
      {
        label: 'Earnings Growth',
        description: "The rate at which the company's net earnings are growing over time",
        formula: '(Net Income₍t₎ − Net Income₍t-1₎) / Net Income₍t-1₎',
        link: 'earningsGrowth',
        fic: false,
      },
      {
        label: 'EPS Growth',
        description: 'Year-over-year percentage change in earnings per share',
        formula: '(EPS₍t₎ − EPS₍t-1₎) / EPS₍t-1₎',
        link: 'epsGrowth',
        fic: false,
      },
      {
        label: 'FCF Growth',
        description: 'Year-over-year percentage change in free cash flow',
        formula: '(FCF₍t₎ − FCF₍t-1₎) / FCF₍t-1₎',
        link: 'fcfGrowth',
        fic: false,
      },
      {
        label: 'ROIC Trend',
        description:
          'The direction of return on invested capital over time; improving ROIC signals quality growth',
        formula: 'ROIC change over time',
        link: 'roicTrend',
        fic: false,
      },
      {
        label: 'Margin Expansion',
        description:
          'Whether profit margins are increasing over time, indicating improving profitability',
        formula: 'Change in operating or net margin over time',
        link: 'marginExpansion',
        fic: false,
      },
    ],
  },
  // 14. Economic Moat
  economicMoat: {
    label: 'Economic Moat',
    metrics: [
      {
        label: 'ROIC above 15%',
        description:
          'Sustained ROIC above 15% is a strong signal of a durable competitive advantage',
        formula: 'ROIC > 15%',
        link: 'roicAbove15Percent',
        fic: false,
      },
      {
        label: 'Stable Gross Margin',
        description: 'Consistent gross margins over time indicate pricing power and cost control',
        formula: 'Gross Margin stability over time',
        link: 'stableGrossMargin',
        fic: false,
      },
      {
        label: 'Low Debt',
        description:
          'A strong balance sheet with low leverage reduces financial risk and preserves flexibility',
        formula: 'Net Debt / EBITDA < 2×',
        link: 'lowDebt',
        fic: false,
      },
      {
        label: 'High FCF Conversion',
        description: 'The ability to convert earnings into free cash flow consistently',
        formula: 'FCF / Net Income > 80%',
        link: 'highFcfConversion',
        fic: false,
      },
      {
        label: 'Pricing Power',
        description: 'The ability to raise prices without losing significant customers',
        formula: '',
        link: 'pricingPower',
        fic: false,
      },
      {
        label: 'Network Effects',
        description: 'The product or service becomes more valuable as more users adopt it',
        formula: '',
        link: 'networkEffects',
        fic: false,
      },
      {
        label: 'Brand Strength',
        description:
          'A recognized and trusted brand that creates customer loyalty and pricing power',
        formula: '',
        link: 'brandStrength',
        fic: false,
      },
    ],
  },
  // 15. Risk Analysis
  riskAnalysis: {
    label: 'Risk Analysis',
    metrics: [
      {
        label: 'Beta',
        description:
          "Measures the stock's sensitivity to market movements; beta > 1 means more volatile than the market",
        formula: 'Volatility vs Market',
        link: 'beta',
        fic: false,
      },
      {
        label: 'Debt Maturity Schedule',
        description: "The timeline of when the company's debt obligations come due",
        formula: '',
        link: 'debtMaturitySchedule',
        fic: false,
      },
      {
        label: 'Customer Concentration',
        description: 'The degree to which revenue depends on a small number of customers',
        formula: '',
        link: 'customerConcentration',
        fic: false,
      },
      {
        label: 'Supplier Concentration',
        description: 'The degree to which the company relies on a small number of suppliers',
        formula: '',
        link: 'supplierConcentration',
        fic: false,
      },
      {
        label: 'Geographic Risk',
        description: 'Exposure to political, economic, or regulatory risks in specific regions',
        formula: '',
        link: 'geographicRisk',
        fic: false,
      },
      {
        label: 'Regulatory Risk',
        description: 'The risk of changes in laws or regulations adversely affecting the business',
        formula: '',
        link: 'regulatoryRisk',
        fic: false,
      },
      {
        label: 'Foreign Exchange Exposure',
        description: 'The impact of currency fluctuations on revenues and earnings',
        formula: '',
        link: 'foreignExchangeExposure',
        fic: false,
      },
      {
        label: 'Commodity Exposure',
        description:
          "The sensitivity of the company's costs or revenues to commodity price changes",
        formula: '',
        link: 'commodityExposure',
        fic: false,
      },
      {
        label: 'Litigation Risk',
        description:
          'Exposure to legal proceedings that could result in financial penalties or reputational damage',
        formula: '',
        link: 'litigationRisk',
        fic: false,
      },
      {
        label: 'Cybersecurity Risk',
        description: 'Vulnerability to data breaches, ransomware, or other cyber threats',
        formula: '',
        link: 'cybersecurityRisk',
        fic: false,
      },
    ],
  },
  // 16. Advanced Metrics
  advancedMetrics: {
    label: 'Advanced Metrics',
    metrics: [
      {
        label: 'NOPAT',
        description:
          'Net operating profit after tax; earnings from operations excluding financing effects',
        formula: 'Net Operating Profit After Tax',
        link: 'nopat',
        fic: false,
      },
      {
        label: 'Economic Profit',
        description: 'The profit remaining after deducting the cost of capital from NOPAT',
        formula: 'NOPAT − Capital Charge',
        link: 'economicProfit',
        fic: false,
      },
      {
        label: 'Economic Value Added (EVA)',
        description: 'The value created above the required return on capital invested',
        formula: 'NOPAT − (Invested Capital × WACC)',
        link: 'eva',
        fic: false,
      },
      {
        label: 'Invested Capital',
        description: 'Total capital deployed in the business by both debt and equity holders',
        formula: 'Total Debt + Total Equity − Cash',
        link: 'investedCapital',
        fic: false,
      },
      {
        label: 'ROIC Spread',
        description:
          'The difference between ROIC and WACC; positive spread means the company creates value',
        formula: 'ROIC − WACC',
        link: 'roicSpread',
        fic: false,
      },
      {
        label: 'WACC',
        description:
          'The blended cost of capital from all sources, used as the discount rate in valuations',
        formula: 'Weighted Average Cost of Capital',
        link: 'wacc',
        fic: false,
      },
      {
        label: 'Intrinsic Value',
        description: 'The estimated fair value of the company based on its fundamentals',
        formula: 'Estimated fair value based on fundamentals',
        link: 'intrinsicValue',
        fic: false,
      },
      {
        label: 'DCF Value',
        description:
          'Company value calculated by discounting projected future cash flows to the present',
        formula: 'Sum of discounted future cash flows',
        link: 'dcfValue',
        fic: false,
      },
      {
        label: 'Reverse DCF',
        description:
          'Works backward from the current price to determine what growth rate the market implies',
        formula: 'Implied growth rate from current price',
        link: 'reverseDcf',
        fic: false,
      },
      {
        label: 'Terminal Value',
        description: 'The present value of all cash flows beyond the explicit forecast period',
        formula: 'Value of cash flows beyond the forecast period',
        link: 'terminalValue',
        fic: false,
      },
      {
        label: 'Owner Earnings',
        description: "Buffett's measure of true distributable earnings available to the owner",
        formula: 'Net Income + Depreciation − Capex − Working Capital Changes',
        link: 'ownerEarnings',
        fic: false,
      },
    ],
  },
  // 17. Core Investor Checklist
  coreInvestorChecklist: {
    label: 'Core Investor Checklist',
    categories: {
      business: {
        label: 'Business',
        metrics: [
          {
            label: 'Understand Business Model',
            description:
              'Can you clearly explain how the company makes money, who its customers are, and what drives its revenue?',
            formula: '',
            link: 'understandBusinessModel',
            fic: false,
          },
          {
            label: 'Competitive Moat',
            description:
              'Does the company have a durable advantage that protects it from competition — such as brand, network effects, switching costs, or cost leadership?',
            formula: '',
            link: 'competitiveMoat',
            fic: false,
          },
          {
            label: 'Management Quality',
            description:
              'Is management competent, shareholder-friendly, and aligned with long-term value creation? Check track record, capital allocation, and insider ownership.',
            formula: '',
            link: 'managementQuality',
            fic: false,
          },
        ],
      },
      growth: {
        label: 'Growth',
        metrics: [
          {
            label: 'Revenue CAGR',
            description:
              'Has revenue grown consistently over 3–10 years? Look for steady compounding, not lumpy or acquisition-driven growth.',
            formula: 'Compound Annual Growth Rate of Revenue',
            link: 'revenueCagr',
            fic: false,
          },
          {
            label: 'EPS CAGR',
            description:
              'Is earnings per share growing at a healthy rate? EPS growth that outpaces revenue growth indicates improving efficiency or buybacks.',
            formula: 'Compound Annual Growth Rate of EPS',
            link: 'epsCagr',
            fic: false,
          },
          {
            label: 'FCF CAGR',
            description:
              'Is free cash flow per share compounding over time? FCF CAGR is often the most reliable indicator of true wealth creation.',
            formula: 'Compound Annual Growth Rate of FCF',
            link: 'fcfCagr',
            fic: false,
          },
        ],
      },
      profitability: {
        label: 'Profitability',
        metrics: [
          {
            label: 'Gross Margin',
            description:
              'Is the gross margin stable or expanding? High and rising gross margins signal pricing power and a strong competitive position.',
            formula: 'Gross Profit / Revenue',
            link: 'grossMargin',
            fic: false,
          },
          {
            label: 'Operating Margin',
            description:
              'Does the company convert revenue into operating profit efficiently? Compare to industry peers and track the trend over time.',
            formula: 'Operating Income / Revenue',
            link: 'operatingMargin',
            fic: false,
          },
          {
            label: 'ROIC',
            description:
              'Is ROIC consistently above 15%? High ROIC sustained over many years is one of the strongest signals of a genuine economic moat.',
            formula: 'NOPAT / Invested Capital',
            link: 'roic',
            fic: false,
          },
          {
            label: 'ROE',
            description:
              'Is ROE high without excessive leverage? Ideal ROE is driven by profitability and efficiency, not financial engineering.',
            formula: "Net Income / Shareholders' Equity",
            link: 'roe',
            fic: false,
          },
        ],
      },
      balanceSheet: {
        label: 'Balance Sheet',
        metrics: [
          {
            label: 'Net Debt',
            description:
              'Does the company carry manageable debt? Net cash positions are ideal; net debt should be low relative to earnings power.',
            formula: 'Total Debt − Cash',
            link: 'netDebt',
            fic: false,
          },
          {
            label: 'Net Debt to EBITDA',
            description:
              'Can the company comfortably service its debt? Below 2× is generally healthy; above 3× warrants caution.',
            formula: 'Net Debt / EBITDA',
            link: 'netDebtToEbitda',
            fic: false,
          },
          {
            label: 'Interest Coverage',
            description:
              'Can the company easily cover its interest payments from operating earnings? A ratio above 5× is a sign of financial strength.',
            formula: 'EBIT / Interest Expense',
            link: 'interestCoverage',
            fic: false,
          },
        ],
      },
      cashFlow: {
        label: 'Cash Flow',
        metrics: [
          {
            label: 'Operating Cash Flow',
            description:
              'Is the company consistently generating positive operating cash flow? This is the lifeblood of the business.',
            formula: 'Cash generated from core operations',
            link: 'operatingCashFlow',
            fic: false,
          },
          {
            label: 'Free Cash Flow',
            description:
              'After capex, does the company generate surplus cash? Consistent FCF gives management flexibility to reward shareholders or invest in growth.',
            formula: 'Operating Cash Flow − Capital Expenditures',
            link: 'freeCashFlow',
            fic: false,
          },
          {
            label: 'Free Cash Flow Yield',
            description:
              'Is the stock reasonably priced relative to the cash it generates? FCF yield above 4–5% often indicates good value.',
            formula: 'Free Cash Flow / Market Cap',
            link: 'freeCashFlowYield',
            fic: false,
          },
        ],
      },
      valuation: {
        label: 'Valuation',
        metrics: [
          {
            label: 'P/E Ratio',
            description:
              'What multiple are you paying for each dollar of earnings? Compare to historical averages and industry peers, and consider the growth rate.',
            formula: 'Share Price / EPS',
            link: 'peRatio',
            fic: false,
          },
          {
            label: 'EV to EBITDA',
            description:
              'A capital-structure-neutral valuation multiple. Useful for comparing companies with different debt levels. Below 10× is often considered cheap.',
            formula: 'Enterprise Value / EBITDA',
            link: 'evToEbitda',
            fic: false,
          },
          {
            label: 'EV to EBIT',
            description:
              'Similar to EV/EBITDA but accounts for depreciation, making it more conservative and appropriate for capital-intensive businesses.',
            formula: 'Enterprise Value / EBIT',
            link: 'evToEbit',
            fic: false,
          },
          {
            label: 'Price to FCF',
            description:
              'How much are you paying per dollar of free cash flow? This is often considered the most reliable valuation multiple for quality businesses.',
            formula: 'Market Cap / Free Cash Flow',
            link: 'priceToFcf',
            fic: false,
          },
          {
            label: 'PEG Ratio',
            description:
              'Adjusts the P/E ratio for growth. A PEG below 1 may indicate undervaluation; above 2 may signal the growth is already priced in.',
            formula: 'P/E Ratio / Earnings Growth Rate',
            link: 'pegRatio',
            fic: false,
          },
        ],
      },
      quality: {
        label: 'Quality',
        metrics: [
          {
            label: 'Earnings Quality',
            description:
              'Are earnings backed by real cash flow? High accruals or a large gap between net income and OCF may signal low-quality or managed earnings.',
            formula: 'Operating Cash Flow / Net Income',
            link: 'earningsQuality',
            fic: false,
          },
          {
            label: 'Share Dilution',
            description:
              'Is the share count growing over time? Dilution destroys per-share value; look for stable or declining share counts.',
            formula: 'Change in shares outstanding over time',
            link: 'shareDilution',
            fic: false,
          },
          {
            label: 'Buybacks',
            description:
              'Is the company buying back shares at sensible prices? Disciplined buybacks below intrinsic value enhance per-share value for remaining shareholders.',
            formula: 'Reduction in shares outstanding',
            link: 'buybacks',
            fic: false,
          },
          {
            label: 'Moat Durability',
            description:
              'Is the competitive advantage likely to persist for 10+ years? Consider technological disruption, regulatory changes, and shifting consumer preferences.',
            formula: '',
            link: 'moatDurability',
            fic: false,
          },
        ],
      },
    },
  },
}
