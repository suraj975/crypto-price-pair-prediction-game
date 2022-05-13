import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  TableCaption,
  TableContainer,
  Text,
} from "@chakra-ui/react";
import { ethers } from "ethers";

import React from "react";
import { pairTypes, siteColorCodes } from "../../helper/constant";
import { claimReward } from "../../helper/contract-methods";
import { useGetUsers } from "../../hooks/use-get-users";

const UsersRoundsTable = ({ contract, rounds, signer, pair }) => {
  const [roundData, setRoundRewards] = React.useState({});
  const users = useGetUsers(contract, signer, rounds, pair);
  const getReward = async (roundNumber) => {
    try {
      setRoundRewards({
        ...roundData,
        [roundNumber]: { roundNumber, isLoading: true },
      });
      const tx = await claimReward(contract, pair, roundNumber);
      await tx.wait();
      setRoundRewards({
        ...roundData,
        [roundNumber]: { roundNumber, isLoading: false },
      });
    } catch (error) {
      setRoundRewards({
        ...roundData,
        [roundNumber]: { roundNumber, isLoading: false },
      });
    }
  };

  return (
    <Box>
      <TableContainer>
        <Table variant="simple">
          <TableCaption color="orange" fontWeight="bold">
            User Rewards of the rounds played
          </TableCaption>
          <Thead>
            <Tr>
              <Th color="orange" fontWeight="bold">
                Round No
              </Th>
              <Th color="orange" fontWeight="bold">
                Token Selected
              </Th>
              <Th color="orange" fontWeight="bold">
                Bet Amount
              </Th>
              <Th color="orange" fontWeight="bold">
                Rewards
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.keys(users)?.map((userRound) => {
              const isClaimLoading =
                roundData?.[userRound] && roundData?.[userRound]?.isLoading;
              const showClaimButton =
                users?.[userRound]?.isWinner && !users?.[userRound]?.claim;

              const userMatchResult = users?.[userRound]?.isWinner
                ? "CLAIMED"
                : "LOST";
              if (!users?.[userRound]?.roundEnded) return null;
              return (
                <Tr key={userRound}>
                  <Td>{userRound}</Td>
                  <Td>
                    {
                      pairTypes[pair][
                        Number(users?.[userRound]?.tokenSelected + 1)
                      ]
                    }
                  </Td>
                  <Td>
                    {ethers?.utils?.formatEther(users?.[userRound]?.amount)}
                  </Td>
                  <Td fontSize="bold">
                    {showClaimButton ? (
                      <Button
                        isLoading={isClaimLoading}
                        onClick={() => getReward(userRound)}
                        colorScheme="orange"
                      >
                        Claim
                      </Button>
                    ) : (
                      userMatchResult
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

function UserDrawerBoard(props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  return (
    <>
      <Button
        ref={btnRef}
        colorScheme="yellow"
        onClick={onOpen}
        position="absolute"
        top={["30%", "16%"]}
        right="0"
        borderTopRightRadius="0px"
        borderBottomRightRadius="0px"
      >
        User board
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="xl"
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent bg={"blackAlpha.900"}>
          <DrawerCloseButton />
          <DrawerHeader
            borderBottom="2px solid orange"
            color="orange"
            fontWeight="bold"
          >
            ROUNDS
          </DrawerHeader>
          <DrawerBody>
            <UsersRoundsTable {...props} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default UserDrawerBoard;
