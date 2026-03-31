'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { SHADOW_SWAP_OTC_ABI } from '@/lib/abi';

export interface Offer {
  id: bigint;
  seller: `0x${string}`;
  sellToken: `0x${string}`;
  buyToken: `0x${string}`;
  pricePerUnit: bigint;
  expiry: bigint;
  isActive: boolean;
}

export function useOfferCount() {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'getOfferCount',
    query: {
      enabled: !!CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    },
  });
}

export function useOffer(id: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'getOffer',
    args: [id],
    query: {
      enabled: !!CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    },
  });
}

export function useTradeCount(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.SHADOW_SWAP_OTC,
    abi: SHADOW_SWAP_OTC_ABI,
    functionName: 'tradeCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.SHADOW_SWAP_OTC && !!address,
    },
  });
}
