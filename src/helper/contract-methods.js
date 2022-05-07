import { ethers } from "ethers";
import aggregratorV3Interface from "../contracts/aggregatorV3Interfaceabi.json";

export const getContractInstance = (address, abi, signer) => {
  return new ethers.Contract(address, abi, signer);
};

export const getPriceFeeds = async (coinPairAddress) => {
  const aggregatorV3InterfaceABI = aggregratorV3Interface.abi;
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
  return await contract.getPairRounds(pair);
};

export const getPairRounds = async (contract, pair) => {
  return await contract.getUserRounds(pair);
};

export const claimReward = async (contract, pair, pairRound) => {
  return await contract.claimReward(pairRound, pair);
};

export const getUsersData = async (contract, allRounds, setUsers) => {
  const data = await getPairRounds(contract, 1);
  if (data?.length === 2) {
    const usersData = data[0]?.reduce((acc, user, index) => {
      const roundNumber = data[1][index]?.toNumber();
      if (!allRounds?.[roundNumber - 1]) return;
      const { firstTokenPriceChange, secondTokenPriceChange } =
        allRounds[roundNumber - 1];

      let isWinner = false;

      const userTokenSelectedChoice = user?.tokenselected;
      if (firstTokenPriceChange !== secondTokenPriceChange) {
        const tokenDominance =
          firstTokenPriceChange > secondTokenPriceChange ? 0 : 1;
        isWinner = userTokenSelectedChoice === tokenDominance;
      }

      acc[roundNumber] = {
        amount: user?.amount.toNumber(),
        tokenSelected: user?.tokenselected,
        claim: user?.claim,
        isWinner,
      };
      return acc;
    }, {});

    setUsers(usersData);
  }
};
