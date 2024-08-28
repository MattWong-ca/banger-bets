"use client";

import Image from "next/image";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { useEffect, useState } from "react";

export default function Home() {
  const clientId = "";
  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1e",
    rpcTarget: "https://rootstock.drpc.org",
    displayName: "Rootstock Mainnet",
    blockExplorerUrl: "https://explorer.rootstock.io/",
    ticker: "RBTC",
    tickerName: "RBTC",
    logo: "https://pbs.twimg.com/profile_images/1592915327343624195/HPPSuVx3_400x400.jpg",
  };
  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig: chainConfig },
  });
  const web3auth = new Web3Auth({
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    privateKeyProvider,
  });

  const [web3authh, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
          privateKeyProvider,
        });
        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);
        if (web3authInstance.connected) {
          setLoggedIn(true);
          setProvider(web3authInstance.provider);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3authh) {
      console.log("Web3Auth not initialized yet");
      return;
    }
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getUserInfo = async () => {
    if (!web3authh) {
      console.log("Web3Auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    console.log(user);
  };

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <nav className="flex justify-between items-center p-4 text-white">
        <div className="space-x-4">
          <a href="#" className="hover:underline text-lg font-bold">My Bets</a>
          <a href="#" className="hover:underline text-lg font-bold">Leaderboard</a>
        </div>
        <button onClick={login} className="bg-white text-black px-4 py-2 rounded text-lg font-bold">Connect Wallet</button>
      </nav>
      
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="relative bg-white rounded-lg w-[80vw] max-w-[1920px] h-[60vh] flex items-center justify-center">
          <h1 className="absolute -top-32 left-1/2 transform -translate-x-1/2 text-white text-7xl font-bold italic">
            BetViral
          </h1>
          <div className="flex w-full h-full">
            <div className="w-1/2 flex items-center justify-center">
              <div className="w-96 h-96 bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600">Placeholder Image</span>
              </div>
            </div>
            <div className="w-1/2 p-8 flex flex-col justify-center items-start">
              <p className="text-black text-xl mb-4">
                Likes in 24 hrs: more than 1280
              </p>
              <p className="text-black text-xl mb-2">
                Bet amount (ETH): 0.001
              </p>
              <span className="bg-red-500 text-white text-sm px-2 py-1 rounded mb-4">
                No Fan Tokens in wallet
              </span>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-lg font-bold">
                🔥 BET
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}