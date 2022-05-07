import { useDisclosure, Button, Text, HStack, Flex } from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import React, { useEffect } from "react";
import { connectors } from "../connectors";
import SelectWalletModal from "../modal";

export const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { activate, deactivate, active } = useWeb3React();
  const disconnect = () => {
    deactivate();
  };

  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider) activate(connectors[provider]);
  }, []);

  return (
    <Flex alignItems="center" bg="gray.700" p="1em">
      <Flex justifyContent="center" flex="10" marginBottom="10px">
        <Text
          margin="0"
          lineHeight="1.15"
          fontSize={["1.5em", "2em", "3em", "3em"]}
          fontWeight="600"
          sx={{
            background: "linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Crypto Prediction
        </Text>
      </Flex>
      <Flex justifyContent="flex-end" flex="1">
        {!active ? (
          <Button colorScheme="pink" onClick={onOpen}>
            Connect Wallet
          </Button>
        ) : (
          <Button colorScheme="purple" onClick={disconnect}>
            Disconnect
          </Button>
        )}
      </Flex>
      <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
    </Flex>
  );
};
