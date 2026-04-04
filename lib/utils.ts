import { formatUnits, parseUnits } from 'viem';
import { CONTRACT_ADDRESSES } from './contracts';

export function getTokenName(address: string): string {
  const addr = address.toLowerCase();
  if (addr === CONTRACT_ADDRESSES.MOCK_ERC20.toLowerCase()) return 'sUSD';
  if (addr === CONTRACT_ADDRESSES.WRAPPED_CONFIDENTIAL_TOKEN.toLowerCase()) return 'csUSD';
  return shortenAddress(address);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatAmount(amount: bigint, decimals = 18, displayDecimals = 4): string {
  return parseFloat(formatUnits(amount, decimals)).toFixed(displayDecimals);
}

export function parseAmount(amount: string, decimals = 18): bigint {
  try {
    return parseUnits(amount, decimals);
  } catch {
    return 0n;
  }
}

export function formatExpiry(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  const minutes = Math.floor(diff / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

export function classNames(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
