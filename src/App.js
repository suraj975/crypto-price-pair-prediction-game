import React from "react";
import { Navbar } from "./components/navbar";
import { Round } from "./components/rounds";
import { RoundTabs } from "./components/rounds-tabs";

export default function Home() {
  return (
    <>
      <Navbar />
      <RoundTabs />
      {/* <Round pair={1} /> */}
    </>
  );
}
