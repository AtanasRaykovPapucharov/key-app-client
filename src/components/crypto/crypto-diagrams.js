/**
 * Each diagram exists once per locale: the labels inside the drawing are
 * translated, not just the caption underneath it.
 *
 * The markup is imported raw rather than used as an <img> source so the SVG
 * inherits the surrounding text colour and reads its accent from CSS — that is
 * what lets one file sit on a dark panel and on a light one.
 *
 * Vite (Quasar CLI vite mode) resolves `?raw`. On the webpack build, replace
 * the suffix with `!!raw-loader!` on each line.
 */
import enAmmPool from 'src/assets/crypto/en/amm-pool.svg?raw'
import enAnalysisSteps from 'src/assets/crypto/en/analysis-steps.svg?raw'
import enBlockchainChain from 'src/assets/crypto/en/blockchain-chain.svg?raw'
import enConsensus51 from 'src/assets/crypto/en/consensus-51.svg?raw'
import enLayer2Rollup from 'src/assets/crypto/en/layer2-rollup.svg?raw'
import enNetworkValue from 'src/assets/crypto/en/network-value.svg?raw'
import enNftRoyalty from 'src/assets/crypto/en/nft-royalty.svg?raw'
import enOracleBridge from 'src/assets/crypto/en/oracle-bridge.svg?raw'
import enPosStake from 'src/assets/crypto/en/pos-stake.svg?raw'
import enPowFlow from 'src/assets/crypto/en/pow-flow.svg?raw'
import enScalabilityTrilemma from 'src/assets/crypto/en/scalability-trilemma.svg?raw'
import enStablecoinTrilemma from 'src/assets/crypto/en/stablecoin-trilemma.svg?raw'
import enTokenStandards from 'src/assets/crypto/en/token-standards.svg?raw'

import bgAmmPool from 'src/assets/crypto/bg/amm-pool.svg?raw'
import bgAnalysisSteps from 'src/assets/crypto/bg/analysis-steps.svg?raw'
import bgBlockchainChain from 'src/assets/crypto/bg/blockchain-chain.svg?raw'
import bgConsensus51 from 'src/assets/crypto/bg/consensus-51.svg?raw'
import bgLayer2Rollup from 'src/assets/crypto/bg/layer2-rollup.svg?raw'
import bgNetworkValue from 'src/assets/crypto/bg/network-value.svg?raw'
import bgNftRoyalty from 'src/assets/crypto/bg/nft-royalty.svg?raw'
import bgOracleBridge from 'src/assets/crypto/bg/oracle-bridge.svg?raw'
import bgPosStake from 'src/assets/crypto/bg/pos-stake.svg?raw'
import bgPowFlow from 'src/assets/crypto/bg/pow-flow.svg?raw'
import bgScalabilityTrilemma from 'src/assets/crypto/bg/scalability-trilemma.svg?raw'
import bgStablecoinTrilemma from 'src/assets/crypto/bg/stablecoin-trilemma.svg?raw'
import bgTokenStandards from 'src/assets/crypto/bg/token-standards.svg?raw'

/** Outer key: locale. Inner key: `diagram.src` in crypto_bg.json / crypto_en.json. */
export default {
  en: {
    'amm-pool': enAmmPool,
    'analysis-steps': enAnalysisSteps,
    'blockchain-chain': enBlockchainChain,
    'consensus-51': enConsensus51,
    'layer2-rollup': enLayer2Rollup,
    'network-value': enNetworkValue,
    'nft-royalty': enNftRoyalty,
    'oracle-bridge': enOracleBridge,
    'pos-stake': enPosStake,
    'pow-flow': enPowFlow,
    'scalability-trilemma': enScalabilityTrilemma,
    'stablecoin-trilemma': enStablecoinTrilemma,
    'token-standards': enTokenStandards,
  },
  bg: {
    'amm-pool': bgAmmPool,
    'analysis-steps': bgAnalysisSteps,
    'blockchain-chain': bgBlockchainChain,
    'consensus-51': bgConsensus51,
    'layer2-rollup': bgLayer2Rollup,
    'network-value': bgNetworkValue,
    'nft-royalty': bgNftRoyalty,
    'oracle-bridge': bgOracleBridge,
    'pos-stake': bgPosStake,
    'pow-flow': bgPowFlow,
    'scalability-trilemma': bgScalabilityTrilemma,
    'stablecoin-trilemma': bgStablecoinTrilemma,
    'token-standards': bgTokenStandards,
  },
}
