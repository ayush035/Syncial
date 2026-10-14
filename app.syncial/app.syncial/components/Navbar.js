import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/public/logo.jpg";
import SearchFollowUser from "./SearchFollowUser";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navLinks = [
    { href: "/predict", label: "Predict" },
    { href: "/discover", label: "Discover" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  const isActive = (path) => router.pathname === path;

  return (
    <header className="border-b border-[#27272A] bg-[#09090B]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Left: Brand + Chain Indicator */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/" className="flex items-center">
              <Image
                src={logo}
                alt="Syncial Logo"
                className="w-24 sm:w-28 h-auto rounded"
                priority
              />
            </Link>

            {/* Single quiet Arc indicator */}
            <span className="inline-flex items-center text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ED3968] mr-1.5 animate-pulse" />
              Arc Mainnet
            </span>
          </div>

          {/* Center: Clean Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "text-[#ED3968] bg-[#ED3968]/10 border border-[#ED3968]/25"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search & Connect Wallet */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:block">
              <SearchFollowUser />
            </div>

            <div className="hidden sm:block">
              <ConnectButton
                showBalance={false}
                chainStatus="none"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'avatar',
                }}
              />
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#09090B] px-4 py-4 space-y-3">
          <div className="mb-2">
            <SearchFollowUser />
          </div>

          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(link.href)
                    ? "bg-[#ED3968]/10 text-[#ED3968] border border-[#ED3968]/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800 flex justify-center">
            <ConnectButton showBalance={false} chainStatus="none" />
          </div>
        </div>
      )}
    </header>
  );
}