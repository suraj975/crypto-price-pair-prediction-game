import React from "react";
import { getRoundsInfo } from "../helper/contract-methods";
export const useRounds = (contract, signer, pair, number) => {
  const [rounds, setRounds] = React.useState([]);
  const [allRounds, setallRounds] = React.useState([]);
  const getData = async () => {
    const data = await getRoundsInfo(contract, pair, number);
    const roundsData = data?.map((round) => {
      return {
        endTimeStamp: round?.endTimeStamp.toNumber(),
        firstTokenPoolAmount: round?.firstTokenPoolAmount.toNumber(),
        firstTokenPrice: round?.firstTokenPrice.toNumber(),
        firstTokenPriceChange: round?.firstTokenPriceChange.toNumber(),
        pairNumber: round?.pairNumber.toNumber(),
        poolAmount: round?.poolAmount.toNumber(),
        poolTokenBaseAmount: round?.poolTokenBaseAmount.toNumber(),
        poolTokenRewardAmount: round?.poolTokenRewardAmount.toNumber(),
        roundEnded: round?.roundEnded,
        roundLock: round?.roundLock,
        roundNumber: round?.roundNumber.toNumber(),
        roundStart: round?.roundStart,
        secondTokenPoolAmount: round?.secondTokenPoolAmount.toNumber(),
        secondTokenPrice: round?.secondTokenPrice.toNumber(),
        secondTokenPriceChange: round?.secondTokenPriceChange.toNumber(),
        startTimeStamp: round?.startTimeStamp.toNumber(),
      };
    });
    const filterData = roundsData?.filter((round) => round?.roundNumber !== 0);
    setallRounds([...filterData].reverse());
    const splicedData = filterData.splice(0, 5);
    setRounds(splicedData.reverse());
  };

  React.useEffect(() => {
    getData();
  }, [signer?._isSigner]);

  React.useEffect(() => {
    if (signer) {
      if (!rounds.length) getData();
      contract.on("RoundExecution", (event) => {
        getData();
      });
      contract.on("Claim", (pair, amount) => {
        getData();
      });
      contract.on("Bet", (pair, amount) => {
        getData();
      });
    }

    return () => {
      contract?.removeAllListeners("RoundExecution");
      contract?.removeAllListeners("Claim");
      contract?.removeAllListeners("Bet");
    };
  }, [signer?._isSigner]);

  return [rounds, allRounds];
};
