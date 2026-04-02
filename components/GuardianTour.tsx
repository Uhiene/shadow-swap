'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Plug, Fuel, Coins, Lock, ShoppingCart, Lightbulb, X, ChevronRight, Zap } from 'lucide-react';

const TOUR_KEY = 'shadowswap_tour_dismissed';

const STEPS = [
  {
    id: 1,
    icon: <Plug size={28} strokeWidth={1.5} />,
    title: 'Connect Your Wallet',
    desc: 'Click the "Connect Wallet" button in the top-right corner. Make sure MetaMask is installed and set to Arbitrum Sepolia (chain ID 421614). If you see a red banner saying "Wrong Network", click Switch Network.',
    action: null,
    actionLabel: null,
    tip: 'No real money needed — this is a testnet.',
  },
  {
    id: 2,
    icon: <Fuel size={28} strokeWidth={1.5} />,
    title: 'Get Free Testnet ETH',
    desc: 'Before you can do anything on-chain, you need a tiny amount of testnet ETH for gas fees. Visit a faucet, paste your wallet address, and request ETH. It arrives in under a minute.',
    action: 'https://faucet.quicknode.com/arbitrum/sepolia',
    actionLabel: 'Open Faucet →',
    tip: 'Gas on Arbitrum is very cheap — 0.001 ETH is enough for hundreds of transactions.',
    external: true,
  },
  {
    id: 3,
    icon: <Coins size={28} strokeWidth={1.5} />,
    title: 'Mint Testnet sUSD',
    desc: 'Go to your Dashboard and mint free Shadow USD (sUSD) tokens. Type any amount (e.g. 1000) and click Mint. Confirm the transaction in MetaMask. Your balance updates in a few seconds.',
    action: '/dashboard',
    actionLabel: 'Go to Dashboard →',
    tip: "sUSD is ShadowSwap's testnet token — it has no real value.",
  },
  {
    id: 4,
    icon: <Lock size={28} strokeWidth={1.5} />,
    title: 'Create a Confidential Offer',
    desc: "Head to Create Offer. You'll go through 4 steps: Approve → Wrap → Approve OTC → Create. This converts your sUSD into encrypted csUSD and posts a sell offer where buyers can see your price but never your amount.",
    action: '/create',
    actionLabel: 'Create an Offer →',
    tip: 'The "Amount Hidden" badge means your trade size is encrypted on-chain using iExec Nox.',
  },
  {
    id: 5,
    icon: <ShoppingCart size={28} strokeWidth={1.5} />,
    title: 'Browse & Take Offers',
    desc: 'Visit the Marketplace to see all live offers. Each card shows the token pair, price per unit, seller reputation, and expiry — but never the amount. Click "Take Offer" to execute a trade.',
    action: '/marketplace',
    actionLabel: 'Browse Marketplace →',
    tip: 'Your trade count builds your on-chain reputation score.',
  },
];

export default function GuardianTour() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem(TOUR_KEY);
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss(permanent = false) {
    setVisible(false);
    setStep(0);
    if (permanent) localStorage.setItem(TOUR_KEY, '1');
  }

  function handleAction(s: typeof STEPS[number]) {
    if (!s.action) return;
    if (s.external) {
      window.open(s.action, '_blank', 'noopener');
    } else {
      dismiss(false);
      router.push(s.action);
    }
  }

  if (!mounted) return null;

  const currentStep = step > 0 ? STEPS[step - 1] : null;

  return (
    <>
      {/* Floating Guardian button */}
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: 'var(--gradient-button)',
          boxShadow: '0 0 20px rgba(124,58,237,0.6), 0 0 40px rgba(217,70,239,0.3)',
          color: '#fff',
        }}
        title="Open Guardian Tour"
      >
        <Shield size={22} />
      </button>

      {/* Backdrop */}
      {visible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(13,2,33,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) dismiss(false); }}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(26,10,62,0.98) 0%, rgba(45,27,105,0.98) 100%)',
              border: '1px solid rgba(167,139,250,0.25)',
              boxShadow: '0 0 60px rgba(124,58,237,0.3), 0 0 120px rgba(217,70,239,0.15)',
            }}
          >
            {/* Close */}
            <button
              onClick={() => dismiss(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>

            {/* Welcome screen */}
            {step === 0 && (
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: 'var(--gradient-button)',
                    boxShadow: '0 0 30px rgba(124,58,237,0.5)',
                    color: '#fff',
                  }}
                >
                  <Shield size={36} />
                </div>

                <h2
                  className="text-2xl font-bold mb-1"
                  style={{
                    background: 'var(--gradient-crystal)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Welcome to ShadowSwap
                </h2>
                <p className="text-sm mb-2" style={{ color: 'var(--purple-glow)' }}>
                  I'm your Guardian — I'll guide you through the platform.
                </p>
                <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  ShadowSwap is a confidential OTC trading desk on Arbitrum Sepolia. You can buy and sell tokens where the amounts are hidden from everyone — protecting you from MEV bots.
                </p>

                <div className="space-y-2 text-left mb-8">
                  {STEPS.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:bg-white/5"
                      onClick={() => setStep(s.id)}
                      style={{ border: '1px solid rgba(167,139,250,0.1)' }}
                    >
                      <span className="w-7 flex-shrink-0 flex items-center justify-center" style={{ color: 'var(--purple-glow)' }}>
                        {s.icon}
                      </span>
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
                      </div>
                      <ChevronRight size={14} className="ml-auto" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'var(--gradient-button)',
                      color: '#fff',
                      boxShadow: 'var(--glow-purple)',
                    }}
                  >
                    Start Tour →
                  </button>
                  <button
                    onClick={() => dismiss(true)}
                    className="px-4 py-3 rounded-xl text-sm transition-all duration-200 hover:bg-white/5"
                    style={{ color: 'var(--text-muted)', border: '1px solid rgba(167,139,250,0.15)' }}
                  >
                    Don't show again
                  </button>
                </div>
              </div>
            )}

            {/* Step screens */}
            {step > 0 && currentStep && (
              <div>
                {/* Progress */}
                <div className="flex items-center gap-2 mb-6">
                  {STEPS.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setStep(s.id)}
                      className="cursor-pointer transition-all duration-300 rounded-full"
                      style={{
                        height: '4px',
                        flex: 1,
                        background: s.id <= step ? 'var(--gradient-button)' : 'rgba(167,139,250,0.2)',
                      }}
                    />
                  ))}
                </div>

                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: 'rgba(124,58,237,0.2)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      color: 'var(--purple-glow)',
                    }}
                  >
                    {currentStep.icon}
                  </div>
                  <div className="text-xs font-mono mb-2" style={{ color: 'var(--purple-glow)' }}>
                    Step {step} of {STEPS.length}
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    {currentStep.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {currentStep.desc}
                  </p>
                </div>

                {/* Tip box */}
                <div
                  className="px-4 py-3 rounded-xl text-xs mb-6 flex items-start gap-2"
                  style={{
                    background: 'rgba(190,242,100,0.08)',
                    border: '1px solid rgba(190,242,100,0.2)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Lightbulb size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--cyan-accent)' }} />
                  <span><span style={{ color: 'var(--cyan-accent)' }}>Tip: </span>{currentStep.tip}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:bg-white/5"
                    style={{ color: 'var(--text-muted)', border: '1px solid rgba(167,139,250,0.15)' }}
                  >
                    ← Back
                  </button>

                  {currentStep.action && (
                    <button
                      onClick={() => handleAction(currentStep)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: 'rgba(124,58,237,0.2)',
                        border: '1px solid rgba(124,58,237,0.4)',
                        color: 'var(--purple-glow)',
                      }}
                    >
                      {currentStep.actionLabel}
                    </button>
                  )}

                  {step < STEPS.length ? (
                    <button
                      onClick={() => setStep((s) => s + 1)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: 'var(--gradient-button)',
                        color: '#fff',
                        boxShadow: 'var(--glow-purple)',
                      }}
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={() => dismiss(true)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] inline-flex items-center justify-center gap-2"
                      style={{
                        background: 'var(--gradient-button)',
                        color: '#fff',
                        boxShadow: 'var(--glow-purple)',
                      }}
                    >
                      Let's Go! <Zap size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
