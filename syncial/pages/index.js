import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import logo from '@/public/logo.jpg';

export default function LandingPage() {
  useEffect(() => {
    document.title = "Syncial - SocialFi x Prediction Platform";
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="relative flex justify-between md:justify-between items-center px-8 md:px-24 py-6 bg-black">
        {/* Centered Logo on Mobile */}
        <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:translate-x-0">
          <Link href='/'>
          <Image
  src={logo}
  alt="Syncial Logo"
  className="w-32 h-auto md:w-[230px] md:h-auto"
/>
          </Link>
        </div>

        {/* Spacer to align logo on desktop */}
        <div className="md:flex-1 hidden md:block"></div>

        {/* Launch App Button - hidden on mobile */}
        <div className="hidden md:block space-x-6 text-md">
          <Link href="https://app.syncial.xyz" className="hover:text-rose-400 hover:outline-2 transition outline-1 outline-rose-400 rounded-md px-4 py-2 text-rose-300 font-semibold">Launch App</Link>
        </div>
      </nav>

      {/* HERO SECTION WITH BACKGROUND IMAGE */}
      <section
        className="relative w-full bg-no-repeat bg-contain flex flex-col md:flex-row items-center justify-between md:px-24 py-24"
        style={{
          backgroundImage: `url('/webpage.JPEG')`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-0" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl mx-12"
        >
          <h2 className="text-5xl md:text-6xl font-bold leading-tight text-white font-sans">Socialize and Predict</h2>
          <p className="mt-6 text-lg text-rose-100">
            Create prediction polls alongside traditional posting, predict the future outcomes correctly and earn.
            Your Predictions, Our rewards.
          </p>
          <div className="mt-8">
            <Link
              href="https://app.syncial.xyz"
              className="inline-block px-8 py-4 bg-[#ED3968] hover:bg-rose-400 rounded-2xl text-lg font-semibold transition"
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
          <img src="/asset1.png" className="w-full md:w-[560px] transform rotate-8 px-12 width: auto" />
          <div className="py-24"></div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-8 md:px-24 py-20 ">
        <h2 className="text-5xl font-bold text-center mb-16 text-[#ED3968]">Features</h2>
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
              className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition text-white text-center outline- outline-rose-400 "
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

      <div className="my-16"></div>
    </div>
  );
}
