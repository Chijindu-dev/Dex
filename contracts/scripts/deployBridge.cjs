// scripts/deployBridge.cjs
const hre = require('hardhat');

async function deployBridge() {
  try {
    console.log('Starting Bridge deployment...');
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log('Deploying with account:', deployer.address);

    // Deploy Bridge contract
    const Bridge = await ethers.getContractFactory('Bridge');
    const bridge = await Bridge.deploy(deployer.address);
    
    console.log('Bridge deployment transaction:', bridge.deploymentTransaction().hash);
    await bridge.waitForDeployment();

    const bridgeAddress = await bridge.getAddress();
    console.log('Bridge deployed to:', bridgeAddress);

    // Add supported tokens
    console.log('\nAdding supported tokens...');
    
    const tokens = [
      '0x56005bdCd754fC6742906A6040aE719A43622651', // SWIFT
      '0xa12ecC1228739e9DbAEf01257968eac0BCbde5DB', // FLUX
      '0xfDefaF0f9985F092899Fe5278c8b32010b8F3BbC'  // NEXUS
    ];

    for (const tokenAddr of tokens) {
      const tx = await bridge.addSupportedToken(tokenAddr);
      await tx.wait();
      console.log('Added supported token:', tokenAddr);
    }

    // Log deployment info
    console.log('\n=== Bridge Deployment Complete ===');
    console.log('Bridge Address:', bridgeAddress);
    console.log('Fee Recipient:', deployer.address);
    console.log('Supported Tokens:', tokens.length);
    console.log('\nUpdate your .env file with:');
    console.log(`VITE_BRIDGE_ADDRESS=${bridgeAddress}`);

    return bridgeAddress;
  } catch (error) {
    console.error('Deployment error:', error);
    process.exit(1);
  }
}

deployBridge();
