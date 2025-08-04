const { ethers } = require('ethers');
const { validateSignature } = require('./src/index');

// Test configuration
const config = {
  environment: 'testnet',
  chainId: '11155111',
  rpcUrl: 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925'
};

console.log('🔍 Debugging validateSignature...\n');

async function debugSignature() {
  try {
    const contractAddress = require('./src/config').STORAGE_UTIL_CONTRACT_ADDRESS_MAP[config.environment][config.chainId];
    console.log(`🏗️  Contract Address: ${contractAddress}\n`);

    // Test with a simple wallet
    const privateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
    const wallet = new ethers.Wallet(privateKey);
    const expectedSigner = wallet.address;
    
    console.log(`🔑 Wallet Address: ${expectedSigner}\n`);

    // Test 1: Simple string message
    console.log('📋 Test 1: Simple string message');
    const message1 = 'Hello World';
    const messageBytes1 = ethers.utils.toUtf8Bytes(message1);
    const signature1 = await wallet.signMessage(messageBytes1);
    
    console.log(`   Message: "${message1}"`);
    console.log(`   Message Bytes: ${messageBytes1}`);
    console.log(`   Signature: ${signature1}`);
    
    try {
      const isValid1 = await validateSignature(messageBytes1, expectedSigner, signature1, contractAddress, config.rpcUrl);
      console.log(`   Result: ${isValid1 ? '✅ Valid' : '❌ Invalid'}\n`);
    } catch (error) {
      console.log(`   Error: ${error.message}\n`);
    }

    // Test 2: Hex string message
    console.log('📋 Test 2: Hex string message');
    const message2 = '0x1234567890abcdef';
    const signature2 = await wallet.signMessage(ethers.utils.arrayify(message2));
    
    console.log(`   Message: ${message2}`);
    console.log(`   Signature: ${signature2}`);
    
    try {
      const isValid2 = await validateSignature(message2, expectedSigner, signature2, contractAddress, config.rpcUrl);
      console.log(`   Result: ${isValid2 ? '✅ Valid' : '❌ Invalid'}\n`);
    } catch (error) {
      console.log(`   Error: ${error.message}\n`);
    }

    // Test 3: Empty message
    console.log('📋 Test 3: Empty message');
    const message3 = '';
    const messageBytes3 = ethers.utils.toUtf8Bytes(message3);
    const signature3 = await wallet.signMessage(messageBytes3);
    
    console.log(`   Message: "${message3}"`);
    console.log(`   Message Bytes: ${messageBytes3}`);
    console.log(`   Signature: ${signature3}`);
    
    try {
      const isValid3 = await validateSignature(messageBytes3, expectedSigner, signature3, contractAddress, config.rpcUrl);
      console.log(`   Result: ${isValid3 ? '✅ Valid' : '❌ Invalid'}\n`);
    } catch (error) {
      console.log(`   Error: ${error.message}\n`);
    }

    // Test 4: Check if contract is accessible
    console.log('📋 Test 4: Check contract accessibility');
    try {
      const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
      const contract = new ethers.Contract(contractAddress, ['function verifySignature(bytes,address,bytes) public pure returns (bool)'], provider);
      
      // Try to call the function with dummy data
      const dummyData = '0x1234567890abcdef';
      const dummySignature = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b';
      
      console.log(`   Contract: ${contractAddress}`);
      console.log(`   Dummy Data: ${dummyData}`);
      console.log(`   Dummy Signature: ${dummySignature}`);
      
      const result = await contract.verifySignature(dummyData, expectedSigner, dummySignature);
      console.log(`   Contract Call Result: ${result}\n`);
    } catch (error) {
      console.log(`   Contract Error: ${error.message}\n`);
    }

  } catch (error) {
    console.log(`❌ Debug failed: ${error.message}\n`);
  }
}

debugSignature().catch(console.error); 