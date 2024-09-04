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
                <div key={index} className="w-4/5 bg-white rounded p-4 my-8 flex justify-center mx-auto">
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
            ))}
        </main>
    );
}