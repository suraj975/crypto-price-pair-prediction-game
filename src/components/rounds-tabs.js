import React from "react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useWeb3React } from "@web3-react/core";
import { getContractInstance, getPairCount } from "../helper/contract-methods";
import { pairTypes, RINKEBY_CONTRACT_ADDRESS } from "../helper/constant";
import { Round } from "./rounds";
import cryptoPricePrediction from "../contracts/CryproPairPricePredictionFactory.json";

const TabListHeaders = ({ pairCount }) => {
  const pairArray = new Array(pairCount)
    .fill(0)
    .map((pair, index) => index + 1);
  return (
    <TabList fontWeight="bold">
      {pairArray?.map((pair, index) => {
        return (
          <Tab fontWeight="bold" color="white" key={index}>
            {pairTypes[pair].comaparison}
          </Tab>
        );
      })}
    </TabList>
  );
};

const TabsComponent = ({ pairCount }) => {
  const pairArray = new Array(pairCount)
    .fill(0)
    .map((pair, index) => index + 1);
  return (
    <TabPanels>
      {pairArray?.map((pair, index) => {
        return (
          <TabPanel key={index}>
            <Round pair={pair} />
          </TabPanel>
        );
      })}
    </TabPanels>
  );
};

export const RoundTabs = () => {
  const [pairCount, setPariCount] = React.useState(0);
  const { library } = useWeb3React();
  const signer = library?.getSigner();
  const cryptoPredictionContract = getContractInstance(
    RINKEBY_CONTRACT_ADDRESS,
    cryptoPricePrediction.abi,
    signer
  );

  React.useEffect(() => {
    const getValues = async () => {
      const count = await getPairCount(cryptoPredictionContract);
      setPariCount(count.toNumber());
    };
    if (signer?._isSigner) {
      getValues();
    }
  }, [signer?._isSigner]);

  if (pairCount === 0) return null;

  return (
    <Tabs
      mt="5"
      variant="soft-rounded"
      colorScheme="purple"
      align="center"
      isLazy={true}
    >
      <TabListHeaders pairCount={pairCount} />
      <TabsComponent pairCount={pairCount} />
    </Tabs>
  );
};
