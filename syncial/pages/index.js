import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import logo from '@/public/logo.jpg'

export default function LandingPage() {
  useEffect(() => {
    document.title = "Syncial - SocialFi x Prediction Platform";
  }, []);

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
          <Link href="/onboard" className="hover:text-rose-400 hover:outline-2 transition outline-1 outline-rose-400 rounded-md px-4 py-2 text-rose-300 font-semibold">Launch App</Link>
        </div>
      </nav>

      {/* HERO SECTION WITH BACKGROUND IMAGE */}
      <section
        className="relative w-full bg-no-repeat  bg-contain flex flex-col md:flex-row items-center justify-between md:px-24 py-24"
        style={{
          backgroundImage: `url('/webpage.JPEG')`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Optional dark overlay */}
        <div className="absolute inset-0 bg-black/60 z-0" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl"
        >
          <h2 className="text-5xl md:text-6xl font-bold leading-tight text-white font-sans">Socialize and Predict</h2>
          <p className="mt-6 text-lg text-gray-300">
            Create prediction polls alongside traditional posting, predict the future outcomes correctly and earn.
            Your Predictions, Our rewards.
          </p>
          <div className="mt-8">
            <Link
              href="/onboard"
              className="inline-block px-8 py-4 bg-rose-500 hover:bg-rose-400 rounded-2xl text-lg font-semibold transition"
            >
              Start Predicting
            </Link>
            <div className="py-24"></div>
            
          </div>
          
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 mt-12 md:mt-0"
        >
          <img src="/asset1.png" className="w-full md:w-[500px] transform rotate-8 px-12" />
          <div className="py-24"></div>
        </motion.div>
      </section>
      {/* <hr className="bg-rose-400 border-0" style={{ height: '0.5px' }} />     */}
      
        {/* FEATURES */}
      <section id="features" className="px-8 md:px-24 py-20 ">
        <h2 className="text-5xl font-bold text-center mb-16 text-rose-500">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {[
            {
              title: "Create Prediction Polls",
              description: "Post polls about future events and allow users to stake on outcomes.",
              image: "/asset2.png",
            },
            {
              title: "Earn Rewards",
              description: "Poll creators earn a portion of the total stake, rewarding engagement and accuracy.",
              image: "/asset3.png",
            },
            {
              title: "Instant Settlement",
              description: "Transparent and secure bet settlements onchain powered by decentralized oracles.",
              image: "/asset5.png",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition text-white text-center outline- outline-rose-400"
            >
              <img
                src={feature.image}
                alt={feature.title}
                className={`mx-auto mb-6 ${
                  feature.image === "/asset3.png","/asset2.png", "/asset3.png"
                    ? "w-60 h-60 object-contain"
                    : "w-20 h-20 object-contain"
                }`}
              />
          
              <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
          
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-8 md:px-24 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="max-w-4xl mx-auto text-gray-300 text-lg leading-8">
          <p className="mb-6">Syncial combines social media and decentralized prediction markets. Users can create posts or add prediction polls tied to real-world events.</p>
          <p className="mb-6">Participants stake crypto on poll outcomes. A share of the stakes goes to poll creators, encouraging high-quality and engaging questions.</p>
          <p>Results are determined using decentralized oracles, ensuring trustless settlement. A small fee is allocated to platform development to keep growing the ecosystem sustainably.</p>
        </div>
      </section>

      {/* CTA */}
      {/* <section id="start" className="flex flex-col items-center justify-center py-20 text-white">
        <h2 className="text-4xl font-bold mb-6">Ready to Shape the Future?</h2>
        <Link href="#" className="px-10 py-5 bg-black hover:bg-gray-800 rounded-full text-lg font-semibold transition">
          Get Started Now
        </Link>
      </section> */}

      {/* FOOTER */}
      <footer className="text-center text-gray-400 text-sm py-10 ">
        © {new Date().getFullYear()} Syncial.xyz All rights reserved.
      </footer>
    </div>
  );
}
