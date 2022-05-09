import React from "react";
import { getPairRounds, getUsersData } from "../helper/contract-methods";
export const useGetUsers = (contract, signer, allRounds) => {
  const [users, setUsers] = React.useState([]);
  const lastRoundNumber = allRounds[allRounds?.length - 1]?.roundNumber;
  const getUsersData = async () => {
    const data = await getPairRounds(contract, 1);
    const roundsObjectFormat = allRounds?.reduce((acc, curr) => {
      acc[curr?.roundNumber] = {
        ...curr,
      };
      return acc;
    }, {});

    if (data?.length === 2) {
      const usersData = data[0]?.reduce((acc, user, index) => {
        const roundNumber = data[1][index]?.toNumber();
        if (!roundsObjectFormat?.[roundNumber]) return acc;
        const { firstTokenPriceChange, secondTokenPriceChange } =
          roundsObjectFormat[roundNumber];

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

  React.useEffect(() => {
    getUsersData();
  }, [signer?._isSigner]);

  React.useEffect(() => {
    getUsersData();
  }, [lastRoundNumber]);

  React.useEffect(() => {
    if (signer) {
      if (!users.length) getUsersData();
      contract.on("RoundExecution", (event) => {
        getUsersData();
      });
      contract.on("Claim", (pair, amount) => {
        getUsersData();
      });
      contract.on("Bet", (pair, amount) => {
        getUsersData();
      });
    }
    return () => {
      contract.removeAllListeners("RoundExecution");
      contract.removeAllListeners("Claim");
      contract.removeAllListeners("Bet");
    };
  }, [signer?._isSigner]);

  return users;
};
