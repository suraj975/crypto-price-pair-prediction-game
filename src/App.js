import { useEffect } from "react";
import { VStack, useDisclosure, Button, Text, HStack } from "@chakra-ui/react";
import SelectWalletModal from "./modal";
import { useWeb3React } from "@web3-react/core";
import { connectors } from "./connectors";
import { ethers } from "ethers";
import cryptoPricePrediction from "./contracts/CryproPairPricePredictionFactory.json";
import React from "react";
import { getContractInstance, getPriceFeeds } from "./helper/contract-methods";
import {
  ETH_USD_MATIC_MAINNET_ADDRESS,
  BTC_USD_MATIC_MAINNET_ADDRESS,
  RINKEBY_CONTRACT_ADDRESS,
} from "./helper/constant";

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { library, chainId, account, activate, deactivate, active } =
    useWeb3React();
  const disconnect = () => {
    deactivate();
  };

  const contract = getContractInstance(
    RINKEBY_CONTRACT_ADDRESS,
    cryptoPricePrediction.abi,
    library?.getSigner()
  );

  React.useEffect(() => {
    const getData = async () => {
      const data = await contract.getPairRounds(1);
      const ethPrice = await getPriceFeeds(ETH_USD_MATIC_MAINNET_ADDRESS);
      const btcPrice = await getPriceFeeds(BTC_USD_MATIC_MAINNET_ADDRESS);
      console.log("ethPrice---->", data, ethPrice, btcPrice);
    };
    getData();
  }, []);

  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider) activate(connectors[provider]);
  }, []);
  return (
    <>
      <VStack justifyContent="center" alignItems="center" h="100vh">
        <HStack marginBottom="10px">
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
            sx={{
              background: "linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Crypto Prediction
          </Text>
        </HStack>
        <HStack>
          {!active ? (
            <Button onClick={onOpen}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
      </VStack>
      <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
    </>
  );
}

// Rounds
//1.Actions Buttons --> bet

// Pair
//
