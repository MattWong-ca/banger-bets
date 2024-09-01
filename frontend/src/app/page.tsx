"use client";
import { ethers } from 'ethers';
import { useEffect, useState } from "react";
import fanToken from "../utils/fanToken.json";
// import betContract from "../utils/betContract.json"; 

declare var window: any

export default function Home() {
  const [userAddress, setUserAddress] = useState('');
  const [fanTokensAmount, setFanTokensAmount] = useState(0);
  const [betAmount, setBetAmount] = useState('');
  // const [data, setData] = useState(null);

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
    // connectWallet();
    getCHZBalance();
  }, [userAddress]);

  const placeBet = async () => {
    // User signs the transaction to give ___ ETH to contract for betting
    // if (!window.ethereum) {
    //   alert("Please install MetaMask!");
    //   return;
    // }
    // try {
    //   await window.ethereum.request({ method: 'eth_requestAccounts' });
    //   const provider = new ethers.BrowserProvider(window.ethereum);
    //   const signer = await provider.getSigner();
    //   const contractAddress = "0x..."; // TO DO: get contract address from deployment
    //   const betContract = new ethers.Contract(contractAddress, betContractABI, signer);

    //   const betAmountWei = ethers.parseEther(betAmount);
    //   const tx = await betContract.bet({ value: betAmountWei });
    //   await tx.wait();
    //   console.log("Bet placed successfully!");
    // } catch (error) {
    //   console.error("Error placing bet:", error);
    //   alert("Failed to place bet. Please try again.");
    // }

    // Use Neynar --> bot makes a cast with the custom frame
    // let betPost = `@${bettorUsername} is betting ${ethAmount} ETH that ${castAuthorUsername}'s cast will get more than ${castLikes} likes in 24 hrs.\nBet against them:`;
    // const betCast = await neynarClient.publishCast(
    //   process.env.SIGNER_UUID!,
    //   betPost,
    //   {
    //     embeds: [{
    //       url: `https://bet-viral.vercel.app/challenge/${authorUsername}`
    //     }]
    //   }
    // );


    // TO DO: Bet data is published to MongoDB


    // setTimeout of 2 mins, then use Neynar to delete the cast
    // setTimeout(async () => {
    //   try {
    //     await neynarClient.deleteCast(betPost.hash);
    //   } catch (error) {
    //     console.error('Error with deleteCast:', error);
    //   }
    // }, 2 * 60 * 1000);


    // do another setTimeout of 24 hrs, then use Neynar to check # of likes, and publish to MongoDB
    // const options = {
    //   method: 'GET',
    //   headers: {
    //     accept: 'application/json',
    //     api_key: 'NEYNAR_API_DOCS'
    //   }
    // };
    // const url = 'https://example.com/api/endpoint';
    // setTimeout(() => {
    //   fetch(url, options)
    //     .then(res => res.json())
    //     .then(json => {
    //       setData(json);
    //     })
    //     .catch(err => console.error('error:' + err));

    // TO DO: the MongoDB data is updated with response from Neynar API

    // }, 24 * 60 * 60 * 1000);
  }

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setUserAddress(accounts[0]);
        console.log("Connected account:", accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("MetaMask is not installed!");
    }
  };

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(e.target.value);
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
              <div className="flex items-center mb-4">
                <p className="text-black text-xl mr-2">
                  Bet amount (ETH):
                </p>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  className="border border-black rounded px-2 py-1 w-24"
                  placeholder="0.00"
                />
              </div>
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
                  <button onClick={placeBet} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-lg font-bold">
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