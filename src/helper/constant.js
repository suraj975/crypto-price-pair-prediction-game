export const RINKEBY_CONTRACT_ADDRESS =
  "0x97640c12eDD262B7C2E4EcFb5F75f40601B1c6dC";

// Chainlink Price feeds address https://docs.chain.link/docs/ethereum-addresses/
export const ETH_USD_RINKEBY_ADDRESS =
  "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e";
export const BTC_USD_RINKEBY_ADDRESS =
  "0xECe365B379E1dD183B20fc5f022230C044d51404";

export const ETH_USD_MATIC_MAINNET_ADDRESS =
  "0xF9680D99D6C9589e2a93a78A04A279e509205945";
export const BTC_USD_MATIC_MAINNET_ADDRESS =
  "0xc907E116054Ad103354f2D350FD2514433D57F6f";

export const MATIC_USD_MATIC_MAINNET_ADDRESS =
  "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0";
export const LINK_USD_MATIC_MAINNET_ADDRESS =
  "0xd9FFdb71EbE7496cC440152d43986Aae0AB76665";

export const pairTypes = {
  1: {
    1: "BTC-USD",
    2: "ETH-USD",
    tokenImage1: "./btc.svg",
    tokenImage2: "./eth.svg",
    comaparison: "BTC Vs ETH",
    tokenSymbol1: "BTC",
    tokenSymbol2: "ETH",
    tokenAddress1: BTC_USD_MATIC_MAINNET_ADDRESS,
    tokenAddress2: ETH_USD_MATIC_MAINNET_ADDRESS,
  },
  2: {
    1: "LINK-USD",
    2: "MATIC-USD",
    tokenImage1: "./link.svg",
    tokenImage2: "./matic.svg",
    comaparison: "LINK Vs MATIC",
    tokenSymbol1: "LINK",
    tokenSymbol2: "MATIC",
    tokenAddress1: LINK_USD_MATIC_MAINNET_ADDRESS,
    tokenAddress2: MATIC_USD_MATIC_MAINNET_ADDRESS,
  },
};
