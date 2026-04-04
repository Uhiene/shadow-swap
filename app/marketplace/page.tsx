'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { Lock, Clock, Inbox, Package } from 'lucide-react';
import { SHADOW_SWAP_OTC_ABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { getTokenName, shortenAddress, formatExpiry } from '@/lib/utils';
import GlowButton from '@/components/GlowButton';

type SortOption = 'newest' | 'expiry' | 'price_asc' | 'price_desc';

function OfferCard({ offerId }: { offerId: number }) {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'getOffer',
    args: [BigInt(offerId)],
    query: { refetchInterval: 4000, staleTime: 0 },
  });

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 animate-pulse">
        <div className="h-4 rounded mb-3 w-2/3" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-4 rounded mb-3 w-1/2" style={{ background: 'var(--bg-elevated)' }} />
        <div className="h-8 rounded w-full mt-4" style={{ background: 'var(--bg-elevated)' }} />
      </div>
    );
  }

  if (!data || !data[5]) return null;

  const [seller, sellToken, buyToken, pricePerUnit, expiry, active] = data;
  if (!active) return null;

  const expiryFormatted = formatExpiry(expiry);
  const isExpiringSoon = Number(expiry) * 1000 - Date.now() < 3_600_000;
  const priceFormatted = (Number(pricePerUnit) / 1e18).toFixed(6);

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:bg-(--bg-elevated) hover:shadow-(--glow-purple)">

      {/* Top row: badge + expiry */}
      <div className="flex items-center justify-between">
        <span className="hidden-badge px-2 py-0.5 rounded-full text-white text-[10px] font-semibold inline-flex items-center gap-1">
          <Lock size={9} /> Amount Hidden
        </span>
        <div
          className="text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
          style={{
            background: isExpiringSoon ? 'rgba(236,72,153,0.15)' : 'rgba(190,242,100,0.1)',
            color: isExpiringSoon ? 'var(--pink-hot)' : 'var(--cyan-accent)',
            border: `1px solid ${isExpiringSoon ? 'rgba(236,72,153,0.3)' : 'rgba(190,242,100,0.3)'}`,
          }}
        >
          <Clock size={10} /> {expiryFormatted}
        </div>
      </div>

      {/* Offer # */}
      <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>Offer #{offerId}</div>

      <div style={{ borderTop: '1px solid rgba(167,139,250,0.1)' }} />

      {/* Rows */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Token</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--purple-glow)' }}>{getTokenName(sellToken)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Rate</span>
          <span className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{priceFormatted} {getTokenName(buyToken)} / unit</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Seller</span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{shortenAddress(seller)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(167,139,250,0.1)' }} />

      <Link href={`/trade/${offerId}`} className="w-full">
        <GlowButton fullWidth size="sm">Take Offer →</GlowButton>
      </Link>
    </div>
  );
}

export default function MarketplacePage() {
  const [sort, setSort] = useState<SortOption>('newest');

  const { data: offerCount, isLoading: countLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'getOfferCount',
    query: { refetchInterval: 4000, staleTime: 0 },
  });

  const totalOffers = offerCount ? Number(offerCount) : 0;
  const contractDeployed = !!CONTRACT_ADDRESSES.SHADOW_SWAP_OTC;

  const offerIds = Array.from({ length: totalOffers }, (_, i) =>
    sort === 'newest' ? totalOffers - 1 - i : i
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Marketplace
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {countLoading
              ? 'Loading offers...'
              : contractDeployed
              ? `${totalOffers} offer${totalOffers !== 1 ? 's' : ''} — amounts are confidential`
              : 'Deploy contracts to see live offers'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid rgba(167,139,250,0.2)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="expiry">Expiring Soon</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
          <Link href="/create">
            <GlowButton size="sm">+ Create Offer</GlowButton>
          </Link>
        </div>
      </div>

      {!contractDeployed && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-4" style={{ color: 'var(--purple-glow)' }}>
            <Package size={48} strokeWidth={1} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Contracts Not Deployed Yet
          </h3>
          <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Deploy contracts to Arbitrum Sepolia and add addresses to{' '}
            <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--purple-glow)' }}>
              lib/contracts.ts
            </code>
          </p>
          <Link href="/dashboard">
            <GlowButton variant="outline">Go to Dashboard</GlowButton>
          </Link>
        </div>
      )}

      {contractDeployed && !countLoading && totalOffers === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-4" style={{ color: 'var(--text-muted)' }}>
            <Inbox size={48} strokeWidth={1} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No Active Offers
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Be the first to create a confidential OTC offer.
          </p>
          <Link href="/create">
            <GlowButton>Create First Offer</GlowButton>
          </Link>
        </div>
      )}

      {contractDeployed && totalOffers > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {offerIds.map((id) => (
            <OfferCard key={id} offerId={id} />
          ))}
        </div>
      )}
    </div>
  );
}
