'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import Link from 'next/link';
import { Check, Lock, Shield, Plug, AlertTriangle, CheckCircle } from 'lucide-react';
import GlowButton from '@/components/GlowButton';
import { MOCK_ERC20_ABI, WRAPPED_CONFIDENTIAL_TOKEN_ABI, SHADOW_SWAP_OTC_ABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { useNoxHandle } from '@/hooks/useNoxHandle';

const STEPS = [
  { id: 1, label: 'Approve sUSD' },
  { id: 2, label: 'Wrap to csUSD' },
  { id: 3, label: 'Approve OTC' },
  { id: 4, label: 'Create Offer' },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-all duration-300"
              style={{
                background: current > step.id ? 'var(--gradient-button)' : current === step.id ? 'var(--gradient-button)' : 'var(--bg-elevated)',
                color: current >= step.id ? '#fff' : 'var(--text-muted)',
                boxShadow: current === step.id ? 'var(--glow-purple)' : 'none',
              }}
            >
              {current > step.id ? <Check size={14} /> : step.id}
            </div>
            <span className="text-xs text-center" style={{ color: current >= step.id ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="h-px flex-1 mb-5 transition-all duration-500"
              style={{ background: current > step.id + 1 ? 'rgba(167,139,250,0.5)' : 'rgba(167,139,250,0.2)' }} />
          )}
        </div>
      ))}
    </div>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-xl outline-none text-sm font-mono transition-all duration-300';
const inputBaseStyle = { background: 'var(--bg-void)', border: '1px solid rgba(167,139,250,0.2)', color: 'var(--text-primary)' };

export default function CreatePage() {
  const { address, isConnected } = useAccount();

  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [expiryHours, setExpiryHours] = useState('168');

  const buyTokenAddress = CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN as `0x${string}`;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Confirm in MetaMask...');
  const [error, setError] = useState('');
  const [stepDone, setStepDone] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const { encryptAmount, isEncrypting } = useNoxHandle();

  async function getFees() {
    try {
      const { createPublicClient, http } = await import('viem');
      const { arbitrumSepolia } = await import('wagmi/chains');
      const client = createPublicClient({ chain: arbitrumSepolia, transport: http('https://sepolia-rollup.arbitrum.io/rpc') });
      const block = await client.getBlock({ blockTag: 'latest' });
      const base = block.baseFeePerGas ?? 25_000_000n;
      return { maxFeePerGas: base * 2n, maxPriorityFeePerGas: base / 10n || 1n };
    } catch {
      return { maxFeePerGas: 200_000_000n, maxPriorityFeePerGas: 2_000_000n };
    }
  }

  const { data: sUSDBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MOCK_ERC20,
    abi: MOCK_ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const contractsDeployed =
    !!CONTRACT_ADDRESSES.MOCK_ERC20 &&
    !!CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN &&
    !!CONTRACT_ADDRESSES.SHADOW_SWAP_OTC;

  const parsedAmount = amount ? parseUnits(amount, 18) : 0n;

  async function waitForBlock() {
    setLoadingMsg('Submitted — settling...');
    await new Promise((r) => setTimeout(r, 4000));
  }

  // Run a step, mark done, then auto-advance after a short success flash
  async function run(label: string, fn: () => Promise<void>, nextStep?: number) {
    setError('');
    setLoading(true);
    setLoadingMsg('Confirm in MetaMask...');
    setStepDone(false);
    try {
      await fn();
      setStepDone(true);
      if (nextStep) {
        await new Promise((r) => setTimeout(r, 1200));
        setStep(nextStep);
        setStepDone(false);
        setError('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes('rejected') && !msg.toLowerCase().includes('denied') && !msg.toLowerCase().includes('cancelled')) {
        setError(`${label} failed: ${msg.slice(0, 120)}`);
      }
    } finally {
      setLoading(false);
      setLoadingMsg('Confirm in MetaMask...');
    }
  }

  async function handleApprove() {
    if (!amount || parsedAmount === 0n) { setError('Enter an amount first'); return; }
    run('Approve', async () => {
      const fees = await getFees();
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.MOCK_ERC20,
        abi: MOCK_ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN, parsedAmount],
        ...fees,
      });
      await waitForBlock();
    }, 2);
  }

  async function handleWrap() {
    if (!amount || parsedAmount === 0n) { setError('Invalid amount'); return; }
    run('Wrap', async () => {
      const fees = await getFees();
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN,
        abi: WRAPPED_CONFIDENTIAL_TOKEN_ABI,
        functionName: 'wrap',
        args: [address!, parsedAmount],
        ...fees,
      });
      await waitForBlock();
    }, 3);
  }

  async function handleSetOperator() {
    run('Set operator', async () => {
      const fees = await getFees();
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN,
        abi: WRAPPED_CONFIDENTIAL_TOKEN_ABI,
        functionName: 'setOperator',
        args: [CONTRACT_ADDRESSES.SHADOW_SWAP_OTC, 4102444800],
        ...fees,
      });
      await waitForBlock();
    }, 4);
  }

  async function handleCreateOffer() {
    if (!pricePerUnit || !amount) { setError('Fill in all fields'); return; }
    run('Create offer', async () => {
      setLoadingMsg('Encrypting amount with Nox...');
      const encrypted = await encryptAmount(parsedAmount, CONTRACT_ADDRESSES.SHADOW_SWAP_OTC);
      if (!encrypted) throw new Error('Nox encryption failed — make sure your wallet is connected');

      const fees = await getFees();
      const expirySecs = BigInt(Math.floor(Date.now() / 1000) + Number(expiryHours) * 3600);
      const price = parseUnits(pricePerUnit, 18);

      setLoadingMsg('Confirm in MetaMask...');
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
        abi: SHADOW_SWAP_OTC_ABI,
        functionName: 'createOffer',
        args: [
          CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN,
          buyTokenAddress,
          price,
          encrypted.handle,
          encrypted.handleProof,
          expirySecs,
        ],
        ...fees,
      });
      await waitForBlock();
      setStep(5);
    });
  }

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4" style={{ color: 'var(--purple-glow)' }}><Plug size={48} strokeWidth={1} /></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Connect Wallet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Connect your wallet to create a confidential OTC offer.</p>
        </div>
      </div>
    );
  }

  if (!contractsDeployed) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4" style={{ color: 'var(--pink-hot)' }}><AlertTriangle size={48} strokeWidth={1} /></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Contracts Not Deployed</h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            Deploy contracts first and add addresses to <code style={{ color: 'var(--purple-glow)' }}>lib/contracts.ts</code>.
          </p>
          <Link href="/dashboard"><GlowButton variant="outline">Dashboard</GlowButton></Link>
        </div>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="glass rounded-2xl p-12 text-center space-y-4">
          <div className="flex justify-center" style={{ color: 'var(--cyan-accent)' }}><CheckCircle size={56} strokeWidth={1} /></div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--cyan-accent)' }}>Offer Created!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Your confidential OTC offer is live. Buyers see the price — never the amount.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <GlowButton href="/marketplace">View Marketplace →</GlowButton>
            <GlowButton variant="outline" onClick={() => { setStep(1); setAmount(''); setPricePerUnit(''); setStepDone(false); setError(''); }}>
              Create Another
            </GlowButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Create Offer</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your sell amount is encrypted — buyers see the price, never the size.</p>
      </div>

      <StepIndicator current={step} />

      <div className="glass rounded-2xl p-8 space-y-6">

        {step === 1 && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Step 1 — Approve sUSD</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Allow the wrapper contract to spend your sUSD tokens.</p>
            </div>
            <div className="px-4 py-2 rounded-xl text-sm" style={{ background: 'var(--bg-elevated)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Your balance: </span>
              <span className="font-mono" style={{ color: 'var(--purple-glow)' }}>
                {sUSDBalance !== undefined ? `${(Number(sUSDBalance) / 1e18).toFixed(4)} sUSD` : '...'}
              </span>
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Amount to sell (sUSD)</label>
              <input
                type="text" inputMode="decimal" placeholder="e.g. 1000"
                value={amount}
                disabled={stepDone}
                onChange={(e) => { setAmount(e.target.value.replace(/[^0-9.]/g, '')); setError(''); }}
                className={inputCls} style={{ ...inputBaseStyle, opacity: stepDone ? 0.5 : 1 }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--purple-bright)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(167,139,250,0.2)')}
              />
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--pink-hot)' }}>{error}</p>}
            {stepDone && (
              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--cyan-accent)' }}>
                <Check size={14} /> Approved! Moving to next step...
              </p>
            )}
            <GlowButton onClick={handleApprove} loading={loading} disabled={stepDone} fullWidth>
              {stepDone ? <span className="flex items-center gap-2"><Check size={14} /> Approved</span> : loading ? loadingMsg : 'Approve sUSD'}
            </GlowButton>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Step 2 — Wrap to csUSD</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Convert {amount} sUSD into confidential csUSD tokens.</p>
            </div>
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--bg-elevated)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>You wrap</span>
                <span className="font-mono" style={{ color: 'var(--purple-glow)' }}>{amount} sUSD</span>
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ color: 'var(--text-muted)' }}>You receive</span>
                <span className="font-mono inline-flex items-center gap-1" style={{ color: 'var(--cyan-accent)' }}>{amount} csUSD <Lock size={12} /></span>
              </div>
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--pink-hot)' }}>{error}</p>}
            {stepDone && (
              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--cyan-accent)' }}>
                <Check size={14} /> Wrapped! Moving to next step...
              </p>
            )}
            <GlowButton onClick={handleWrap} loading={loading} disabled={stepDone} fullWidth>
              {stepDone ? <span className="flex items-center gap-2"><Check size={14} /> Wrapped</span> : loading ? loadingMsg : `Wrap ${amount} sUSD`}
            </GlowButton>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Step 3 — Approve OTC Contract</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Allow the ShadowSwap OTC contract to move your csUSD tokens during a trade.
              </p>
            </div>
            <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(190,242,100,0.07)', border: '1px solid rgba(190,242,100,0.15)' }}>
              <span style={{ color: 'var(--cyan-accent)' }}>Why? </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                ERC-7984 confidential tokens use an operator model. The OTC contract needs to be set as an operator on your csUSD so it can escrow the sell amount when you create an offer.
              </span>
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--pink-hot)' }}>{error}</p>}
            {stepDone && (
              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--cyan-accent)' }}>
                <Check size={14} /> Approved! Moving to next step...
              </p>
            )}
            <GlowButton onClick={handleSetOperator} loading={loading} disabled={stepDone} fullWidth>
              {stepDone ? <span className="flex items-center gap-2"><Check size={14} /> Approved</span> : loading ? loadingMsg : 'Approve OTC Contract'}
            </GlowButton>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Step 4 — Create Offer</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Set your price and expiry. The sell amount stays encrypted on-chain.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Price Per Unit (in csUSD)</label>
                <input type="text" inputMode="decimal" placeholder="e.g. 1.0"
                  value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value.replace(/[^0-9.]/g, ''))}
                  className={inputCls} style={inputBaseStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--purple-bright)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(167,139,250,0.2)')}
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Expires In</label>
                <select value={expiryHours} onChange={(e) => setExpiryHours(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm cursor-pointer" style={inputBaseStyle}>
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="24">24 hours</option>
                  <option value="72">3 days</option>
                  <option value="168">7 days</option>
                </select>
              </div>
            </div>
            <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(217,70,239,0.08)', border: '1px solid rgba(217,70,239,0.2)' }}>
              <span className="inline-flex items-center gap-1" style={{ color: 'var(--magenta-crystal)' }}><Shield size={11} /> Privacy Note: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                Your sell amount ({amount} csUSD) will be encrypted using iExec Nox. Buyers only see the price per unit.
              </span>
            </div>
            {error && <p className="text-sm" style={{ color: 'var(--pink-hot)' }}>{error}</p>}
            <GlowButton onClick={handleCreateOffer} loading={loading || isEncrypting} fullWidth>
              {isEncrypting ? 'Encrypting with Nox...' : loading ? loadingMsg : <span className="flex items-center gap-2">Create Offer <Lock size={14} /></span>}
            </GlowButton>
          </>
        )}
      </div>
    </div>
  );
}
