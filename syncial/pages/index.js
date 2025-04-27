import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  useEffect(() => {
    document.title = "Syncial - SocialFi Prediction Platform";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 md:px-24 py-6 bg-transparent">
        <h1 className="text-3xl font-extrabold tracking-tight">Syncial</h1>
        <div className="space-x-6 text-lg">
          <Link href="#features" className="hover:text-blue-400 transition">Features</Link>
          <Link href="#how-it-works" className="hover:text-blue-400 transition">How It Works</Link>
          <Link href="#start" className="hover:text-blue-400 transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-24 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">Shape the Future with Your Voice</h2>
          <p className="mt-6 text-lg text-gray-300">
            Syncial lets you create prediction polls alongside social posts, stake outcomes, and earn — all secured by blockchain transparency.
          </p>
          <div className="mt-8">
            <Link href="#start" className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-semibold transition">
              Start Predicting
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 md:mt-0"
        >
          <img src="/hero-image.svg" alt="Hero" className="w-full md:w-[500px]" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-8 md:px-24 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Create Prediction Polls", description: "Post polls about future events and allow users to stake on outcomes.", image: "/feature-poll.svg" },
            { title: "Earn Rewards", description: "Poll creators earn a portion of the total stake, rewarding engagement and accuracy.", image: "/feature-earn.svg" },
            { title: "On-Chain Settlement", description: "Transparent and secure bet settlements powered by decentralized oracles.", image: "/feature-onchain.svg" },
          ].map((feature, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-[#1e293b] p-8 rounded-2xl shadow-lg hover:shadow-2xl transition"
            >
              <img src={feature.image} alt={feature.title} className="w-20 h-20 mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold text-center mb-4">{feature.title}</h3>
              <p className="text-gray-400 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-8 md:px-24 py-20 bg-[#0f172a]">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="max-w-4xl mx-auto text-gray-300 text-lg leading-8">
          <p className="mb-6">Syncial combines social media and decentralized prediction markets. Users can create posts or add prediction polls tied to real-world events.</p>
          <p className="mb-6">Participants stake crypto on poll outcomes. A share of the stakes goes to poll creators, encouraging high-quality and engaging questions.</p>
          <p>Results are determined using decentralized oracles, ensuring trustless settlement. A small fee is allocated to platform development to keep growing the ecosystem sustainably.</p>
        </div>
      </section>

      {/* Call to Action */}
      <section id="start" className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <h2 className="text-4xl font-bold mb-6">Ready to Shape the Future?</h2>
        <Link href="#" className="px-10 py-5 bg-black hover:bg-gray-800 rounded-full text-lg font-semibold transition">
          Get Started Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-10">
        © {new Date().getFullYear()} Syncial. All rights reserved.
      </footer>
    </div>
  );
}
