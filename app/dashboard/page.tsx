'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useChainId, useBalance, useSwitchChain } from 'wagmi';
import { parseUnits } from 'viem';
import Link from 'next/link';
import { Plug, Lock, CheckCircle } from 'lucide-react';
import GlowButton from '@/components/GlowButton';
import { MOCK_ERC20_ABI, SHADOW_SWAP_OTC_ABI } from '@/lib/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { shortenAddress } from '@/lib/utils';
import { ARBITRUM_SEPOLIA_CHAIN_ID } from '@/lib/config';

function StatCard({ label, value, sub, color }: { label: string; value: React.ReactNode; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-1 transition-all duration-300 hover:bg-(--bg-elevated)">
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-2xl font-bold font-mono" style={{ color: color ?? 'var(--purple-glow)' }}>
        {value}
      </div>
      {sub && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== ARBITRUM_SEPOLIA_CHAIN_ID;

  const [mintAmount, setMintAmount] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [mintError, setMintError] = useState('');

  const { data: ethBalance } = useBalance({
    address,
    chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const { data: sUSDBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.MOCK_ERC20,
    abi: MOCK_ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESSES.MOCK_ERC20, refetchInterval: 3000 },
  });

  const { data: tradeCount } = useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'tradeCount',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESSES.SHADOW_SWAP_OTC },
  });

  const { data: offerCount } = useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'getOfferCount',
    query: { enabled: !!CONTRACT_ADDRESSES.SHADOW_SWAP_OTC, refetchInterval: 5000 },
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

  const hasGas = ethBalance && ethBalance.value > 0n;
  const noGas = ethBalance && ethBalance.value === 0n;

  async function handleMint() {
    const amount = mintAmount.trim();
    if (!address || !amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setMintError('');
    setMintStatus('idle');
    setIsMinting(true);

    try {
      const fees = await getFees();
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.MOCK_ERC20,
        abi: MOCK_ERC20_ABI,
        functionName: 'mint',
        args: [address, parseUnits(amount, 18)],
        chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
        ...fees,
      });

      setMintStatus('done');
      setTimeout(() => refetchBalance(), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('cancelled')) {
        setMintStatus('idle');
      } else {
        setMintStatus('error');
        setMintError(msg.length < 120 ? msg : 'Transaction failed — check MetaMask for details.');
      }
    } finally {
      setIsMinting(false);
    }
  }

  const contractsDeployed = !!CONTRACT_ADDRESSES.MOCK_ERC20 && !!CONTRACT_ADDRESSES.SHADOW_SWAP_OTC;
  const shownBalance = sUSDBalance as bigint | undefined;

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="glass rounded-2xl p-12 text-center max-w-md mx-auto">
          <div className="flex justify-center mb-4" style={{ color: 'var(--purple-glow)' }}><Plug size={48} strokeWidth={1} /></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Connect Wallet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Connect your wallet to view balances and manage your trades.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Wrong network banner */}
      {isWrongNetwork && (
        <div className="mb-6 px-5 py-4 rounded-2xl flex items-center justify-between gap-4"
          style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.4)' }}>
          <div>
            <span className="font-semibold" style={{ color: 'var(--pink-hot)' }}>Wrong network — </span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              MetaMask must be on <strong>Arbitrum Sepolia</strong> (chain 421614).
            </span>
          </div>
          <button
            onClick={() => switchChain({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID })}
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: 'var(--pink-hot)', color: '#fff' }}
          >
            Switch Network
          </button>
        </div>
      )}

      {/* No ETH for gas banner */}
      {!isWrongNetwork && noGas && (
        <div className="mb-6 px-5 py-4 rounded-2xl flex items-center justify-between gap-4"
          style={{ background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.35)' }}>
          <div>
            <span className="font-semibold" style={{ color: 'var(--magenta-crystal)' }}>No gas ETH — </span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              You need free testnet ETH on Arbitrum Sepolia to pay gas fees.
            </span>
          </div>
          <a
            href="https://faucet.triangleplatform.com/arbitrum/sepolia"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap"
            style={{ background: 'var(--purple-bright)', color: '#fff' }}
          >
            Get Testnet ETH →
          </a>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          <span className="font-mono">{shortenAddress(address!)}</span>
          {ethBalance && (
            <span className="ml-3 font-mono text-xs" style={{ color: hasGas ? 'var(--cyan-accent)' : 'var(--pink-hot)' }}>
              {parseFloat(ethBalance.formatted).toFixed(4)} ETH (gas)
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="sUSD Balance"
          value={shownBalance !== undefined ? `${(Number(shownBalance) / 1e18).toFixed(2)}` : '...'}
          sub="Shadow USD (testnet)"
          color="var(--purple-glow)"
        />
        <StatCard label="csUSD Balance" value={<Lock size={22} />} sub="Encrypted on-chain" color="var(--magenta-crystal)" />
        <StatCard
          label="Reputation"
          value={tradeCount !== undefined ? tradeCount.toString() : '0'}
          sub="Completed trades"
          color="var(--cyan-accent)"
        />
        <StatCard
          label="Total Offers"
          value={offerCount !== undefined ? offerCount.toString() : '0'}
          sub="On marketplace"
          color="var(--pink-glow)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mint */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Get Testnet sUSD</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Mint free Shadow USD tokens for testing on Arbitrum Sepolia.
            </p>
          </div>

          {!contractsDeployed ? (
            <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--pink-hot)', border: '1px solid rgba(236,72,153,0.2)' }}>
              Deploy contracts first and update <code>lib/contracts.ts</code>.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Amount (sUSD)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 1000"
                  value={mintAmount}
                  onChange={(e) => {
                    setMintAmount(e.target.value.replace(/[^0-9]/g, ''));
                    setMintStatus('idle');
                    setMintError('');
                  }}
                  className="w-full px-4 py-3 rounded-xl outline-none text-sm font-mono transition-all duration-300"
                  style={{ background: 'var(--bg-void)', border: '1px solid rgba(167,139,250,0.2)', color: 'var(--text-primary)' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--purple-bright)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(167,139,250,0.2)')}
                />
              </div>

              {mintStatus === 'done' && (
                <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--cyan-accent)' }}>
                  <CheckCircle size={14} /> Submitted! Balance will update in a few seconds.
                </p>
              )}

              {mintStatus === 'error' && mintError && (
                <p className="text-sm wrap-break-word" style={{ color: 'var(--pink-hot)' }}>{mintError}</p>
              )}

              <GlowButton
                onClick={handleMint}
                loading={isMinting}
                disabled={!mintAmount || Number(mintAmount) <= 0 || isMinting || isWrongNetwork}
                fullWidth
              >
                {isMinting ? 'Confirm in MetaMask...' : `Mint ${mintAmount || '—'} sUSD`}
              </GlowButton>

              {noGas && (
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  Need gas?{' '}
                  <a href="https://faucet.triangleplatform.com/arbitrum/sepolia" target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--purple-glow)', textDecoration: 'underline' }}>
                    Get free testnet ETH →
                  </a>
                </p>
              )}
            </>
          )}
        </div>

        {/* Wrap / Unwrap */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Wrap / Unwrap</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Convert between standard sUSD and confidential csUSD tokens.
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/create" className="block"><GlowButton fullWidth><span className="flex items-center justify-center gap-2">Wrap sUSD → csUSD <Lock size={14} /></span></GlowButton></Link>
            <div className="px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(217,70,239,0.08)', border: '1px solid rgba(217,70,239,0.2)' }}>
              <span style={{ color: 'var(--magenta-crystal)' }}>Unwrap csUSD → sUSD: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                2-step process: burn (encrypted) → finalize (with decryption proof). Available after iExec Nox integration.
              </span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/marketplace" className="block">
              <GlowButton variant="secondary" fullWidth>Browse Marketplace →</GlowButton>
            </Link>
            <Link href="/create" className="block">
              <GlowButton variant="outline" fullWidth>Create New Offer →</GlowButton>
            </Link>
          </div>
        </div>

        {/* Network info */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Network &amp; Contracts</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: 'Network', value: 'Arbitrum Sepolia (421614)', color: 'var(--cyan-accent)' },
              { label: 'sUSD', value: CONTRACT_ADDRESSES.MOCK_ERC20 ? shortenAddress(CONTRACT_ADDRESSES.MOCK_ERC20) : 'Not deployed' },
              { label: 'csUSD', value: CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN ? shortenAddress(CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN) : 'Not deployed' },
              { label: 'OTC Contract', value: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC ? shortenAddress(CONTRACT_ADDRESSES.SHADOW_SWAP_OTC) : 'Not deployed' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span className="font-mono text-xs" style={{ color: color ?? 'var(--text-secondary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
