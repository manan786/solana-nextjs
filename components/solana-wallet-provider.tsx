"use client";

import React, { useCallback, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  // LedgerWalletAdapter,
  // SlopeWalletAdapter,
} from "@solana/wallet-adapter-wallets";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
// import { AutoConnectProvider, useAutoConnect } from './AutoConnectProvider';

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

const AppWalletProvider = ({ children }: { children: React.ReactNode }) => {
  // const { autoConnect } = useAutoConnect();
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // manually add any legacy wallet adapters here
      // new UnsafeBurnerWalletAdapter(),
    ],
    [network],
  );

  const onError = useCallback((error: WalletError) => {
    console.log({
      type: "error",
      message: error.message ? `${error.name}: ${error.message}` : error.name,
    });
    // notify();
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default AppWalletProvider;
