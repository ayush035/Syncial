import { FaTelegram, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { LuMail } from "react-icons/lu";
import { FiGithub } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-[#09090B] text-zinc-500 py-6 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span>© {new Date().getFullYear()} Syncial • Arc Mainnet</span>
        </div>

        <div className="flex items-center space-x-4 text-zinc-400">
          <a
            href="https://x.com/syncialxyz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ED3968] transition"
            aria-label="X Twitter"
          >
            <FaXTwitter size={15} />
          </a>
          <a
            href="https://t.me/syncial"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ED3968] transition"
            aria-label="Telegram"
          >
            <FaTelegram size={15} />
          </a>
          <a
            href="mailto:hey.syncial@gmail.com"
            className="hover:text-[#ED3968] transition"
            aria-label="Email"
          >
            <LuMail size={15} />
          </a>
          <a
            href="https://www.linkedin.com/company/syncial"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ED3968] transition"
            aria-label="LinkedIn"
          >
            <FaLinkedinIn size={15} />
          </a>
          <a
            href="https://github.com/Syncial"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ED3968] transition"
            aria-label="GitHub"
          >
            <FiGithub size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
