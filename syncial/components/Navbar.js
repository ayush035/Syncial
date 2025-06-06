import Link from "next/link";
import { ConnectButton } from '@rainbow-me/rainbowkit';
// import  '@/styles/Home.module.css'
import Image from "next/image";
import logo from '@/public/logo.jpg'
import { Search } from "lucide-react";
import { Input } from "postcss";
export default function Navbar() {

    return (
        


<div className=" text-white flex flex-col">
    
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 md:px-24 py-6 bg-black">
      <div className="flex">
      <Link href='/'>
     < Image
                    src = {logo}
                    alt=''
                 width="230"
                 height="230"/></Link>
                   <div className="flex items-center bg-[#16030d] rounded-xl w-60 my-2 mx-6 px-2 h-11 outline outline-1 outline-[#39071f]">
      <Search className="text-[#563e4b] w-5 h-5 mr-2" />
      <input
        className="text-rose-100 bg-[#16030d] text-lg w-60 h-full outline-none "
        placeholder="Search"
      />
    </div>
                 
                     {/* <input className="rounded-xl text-rose-100  py-2 px-4 bg-[#16030d] w-60 h-11 text-lg outline-1 outline-[#39071f] my-4 mx-6" placeholder=" 🔍  Search"/> */}
                     </div>
        <div className="space-x-6 text-md flex ">
          {/* <Link href="#features" className="hover:text-blue-400 transition">Features</Link>
          <Link href="#how-it-works" className="hover:text-blue-400 transition">How It Works</Link> */}
          {/* <Link href="#start" className="hover:text-rose-400 hover:outline-2 transition outline-1 outline-rose-400 rounded-md px-4 py-2 text-rose-300 font-semibold">Launch App</Link> */}
        <ConnectButton/>
             </div>
      </nav>
      </div>

      );
      
      } 