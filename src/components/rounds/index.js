import { Flex, Box, Text, Stack, Button } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import cryptoPricePrediction from "../../contracts/CryproPairPricePredictionFactory.json";
import { getContractInstance } from "../../helper/contract-methods";
import {
  ETH_USD_MATIC_MAINNET_ADDRESS,
  BTC_USD_MATIC_MAINNET_ADDRESS,
  RINKEBY_CONTRACT_ADDRESS,
  pairTypes,
} from "../../helper/constant";
import { useRounds } from "../../hooks/use-rounds";
import { usePriceFeeds } from "../../hooks/use-price-feeds";
import { CountDownTimer } from "./countdown";
import { Progress } from "@chakra-ui/react";
import { ButtonWrapper } from "./bet-buttons-wrapper";
import { ethers } from "ethers";

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

const RoundInfoWrapper = ({ endTimeStamp, poolAmount, winner, roundEnded }) => {
  console.log("typeof poolAmount", typeof poolAmount);
  return (
    <Stack>
      <CountDownTimer time={Number(endTimeStamp) * 1000} />
      <Text text-align="center" fontWeight="bold">
        Pool : {poolAmount > 0 ? Number(poolAmount)?.toFixed(4) : 0}
      </Text>
      {roundEnded && Number(endTimeStamp) !== 0 && (
        <Text text-align="center" color="teal.300" fontWeight="bold">
          {winner()} WINS
        </Text>
      )}
    </Stack>
  );
};

const calculateTimeBasedProgress = (endTimeStamp, startTimeStamp) => {
  const startMs = startTimeStamp * 1000;
  const endMs = endTimeStamp * 1000;
  const now = Date.now();
  const rawProgress = ((now - startMs) / (endMs - startMs)) * 100;
  const progress = rawProgress <= 100 ? rawProgress : 100;
  return progress;
};

const RoundHeader = ({
  roundNumber,
  roundStatus,
  endTimeStamp,
  startTimeStamp,
  isRoundLive,
}) => {
  const timeProgressRatio = calculateTimeBasedProgress(
    endTimeStamp,
    startTimeStamp
  );

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
      {isRoundLive && (
        <Progress colorScheme="purple" value={timeProgressRatio} />
      )}
    </Box>
  );
};

const RoundProgressWrapper = ({ progress }) => {
  const dominancePercentage = progress?.ratioOfPercentageChanges ?? 50;
  return (
    <Box marginX="1" mb="4">
      <Text fontWeight="bold">Dominance</Text>
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
        value={dominancePercentage}
      />
      <Flex justifyContent="space-between">
        <Text fontWeight="bold">{dominancePercentage.toFixed(0)}%</Text>
        <Text fontWeight="bold">
          {(100 - dominancePercentage).toFixed(0)}%{" "}
        </Text>
      </Flex>
    </Box>
  );
};

export const Round = ({ pair }) => {
  const { library } = useWeb3React();
  const signer = library?.getSigner();
  const cryptoPredictionContract = getContractInstance(
    RINKEBY_CONTRACT_ADDRESS,
    cryptoPricePrediction.abi,
    signer
  );

  const roundWinner = (round) => {
    const winner =
      round.firstTokenPriceChange === round.secondTokenPriceChange
        ? 0
        : round.firstTokenPriceChange > round.secondTokenPriceChange
        ? 1
        : 2;

    return winner === 0 ? "" : pairTypes[pair][winner];
  };

  const rounds = useRounds(cryptoPredictionContract, signer);
  // const currentPairsPriceFeeds = usePriceFeeds([
  //   BTC_USD_MATIC_MAINNET_ADDRESS,
  //   ETH_USD_MATIC_MAINNET_ADDRESS,
  // ]);
  console.log("round---", rounds);
  return (
    <Flex flexWrap="wrap">
      {rounds?.map((round) => {
        const roundStatus = round?.roundEnded
          ? "EXPIRED"
          : round?.roundLock
          ? "LIVE"
          : "NEXT";
        const isRoundLive = round?.roundLock && !round?.roundEnded;
        const percentageRationCalulation =
          isRoundLive &&
          tokenPercentageChangeCalculation(
            round?.firstTokenPrice,
            round?.secondTokenPrice,
            []
          );

        return (
          <Box
            m="2"
            key={round?.roundNumber}
            borderWidth="1px"
            backgroundOrigin="border-box"
            backgroundClip={"content-box, border-box"}
            backgroundSize="cover"
            boxSizing="border-box"
            borderRadius="5px"
            boxShadow="0 0 3px 5px rgba(0, 0, 0, 0.5)"
            border="2px solid transparent"
            background={
              !round?.roundEnded
                ? "linear-gradient(90deg, rgba(128,90,213,1) 0%, rgba(237,100,166,1) 100%)"
                : "none"
            }
          >
            <Box h="100%" background="gray.800" w="500px">
              <RoundHeader
                roundNumber={round?.roundNumber}
                roundStatus={roundStatus}
                endTimeStamp={round?.endTimeStamp}
                startTimeStamp={round?.startTimeStamp}
                isRoundLive={isRoundLive}
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
                  poolAmount={ethers.utils.formatEther(round?.poolAmount)}
                  winner={() => roundWinner(round)}
                  roundEnded={round?.roundEnded}
                />
                <TokenWrapper
                  path={"./eth.svg"}
                  pair={"ETH-USD"}
                  color={"#805AD5"}
                  tokenRoundFixedPrice={round?.secondTokenPrice}
                />
              </Flex>
              {isRoundLive && (
                <RoundProgressWrapper progress={percentageRationCalulation} />
              )}
              {
                <ButtonWrapper
                  round={round}
                  pair={1}
                  pairRound={round?.roundNumber}
                  allRounds={rounds}
                />
              }
            </Box>
          </Box>
        );
      })}
    </Flex>
  );
};
