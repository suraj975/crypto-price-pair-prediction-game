import { ethers } from "ethers";
import aggregratorV3Interface from "../contracts/aggregatorV3Interfaceabi.json";

export const getContractInstance = (address, abi, signer) => {
  return new ethers.Contract(address, abi, signer);
};

export const getPriceFeeds = async (coinPairAddress) => {
  const aggregatorV3InterfaceABI = aggregratorV3Interface.abi;
  console.log(
    "process.env.REACT_APP_ALCHEMY_MATIC_MAINNET_KEY--",
    process.env.REACT_APP_ALCHEMY_MATIC_MAINNET_KEY
  );
  const provider = new ethers.providers.JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_MATIC_MAINNET_KEY}`
  );
  const priceFeed = getContractInstance(
    coinPairAddress,
    aggregatorV3InterfaceABI,
    provider
  );
  let roundData = await priceFeed.latestRoundData();
  let decimals = await priceFeed.decimals();
  return Number(
    (roundData.answer.toString() / Math.pow(10, decimals)).toFixed(2)
  );
};

export const getRoundsInfo = async (contract, pair) => {
  return await contract.getPairRounds(pair, 5);
};

export const getPairCount = async (contract) => {
  return await contract.getPairCount();
};

export const getPairRounds = async (contract, pair) => {
  return await contract.getUserRounds(pair);
};

export const claimReward = async (contract, pair, pairRound) => {
  return await contract.claimReward(pairRound, pair);
};
