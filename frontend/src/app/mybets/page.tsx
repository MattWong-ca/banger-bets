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
    const [image, setImage] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [authorUsername, setAuthorUsername] = useState('');
    const [postText, setPostText] = useState('');
    const [userBets, setUserBets] = useState<any>([]);

    useEffect(() => {
        connectWallet();
        if (userAddress) {
            getBetsByUser(userAddress);
        }
    }, [userAddress]);

    useEffect(() => {
        const fetchCastInfo = async () => {
            // 0x00221a629cf888fb2ff5997fd4d25cd49272fc42
            const url = `https://api.neynar.com/v2/farcaster/cast?identifier=HASH&type=hash`;
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
        };
        fetchCastInfo();
    }, [image, displayName, authorUsername, postText]);

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
            // console.log('Bets retrieved:', data);
            setUserBets(data);
            // return data;
        }
    }
    const g = () => {
        console.log(userBets[0])
    }

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
            {userBets.map((bet: any, index: number) => (
                <div key={index} className="bg-white rounded p-4 my-8">
                    <div>
                        <span className="font-bold">Cast:</span> <a href={`#`} className="text-blue-500">{bet.cast_hash}</a>
                    </div>
                    <div>
                        <span className="font-bold">Predicted Likes:</span> {bet.likes_prediction}
                    </div>
                    <div>
                        <span className="font-bold">Bet Amount:</span> {bet.bet_amount}
                    </div>
                    <div>
                        <span className="font-bold">Against:</span> {bet.challenger_username}
                    </div>
                </div>
            ))}
        </main>
    );
}