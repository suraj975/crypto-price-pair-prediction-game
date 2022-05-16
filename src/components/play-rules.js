import React from "react";
import { Box, Heading, Text, Divider, Flex, Stack } from "@chakra-ui/react";

import { siteColorCodes } from "../helper/constant";

const PlayInfoHeader = () => {
  return (
    <Stack spacing="4" mt="4">
      <Heading textAlign="center" color="orange">
        How to Play ?
      </Heading>
      <Text w={["100%", "500px"]} textAlign="center">
        Just choose anyone of the coin whose price will fluctuate more in a
        given time. One with higher percentage, whether up or down will win.
        Simple !!
      </Text>
    </Stack>
  );
};

const PlayStepsCard = ({ step, title, description }) => {
  return (
    <Box
      borderRadius="10px"
      p="10"
      mb="2"
      bg={siteColorCodes.bodyBackround}
      maxW="350px"
    >
      <Stack>
        <Text fontSize="12px">Step {step}</Text>
        <Text fontWeight="bold" fontSize="18px" color="orange">
          {title}
        </Text>
        <Text>{description}</Text>
      </Stack>
    </Box>
  );
};

const PlayWinningCriteria = () => {
  return (
    <Flex flexDir="column" justifyContent="flex-start" w="100%">
      <Heading
        textAlign={["center", "left"]}
        size="lg"
        color="orange"
        marginY="10"
      >
        Winning Criteria
      </Heading>
      <Stack spacing="4">
        <Text fontSize="18px">
          The precentage change of one token must be higher than other token.
        </Text>
        <Text color="gray.400" fontSize="15px">
          Here’s an example of two tokens, BTC/USD & ETH/USD.
        </Text>
        <Text fontSize="15px" color="gray.400">
          When the live round starts, price is fixed for both BTC and ETH ( eg
          30,000 USD & 2500 USD) and at the end of round, BTC and ETH price is
          31,000 & 2400. The btc rose by 3.3 % and eth decrease by 4%.
        </Text>
        <Text fontSize="15px" color="gray.400">
          {
            "The important part here to understand is the percentage change at the end of round. Eth bet users wins. (4% > 3.3%)"
          }
        </Text>
      </Stack>
    </Flex>
  );
};

const PrizeFunds = () => {
  return (
    <Flex flexDir="column" justifyContent="flex-start" w="100%">
      <Heading
        textAlign={["center", "left"]}
        size="lg"
        w="100%"
        color="orange"
        marginY="10"
      >
        Prize Funds
      </Heading>
      <Stack spacing="4">
        <Text fontSize="18px">The prize distribution.</Text>
        <Text color="gray.400" fontSize="15px">
          Each round accumulates the pool money from the bets placed by the
          user.
        </Text>
        <Text fontSize="15px" color="gray.400">
          3% of the total pool amount is taken as fees for the platform future
          growth. The rest is divided among the winners.
        </Text>
        <Text fontSize="15px" color="gray.400">
          If the percentage change remains same then the whole pool money will
          go to the platform.
        </Text>
      </Stack>
    </Flex>
  );
};

export const HowToPlay = () => {
  return (
    <Flex
      borderTop="4px solid orange"
      bg="black"
      flexDir="column"
      alignItems="center"
      paddingX={["2%", "20%"]}
      paddingY="10"
    >
      <PlayInfoHeader />
      <Flex
        flexWrap="wrap"
        mt="10"
        w="100%"
        justifyContent={["center", "space-between"]}
      >
        <PlayStepsCard
          step="1"
          title="Bet Any Coin Pair"
          description="Bet on any coin pair (eg: ETH/USDT) which you think will have greater
            price fluctuation within the given time."
        />
        <PlayStepsCard
          step="2"
          title="Wait for the round completion"
          description="Once the draw is over, the coin pair with highest percentage change wins"
        />
        <PlayStepsCard
          step="3"
          title="Claim Rewards"
          description="If you win the bet then click claim to get the rewards"
        />
      </Flex>
      <Divider mt="4" />
      <PlayWinningCriteria />
      <Divider mt="4" />
      <PrizeFunds />
    </Flex>
  );
};
