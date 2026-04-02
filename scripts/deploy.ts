import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with:', deployer.address);
  console.log('Balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH');

  // 1. Deploy MockERC20 (sUSD)
  console.log('\n1. Deploying MockERC20 (sUSD)...');
  const MockERC20 = await ethers.getContractFactory('MockERC20');
  const mockERC20 = await MockERC20.deploy();
  await mockERC20.waitForDeployment();
  const mockERC20Address = await mockERC20.getAddress();
  console.log('   MockERC20 deployed to:', mockERC20Address);

  // 2. Deploy WrappedConfidentialToken (csUSD)
  console.log('\n2. Deploying WrappedConfidentialToken (csUSD)...');
  const WrappedConfidentialToken = await ethers.getContractFactory('WrappedConfidentialToken');
  const wrappedToken = await WrappedConfidentialToken.deploy(mockERC20Address);
  await wrappedToken.waitForDeployment();
  const wrappedTokenAddress = await wrappedToken.getAddress();
  console.log('   WrappedConfidentialToken deployed to:', wrappedTokenAddress);

  // 3. Deploy ShadowSwapOTC
  console.log('\n3. Deploying ShadowSwapOTC...');
  const ShadowSwapOTC = await ethers.getContractFactory('ShadowSwapOTC');
  const shadowSwapOTC = await ShadowSwapOTC.deploy();
  await shadowSwapOTC.waitForDeployment();
  const shadowSwapOTCAddress = await shadowSwapOTC.getAddress();
  console.log('   ShadowSwapOTC deployed to:', shadowSwapOTCAddress);

  // Summary
  console.log('\n✅ All contracts deployed!');
  console.log('\n--- Copy these into lib/contracts.ts and .env.local ---');
  console.log(`MOCK_ERC20:                   ${mockERC20Address}`);
  console.log(`WRAPPED_CONFIDENTIAL_TOKEN:   ${wrappedTokenAddress}`);
  console.log(`SHADOW_SWAP_OTC:              ${shadowSwapOTCAddress}`);
  console.log('\n--- .env.local values ---');
  console.log(`NEXT_PUBLIC_MOCK_ERC20_ADDRESS=${mockERC20Address}`);
  console.log(`NEXT_PUBLIC_WRAPPED_CONFIDENTIAL_TOKEN_ADDRESS=${wrappedTokenAddress}`);
  console.log(`NEXT_PUBLIC_SHADOW_SWAP_OTC_ADDRESS=${shadowSwapOTCAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
