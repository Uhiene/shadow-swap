'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import GlowButton from '@/components/GlowButton';
import { SHADOW_SWAP_OTC_ABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { shortenAddress, formatExpiry } from '@/lib/utils';

export default function TradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const offerId = BigInt(id);
  const { address, isConnected } = useAccount();
  const [buyAmount, setBuyAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const { data: offer, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'getOffer',
    args: [offerId],
  });

  const { data: sellerRep } = useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'tradeCount',
    args: offer ? [offer[0]] : undefined,
    query: { enabled: !!offer },
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

  async function handleTrade() {
    setError('');
    if (!buyAmount) { setError('Enter the amount you want to buy'); return; }
    setLoading(true);
    try {
      const fees = await getFees();
      const encBuyAmountPlaceholder = `0x${'00'.repeat(32)}` as `0x${string}`;
      const proofPlaceholder = '0x' as `0x${string}`;
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
        abi: SHADOW_SWAP_OTC_ABI,
        functionName: 'takeOffer',
        args: [offerId, encBuyAmountPlaceholder, proofPlaceholder],
        ...fees,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes('rejected')) setError('Trade failed. Try again.');
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
        address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
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
          <div className="text-5xl mb-4">🚧</div>
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
          <div className="text-5xl mb-4">❌</div>
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

      <div className="glass rounded-2xl p-6 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Offer #{id}</h2>
          <div className="flex items-center gap-2">
            <span className="hidden-badge px-2 py-0.5 rounded-full text-white text-[10px] font-semibold">🔒 Amount Hidden</span>
            {isExpired ? (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(236,72,153,0.15)', color: 'var(--pink-hot)' }}>Expired</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,211,238,0.1)', color: 'var(--cyan-accent)' }}>⏱ {expiryFormatted}</span>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(167,139,250,0.1)' }} />

        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span style={{ color: 'var(--text-muted)' }}>Seller</span>
          <span className="text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{shortenAddress(seller)}</span>

          <span style={{ color: 'var(--text-muted)' }}>Reputation</span>
          <span className="text-right font-semibold" style={{ color: 'var(--cyan-accent)' }}>
            {sellerRep !== undefined ? `${sellerRep.toString()} trades` : '—'}
          </span>

          <span style={{ color: 'var(--text-muted)' }}>Sell Token</span>
          <span className="text-right font-mono text-xs" style={{ color: 'var(--purple-glow)' }}>{shortenAddress(sellToken)}</span>

          <span style={{ color: 'var(--text-muted)' }}>Buy Token</span>
          <span className="text-right font-mono text-xs" style={{ color: 'var(--purple-glow)' }}>{shortenAddress(buyToken)}</span>

          <span style={{ color: 'var(--text-muted)' }}>Sell Amount</span>
          <span className="text-right font-semibold" style={{ color: 'var(--magenta-crystal)' }}>🔒 Encrypted</span>

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
          <div className="text-4xl">✅</div>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--cyan-accent)' }}>Offer Cancelled</h3>
          <Link href="/marketplace"><GlowButton variant="outline">← Marketplace</GlowButton></Link>
        </div>
      )}

      {isConnected && success && (
        <div className="glass rounded-2xl p-8 text-center space-y-3">
          <div className="text-4xl">✅</div>
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
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Enter Buy Amount</h2>

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

          {buyAmount && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--bg-elevated)' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>You pay</span>
                <span className="font-mono" style={{ color: 'var(--purple-glow)' }}>
                  🔒 {(parseFloat(buyAmount) * parseFloat(priceFormatted)).toFixed(4)} csUSD
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ color: 'var(--text-muted)' }}>You receive</span>
                <span className="font-mono" style={{ color: 'var(--cyan-accent)' }}>🔒 {buyAmount} csUSD</span>
              </div>
            </div>
          )}

          <div
            className="px-4 py-3 rounded-xl text-xs"
            style={{ background: 'rgba(217,70,239,0.08)', border: '1px solid rgba(217,70,239,0.2)' }}
          >
            <span style={{ color: 'var(--magenta-crystal)' }}>🔒 Privacy: </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              Your buy amount is encrypted via iExec Nox before the transaction. The seller sees tokens arrive — not the exact amount.
            </span>
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--pink-hot)' }}>{error}</p>}

          <GlowButton onClick={handleTrade} loading={loading} fullWidth size="lg">
            {loading ? 'Confirm in MetaMask...' : 'Execute Trade 🔒'}
          </GlowButton>
        </div>
      )}
    </div>
  );
}
