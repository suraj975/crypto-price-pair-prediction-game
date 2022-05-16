import React from "react";
import { Navbar } from "./components/navbar";
import { HowToPlay } from "./components/play-rules";
import { RoundTabs } from "./components/rounds-tabs";
import {
  Box,
  Heading,
  Text,
  Button,
  Divider,
  Flex,
  Stack,
  Image,
  useDisclosure,
} from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import SelectWalletModal from "./modal";

const LandingPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex h="85vh" justifyContent="center" alignItems="center">
      <Flex
        flexDir="column"
        justifyContent="center"
        alignItems="center"
        flex="2"
      >
        <Heading textAlign="left" size="2xl" w="450px" color="orange">
          Place your bet on your favourite crypto pair and win rounds.
        </Heading>
        <Button w="400px" mt="100px" colorScheme="orange" onClick={onOpen}>
          Connect Wallet
        </Button>
      </Flex>
      <Flex alignItems="flex-end" flex="1">
        <Box mr="5">
          <Image w="50px" h="50px" src="./eth.svg" />
          <Box
            background="linear-gradient(0deg, rgba(231,238,9,0.9486388305322129) 0%, rgba(223,154,6,0.8814119397759104) 100%)"
            mt="2"
            h="150px"
          />
        </Box>
        <Box mr="5">
          <Image w="50px" h="50px" src="./btc.svg" />
          <Box
            background="linear-gradient(0deg, rgba(231,238,9,0.9486388305322129) 0%, rgba(223,154,6,0.8814119397759104) 100%)"
            mt="2"
            h="200px"
          />
        </Box>
        <Box mr="5">
          <Image w="50px" h="50px" src="./sand.svg" />
          <Box
            background="linear-gradient(0deg, rgba(231,238,9,0.9486388305322129) 0%, rgba(223,154,6,0.8814119397759104) 100%)"
            mt="2"
            h="250px"
          />
        </Box>
        <Box mr="5">
          <Image w="50px" h="50px" src="./matic.svg" />
          <Box
            background="linear-gradient(0deg, rgba(231,238,9,0.9486388305322129) 0%, rgba(223,154,6,0.8814119397759104) 100%)"
            mt="2"
            h="300px"
          />
        </Box>
      </Flex>
      <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
    </Flex>
  );
};

export default function Home() {
  const { active } = useWeb3React();
  return (
    <>
      <Navbar />
      {active && <RoundTabs />}
      {!active && <LandingPage />}
      <HowToPlay />
    </>
  );
}
