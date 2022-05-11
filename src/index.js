import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import App from "./App";
// 1. Import `extendTheme`
import { extendTheme } from "@chakra-ui/react";

// 2. Call `extendTheme` and pass your custom values
const theme = extendTheme({
  colors: {
    brand: {
      100: "#f7fafc",
      // ...
      900: "#1a202c",
    },
  },
  styles: {
    global: (props) => ({
      body: {
        fontFamily: "body",
        bg: "#8367c7",
        color: "white",
        lineHeight: "base",
      },
    }),
  },
});

const getLibrary = (provider) => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 8000; // frequency provider is polling
  return library;
};

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <App />
      </Web3ReactProvider>
    </ChakraProvider>
  </StrictMode>
);
