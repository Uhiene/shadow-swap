'use client';

import { useState, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { createViemHandleClient } from '@iexec-nox/handle';
import type { HandleClient } from '@iexec-nox/handle';

export interface EncryptResult {
  handle: `0x${string}`;
  handleProof: `0x${string}`;
}

export function useNoxHandle() {
  const { data: walletClient } = useWalletClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getClient(): Promise<HandleClient | null> {
    if (!walletClient) {
      setError('Wallet not connected');
      return null;
    }
    try {
      return await createViemHandleClient(walletClient);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Nox client');
      return null;
    }
  }

  // Encrypt a token amount (uint256) for a specific contract
  const encryptAmount = useCallback(
    async (
      amount: bigint,
      contractAddress: `0x${string}`
    ): Promise<EncryptResult | null> => {
      setIsEncrypting(true);
      setError(null);
      try {
        const client = await getClient();
        if (!client) return null;
        const { handle, handleProof } = await client.encryptInput(
          amount,
          'uint256',
          contractAddress
        );
        return { handle: handle as `0x${string}`, handleProof: handleProof as `0x${string}` };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Encryption failed');
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [walletClient]
  );

  // Decrypt a handle back to a plaintext bigint (only works if ACL allows this wallet)
  const decryptHandle = useCallback(
    async (handle: `0x${string}`): Promise<bigint | null> => {
      setIsDecrypting(true);
      setError(null);
      try {
        const client = await getClient();
        if (!client) return null;
        const { value } = await client.decrypt(handle as Parameters<typeof client.decrypt>[0]);
        return value as bigint;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Decryption failed');
        return null;
      } finally {
        setIsDecrypting(false);
      }
    },
    [walletClient]
  );

  return {
    encryptAmount,
    decryptHandle,
    isEncrypting,
    isDecrypting,
    error,
    isReady: !!walletClient,
  };
}
