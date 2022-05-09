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
import {
  claimReward,
  getContractInstance,
} from "../../helper/contract-methods";
import { pairTypes, RINKEBY_CONTRACT_ADDRESS } from "../../helper/constant";
import cryptoPricePrediction from "../../contracts/CryproPairPricePredictionFactory.json";
import { useGetUsers } from "../../hooks/use-get-users";
import { useRounds } from "../../hooks/use-rounds";
import { RoundContext } from "./index";

function BettingAmountModal({
  isOpen,
  onClose,
  value,
  setValue,
  buttonRefType,
  tokenBetAction,
}) {
  const betType = buttonRefType?.current === 1 ? "BTC-USD" : "ETH-USD";
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
                  value={value ?? 0.0002}
                  placeholder="Bet Amount"
                  min={0.0001}
                  onChange={(e) => setValue(e?.target.value)}
                />
                <Text textAlign="right" mt="1" fontSize="10px">
                  Min bet is 0.0001 ETH
                </Text>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="pink" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              disabled={value < 0.0001}
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

export const ButtonWrapper = ({ round, pairRound, pair, allRounds }) => {
  const { library } = useWeb3React();
  const [value, setValue] = React.useState(0.0002);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const buttonRefType = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const roundsData = React.useContext(RoundContext);
  const signer = library?.getSigner();

  const cryptoPredictionContract = getContractInstance(
    RINKEBY_CONTRACT_ADDRESS,
    cryptoPricePrediction.abi,
    signer
  );
  useRounds(cryptoPredictionContract, signer);
  const openModalAction = (type) => {
    buttonRefType.current = type;
    onOpen();
  };

  const getReward = async () => {
    try {
      setLoading(true);
      const tx = await claimReward(cryptoPredictionContract, pair, pairRound);
      await tx.wait();
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

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
      onClose();
      await tx.wait();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      onClose();
    }
  };
  const users = useGetUsers(cryptoPredictionContract, signer, roundsData);
  const hasWon =
    round?.roundEnded &&
    !users?.[round.roundNumber]?.claim &&
    users?.[round.roundNumber]?.isWinner;
  const isBetTaken = users?.[round.roundNumber]?.amount > 0;
  const isNextRound =
    round?.roundStart && !round?.roundLock && Number(round?.endTimeStamp) !== 0;
  const { tokenSymbol1, tokenSymbol2 } = pairTypes[pair];
  return (
    <Flex>
      {!hasWon && isNextRound && (
        <>
          <Button
            onClick={() => openModalAction(1)}
            isLoading={loading && buttonRefType.current === 1}
            colorScheme="pink"
            flex="1"
            mx="2"
            isDisabled={isBetTaken}
          >
            Bet {tokenSymbol1}
          </Button>
          <Button
            onClick={() => openModalAction(2)}
            isLoading={loading && buttonRefType.current === 2}
            colorScheme="purple"
            flex="1"
            mx="2"
            isDisabled={isBetTaken}
          >
            Bet {tokenSymbol2}
          </Button>
        </>
      )}
      {hasWon && (
        <Button
          onClick={getReward}
          colorScheme="pink"
          flex="1"
          mx="2"
          isLoading={loading}
        >
          Claim
        </Button>
      )}
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
