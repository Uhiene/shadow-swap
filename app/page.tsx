'use client';

import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { Lock } from 'lucide-react';
import GlowButton from '@/components/GlowButton';
import { SHADOW_SWAP_OTC_ABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Hidden Order Sizes',
    description: 'Your trade amounts are encrypted on-chain using iExec Nox confidential tokens. Nobody — not even validators — can see how much you\'re trading.',
    color: 'var(--purple-glow)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'MEV Protection',
    description: 'Front-running is impossible when bots can\'t read your order size. ShadowSwap saves you from the $900M+ lost annually to MEV extraction.',
    color: 'var(--cyan-accent)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    title: 'Zero Slippage OTC',
    description: 'Direct peer-to-peer settlement at a fixed agreed price. No AMM pools, no price impact, no slippage — just clean OTC execution.',
    color: 'var(--magenta-crystal)',
  },
];

function OfferCountStat() {
  const { data: count } = useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'getOfferCount',
  });

  return <>{count !== undefined ? count.toString() : '—'}</>;
}

export default function HomePage() {
  const { isConnected } = useAccount();

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="text-center mb-28">
        <div className="fade-in fade-in-1 inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full glass text-sm">
          <span className="hidden-badge px-2 py-0.5 rounded-full text-white text-[10px] font-semibold tracking-widest">
            LIVE
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Arbitrum Sepolia · Powered by iExec Nox
          </span>
        </div>

        <h1 className="fade-in fade-in-2 text-6xl md:text-8xl font-bold mb-6 leading-none tracking-tight">
          <span style={{ color: 'var(--text-primary)' }}>Shadow</span>
          <span
            style={{
              background: 'var(--gradient-crystal)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Swap
          </span>
        </h1>

        <p
          className="fade-in fade-in-3 text-2xl md:text-3xl font-light mb-4"
          style={{ color: 'var(--purple-glow)' }}
        >
          Trade Large. Stay Hidden.
        </p>

        <p
          className="fade-in fade-in-4 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          The first confidential OTC desk for crypto whales. Encrypted order sizes.
          Zero MEV exposure. Peer-to-peer settlement on Arbitrum.
        </p>

        <div className="fade-in fade-in-5 flex flex-col sm:flex-row items-center justify-center gap-4">
          <GlowButton href="/marketplace" size="lg">Browse Offers</GlowButton>
          <GlowButton href="/create" size="lg" variant="outline">Create Offer</GlowButton>
        </div>
      </section>

      {/* Stats */}
      <section className="fade-in fade-in-5 grid grid-cols-2 md:grid-cols-4 gap-4 mb-28">
        {[
          { label: 'Active Offers', value: <OfferCountStat /> },
          { label: 'MEV Protected', value: '100%' },
          { label: 'Hidden Volume', value: <Lock size={22} /> },
          { label: 'Network', value: 'Arb Sepolia' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-2xl p-5 text-center transition-all duration-300 hover:bg-(--bg-elevated)"
          >
            <div
              className="flex items-center justify-center text-2xl md:text-3xl font-bold mb-1 min-h-[36px]"
              style={{ color: 'var(--purple-glow)', fontFamily: 'var(--font-mono), monospace' }}
            >
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="mb-28">
        <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--text-primary)' }}>
          Built for Whales
        </h2>
        <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Every feature is designed to protect large trades from extraction.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-7 transition-all duration-300 hover:bg-(--bg-elevated) group"
            >
              <div
                className="mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-28">
        <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--text-primary)' }}>
          How It Works
        </h2>
        <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Three steps. Zero exposure.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Wrap Tokens',
              desc: 'Convert standard ERC-20 tokens into confidential ERC-7984 tokens. Your balance becomes encrypted on-chain.',
              color: 'var(--purple-bright)',
            },
            {
              step: '02',
              title: 'Create or Take Offer',
              desc: 'Post a sell offer — buyers see the price but never the size. Or browse offers and trade confidentially.',
              color: 'var(--magenta-crystal)',
            },
            {
              step: '03',
              title: 'Settle & Unwrap',
              desc: 'The trade settles on-chain. Unwrap your confidential tokens back to standard ERC-20 anytime.',
              color: 'var(--cyan-accent)',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="gradient-border p-7 rounded-2xl transition-all duration-300 group"
            >
              <div
                className="text-5xl font-bold mb-4 opacity-25 group-hover:opacity-50 transition-opacity"
                style={{ color: item.color, fontFamily: 'var(--font-mono), monospace' }}
              >
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="rounded-3xl p-10 md:p-16 text-center gradient-border"
        style={{ background: 'rgba(26, 10, 62, 0.8)' }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Ready to Trade in the Shadows?
        </h2>
        <p className="max-w-lg mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
          Connect your wallet, grab testnet tokens from the dashboard, and experience
          confidential OTC trading firsthand.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isConnected ? (
            <>
              <GlowButton href="/dashboard" size="lg">Go to Dashboard</GlowButton>
              <GlowButton href="/marketplace" size="lg" variant="outline">View Offers</GlowButton>
            </>
          ) : (
            <GlowButton href="/dashboard" size="lg">Connect &amp; Get Started</GlowButton>
          )}
        </div>
      </section>
    </div>
  );
}
