'use client';

import { useState } from 'react';
import { useWalletClient } from 'wagmi';

interface EncryptResult {
  handle: string;
  inputProof: string;
}

export function useNoxHandle() {
  const { data: walletClient } = useWalletClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function encryptInput(
    amount: bigint,
    contractAddress: `0x${string}`
  ): Promise<EncryptResult | null> {
    if (!walletClient) {
      setError('Wallet not connected');
      return null;
    }
    setIsEncrypting(true);
    setError(null);
    try {
      // @iexec-nox/handle integration
      // const { createViemHandleClient } = await import('@iexec-nox/handle');
      // const handleClient = await createViemHandleClient(walletClient);
      // const { handle, inputProof } = await handleClient.encryptInput(amount, contractAddress);
      // return { handle, inputProof };
      throw new Error('@iexec-nox/handle not yet installed — run: npm install @iexec-nox/handle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed');
      return null;
    } finally {
      setIsEncrypting(false);
    }
  }

  async function decrypt(handle: string): Promise<bigint | null> {
    if (!walletClient) {
      setError('Wallet not connected');
      return null;
    }
    setIsDecrypting(true);
    setError(null);
    try {
      // const { createViemHandleClient } = await import('@iexec-nox/handle');
      // const handleClient = await createViemHandleClient(walletClient);
      // const plaintext = await handleClient.decrypt(handle);
      // return plaintext;
      throw new Error('@iexec-nox/handle not yet installed — run: npm install @iexec-nox/handle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed');
      return null;
    } finally {
      setIsDecrypting(false);
    }
  }

  return { encryptInput, decrypt, isEncrypting, isDecrypting, error };
}
