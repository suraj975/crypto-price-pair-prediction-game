import React from "react";
import { Navbar } from "./components/navbar";
import { Round } from "./components/rounds";

export default function Home() {
  return (
    <>
      <Navbar />
      <Round pair={1} />
    </>
  );
}
