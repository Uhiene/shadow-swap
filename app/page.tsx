'use client';

import Link from 'next/link';
import GlowButton from '@/components/GlowButton';

const stats = [
  { label: 'MEV Losses Prevented', value: '$0', suffix: ' (testnet)' },
  { label: 'Confidential Trades', value: '0' },
  { label: 'Hidden Volume', value: '🔒', suffix: ' Always' },
  { label: 'Network', value: 'Arbitrum', suffix: ' Sepolia' },
];

const features = [
  {
    icon: '🔒',
    title: 'Hidden Order Sizes',
    description: 'Your trade amounts are encrypted using iExec Nox confidential tokens. MEV bots see nothing — not even the size of your trade.',
  },
  {
    icon: '⚡',
    title: 'Instant Settlement',
    description: 'OTC trades settle on-chain on Arbitrum Sepolia in seconds. No order books, no matching engines — just direct peer-to-peer.',
  },
  {
    icon: '🛡️',
    title: 'MEV-Proof by Design',
    description: "Front-running is impossible when nobody knows how much you're trading. Confidential execution at the smart contract level.",
  },
  {
    icon: '💎',
    title: 'Reputation System',
    description: 'Build your OTC reputation on-chain. Every completed trade increments your trade count — verifiable, immutable, trustless.',
  },
  {
    icon: '🔄',
    title: 'Wrap & Unwrap Anytime',
    description: 'Move between standard ERC-20 and confidential ERC-7984 tokens freely. Your assets, your control.',
  },
  {
    icon: '🌐',
    title: 'Fully Decentralized',
    description: 'No intermediaries. No custodians. No KYC. Connect your wallet, wrap your tokens, and trade.',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="text-center mb-24">
        <div className="fade-in fade-in-1 inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full glass text-sm">
          <span className="hidden-badge px-2 py-0.5 rounded-full text-white text-[10px] font-semibold">
            BETA
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Live on Arbitrum Sepolia — Powered by iExec Nox
          </span>
        </div>

        <h1
          className="fade-in fade-in-2 text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span style={{ color: 'var(--text-primary)' }}>Trade Large.</span>
          <br />
          <span
            style={{
              background: 'var(--gradient-crystal)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Stay Hidden.
          </span>
        </h1>

        <p
          className="fade-in fade-in-3 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          The first confidential OTC desk for crypto whales. Trade large amounts without
          revealing order sizes — MEV bots see nothing, you keep everything.
        </p>

        <div className="fade-in fade-in-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/marketplace">
            <GlowButton size="lg">Browse Offers</GlowButton>
          </Link>
          <Link href="/create">
            <GlowButton size="lg" variant="secondary">Create Offer</GlowButton>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="fade-in fade-in-5 grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-2xl p-5 text-center hover:bg-(--bg-elevated) transition-all duration-300 hover:shadow-(--glow-purple)"
          >
            <div
              className="text-2xl md:text-3xl font-bold mb-1"
              style={{ color: 'var(--purple-glow)', fontFamily: 'var(--font-mono), monospace' }}
            >
              {stat.value}
              {stat.suffix && (
                <span className="text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                  {stat.suffix}
                </span>
              )}
            </div>
            <div className="text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-4" style={{ color: 'var(--text-primary)' }}>
          How ShadowSwap Works
        </h2>
        <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Three steps. Zero exposure. Complete confidentiality.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Wrap Your Tokens',
              desc: 'Convert standard ERC-20 tokens into confidential ERC-7984 tokens using iExec Nox. Your balance becomes encrypted on-chain.',
              color: 'var(--purple-bright)',
            },
            {
              step: '02',
              title: 'Create or Take Offer',
              desc: 'Post a sell offer with a hidden amount — buyers see the price but never the size. Or browse existing offers and trade confidentially.',
              color: 'var(--magenta-crystal)',
            },
            {
              step: '03',
              title: 'Settle & Unwrap',
              desc: 'The trade settles on-chain. Both parties receive confidential tokens. Unwrap anytime to get standard ERC-20 tokens back.',
              color: 'var(--cyan-accent)',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="gradient-border p-6 rounded-2xl hover:shadow-(--glow-purple) transition-all duration-300 group"
            >
              <div
                className="text-5xl font-bold mb-4 opacity-30 group-hover:opacity-50 transition-opacity"
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

      {/* Features */}
      <section className="mb-24">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
          Built for Whales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 hover:bg-(--bg-elevated) transition-all duration-300 hover:shadow-(--glow-purple)"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.description}
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
        <p className="max-w-lg mx-auto mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
          Connect your wallet, grab some testnet tokens, and experience confidential OTC trading firsthand.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <GlowButton size="lg">Get Started</GlowButton>
          </Link>
          <Link href="/marketplace">
            <GlowButton size="lg" variant="outline">View Live Offers</GlowButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
