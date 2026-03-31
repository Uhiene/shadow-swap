import { createConfig, http, createStorage, cookieStorage } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: [injected()],
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
  },
  ssr: true,
});

export const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;
