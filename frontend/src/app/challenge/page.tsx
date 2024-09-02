"use client";
import React, { useEffect, useState } from 'react';

export default function ChallengePage() {
  const [urlParams, setUrlParams] = useState<string[]>([]);

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
      }
    };

    fetchCastLikes();
  }, []);
  return (
    <div>
      <h1>{urlParams[0]}</h1>
      <h1>{urlParams[1]}</h1>
      <h1>{urlParams[2]}</h1>
      <h1>{urlParams[3]}</h1>
      {/* Add your challenge page content here */}
    </div>
  );
}