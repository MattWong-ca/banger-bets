"use client";
import { ethers } from 'ethers';
import { useEffect, useState } from "react";
import fanToken from "../../utils/fanToken.json";
import betContractJson from "../../utils/betContract.json";
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

declare var window: any

const supabase = createClient('https://uzhrukpbosrdtqvzjbyu.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_KEY!);

export default function Home() {
  const [urlParams, setUrlParams] = useState<{
    castHash: string;
    likes: string;
    betAmount: string;
    ogBettorAddress: string;
    challengerUsername: string;
  }>();
  const [userAddress, setUserAddress] = useState('');
  const [fanTokensAmount, setFanTokensAmount] = useState(0);
  const [image, setImage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authorUsername, setAuthorUsername] = useState('');
  const [postText, setPostText] = useState('');
  const [challenged, setChallenged] = useState(false);

  useEffect(() => {
    connectWallet();
    if (userAddress) {
      getCHZBalance();
    }
  }, [userAddress]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setUrlParams({
      castHash: searchParams.get('castHash') || '',
      likes: searchParams.get('likes') || '',
      betAmount: searchParams.get('betAmount') || '',
      ogBettorAddress: searchParams.get('ogBettorAddress') || '',
      challengerUsername: searchParams.get('challengerUsername') || ''
    });
  }, []);

  useEffect(() => {
    const fetchCastInfo = async () => {
      // 0x00221a629cf888fb2ff5997fd4d25cd49272fc42
      if (urlParams && urlParams.castHash) {
        const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${urlParams.castHash}&type=hash`;
        console.log("url: ", url);
        const res = await fetchCast(url);
        if (res && res.cast.author.pfp_url) {
          setImage(res.cast.author.pfp_url);
          console.log("image: ", image);
        }
        if (res && res.cast.author.display_name) {
          setDisplayName(res.cast.author.display_name);
          console.log("displayName: ", displayName);
        }
        if (res && res.cast.author.username) {
          setAuthorUsername(res.cast.author.username);
          console.log("authorUsername: ", authorUsername);
        }
        if (res && res.cast.text) {
          setPostText(res.cast.text);
          console.log("postText: ", postText);
        }
      }
    };

    fetchCastInfo();
  }, [image, displayName, authorUsername, postText, urlParams?.castHash]);

  async function fetchCast(url: string) {
    const options = { method: 'GET', headers: { accept: 'application/json', api_key: 'NEYNAR_API_DOCS' } };
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }

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

  async function addChallenger(castHash: string, challengerAddress: string, challengerUsername: string) {
    const { data, error } = await supabase
      .from('bets')
      .update({
        challenger_address: challengerAddress,
        challenger_username: challengerUsername,
        matched: true
      })
      .eq('cast_hash', castHash);

    if (error) {
      console.error('Error updating challenger info:', error);
    } else {
      console.log('Challenger info updated!');
    }
  }

  const placeChallengeBet = async () => {
    // User signs the transaction to give ___ ETH to contract for betting
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = "0xfF70C3ae45022AE728b62c90d0c14D526560e9Cf"; // TO DO: get contract address from deployment
      const betContract = new ethers.Contract(contractAddress, betContractJson.abi, signer);

      const betAmountWei = ethers.parseEther(urlParams!.betAmount);
      const tx = await betContract.challengeBet(urlParams!.ogBettorAddress, { value: betAmountWei });
      setChallenged(true)
      await tx.wait();
      console.log("Bet placed successfully!");
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("Failed to place bet. Please try again.");
    }

    // TO DO: Add challenger address to Supabase (IT WORKS!)
    addChallenger(urlParams!.castHash, userAddress, urlParams!.challengerUsername)

    // TO DO: Delete cast if challenger puts down a bet

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

  return (
    <main className="bg-black min-h-screen flex flex-col">
      <nav className="flex justify-between items-center p-4 text-white">
        <div className="space-x-4">
          <a href="/" className="hover:underline text-lg font-bold">Home</a>
          <a href="/mybets" className="hover:underline text-lg font-bold">My Bets</a>
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
            Challenge Bet
          </h1>
          <div className="flex w-full h-full">
            <div className="w-1/2 flex items-center justify-center">
              <div className="w-96 h-96 border-2 border-black p-4 pr-6">
                <div className="flex items-start">
                  <Image
                    src={image || "https://pbs.twimg.com/profile_images/1546487688601096192/QoG0ZVgH_400x400.jpg"}
                    alt="Profile picture"
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div className="ml-4">
                    <div className="flex items-center">
                      <span className="font-bold text-black mr-2">{displayName || "Farcaster"}</span>
                      <span className="text-gray-500">@{authorUsername || "farcaster"}</span>
                    </div>
                    <p className="mt-1 text-black whitespace-pre-wrap">{postText || "ok banger"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/2 flex flex-col justify-center items-start">
              <div className="flex items-center mb-4">
                <p className="text-black text-3xl mr-4 font-bold w-72">
                  Likes in 24 hrs:
                </p>
                <p className="border border-black px-4 py-2 w-32 text-2xl">
                  {urlParams?.likes}
                </p>
              </div>
              <div className="flex items-center mb-4">
                <p className="text-black text-3xl mr-4 font-bold w-72">
                  Bet amount (ETH):
                </p>
                <p className="border border-black px-4 py-2 w-32 text-2xl">
                  {urlParams?.betAmount}
                </p>
              </div>
              <div className="pt-8">
                <p className={`text-lg font-bold italic ${fanTokensAmount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {fanTokensAmount > 0
                    ? `✅ ${fanTokensAmount} Fan Tokens in wallet`
                    : '❌ No Fan Tokens in wallet'
                  }
                </p>
                {
                  fanTokensAmount > 0 ? (
                    challenged ? (
                      <div className="text-black px-4 py-2 rounded text-xl font-bold mt-4 flex justify-center items-center" style={{ width: "433px" }}>
                        {'✅ CHALLENGED'}
                      </div>
                    ) : (
                      <button onClick={placeChallengeBet} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-xl font-bold mt-4" style={{ width: "433px" }}>
                        {'🔥 CHALLENGE BET'}
                      </button>
                    )
                  ) : (
                    <button disabled className="bg-gray-200 text-gray-400 px-4 py-2 rounded text-xl font-bold cursor-not-allowed mt-4" style={{ width: "433px" }}>
                      CHALLENGE BET
                    </button>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}