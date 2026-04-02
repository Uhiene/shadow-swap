// ABIs — fill in after contract compilation
// Run: npx hardhat compile
// Then copy from artifacts/contracts/*/[ContractName].json

export const MOCK_ERC20_ABI = [
  {
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const WRAPPED_CONFIDENTIAL_TOKEN_ABI = [
  {
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'wrap',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'encAmount', type: 'bytes32' }, { name: 'proof', type: 'bytes' }],
    name: 'unwrap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    // Grant the OTC contract permission to call confidentialTransferFrom on behalf of this user
    inputs: [{ name: 'operator', type: 'address' }, { name: 'until', type: 'uint48' }],
    name: 'setOperator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'holder', type: 'address' }, { name: 'spender', type: 'address' }],
    name: 'isOperator',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const SHADOW_SWAP_OTC_ABI = [
  {
    inputs: [
      { name: 'sellToken', type: 'address' },
      { name: 'buyToken', type: 'address' },
      { name: 'pricePerUnit', type: 'uint256' },
      { name: 'encAmount', type: 'bytes32' },
      { name: 'proof', type: 'bytes' },
      { name: 'expiry', type: 'uint256' },
    ],
    name: 'createOffer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'offerId', type: 'uint256' },
      { name: 'encBuyAmount', type: 'bytes32' },
      { name: 'proof', type: 'bytes' },
    ],
    name: 'takeOffer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'offerId', type: 'uint256' }],
    name: 'cancelOffer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOfferCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'getOffer',
    outputs: [
      { name: 'seller', type: 'address' },
      { name: 'sellToken', type: 'address' },
      { name: 'buyToken', type: 'address' },
      { name: 'pricePerUnit', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'tradeCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'offerId', type: 'uint256' },
      { indexed: true, name: 'seller', type: 'address' },
    ],
    name: 'OfferCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'offerId', type: 'uint256' },
      { indexed: true, name: 'buyer', type: 'address' },
    ],
    name: 'OfferTaken',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'offerId', type: 'uint256' }],
    name: 'OfferCancelled',
    type: 'event',
  },
] as const;
