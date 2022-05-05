import React from "react";
import {
  Flex,
  Box,
  Text,
  Stack,
  Button,
  Modal,
  Input,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { getContractInstance } from "../../helper/contract-methods";
import { RINKEBY_CONTRACT_ADDRESS } from "../../helper/constant";
import cryptoPricePrediction from "../../contracts/CryproPairPricePredictionFactory.json";

function BettingAmountModal({
  isOpen,
  onClose,
  value,
  setValue,
  buttonRefType,
  tokenBetAction,
}) {
  const betType = buttonRefType?.current === 1 ? "BTC-USD" : "ETH-USD";
  console.log("value----->", value >= 0.001);
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalContent bg="gray.700">
          <ModalHeader>
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">BET</Text>
              <Text fontWeight="bold">{betType}</Text>
            </Flex>
          </ModalHeader>
          <ModalBody>
            <Stack>
              <Text fontWeight="bold">Commit</Text>
              <Box>
                <Input
                  type="text"
                  value={value ?? 0.001}
                  placeHolder="Bet Amount"
                  min={0.001}
                  onChange={(e) => setValue(e?.target.value)}
                />
                <Text textAlign="right" mt="1" fontSize="10px">
                  Min bet is 0.001 ETH
                </Text>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="pink" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              disabled={value < 0.001}
              onClick={() => tokenBetAction(buttonRefType?.current)}
              colorScheme="purple"
            >
              Bet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export const ButtonWrapper = ({ pairRound, pair }) => {
  const { library } = useWeb3React();
  const [value, setValue] = React.useState(0.001);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const buttonRefType = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const signer = library?.getSigner();
  const cryptoPredictionContract = getContractInstance(
    RINKEBY_CONTRACT_ADDRESS,
    cryptoPricePrediction.abi,
    signer
  );
  console.log("type----", pairRound, pair);

  const openModalAction = (type) => {
    buttonRefType.current = type;
    onOpen();
  };

  const getBigNumberFormat = (value) => {
    return ethers?.BigNumber?.from(value);
  };
  const pairRoundBigNumberFormat = getBigNumberFormat(pairRound);
  const pairBigNumberFormat = getBigNumberFormat(pair);
  console.log(
    "pairRoundBigNumberFormat,pairBigNumberFormat",
    pairRoundBigNumberFormat,
    pairBigNumberFormat
  );
  const tokenBetAction = async (type) => {
    const actionButtonType = type === 1 ? "firstTokenBet" : "secondTokenBet";

    try {
      setLoading(true);
      const tx = await cryptoPredictionContract[actionButtonType](
        pairRound,
        pair,
        {
          value: ethers.utils.parseUnits(value.toString(), "ether"),
        }
      );
      tx.wait();
      onClose();
    } catch (error) {
      console.log("eroorsss----", error);
      onClose();
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <Flex mb="2">
      <Button
        onClick={() => openModalAction(1)}
        mx="2"
        isLoading={loading && buttonRefType.current === 1}
        colorScheme="pink"
        flex="1"
      >
        Bet BTC
      </Button>
      <Button
        onClick={() => openModalAction(2)}
        isLoading={loading && buttonRefType.current === 2}
        mx="2"
        colorScheme="purple"
        flex="1"
      >
        Bet ETH
      </Button>
      <BettingAmountModal
        isOpen={isOpen}
        onClose={onClose}
        value={value}
        setValue={setValue}
        buttonRefType={buttonRefType}
        tokenBetAction={tokenBetAction}
      />
    </Flex>
  );
};
