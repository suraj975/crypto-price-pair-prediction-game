import React from "react";
import { getUsersData } from "../helper/contract-methods";
export const useGetUsers = (contract, signer, allRounds) => {
  //if (!allRounds.length) return [];
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    getUsersData(contract, allRounds, setUsers);
  }, [signer?._isSigner]);

  React.useEffect(() => {
    getUsersData(contract, allRounds, setUsers);
  }, [allRounds?.length]);

  React.useEffect(() => {
    if (signer) {
      if (!users.length) getUsersData();
      contract.on("Claim", (pair, amount) => {
        getUsersData(contract, allRounds, setUsers);
      });
      contract.on("Bet", (pair, amount) => {
        getUsersData(contract, allRounds, setUsers);
      });
    }
    return () => {
      contract.removeAllListeners("Claim");
      contract.removeAllListeners("Bet");
    };
  }, [signer?._isSigner]);

  return users;
};
