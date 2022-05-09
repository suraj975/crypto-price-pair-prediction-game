import React from "react";
import { getPriceFeeds } from "../helper/contract-methods";

export const usePriceFeeds = (pricePairs) => {
  const [priceFeeds, setPriceFeeds] = React.useState([]);
  React.useEffect(() => {
    const getData = async (pricePairs) => {
      const promises = await pricePairs.map(async (pair) => {
        const data = await getPriceFeeds(pair);
        return data;
      });
      const data = await Promise.all(promises);
      if (priceFeeds?.[0] !== data?.[0] || priceFeeds?.[1] !== data?.[1]) {
        setPriceFeeds(data);
      }
    };
    const intervalId = setInterval(() => {
      getData(pricePairs);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return priceFeeds;
};
