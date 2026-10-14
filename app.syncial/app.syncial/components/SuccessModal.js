import Link from 'next/link';
import { X, Check } from 'lucide-react';

export default function SuccessModal({ onClose, username }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="clean-card p-6 max-w-sm w-full mx-auto shadow-xl text-center space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-zinc-500 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <Check className="w-5 h-5" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-white">
            Username Registered
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            <span className="text-[#ED3968] font-semibold">@{username}</span> is now linked to your address on Arc Mainnet.
          </p>
        </div>

        <div className="pt-1">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="w-full py-2.5 px-4 btn-primary text-xs flex items-center justify-center"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}