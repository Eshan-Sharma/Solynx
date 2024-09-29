"use client";
import Image from "next/image";
import Dashboard from "./dashboard/page";
import AppWalletProvider from "./components/WalletAdapter";

export default function Home() {
  return (
    <div className="">
      <AppWalletProvider>
        <Dashboard />
      </AppWalletProvider>
    </div>
  );
}
