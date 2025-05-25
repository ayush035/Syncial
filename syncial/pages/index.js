import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  useEffect(() => {
    document.title = "Syncial - SocialFi Prediction Platform";
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 md:px-24 py-6 bg-black">
        <h1 className="text-3xl font-extrabold tracking-tight">Syncial</h1>
        <div className="space-x-6 text-md">
          {/* <Link href="#features" className="hover:text-blue-400 transition">Features</Link>
          <Link href="#how-it-works" className="hover:text-blue-400 transition">How It Works</Link> */}
          <Link href="#start" className="hover:text-rose-400 hover:outline-2 transition outline-1 outline-rose-400 rounded-md px-4 py-2 text-rose-300 font-semibold">Launch App</Link>
        </div>
      </nav>

      {/* HERO SECTION WITH BACKGROUND IMAGE */}
      <section
        className="relative w-full bg-no-repeat  bg-contain flex flex-col md:flex-row items-center justify-between md:px-24 py-24"
        style={{
          backgroundImage: `url('/webpage.jpeg')`,
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
          <h2 className="text-5xl md:text-6xl font-bold leading-tight text-white font-sans">Polls With Purpose</h2>
          <p className="mt-6 text-lg text-gray-300">
            Create prediction polls alongside traditional posting, predict the future outcomes correctly and earn.
            Your Predictions, Our rewards.
          </p>
          <div className="mt-8">
            <Link
              href="#start"
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
      <hr className="bg-rose-400 border-0" style={{ height: '0.5px' }} />    
      
        {/* FEATURES */}
      <section id="features" className="px-8 md:px-24 py-20 ">
        <h2 className="text-4xl font-bold text-center mb-16">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: "Create Prediction Polls",
              description: "Post polls about future events and allow users to stake on outcomes.",
              image: "/feature-poll.svg",
            },
            {
              title: "Earn Rewards",
              description: "Poll creators earn a portion of the total stake, rewarding engagement and accuracy.",
              image: "/feature-earn.svg",
            },
            {
              title: "On-Chain Settlement",
              description: "Transparent and secure bet settlements powered by decentralized oracles.",
              image: "/feature-onchain.svg",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className=" p-8 rounded-2xl shadow-lg hover:shadow-2xl transition"
            >
              <img src={feature.image} alt={feature.title} className="w-20 h-20 mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold text-center mb-4">{feature.title}</h3>
              <p className="text-gray-400 text-center">{feature.description}</p>
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
        © {new Date().getFullYear()} Syncial.co All rights reserved.
      </footer>
    </div>
  );
}
