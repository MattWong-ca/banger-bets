"use client";
import { ethers } from 'ethers';
import { useEffect, useState } from "react";
import fanToken from "../../utils/fanToken.json";
// import betContract from "../../utils/betContract.json"; 
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

declare var window: any

const supabase = createClient('https://uzhrukpbosrdtqvzjbyu.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_KEY!);

export default function Home() {
    const [userAddress, setUserAddress] = useState('');
    const [userBets, setUserBets] = useState<any>([]);
    const [userBetsWithAdditionalInfo, setBetsWithAdditionalInfo] = useState<any>([]);
    const [won, setWon] = useState(false);

    useEffect(() => {
        connectWallet();
        if (userAddress) {
            getBetsByUser(userAddress);
        }
    }, [userAddress]);

    useEffect(() => {
        const fetchAdditionalInfo = async () => {
            const updatedBets = await Promise.all(
                userBets.map(async (bet: any) => {
                    if (bet.cast_hash) {
                        const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${bet.cast_hash}&type=hash`;
                        const res = await fetchCast(url);
                        return { ...bet, ...res };
                    }
                    return bet;
                })
            );
            setBetsWithAdditionalInfo(updatedBets);
        };
        if (userBets.length > 0) {
            fetchAdditionalInfo();
        }
    }, [userBets]);

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

    async function getBetsByUser(bettorAddress: string) {
        const { data, error } = await supabase
            .from('bets')
            .select('*')
            .eq('bettor_address', bettorAddress);

        if (error) {
            console.error('Error fetching bets:', error);
        } else {
            console.log('Bets retrieved:', data);
            setUserBets(data);
        }
    }

    // const g = () => {
    //     console.log(userBets[0])
    //     console.log("More info: ", userBetsWithAdditionalInfo)
    // }

    async function getLikesByCastHash(castHash: string) {
        const { data, error } = await supabase
            .from('bets')
            .select('likes_prediction, one_day_likes')
            .eq('cast_hash', castHash);

        if (error) {
            console.error('Error fetching likes:', error);
            return null;
        } else {
            console.log('Likes retrieved:', data[0]);
            if (data[0].one_day_likes > data[0].likes_prediction) {
                setWon(true);
            }
        }
    }

    // async function claimWinnings(ogBettorAddress: string) {
    //     try {
    //         if (window.ethereum) {
    //             await window.ethereum.request({ method: "eth_requestAccounts" });
    //             const provider = new ethers.BrowserProvider(window.ethereum);
    //             const signer = await provider.getSigner();

    //             const contract = new ethers.Contract(contractAddress, betContract.abi, signer);

    //             const tx = await contract.withdraw(ogBettorAddress);

    //             console.log("Transaction sent:", tx);

    //             const receipt = await tx.wait();
    //             console.log("Transaction mined:", receipt);

    //         } else {
    //             console.error("Ethereum provider not found. Install MetaMask!");
    //         }
    //     } catch (error) {
    //         console.error("Error withdrawing bet:", error);
    //     }
    // }

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
            <div className="flex justify-center px-4">
                <h1 className=" text-white text-7xl font-bold italic">
                    My Bets
                </h1>
            </div>
            {userBetsWithAdditionalInfo.map((bet: any, index: number) => (
                <div key={index} className="w-4/5 bg-white rounded p-4 my-8 justify-center mx-auto">
                    <div className="w-full flex">
                        <div className="w-1/5 text-center">
                            <div>
                                <span className="font-bold">Cast:</span>
                                <div className="text-4xl">
                                    <a href={`https://warpcast.com/${bet.cast.author.username}/${bet.cast_hash}`} target="_blank" className="text-blue-500">
                                        {`${bet.cast_hash.slice(0, 4)}...${bet.cast_hash.slice(-2)}`}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="w-1/5 text-center">
                            <div>
                                <span className="font-bold">Cast Author:</span>
                                <div className="text-4xl">{`${bet.cast.author.username.length > 8 ? bet.cast.author.username.slice(0, 8) + '...' : bet.cast.author.username}`}</div>
                            </div>
                        </div>
                        <div className="w-1/5 text-center">
                            <div>
                                <span className="font-bold">Predicted Likes:</span>
                                <div className="text-4xl">{bet.likes_prediction}</div>
                            </div>
                        </div>
                        <div className="w-1/5 text-center">
                            <div>
                                <span className="font-bold">Bet Amount:</span>
                                <div className="text-4xl">{bet.bet_amount}</div>
                            </div>
                        </div>
                        <div className="w-1/5 text-center">
                            <div>
                                <span className="font-bold">Against:</span>
                                <div className="text-4xl">{bet.challenger_username}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center items-center h-full flex-col">
                        <div className="flex justify-center mt-4 items-center">Check status: </div>
                        {
                            won ? (
                                <div className="flex">
                                    <div className="text-2xl">🎉 You Won!</div>
                                    <button /* onClick={claimWinnings(userAddress)} */ className="ml-2 text-xl bg-black rounded text-white w-24">Claim</button>
                                </div>
                            ) : (<button onClick={() => getLikesByCastHash(bet.cast_hash)} className="bg-black rounded text-white w-24">Check 👀</button>)
                        }
                        {/* <button onClick={() => getLikesByCastHash(bet.cast_hash)} className="bg-black rounded text-white w-24">Check 👀</button> */}
                    </div>
                </div>
            ))}
        </main>
    );
}