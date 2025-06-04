import { FaTwitter, FaTelegram, FaEnvelope, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-white py-6 border-t border-rose-500">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-rose-100 mb-2 md:mb-0 text-center md:text-left">
          © {new Date().getFullYear()} Syncial. All rights reserved.
        </p>

        <div className="flex space-x-6">
          <a href="https://twitter.com/syncialxyz" target="_blank" rel="noopener noreferrer" className="hover:text-[#ED3968] transition">
            <FaTwitter size={20} />
          </a>
          <a href="https://t.me/syncial" target="_blank" rel="noopener noreferrer" className="hover:text-[#ED3968] transition">
            <FaTelegram size={20} />
          </a>
          <a href="mailto:hello@syncial.xyz" className="hover:text-[#ED3968] transition">
            <FaEnvelope size={20} />
          </a>
          <a href="https://www.linkedin.com/company/syncial" target="_blank" rel="noopener noreferrer" className="hover:text-[#ED3968] transition">
            <FaLinkedin size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
