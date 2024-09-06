"use client";
import { ethers } from 'ethers';
import { useEffect, useState } from "react";
import fanToken from "../utils/fanToken.json";
// import betContract from "../utils/betContract.json"; 
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';

declare var window: any

const supabase = createClient('https://uzhrukpbosrdtqvzjbyu.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_KEY!);
const neynarClient = new NeynarAPIClient(process.env.NEXT_PUBLIC_NEYNAR_API_KEY!);

export default function Home() {
  const [userAddress, setUserAddress] = useState('');
  const [fanTokensAmount, setFanTokensAmount] = useState(0);
  const [betAmount, setBetAmount] = useState('');
  const [likesPrediction, setLikesPrediction] = useState('');
  const [oneDayLikes, setOneDayLikes] = useState(0);
  const [urlParams, setUrlParams] = useState<string[]>([]);
  const [image, setImage] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authorUsername, setAuthorUsername] = useState('');
  const [postText, setPostText] = useState('');
  const [betPlaced, setBetPlaced] = useState(false);

  async function fetchLikes(url: string) {
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

  useEffect(() => {
    const searchParams = window.location.search.substring(1); // Removes leading '?'
    const params = searchParams.split('?');
    setUrlParams(params);
    console.log("urlParams: ", params);

    const fetchCastLikes = async () => {
      console.log("urlParams[0]: ", urlParams[0]);
      // 0x00221a629cf888fb2ff5997fd4d25cd49272fc42
      if (urlParams[0]) {
        const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${urlParams[0]}&type=hash`;
        console.log("url: ", url);
        const res = await fetchLikes(url);
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

    fetchCastLikes();
  }, [image, displayName, authorUsername, postText, urlParams[0]]);

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
    if (userAddress) {
      getCHZBalance();
    }
  }, [userAddress]);

  async function createBet(castHash: string, bettorAddress: string, bettorUsername: string, initialLikes: number, betAmount: number) {
    const { data, error } = await supabase
      .from('bets')
      .insert([
        {
          cast_hash: castHash,
          bettor_address: bettorAddress,
          bettor_username: bettorUsername,
          likes_prediction: initialLikes,
          bet_amount: betAmount
        }
      ]);
    if (error) {
      console.error('Error inserting bet:', error);
    } else {
      console.log('Bet inserted!');
    }
  }

  async function update24hrLikes(castHash: string, likes: number) {
    const { data, error } = await supabase
      .from('bets')
      .update({ "one_day_likes": likes })
      .eq('cast_hash', castHash);

    if (error) {
      console.error('Error updating 24hr likes:', error);
    } else {
      console.log('24hr likes updated:', data);
    }
  }

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
    console.log(`@${urlParams[2]} is betting ${betAmount} ETH that @${authorUsername}'s cast will get more than ${likesPrediction} likes in 24 hrs.\n\nBet against them:`)
    // Use Neynar --> bot makes a cast with the custom frame
    // bettorUsername, castAuthorUsername from URL params
    if (!process.env.NEXT_PUBLIC_SIGNER_UUID) {
      throw new Error("Make sure you set SIGNER_UUID in your .env file");
    }
    let betPost = `@${urlParams[2]} is betting ${betAmount} ETH that @${authorUsername}'s cast will get more than ${likesPrediction} likes in 24 hrs.\n\nBet against them:`;
    const newBetCast = await neynarClient.publishCast(
      process.env.NEXT_PUBLIC_SIGNER_UUID!,
      betPost,
      {
        embeds: [{
          // THIS IS THE FRAME URL, NOT THE CHALLENGE PAGE URL
          // THE OG BETTOR ADDRESS (userAddress) WILL BE PASSED TO THE URL BUTTON THAT THE USER CLICKS SO IT CAN APPEAR AT TOP OF CHALLENGE PAGE BET URL
          url: `https://bangerbets.vercel.app/api/challenge/${urlParams[0]}/${likesPrediction}/${betAmount}/${userAddress}`
        }]
      }
    );

    // Bet data is published to Supabase
    createBet(urlParams[0], userAddress, urlParams[2], Number(likesPrediction), Number(betAmount))

    // setTimeout of 2 mins, then use Neynar to delete the cast
    // setTimeout(async () => {
    //   try {
    //     await neynarClient.deleteCast(process.env.NEXT_PUBLIC_SIGNER_UUID!, newBetCast.hash);
    //   } catch (error) {
    //     console.error('Error with deleteCast:', error);
    //   }
    // }, 2 * 60 * 1000);


    // After 24 hrs, use Neynar to check # of likes, and publish to Supabase. TO DO: use a cron job in the future
    // const options = {
    //   method: 'GET',
    //   headers: {
    //     accept: 'application/json',
    //     api_key: 'NEYNAR_API_DOCS'
    //   }
    // };
    // const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${urlParams[0]}&type=hash`;
    // setTimeout(() => {
    //   fetch(url, options)
    //     .then(res => res.json())
    //     .then(json => {
    //       setOneDayLikes(json.cast.reactions.likes_count);
    //     })
    //     .catch(err => console.error('error:' + err));
    // }, 120000);

    // After successful bet placement
    setBetPlaced(true);
  }

  // one_day_likes in Supabase is updated with response from Neynar API
  // useEffect(() => {
  //   update24hrLikes(urlParams[0], oneDayLikes)
  // }, [oneDayLikes]);

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

  const handleLikesPredictionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLikesPrediction(e.target.value);
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
            💥BANGER!💥
          </h1>
          <div className="flex w-full h-full">
            <div className="w-1/2 flex items-center justify-center">
              <div className="w-96 h-96 border-2 border-black p-4 pr-6 overflow-hidden">
                <div className="flex flex-col h-full">
                  <div className="flex items-start">
                    <Image
                      src={image || "https://pbs.twimg.com/profile_images/1546487688601096192/QoG0ZVgH_400x400.jpg"}
                      alt="Profile picture"
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div className="ml-4 flex-grow overflow-hidden">
                      <div className="flex items-center">
                        <span className="font-bold text-black mr-2 truncate">{displayName || "Farcaster"}</span>
                        <span className="text-gray-500 truncate">@{authorUsername || "farcaster"}</span>
                      </div>
                      <p className="mt-1 text-black whitespace-pre-wrap overflow-y-auto max-h-[calc(100%-2rem)]">{postText || "ok banger"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/2 flex flex-col justify-center items-start">
              <div className="flex items-center mb-4">
                <p className="text-black text-3xl mr-4 font-bold w-72">
                  Likes in 24 hrs:
                </p>
                <input
                  type="number"
                  min="0"
                  value={likesPrediction}
                  onChange={handleLikesPredictionChange}
                  className="border border-black px-4 py-2 w-32 text-2xl"
                  placeholder="0"
                  style={{ MozAppearance: 'textfield' }}
                />
              </div>
              <div className="flex items-center mb-4">
                <p className="text-black text-3xl mr-4 font-bold w-72">
                  Bet amount (ETH):
                </p>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={betAmount}
                  onChange={handleBetAmountChange}
                  className="border border-black px-4 py-2 w-32 text-2xl"
                  placeholder="0.00"
                  style={{ MozAppearance: 'textfield' }}
                />
              </div>
              <div className="pt-8">
                <p className={`text-lg font-bold italic ${fanTokensAmount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {fanTokensAmount > 0
                    ? `✅ ${fanTokensAmount} Fan Tokens in wallet`
                    : '❌ No Fan Tokens in wallet'
                  }
                </p>
                {betPlaced ? (
                  <p className="text-black text-center px-4 py-2 rounded text-xl font-bold mt-4" style={{ width: "433px" }}>
                    Bet placed!
                  </p>
                ) : (
                  fanTokensAmount > 0 ? (
                    <button onClick={placeBet} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-xl font-bold mt-4" style={{ width: "433px" }}>
                      🔥 BET
                    </button>
                  ) : (
                    <button disabled className="bg-gray-200 text-gray-400 px-4 py-2 rounded text-xl font-bold cursor-not-allowed mt-4" style={{ width: "433px" }}>
                      BET
                    </button>
                  )
                )}
              </div>
              {/* <button onClick={getCHZBalance}>Refresh Balance</button> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


// When I need to transfer Fan Tokens locally:
// const transfer = async (amount: number) => {
//   const { ethereum } = window;
//   const id = "0x15b32";
//   let chainId = await ethereum.request({ method: 'eth_chainId' });
//   if (chainId !== id) {
//     alert("You are not connected to CHZ testnet!");
//     return;
//   }
//   try {
//     await window.ethereum.request({ method: 'eth_requestAccounts' });
//     const provider = new ethers.BrowserProvider(window.ethereum);
//     const signer = await provider.getSigner();
//     const chzTokenAddress = "0xb861d6d79123ADa308E5F4030F458b402E2D131A";
//     const chzTokenContract = new ethers.Contract(chzTokenAddress, fanToken.abi, signer);
//     const success = await chzTokenContract.transfer("0x41eA9F2133Cc54623e7105d39623C484c4240173", ethers.parseUnits("100", 2));
//     console.log("Transfer result: ", success);
//   } catch (error) {
//     console.error("Error transferring: ", error);
//   }
// }
{/* <button onClick={() => transfer(100)}>transfer</button> */ }