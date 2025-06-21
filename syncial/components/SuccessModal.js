import { motion } from 'framer-motion';

export default function SuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black text-white rounded-2xl p-6 md:p-10 w-full max-w-lg shadow-xl text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-rose-100 mb-4">Congratulations 🎉</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-[#ED3968] mb-4">You're added to the whitelist!</h2>
        <p className="text-base md:text-lg text-rose-100 mb-6">
          You'll be able to access the app once it's live. <br /> Till then, keep an eye on our socials!
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-[#ED3968] hover:bg-rose-500 rounded-full text-white font-semibold transition"
        >
          x
        </button>
      </motion.div>
    </div>
  );
}
