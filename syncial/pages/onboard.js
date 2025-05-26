import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
export default function LandingPage() {
return(

    <>
    
<Navbar/>

    <div className="flex justify-center items-center py-26">
       <div>
       
       <div className=" text-white text-7xl font-bold">
        WELCOME TO 
       </div>
       
       <p className=" text-[#ED3968] text-7xl font-bold px-22">
        SYNCIAL
       </p>
       
       <div className="text-rose-100 text-md px-14  my-2">
        Enter your preffered Username to create an account
    </div>
<div  className="flex justify-center py-4">
    <input className="rounded-xl text-rose-100 px-4 py-2 bg-[#39071f] w-120 h-13 text-lg" placeholder="Username"/>
</div>
<div className=" text-rose-100 text-md my- mx-24">
By signing up, you are agreeing to Syncial's 
</div>
<p className="px-38 text-[#ED3968]"> Terms and Privacy Policy</p>
<div className="flex justify-center py-4">
<button className="inline-block  bg-[#ED3968] hover:bg-rose-400 rounded-2xl text-lg font-semibold transition w-120 h-13 cursor-pointer">
Sign Up
</button>
</div>
       </div>
    </div>
    
    </>
)
}