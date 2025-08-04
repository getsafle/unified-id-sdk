// Simple Utility Functions Test
//
// INSTRUCTIONS:
// 1. This script tests all utility functions using the SDK instance.
// 2. Uses real contract data for testing.
// 3. Simple and easy to read format.
// 4. Run this file with: node tests/utility-functions-simple.test.js
//

const { UnifiedIdSDK, createSignatureMessage } = require('../src/index');
const { ethers } = require('ethers');

// Test configuration
const config = {
  baseURL: 'https://api.test.com',
  authToken: 'test-token',
  chainId: '11155111',
  environment: 'testnet',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR-PROJECT-ID'
};

// Test data
const testData = {
  unifiedIds: ['safle_2', 'karan_test_2', 'nonexistent_id'],
  addresses: [
    '0xE4A39201c4585450BfE2144ba3Ec3aa9d2198Aa4', // safle_2 primary
    '0x2502875cC092d96792Ac1744A6CEFd04d2cf555F', // karan_test_2 primary
    '0x87530f4AA554Ac2e6f420848450342b0971afa74', // karan_test_2 master
    '0xfEfD8f17d4C10b9ebC93EA67858147178aa11677', // safle_2 master
    '0x0000000000000000000000000000000000000000', // zero address
    '0x1234567890123456789012345678901234567890',  // random address
    '0xe91f41ea0c1a670c495becf45c5bd6eb1b1cdf1'  // secondary address to test
  ],
  tokens: [
    '0x0000000000000000000000000000000000000000', // ETH
    '0xA0b86a33E6441b8c4C8C0b4b8C8C0b4b8C8C0b4b', // Mock USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // USDT
  ],
  registrarFees: [
    '100000000000000000',   // 0.1 ETH
    '1000000000000000000',  // 1 ETH
    '10000000000000000000'  // 10 ETH
  ],
  // Test private keys for signature validation
  privateKeys: [
    '0x1234567890123456789012345678901234567890123456789012345678901234',
    '0x2345678901234567890123456789012345678901234567890123456789012345',
    '0x3456789012345678901234567890123456789012345678901234567890123456'
  ]
};

function checkConfig(cfg) {
  const required = ['baseURL', 'authToken', 'chainId', 'environment'];
  for (const key of required) {
    if (!cfg[key]) throw new Error(`Missing required config: ${key}`);
  }
}

async function utilityFunctionsTest() {
  checkConfig(config);
  console.log('🚀 Simple Utility Functions Test\n');
  console.log('📋 Test Configuration:');
  console.log(`   Environment: ${config.environment}`);
  console.log(`   Chain ID: ${config.chainId}`);
  console.log(`   RPC URL: ${config.rpcUrl}\n`);
  
  const sdk = new UnifiedIdSDK(config);

  try {
    // --- 1. Test isValidUnifiedID ---
    console.log('1. Testing isValidUnifiedID...');
    for (const unifiedId of testData.unifiedIds) {
      try {
        const isValid = await sdk.isValidUnifiedID(unifiedId, config.rpcUrl);
        console.log(`   ${unifiedId}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      } catch (error) {
        console.log(`   ${unifiedId}: ❌ Error - ${error.message}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 2. Test isPrimaryAddressAlreadyRegistered ---
    console.log('2. Testing isPrimaryAddressAlreadyRegistered...');
    for (const address of testData.addresses) {
      try {
        const isRegistered = await sdk.isPrimaryAddressAlreadyRegistered(address, config.rpcUrl);
        console.log(`   ${address}: ${isRegistered ? '✅ Registered' : '❌ Not Registered'}`);
      } catch (error) {
        console.log(`   ${address}: ❌ Error - ${error.message}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 3. Test isSecondaryAddressAlreadyRegistered ---
    console.log('3. Testing isSecondaryAddressAlreadyRegistered...');
    for (const address of testData.addresses) {
      try {
        const isRegistered = await sdk.isSecondaryAddressAlreadyRegistered(address, config.rpcUrl);
        console.log(`   ${address}: ${isRegistered ? '✅ Registered' : '❌ Not Registered'}`);
      } catch (error) {
        console.log(`   ${address}: ❌ Error - ${error.message}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 4. Test isUnifiedIDAlreadyRegistered ---
    console.log('4. Testing isUnifiedIDAlreadyRegistered...');
    for (const unifiedId of testData.unifiedIds) {
      try {
        const isRegistered = await sdk.isUnifiedIDAlreadyRegistered(unifiedId, config.rpcUrl);
        console.log(`   ${unifiedId}: ${isRegistered ? '✅ Registered' : '❌ Not Registered'}`);
      } catch (error) {
        console.log(`   ${unifiedId}: ❌ Error - ${error.message}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 5. Test getMasterWalletforUnifiedID ---
    console.log('5. Testing getMasterWalletforUnifiedID...');
    for (const unifiedId of testData.unifiedIds) {
      try {
        const masterWallet = await sdk.getMasterWalletforUnifiedID(unifiedId, config.rpcUrl);
        console.log(`   ${unifiedId}: ${masterWallet}`);
      } catch (error) {
        console.log(`   ${unifiedId}: ❌ Error - ${error.message}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 6. Test getPrimaryWalletforUnifiedID ---
    console.log('6. Testing getPrimaryWalletforUnifiedID...');
    for (const unifiedId of testData.unifiedIds) {
      try {
        const primaryWallet = await sdk.getPrimaryWalletforUnifiedID(unifiedId, config.rpcUrl);
        console.log(`   ${unifiedId}: ${primaryWallet}`);
      } catch (error) {
        console.log(`   ${unifiedId}: ❌ Error - ${error.message}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 7. Test getSecondaryWalletsforUnifiedID ---
    console.log('7. Testing getSecondaryWalletsforUnifiedID...');
    for (const unifiedId of testData.unifiedIds) {
      try {
        const secondaryWallets = await sdk.getSecondaryWalletsforUnifiedID(unifiedId, config.rpcUrl);
        console.log(`   ${unifiedId}: [${secondaryWallets.join(', ')}] (${secondaryWallets.length} wallets)`);
      } catch (error) {
        console.log(`   ${unifiedId}: ❌ Error - ${error.message}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 8. Test getUnifiedIDByPrimaryAddress ---
    console.log('8. Testing getUnifiedIDByPrimaryAddress...');
    for (const address of testData.addresses) {
      try {
        const unifiedId = await sdk.getUnifiedIDByPrimaryAddress(address, config.chainId, config.rpcUrl);
        console.log(`   ${address}: "${unifiedId}"`);
      } catch (error) {
        console.log(`   ${address}: ❌ Error - ${error.message}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 9. Test getRegistrationFees ---
    console.log('9. Testing getRegistrationFees...');
    for (const token of testData.tokens) {
      for (const fees of testData.registrarFees) {
        try {
          const requiredAmount = await sdk.getRegistrationFees(token, fees, config.rpcUrl);
          console.log(`   Token: ${token}, Fees: ${fees} → Required: ${requiredAmount}`);
        } catch (error) {
          console.log(`   Token: ${token}, Fees: ${fees} → ❌ Error - ${error.message}`);
        }
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 10. Test validateSignature ---
    console.log('10. Testing validateSignature...');
    for (let i = 0; i < testData.privateKeys.length; i++) {
      try {
        // Create a wallet and sign a message
        const wallet = new ethers.Wallet(testData.privateKeys[i]);
        const expectedSigner = wallet.address;
        
        // Create the data that matches the SDK's signature format
        const unifiedId = 'test_unified_id';
        const userAddress = expectedSigner;
        const nonce = 1;
        
        // Create the data exactly as the SDK does
        const inner = ethers.utils.defaultAbiCoder.encode(
          ['string', 'address'],
          [unifiedId, userAddress]
        );
        const packed = ethers.utils.solidityPack(['bytes', 'uint256'], [inner, nonce]);
        
        // Create the hash that the SDK actually signs
        const hash = ethers.utils.keccak256(packed);
        
        // Sign the hash (this is what the SDK actually does)
        const signature = await wallet.signMessage(ethers.utils.arrayify(hash));
        
        // Validate signature using SDK - pass the packed data (original data, not the hash)
        // The contract will hash the packed data internally and then verify the signature
        const isValid = await sdk.validateSignature(packed, expectedSigner, signature, config.rpcUrl);
        console.log(`   Wallet ${i + 1} (${expectedSigner}): ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      } catch (error) {
        console.log(`   Wallet ${i + 1}: ❌ Error - ${error.message}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // Summary
    console.log('🎉 Utility Functions Test Completed!');
    console.log('📊 Check the results above for success/failure');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
utilityFunctionsTest(); 