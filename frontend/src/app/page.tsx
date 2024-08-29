"use client";
import { ethers } from 'ethers';

// import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
// import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
// import { Web3Auth } from "@web3auth/modal";
import { useEffect, useState } from "react";
// import { useWeb3Auth, Web3AuthProvider } from "@web3auth/modal-react-hooks";
// import Web3AuthClient from "./client";
declare var window: any
export default function Home() {
  const [userAddress, setUserAddress] = useState('');

  const getCHZBalance = async () => {
    try {
      const chilizProvider = new ethers.JsonRpcProvider('https://rpc.ankr.com/chiliz');
      const chzTokenAddress = "0x..."; // REPLACE WITH ACTUAL CHZ CONTRACT ADDRESS I DEPLOY
      const chzTokenABI = [""]; // REPLACE WITH ACTUAL CHZ CONTRACT ABI I DEPLOY
      const chzTokenContract = new ethers.Contract(chzTokenAddress, chzTokenABI, chilizProvider);  
      const balance = await chzTokenContract.balanceOf(userAddress);
      console.log("CHZ Balance: ", ethers.formatUnits(balance, 18));
    } catch (error) {
      console.error("Error fetching CHZ balance: ", error);
    }
  }
  useEffect(() => {
    getCHZBalance();
  }, []);

  const connectWallet = async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Set the user's address
        setUserAddress(accounts[0]);

        // Create an ethers provider
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Get the signer
        const signer = provider.getSigner();

        // You can now use `signer` to interact with the blockchain
        console.log("Connected account:", accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };
  // const { isConnected, connect } = useWeb3Auth();
  // const clientId = "BKafN9Mq-bb7sVCq8-ZcfME29emBV94GAMhMtJUvTYhNLF4dQLWBuFvC41CqtpOHmuSP2QnC23Y6oYIeHZzIiSw";
  // const chainConfig = {
  //   chainNamespace: CHAIN_NAMESPACES.EIP155,
  //   chainId: "0x1e",
  //   rpcTarget: "https://rootstock.drpc.org",
  //   displayName: "Rootstock Mainnet",
  //   blockExplorerUrl: "https://explorer.rootstock.io/",
  //   ticker: "RBTC",
  //   tickerName: "RBTC",
  //   logo: "https://pbs.twimg.com/profile_images/1592915327343624195/HPPSuVx3_400x400.jpg",
  // };
  // const privateKeyProvider = new EthereumPrivateKeyProvider({
  //   config: { chainConfig: chainConfig },
  // });
  // const web3auth = new Web3Auth({
  //   clientId,
  //   web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  //   privateKeyProvider,
  // });

  // const [web3authh, setWeb3auth] = useState<Web3Auth | null>(null);
  // const [provider, setProvider] = useState<IProvider | null>(null);
  // const [loggedIn, setLoggedIn] = useState(false);

  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       const web3authInstance = new Web3Auth({
  //         clientId,
  //         web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  //         privateKeyProvider,
  //       });
  //       await web3authInstance.initModal();
  //       setWeb3auth(web3authInstance);
  //       if (web3authInstance.connected) {
  //         setLoggedIn(true);
  //         setProvider(web3authInstance.provider);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   init();
  // }, []);

  // const login = async () => {
  //   if (!web3authh) {
  //     console.log("Web3Auth not initialized yet");
  //     return;
  //   }
  //   try {
  //     const web3authProvider = await web3auth.connect();
  //     setProvider(web3authProvider);
  //     setLoggedIn(true);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // const getUserInfo = async () => {
  //   if (!web3authh) {
  //     console.log("Web3Auth not initialized yet");
  //     return;
  //   }
  //   const user = await web3auth.getUserInfo();
  //   console.log(user);
  // };

  return (
    // <Web3AuthClient>

    <main className="bg-black min-h-screen flex flex-col">
      <nav className="flex justify-between items-center p-4 text-white">
        <div className="space-x-4">
          <a href="#" className="hover:underline text-lg font-bold">My Bets</a>
          <a href="#" className="hover:underline text-lg font-bold">Leaderboard</a>
        </div>
        {userAddress ? (
          <div className="text-white text-lg font-bold">
            {`${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}
          </div>
        ) : (
          <button onClick={connectWallet} className="bg-white text-black px-4 py-2 rounded text-lg font-bold">
            Connect Wallet
          </button>
        )}
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
              <button onClick={getCHZBalance}>Refresh Balance</button>
            </div>
          </div>
        </div>
      </div>
    </main>
    // {/* </Web3AuthClient> */}
  );
}