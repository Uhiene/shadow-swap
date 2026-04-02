// Deployed contract addresses on Arbitrum Sepolia (421614)
// Update these after running `npx hardhat run scripts/deploy.ts --network arbitrumSepolia`

export const CONTRACT_ADDRESSES = {
  MOCK_ERC20: '0xA1782fe2C2969C2787315b906eca2E8019557030' as `0x${string}`,
  WRAPPED_CONFIDENTIAL_TOKEN: '0x5bBd253DcA6aA5Ca4Af3b3dc351a590eCaa12046' as `0x${string}`,
  SHADOW_SWAP_OTC: '0x168380D79dea19E7d3B4Bcc1f6766f5580337034' as `0x${string}`,
} as const;
