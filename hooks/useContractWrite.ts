'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Abi } from 'viem';

export type TxStatus = 'idle' | 'pending' | 'mining' | 'success' | 'error';

export function useContractWrite() {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();

  async function write({
    address,
    abi,
    functionName,
    args,
    onSuccess,
  }: {
    address: `0x${string}`;
    abi: Abi;
    functionName: string;
    args?: unknown[];
    onSuccess?: (hash: `0x${string}`) => void;
  }): Promise<`0x${string}` | null> {
    setStatus('pending');
    setErrorMsg(null);
    try {
      const hash = await writeContractAsync({
        address,
        abi,
        functionName,
        args,
      });
      setStatus('mining');
      onSuccess?.(hash);
      return hash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      setErrorMsg(msg.includes('User rejected') ? 'Transaction rejected' : msg);
      setStatus('error');
      return null;
    }
  }

  function reset() {
    setStatus('idle');
    setErrorMsg(null);
  }

  return { write, status, errorMsg, reset };
}
