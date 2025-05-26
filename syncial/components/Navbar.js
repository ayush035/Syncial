import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';
// import  '@/styles/Home.module.css'
import Image from "next/image";

export default function Navbar() {

    return (
        


<div className="min-h-screen text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 md:px-24 py-6 bg-black">
      <Link href='/'>
      <Image
                    src = {logo}
                    alt=''
                 width="230"
                 height="230"/></Link>
        <div className="space-x-6 text-md">
          {/* <Link href="#features" className="hover:text-blue-400 transition">Features</Link>
          <Link href="#how-it-works" className="hover:text-blue-400 transition">How It Works</Link> */}
          {/* <Link href="#start" className="hover:text-rose-400 hover:outline-2 transition outline-1 outline-rose-400 rounded-md px-4 py-2 text-rose-300 font-semibold">Launch App</Link> */}
        <ConnectButton/>
             </div>
      </nav>
      </div>

      );
      
      }