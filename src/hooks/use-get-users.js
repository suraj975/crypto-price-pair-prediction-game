import React from "react";
import { getPairRounds } from "../helper/contract-methods";
export const useGetUsers = (contract, signer, allRounds) => {
  const [users, setUsers] = React.useState([]);
  const getData = async () => {
    const data = await getPairRounds(contract, 1);
    console.log("data=====?", data);
    if (data?.length === 2) {
      const usersData = data[0]?.reduce((acc, user, index) => {
        const roundNumber = data[1][index]?.toNumber();

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

  React.useEffect(() => {
    getData();
  }, [signer?._isSigner]);

  return users;
};
