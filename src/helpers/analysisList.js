export const businessBasics = [
  'industry',
  'businessModel',
  'productsServices',
  'geographicExposure',
  'marketShare',
  'competitiveAdvantagesMoat',
  'managementQuality',
  'insiderOwnership',
  'institutionalOwnership',
  'esgFactors',
]

export const sizeAndMarketMetrics = [
  'marketCap',
  'enterpriseValue',
  'freeFloat',
  'sharesOutstanding',
  'beta',
]

export const revenueAndGrowth = [
  'revenueGrowthYoy',
  'revenueCagr',
  'organicRevenueGrowth',
  'segmentGrowth',
  'geographicGrowth',
  'customerGrowth',
  'marketShareGrowth',
  'epsGrowth',
  'fcfGrowth',
]

export const profitability = {
  margins: ['grossMargin', 'operatingMargin', 'ebitdaMargin', 'netMargin', 'fcfMargin'],
  returns: [
    'returnOnEquity',
    'returnOnAssets',
    'returnOnInvestedCapital',
    'returnOnCapitalEmployed',
  ],
  //['roe', 'roa', 'roic', 'roce']
}

export const liquidity = ['currentRatio', 'quickRatio', 'cashRatio']

export const solvencyAndDebt = [
  'debtToEquity',
  'debtToAssets',
  'debtToCapital',
  'netDebt',
  'netDebtToEbitda',
  'interestCoverage',
  'debtServiceCoverage',
]

export const efficiency = [
  'assetTurnover',
  'inventoryTurnover',
  'receivablesTurnover',
  'payablesTurnover',
  'workingCapitalTurnover',
  'cashConversionCycle',
  'daysInventoryOutstanding',
  'daysSalesOutstanding',
  'daysPayableOutstanding',
]

export const cashFlow = [
  'operatingCashFlow',
  'operatingCashFlowGrowth',
  'operatingCashFlowMargin',
  'freeCashFlow',
  'freeCashFlowGrowth',
  'freeCashFlowMargin',
  'freeCashFlowYield',
  'cashConversion',
  'ownerEarnings',
]

export const valuation = {
  earningsBased: ['peRatio', 'forwardPe', 'pegRatio', 'shillerPe'],
  salesBased: ['psRatio', 'forwardPs'],
  bookValueBased: ['pbRatio', 'priceToTangibleBook', 'priceToNetAssetValue'],
  cashFlowBased: ['pcfRatio', 'priceToFreeCashFlow'],
  dividendBased: ['dividendYield', 'dividendPayoutRatio'],
  enterpriseValueBased: [
    'evToRevenue',
    'evToEbitda',
    'evToEbit',
    'evToFcf',
    'evToOperatingCashFlow',
  ],
}
