import { createConfig, http, createStorage, cookieStorage, fallback } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: [injected()],
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [arbitrumSepolia.id]: fallback([
      http('https://sepolia-rollup.arbitrum.io/rpc'),
      http('https://arbitrum-sepolia.blockpi.network/v1/rpc/public'),
      http('https://arbitrum-sepolia-rpc.publicnode.com'),
    ]),
  },
  ssr: true,
});

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
