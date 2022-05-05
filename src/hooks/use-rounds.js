import React from "react";
import { getRoundsInfo } from "../helper/contract-methods";
export const useRounds = (contract, signer) => {
  const [rounds, setRounds] = React.useState([]);
  const getData = async () => {
    const data = await getRoundsInfo(contract, 1);
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
    setRounds(roundsData);
  };

  React.useEffect(() => {
    getData();
  }, [signer?._isSigner]);

  React.useEffect(() => {
    if (signer) {
      if (!rounds.length) getData();
      contract.on(
        "RoundExecution",
        (pair, currentRound, previousRound, nextRound) => {
          getData();
        }
      );
    }

    return () => {
      contract.removeAllListeners("RoundExecution");
    };
  }, [signer?._isSigner]);

  return rounds;
};
