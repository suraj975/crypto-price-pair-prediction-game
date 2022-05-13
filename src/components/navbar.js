import { useDisclosure, Button, Image, Flex } from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import React, { useEffect } from "react";
import { connectors } from "../connectors";
import { siteColorCodes } from "../helper/constant";
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
    <Flex
      alignItems="center"
      bg={siteColorCodes?.modalBAcground}
      borderBottom="2px solid orange"
    >
      <Flex justifyContent="flex-between" flex="10">
        <Image w="110px" h="110px" src="./logo.png" />
      </Flex>
      <Flex justifyContent="flex-end" flex="1">
        {!active ? (
          <Button colorScheme="orange" onClick={onOpen}>
            Connect Wallet
          </Button>
        ) : (
          <Button colorScheme="orange" onClick={disconnect}>
            Disconnect
          </Button>
        )}
      </Flex>
      <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
    </Flex>
  );
};
