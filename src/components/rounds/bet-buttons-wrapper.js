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
import {
  pairTypes,
  RINKEBY_CONTRACT_ADDRESS,
  siteColorCodes,
} from "../../helper/constant";
import cryptoPricePrediction from "../../contracts/CryproPairPricePredictionFactory.json";
import { useGetUsers } from "../../hooks/use-get-users";
import { RoundContext } from "./index";

function BettingAmountModal({
  isOpen,
  onClose,
  value,
  pair,
  setValue,
  buttonRefType,
  tokenBetAction,
}) {
  const betType = pairTypes[pair][buttonRefType?.current];
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalContent
          bg={siteColorCodes?.modalBAcground}
          border="4px solid orange"
        >
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
                  Min bet is 0.0001 Matic
                </Text>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="yellow" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              disabled={value < 0.0001}
              onClick={() => tokenBetAction(buttonRefType?.current)}
              colorScheme="orange"
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
  const [_, roundsData] = React.useContext(RoundContext);
  const signer = library?.getSigner();

  const cryptoPredictionContract = getContractInstance(
    RINKEBY_CONTRACT_ADDRESS,
    cryptoPricePrediction.abi,
    signer
  );
  // Remove this hook as the data is coming from context provider
  //useRounds(cryptoPredictionContract, signer, pair, 5);
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
  const users = useGetUsers(cryptoPredictionContract, signer, roundsData, pair);
  const hasWon =
    round?.roundEnded &&
    !users?.[round.roundNumber]?.claim &&
    users?.[round.roundNumber]?.isWinner;
  const isBetTaken = users?.[round.roundNumber]?.amount > 0;
  const isNextRound =
    round?.roundStart && !round?.roundLock && Number(round?.endTimeStamp) !== 0;
  const currentTime = Math.floor(Date.now() / 1000);
  const isLastRoundTimerOver =
    isNextRound && allRounds[allRounds.length - 2].endTimeStamp < currentTime;
  const { tokenSymbol1, tokenSymbol2 } = pairTypes[pair];
  return (
    <Flex mt="10">
      {!hasWon && isNextRound && (
        <>
          <Button
            onClick={() => openModalAction(1)}
            isLoading={loading && buttonRefType.current === 1}
            colorScheme="yellow"
            flex="1"
            mx="2"
            isDisabled={isLastRoundTimerOver || isBetTaken}
          >
            Bet {tokenSymbol1}
          </Button>
          <Button
            onClick={() => openModalAction(2)}
            isLoading={loading && buttonRefType.current === 2}
            colorScheme="orange"
            flex="1"
            mx="2"
            isDisabled={isLastRoundTimerOver || isBetTaken}
          >
            Bet {tokenSymbol2}
          </Button>
        </>
      )}
      {hasWon && (
        <Button
          onClick={getReward}
          colorScheme="orange"
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
        pair={pair}
        tokenBetAction={tokenBetAction}
      />
    </Flex>
  );
};
