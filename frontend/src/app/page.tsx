"use client";
import { ethers } from 'ethers';
import { useEffect, useState } from "react";
import fanToken from "../utils/fanToken.json";

declare var window: any
export default function Home() {
  const [userAddress, setUserAddress] = useState('');
  const [fanTokensAmount, setFanTokensAmount] = useState(0);

  const getCHZBalance = async () => {
    try {
      const chilizProvider = new ethers.JsonRpcProvider('https://spicy-rpc.chiliz.com/');
      const chzTokenAddress = "0xb861d6d79123ADa308E5F4030F458b402E2D131A";
      const chzTokenContract = new ethers.Contract(chzTokenAddress, fanToken.abi, chilizProvider);
      const balance = await chzTokenContract.balanceOf(userAddress);
      setFanTokensAmount(Number(ethers.formatUnits(balance, 2)));
      console.log("CHZ Balance: ", ethers.formatUnits(balance, 2));
    } catch (error) {
      console.error("Error fetching CHZ balance: ", error);
    }
  }

  useEffect(() => {
    getCHZBalance();
  }, [userAddress]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = provider.getSigner();
        console.log("Connected account:", accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  return (
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
              {fanTokensAmount > 0 ? (
                <span className="bg-green-500 text-white text-sm px-2 py-1 rounded mb-4">
                  {fanTokensAmount} Fan Tokens in wallet
                </span>
              ) : (
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded mb-4">
                  No Fan Tokens in wallet
                </span>
              )}
              {
                fanTokensAmount > 0 ? (
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-lg font-bold">
                    🔥 BET
                  </button>
                ) : (
                  <button disabled className="bg-gray-200 text-gray-400 px-4 py-2 rounded text-lg font-bold cursor-not-allowed">
                    BET
                  </button>
                )
              }
              <button onClick={getCHZBalance}>Refresh Balance</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}