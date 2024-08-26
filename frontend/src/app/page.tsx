import Image from "next/image";

export default function Home() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      <nav className="flex justify-between items-center p-4 text-white">
        <div className="space-x-4">
          <a href="#" className="hover:underline">My Bets</a>
          <a href="#" className="hover:underline">Leaderboard</a>
        </div>
        <button className="bg-white text-black px-4 py-2 rounded">Connect Wallet</button>
      </nav>
      
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="relative bg-white rounded-lg w-[80vw] max-w-[1920px] h-[50vh] flex items-center justify-center">
          <h1 className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-white text-4xl font-bold italic">
            Bet Viral
          </h1>
          {/* Add content for the white rectangle here */}
        </div>
      </div>
    </main>
  );
}