import { Flex, Box, Text, Stack, Button } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import cryptoPricePrediction from "../../contracts/CryproPairPricePredictionFactory.json";
import { getContractInstance } from "../../helper/contract-methods";
import {
  ETH_USD_MATIC_MAINNET_ADDRESS,
  BTC_USD_MATIC_MAINNET_ADDRESS,
  RINKEBY_CONTRACT_ADDRESS,
} from "../../helper/constant";
import { useRounds } from "../../hooks/use-rounds";
import { usePriceFeeds } from "../../hooks/use-price-feeds";
import { CountDownTimer } from "./countdown";
import { Progress } from "@chakra-ui/react";

const convertPriceUptoTwoDecimal = (price) => {
  return (price / 100000000).toFixed(2);
};

const percentageCalculation = (fixedPrice, updatedPrice) => {
  if (!updatedPrice) return 0;
  if (updatedPrice > fixedPrice) {
    return ((updatedPrice - fixedPrice) / updatedPrice) * 100;
  } else {
    return ((fixedPrice - updatedPrice) / updatedPrice) * 100;
  }
};

const tokenPercentageChangeCalculation = (
  firstTokenPrice,
  secondTokenPrice,
  updatedPriceFeeds
) => {
  if (!updatedPriceFeeds?.length) return;
  const firstTokenPercentageChange = percentageCalculation(
    convertPriceUptoTwoDecimal(firstTokenPrice),
    updatedPriceFeeds?.[0]
  );
  const secondTokenPercentageChange = percentageCalculation(
    convertPriceUptoTwoDecimal(secondTokenPrice),
    updatedPriceFeeds?.[1]
  );

  const ratioOfPercentageChanges =
    (firstTokenPercentageChange /
      (firstTokenPercentageChange + secondTokenPercentageChange)) *
    100;
  return {
    firstTokenPercentageChange,
    secondTokenPercentageChange,
    ratioOfPercentageChanges,
  };
};

const TokenWrapper = ({ path, tokenRoundFixedPrice, pair, color }) => {
  return (
    <Flex marginX="3" flexDir="column">
      <img src={path} height="70px" width="70px" />
      <Text color={color} mt="2" fontSize="sm" fontWeight="bold">
        {pair}
      </Text>
      <Text mt="2" fontWeight="bold">
        {convertPriceUptoTwoDecimal(tokenRoundFixedPrice)}
      </Text>
    </Flex>
  );
};

const RoundInfoWrapper = ({ endTimeStamp, poolAmount }) => {
  return (
    <Stack>
      <CountDownTimer time={Number(endTimeStamp) * 1000} />
      <Text fontWeight="bold">Pool : {poolAmount}</Text>
    </Stack>
  );
};

const calculateTimeBasedProgress = (endTimeStamp) => {
  if (Date.now() > endTimeStamp * 1000) return 100;
  const currentTime = new Date();
  const currentTimeInMinutes = currentTime.getMinutes();
  const timeStampMinutes = new Date(endTimeStamp * 1000).getMinutes();
  const data = (currentTimeInMinutes / timeStampMinutes) * 100;
  return data.toFixed(0);
};

const RoundHeader = ({ roundNumber, roundStatus, endTimeStamp }) => {
  const timeProgressRatio = calculateTimeBasedProgress(endTimeStamp);

  return (
    <Box mb="4">
      <Flex p="4" justifyContent="space-between" alignItems="center">
        <Text fontWeight="bold" fontSize="16">
          {roundStatus}
        </Text>
        <Text fontWeight="bold" fontSize="16">
          BTC VS ETH
        </Text>
        <Text mr="1px" fontSize="12px">
          #{roundNumber}
        </Text>
      </Flex>
      {roundNumber === 15 && (
        <Progress colorScheme="purple" value={timeProgressRatio} />
      )}
    </Box>
  );
};

export const Round = () => {
  const { library } = useWeb3React();
  const signer = library?.getSigner();
  const cryptoPredictionContract = getContractInstance(
    RINKEBY_CONTRACT_ADDRESS,
    cryptoPricePrediction.abi,
    signer
  );

  const rounds = useRounds(cryptoPredictionContract, signer);
  // const currentPairsPriceFeeds = usePriceFeeds([
  //   BTC_USD_MATIC_MAINNET_ADDRESS,
  //   ETH_USD_MATIC_MAINNET_ADDRESS,
  // ]);
  console.log("currentPairsPriceFseeds---", rounds);
  return (
    <Flex flexWrap="wrap">
      {rounds?.map((round) => {
        const roundStatus = round?.roundEnded
          ? "EXPIRED"
          : round?.roundLock
          ? "LIVE"
          : "NEXT";
        const percentageRationCalulation =
          round?.roundNumber === 15 &&
          tokenPercentageChangeCalculation(
            round?.firstTokenPrice,
            round?.secondTokenPrice,
            []
          );
        return (
          <Box
            w="500px"
            m="2"
            key={round?.roundNumber}
            borderColor={
              round?.roundEnded ? "red" : round?.roundLock ? "yellow" : "green"
            }
            borderWidth="1px"
            backgroundOrigin="border-box"
            backgroundClip={"content-box, border-box"}
            backgroundSize="cover"
            boxSizing="border-box"
            boxShadow="0 0 5px 5px rgba(0, 0, 0, 0.5)"
            border="16px solid transparent"
            borderImage="linear-gradient(45deg, red , yellow)"
          >
            <RoundHeader
              roundNumber={round?.roundNumber}
              roundStatus={roundStatus}
              endTimeStamp={round?.endTimeStamp}
            />
            <Flex mb="10" justifyContent="space-between" alignItems="center">
              <TokenWrapper
                path={"./btc.svg"}
                pair={"BTC-USD"}
                color={"#ED64A6"}
                tokenRoundFixedPrice={round?.firstTokenPrice}
              />
              <RoundInfoWrapper
                endTimeStamp={round?.endTimeStamp}
                poolAmount={round?.poolTokenBaseAmount}
              />
              <TokenWrapper
                path={"./eth.svg"}
                pair={"ETH-USD"}
                color={"#805AD5"}
                tokenRoundFixedPrice={round?.secondTokenPrice}
              />
            </Flex>
            {round?.roundNumber === 15 && (
              <Progress
                colorScheme={"pink"}
                hasStripe
                size="lg"
                sx={{
                  backgroundSize: "1rem 1rem",
                  backgroundColor: "#805AD5 !important",
                  backgroundImage:
                    "linear-gradient( 45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent )",
                  div: {
                    backgroundColor: "#ED64A6 !important",
                  },
                }}
                value={
                  percentageRationCalulation?.ratioOfPercentageChanges ?? 50
                }
              />
            )}
            <Flex mb="2">
              <Button mx="2" colorScheme="pink" flex="1">
                Bet BTC
              </Button>
              <Button mx="2" colorScheme="purple" flex="1">
                Bet ETH
              </Button>
            </Flex>
          </Box>
        );
      })}
    </Flex>
  );
};
