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
       <p className=" text-white text-7xl font-bold px-24">
        SYNCIAL
       </p>
       </div>

    </div>
    
    </>
)
}