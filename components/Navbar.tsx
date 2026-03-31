"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { classNames } from "@/lib/utils";
import logo from "@/public/logo.png";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/create", label: "Create Offer" },
  { href: "/dashboard", label: "Dashboard" },
];

function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="hidden md:block px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--purple-glow)",
            fontFamily: "var(--font-mono), monospace",
            border: "1px solid rgba(167,139,250,0.2)",
          }}
        >
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
          style={{
            background: "rgba(236,72,153,0.15)",
            color: "var(--pink-hot)",
            border: "1px solid rgba(236,72,153,0.3)",
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  const injectedConnector = connectors.find((c) => c.type === "injected");

  return (
    <button
      onClick={() =>
        injectedConnector && connect({ connector: injectedConnector })
      }
      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: "var(--gradient-button)",
        color: "#fff",
        boxShadow: "var(--glow-purple)",
      }}
    >
      Connect Wallet
    </button>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 glass"
      style={{ borderBottom: "1px solid rgba(167, 139, 250, 0.12)" }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <img src="/logo.png" alt="ShadowSwap" className="w-16 h-16" />

          <span
            className="text-xl font-bold tracking-wide"
            style={{
              background: "var(--gradient-crystal)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ShadowSwap
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  isActive
                    ? "text-(--purple-glow) bg-(--bg-elevated)"
                    : "text-(--text-secondary)hover:text-[var(--text-primary)] hover:bg-(--bg-elevated)",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="p-2 rounded-lg text-xs hover:bg-(--bg-elevated) transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              {link.label === "Marketplace" && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              )}
            </Link>
          ))}
        </div>

        <ConnectButton />
      </nav>
    </header>
  );
}
