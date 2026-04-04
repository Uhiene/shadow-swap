'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { AlertTriangle, XCircle, Lock, Clock, CheckCircle, Shield, Check } from 'lucide-react';
import GlowButton from '@/components/GlowButton';
import { SHADOW_SWAP_OTC_ABI, WRAPPED_CONFIDENTIAL_TOKEN_ABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { shortenAddress, formatExpiry } from '@/lib/utils';
import { useNoxHandle } from '@/hooks/useNoxHandle';
import { parseUnits } from 'viem';

export default function TradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const offerId = BigInt(id);
  const { address, isConnected } = useAccount();
  const [buyAmount, setBuyAmount] = useState('');
  const [step, setStep] = useState(1); // 1 = set operator, 2 = execute trade
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [operatorDone, setOperatorDone] = useState(false);

  const { encryptAmount, isEncrypting } = useNoxHandle();

  const { data: offer, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'getOffer',
    args: [offerId],
  });

  // Check if OTC is already set as operator for this buyer
  const { data: isOperatorAlready } = useReadContract({
    address: CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN as `0x${string}`,
    abi: WRAPPED_CONFIDENTIAL_TOKEN_ABI,
    functionName: 'isOperator',
    args: address ? [address, CONTRACT_ADDRESSES.SHADOW_SWAP_OTC as `0x${string}`] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN, refetchInterval: 4000 },
  });

  const { writeContractAsync } = useWriteContract();

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

  async function handleSetOperator() {
    setError('');
    setLoading(true);
    try {
      const fees = await getFees();
      // until = year 2100 timestamp (effectively permanent)
      const until = 4102444800;
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN as `0x${string}`,
        abi: WRAPPED_CONFIDENTIAL_TOKEN_ABI,
        functionName: 'setOperator',
        args: [CONTRACT_ADDRESSES.SHADOW_SWAP_OTC as `0x${string}`, until],
        ...fees,
      });
      // Wait a bit for chain to process
      await new Promise((r) => setTimeout(r, 4000));
      setOperatorDone(true);
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes('rejected')) setError('Set operator failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleTrade() {
    setError('');
    if (!buyAmount || isNaN(parseFloat(buyAmount)) || parseFloat(buyAmount) <= 0) {
      setError('Enter a valid amount to buy');
      return;
    }
    setLoading(true);
    try {
      const fees = await getFees();
      const parsedAmount = parseUnits(buyAmount, 18);

      // Encrypt the buy amount for the OTC contract
      const encrypted = await encryptAmount(parsedAmount, CONTRACT_ADDRESSES.SHADOW_SWAP_OTC as `0x${string}`);
      if (!encrypted) {
        setError('Encryption failed. Make sure your wallet is connected.');
        setLoading(false);
        return;
      }

      await writeContractAsync({
        address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC as `0x${string}`,
        abi: SHADOW_SWAP_OTC_ABI,
        functionName: 'takeOffer',
        args: [offerId, encrypted.handle as `0x${string}`, encrypted.handleProof as `0x${string}`],
        ...fees,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      if (!msg.includes('rejected') && !msg.includes('denied') && !msg.includes('cancelled')) {
        if (msg.includes('insufficient') || msg.includes('balance') || msg.includes('transfer')) {
          setError('Not enough csUSD. Go to Dashboard and wrap more sUSD tokens first.');
        } else if (msg.includes('operator') || msg.includes('allowance')) {
          setError('OTC contract not approved. Go back to Step 1 and approve it.');
        } else {
          setError('Trade failed. Make sure you have enough csUSD and try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    setError('');
    try {
      const fees = await getFees();
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC as `0x${string}`,
        abi: SHADOW_SWAP_OTC_ABI,
        functionName: 'cancelOffer',
        args: [offerId],
        ...fees,
      });
      setCancelSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes('rejected')) setError('Cancel failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!CONTRACT_ADDRESSES.SHADOW_SWAP_OTC) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4" style={{ color: 'var(--pink-hot)' }}><AlertTriangle size={48} strokeWidth={1} /></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Contracts Not Deployed</h2>
          <Link href="/marketplace"><GlowButton variant="outline">← Marketplace</GlowButton></Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="glass rounded-2xl p-8 animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 rounded" style={{ background: 'var(--bg-elevated)', width: `${60 + i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!offer || !offer[5]) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="glass rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-4" style={{ color: 'var(--pink-hot)' }}><XCircle size={48} strokeWidth={1} /></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Offer Not Found</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>This offer is inactive, expired, or does not exist.</p>
          <Link href="/marketplace"><GlowButton variant="outline">← Back to Marketplace</GlowButton></Link>
        </div>
      </div>
    );
  }

  const [seller, sellToken, buyToken, pricePerUnit, expiry] = offer;
  const expiryFormatted = formatExpiry(expiry);
  const isExpired = Number(expiry) * 1000 < Date.now();
  const priceFormatted = (Number(pricePerUnit) / 1e18).toFixed(6);
  const isSeller = address?.toLowerCase() === seller.toLowerCase();

  // Operator is already set if the chain confirms it, or we just set it this session
  const operatorReady = isOperatorAlready || operatorDone;
  const currentStep = operatorReady ? 2 : step;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/marketplace" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
          ← Marketplace
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Offer #{id}</span>
      </div>

      <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Take Offer</h1>

      {/* Offer details */}
      <div className="glass rounded-2xl p-6 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Offer #{id}</h2>
          <div className="flex items-center gap-2">
            <span className="hidden-badge px-2 py-0.5 rounded-full text-white text-[10px] font-semibold inline-flex items-center gap-1"><Lock size={9} /> Amount Hidden</span>
            {isExpired ? (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(236,72,153,0.15)', color: 'var(--pink-hot)' }}>Expired</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: 'rgba(190,242,100,0.1)', color: 'var(--cyan-accent)' }}><Clock size={10} /> {expiryFormatted}</span>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(167,139,250,0.1)' }} />

        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span style={{ color: 'var(--text-muted)' }}>Seller</span>
          <span className="text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{shortenAddress(seller)}</span>

          <span style={{ color: 'var(--text-muted)' }}>Sell Token</span>
          <span className="text-right font-mono text-xs" style={{ color: 'var(--purple-glow)' }}>{shortenAddress(sellToken)}</span>

          <span style={{ color: 'var(--text-muted)' }}>Buy Token</span>
          <span className="text-right font-mono text-xs" style={{ color: 'var(--purple-glow)' }}>{shortenAddress(buyToken)}</span>

          <span style={{ color: 'var(--text-muted)' }}>Sell Amount</span>
          <span className="text-right font-semibold inline-flex items-center gap-1 justify-end" style={{ color: 'var(--magenta-crystal)' }}><Lock size={12} /> Encrypted</span>

          <span style={{ color: 'var(--text-muted)' }}>Price / Unit</span>
          <span className="text-right font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{priceFormatted}</span>
        </div>
      </div>

      {!isConnected && (
        <div className="glass rounded-2xl p-8 text-center">
          <p style={{ color: 'var(--text-secondary)' }}>Connect your wallet to take this offer.</p>
        </div>
      )}

      {isConnected && cancelSuccess && (
        <div className="glass rounded-2xl p-8 text-center space-y-3">
          <div className="flex justify-center" style={{ color: 'var(--cyan-accent)' }}><CheckCircle size={40} strokeWidth={1.5} /></div>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--cyan-accent)' }}>Offer Cancelled</h3>
          <Link href="/marketplace"><GlowButton variant="outline">← Marketplace</GlowButton></Link>
        </div>
      )}

      {isConnected && success && (
        <div className="glass rounded-2xl p-8 text-center space-y-3">
          <div className="flex justify-center" style={{ color: 'var(--cyan-accent)' }}><CheckCircle size={40} strokeWidth={1.5} /></div>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--cyan-accent)' }}>Trade Successful!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Confidential tokens exchanged. Check your dashboard for balances.
          </p>
          <Link href="/dashboard"><GlowButton fullWidth>Go to Dashboard</GlowButton></Link>
        </div>
      )}

      {isConnected && !success && !cancelSuccess && isSeller && (
        <div className="glass rounded-2xl p-8 text-center space-y-4">
          <p style={{ color: 'var(--text-secondary)' }}>This is your own offer.</p>
          {error && <p className="text-sm" style={{ color: 'var(--pink-hot)' }}>{error}</p>}
          <GlowButton variant="danger" onClick={handleCancel} loading={loading} fullWidth>
            {loading ? 'Confirm in MetaMask...' : 'Cancel Offer'}
          </GlowButton>
        </div>
      )}

      {isConnected && !success && !cancelSuccess && !isSeller && isExpired && (
        <div className="glass rounded-2xl p-8 text-center">
          <p style={{ color: 'var(--pink-hot)' }}>This offer has expired.</p>
        </div>
      )}

      {isConnected && !success && !cancelSuccess && !isSeller && !isExpired && (
        <div className="glass rounded-2xl p-6 space-y-5">

          {/* Step progress */}
          <div className="flex items-center gap-2 mb-2">
            {[
              { n: 1, label: 'Approve OTC' },
              { n: 2, label: 'Execute Trade' },
            ].map(({ n, label }) => {
              const done = (n === 1 && operatorReady) || (n === 2 && success);
              const active = currentStep === n;
              return (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: done
                        ? 'var(--gradient-button)'
                        : active
                        ? 'rgba(124,58,237,0.3)'
                        : 'rgba(167,139,250,0.1)',
                      border: active ? '1px solid rgba(124,58,237,0.6)' : '1px solid transparent',
                      color: done || active ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {done ? <Check size={12} /> : n}
                  </div>
                  <span className="text-xs" style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {label}
                  </span>
                  {n < 2 && <div className="flex-1 h-px" style={{ background: operatorReady ? 'var(--gradient-button)' : 'rgba(167,139,250,0.2)' }} />}
                </div>
              );
            })}
          </div>

          {/* Step 1: Set Operator */}
          {!operatorReady && (
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Step 1: Approve OTC Contract</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Allow ShadowSwap to move your csUSD confidentially. This is a one-time approval per wallet.
                </p>
              </div>
              {error && <p className="text-sm" style={{ color: 'var(--pink-hot)' }}>{error}</p>}
              <GlowButton onClick={handleSetOperator} loading={loading} fullWidth size="lg">
                {loading ? 'Confirm in MetaMask...' : <span className="flex items-center gap-2"><Shield size={14} /> Approve OTC →</span>}
              </GlowButton>
            </div>
          )}

          {/* Step 2: Execute Trade */}
          {operatorReady && (
            <div className="space-y-4">
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Step 2: Enter Buy Amount</h2>

              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Amount of tokens you want to buy
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 500"
                  value={buyAmount}
                  onChange={(e) => { setBuyAmount(e.target.value.replace(/[^0-9.]/g, '')); setError(''); }}
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm font-mono transition-all duration-300"
                  style={{ background: 'var(--bg-void)', border: '1px solid rgba(167,139,250,0.2)', color: 'var(--text-primary)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--purple-bright)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(167,139,250,0.2)')}
                />
              </div>

              {buyAmount && !isNaN(parseFloat(buyAmount)) && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>You pay</span>
                    <span className="font-mono inline-flex items-center gap-1" style={{ color: 'var(--purple-glow)' }}>
                      <Lock size={12} /> {(parseFloat(buyAmount) * parseFloat(priceFormatted)).toFixed(4)} csUSD
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span style={{ color: 'var(--text-muted)' }}>You receive</span>
                    <span className="font-mono inline-flex items-center gap-1" style={{ color: 'var(--cyan-accent)' }}><Lock size={12} /> {buyAmount} csUSD</span>
                  </div>
                </div>
              )}

              <div
                className="px-4 py-3 rounded-xl text-xs"
                style={{ background: 'rgba(217,70,239,0.08)', border: '1px solid rgba(217,70,239,0.2)' }}
              >
                <span className="inline-flex items-center gap-1" style={{ color: 'var(--magenta-crystal)' }}><Shield size={11} /> Privacy: </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Your buy amount is encrypted via iExec Nox before the transaction. The seller sees tokens arrive — not the exact amount.
                </span>
              </div>

              {error && <p className="text-sm" style={{ color: 'var(--pink-hot)' }}>{error}</p>}

              <GlowButton onClick={handleTrade} loading={loading || isEncrypting} fullWidth size="lg">
                {isEncrypting
                  ? 'Encrypting amount...'
                  : loading
                  ? 'Confirm in MetaMask...'
                  : <span className="flex items-center gap-2">Execute Trade <Lock size={14} /></span>}
              </GlowButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
