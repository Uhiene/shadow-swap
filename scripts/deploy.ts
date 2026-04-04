import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with:', deployer.address);
  console.log('Balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH');

  const MockERC20 = await ethers.getContractFactory('MockERC20');
  const WrappedConfidentialToken = await ethers.getContractFactory('WrappedConfidentialToken');
  const ShadowSwapOTC = await ethers.getContractFactory('ShadowSwapOTC');

  // 1. Deploy MockERC20 (sUSD)
  console.log('\n1. Deploying MockERC20 (sUSD)...');
  const sUSD = await MockERC20.deploy('Shadow USD', 'sUSD');
  await sUSD.waitForDeployment();
  const sUSDAddress = await sUSD.getAddress();
  console.log('   sUSD deployed to:', sUSDAddress);

  // 2. Deploy MockERC20 (sETH)
  console.log('\n2. Deploying MockERC20 (sETH)...');
  const sETH = await MockERC20.deploy('Shadow ETH', 'sETH');
  await sETH.waitForDeployment();
  const sETHAddress = await sETH.getAddress();
  console.log('   sETH deployed to:', sETHAddress);

  // 3. Deploy WrappedConfidentialToken (csUSD)
  console.log('\n3. Deploying WrappedConfidentialToken (csUSD)...');
  const csUSD = await WrappedConfidentialToken.deploy(sUSDAddress, 'Confidential Shadow USD', 'csUSD');
  await csUSD.waitForDeployment();
  const csUSDAddress = await csUSD.getAddress();
  console.log('   csUSD deployed to:', csUSDAddress);

  // 4. Deploy WrappedConfidentialToken (csETH)
  console.log('\n4. Deploying WrappedConfidentialToken (csETH)...');
  const csETH = await WrappedConfidentialToken.deploy(sETHAddress, 'Confidential Shadow ETH', 'csETH');
  await csETH.waitForDeployment();
  const csETHAddress = await csETH.getAddress();
  console.log('   csETH deployed to:', csETHAddress);

  // 5. Deploy ShadowSwapOTC
  console.log('\n5. Deploying ShadowSwapOTC...');
  const shadowSwapOTC = await ShadowSwapOTC.deploy();
  await shadowSwapOTC.waitForDeployment();
  const shadowSwapOTCAddress = await shadowSwapOTC.getAddress();
  console.log('   ShadowSwapOTC deployed to:', shadowSwapOTCAddress);

  console.log('\n✅ All contracts deployed!');
  console.log('\n--- Copy these into lib/contracts.ts ---');
  console.log(`MOCK_ERC20:                      ${sUSDAddress}`);
  console.log(`MOCK_ERC20_ETH:                  ${sETHAddress}`);
  console.log(`WRAPPED_CONFIDENTIAL_TOKEN:      ${csUSDAddress}`);
  console.log(`WRAPPED_CONFIDENTIAL_TOKEN_ETH:  ${csETHAddress}`);
  console.log(`SHADOW_SWAP_OTC:                 ${shadowSwapOTCAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
