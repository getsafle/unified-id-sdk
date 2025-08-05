//  Utility Functions Test
//
// INSTRUCTIONS:
// 1. This script tests all utility functions using the SDK instance.
// 2. Uses real contract data for testing.
// 3. Simple and easy to read format.
// 4. Run this file with: node tests/utility-functions-simple.test.js
//

const { UnifiedIdSDK} = require('../src/index');
const { ethers } = require('ethers');

// Test configuration
const config = {
  baseURL: 'https://api.test.com',
  authToken: 'test-token',
  chainId: '11155111',
  environment: 'testnet',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'
};

function checkConfig(cfg) {
  const required = ['baseURL', 'authToken', 'chainId', 'environment'];
  for (const key of required) {
    if (!cfg[key]) throw new Error(`Missing required config: ${key}`);
  }
}

function extractReadableError(error) {
  // Handle ethers.js errors
  if (error.code === 'CALL_EXCEPTION') {
    if (error.reason) {
      return error.reason;
    }
    if (error.errorArgs && error.errorArgs.length > 0) {
      return error.errorArgs[0];
    }
  }
  
  // Handle validation errors
  if (error.code === 'INVALID_ARGUMENT') {
    if (error.argument) {
      return `Invalid ${error.argument}: ${error.value}`;
    }
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error - check RPC URL';
  }
  
  // Handle timeout errors
  if (error.code === 'TIMEOUT') {
    return 'Request timeout';
  }
  
  // For other errors, return a simplified message
  if (error.message) {
    // Remove long hex data and URLs from error messages
    let message = error.message;
    message = message.replace(/data="0x[0-9a-fA-F]+"/g, '');
    message = message.replace(/\[ See: https:\/\/links\.ethers\.org\/[^\]]+ \]/g, '');
    message = message.replace(/\(method="[^"]+"/g, '');
    message = message.replace(/errorArgs=\[[^\]]+\]/g, '');
    message = message.replace(/errorName="[^"]*"/g, '');
    message = message.replace(/errorSignature="[^"]*"/g, '');
    message = message.replace(/reason="[^"]*"/g, '');
    message = message.replace(/code=[A-Z_]+/g, '');
    message = message.replace(/version=[^,]+/g, '');
    message = message.replace(/,\s*,/g, ',');
    message = message.replace(/\(\s*\)/g, '');
    message = message.replace(/^\s*,\s*/, '');
    message = message.replace(/\s*,\s*$/, '');
    message = message.trim();
    
    return message;
  }
  
  return 'Unknown error occurred';
}

async function utilityFunctionsTest() {
  checkConfig(config);
  console.log('🚀 Utility Functions Test\n');
  console.log('📋 Test Configuration:');
  console.log(`   Environment: ${config.environment}`);
  console.log(`   Chain ID: ${config.chainId}`);
  console.log(`   RPC URL: ${config.rpcUrl}\n`);
  
  const sdk = new UnifiedIdSDK(config);

  try {
    // --- 1. Test isValidUnifiedID ---
    console.log('1. Testing isValidUnifiedID...');
    const validUnifiedIds = ['safle_2', 'karan_test_2', '5Aug_1', '5Aug_2', '123456789123456789123456789'];
    for (const unifiedId of validUnifiedIds) {
      try {
        const isValid = await sdk.isValidUnifiedID(unifiedId, config.rpcUrl);
        console.log(`   ${unifiedId}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      } catch (error) {
        const errorMessage = extractReadableError(error);
        console.log(`   ${unifiedId}: ❌ Error - ${errorMessage}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 2. Test isPrimaryAddressAlreadyRegistered ---
    console.log('2. Testing isPrimaryAddressAlreadyRegistered...');
    const primaryAddresses = [
      '0xE4A39201c4585450BfE2144ba3Ec3aa9d2198Aa4', // safle_2 primary
      '0x2502875cC092d96792Ac1744A6CEFd04d2cf555F', // karan_test_2 primary
      '0x0000000000000000000000000000000000000000', // zero address
      '0x1234567890123456789012345678901234567890'  // random address
    ];
    for (const address of primaryAddresses) {
      try {
        const isRegistered = await sdk.isPrimaryAddressAlreadyRegistered(address, config.rpcUrl);
        console.log(`   ${address}: ${isRegistered ? '✅ Registered' : '❌ Not Registered'}`);
      } catch (error) {
        const errorMessage = extractReadableError(error);
        console.log(`   ${address}: ❌ Error - ${errorMessage}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 3. Test isSecondaryAddressAlreadyRegistered ---
    console.log('3. Testing isSecondaryAddressAlreadyRegistered...');
    const secondaryAddresses = [
      '0xe91f41ea0c1a670c495becf45c5bd6eb1b1cdf1', // secondary address
      '0x3f16300342B9118f5B0F4753eCeb504d94D07217', // another secondary
      '0x0000000000000000000000000000000000000000', // zero address
      '0x1234567890123456789012345678901234567890'  // random address
    ];
    for (const address of secondaryAddresses) {
      try {
        const isRegistered = await sdk.isSecondaryAddressAlreadyRegistered(address, config.rpcUrl);
        console.log(`   ${address}: ${isRegistered ? '✅ Registered' : '❌ Not Registered'}`);
      } catch (error) {
        const errorMessage = extractReadableError(error);
        console.log(`   ${address}: ❌ Error - ${errorMessage}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 4. Test isUnifiedIDAlreadyRegistered ---
    console.log('4. Testing isUnifiedIDAlreadyRegistered...');
    const registeredUnifiedIds = ['safle_2', 'karan_test_2', 'nonexistent_id', '5Aug_1'];
    for (const unifiedId of registeredUnifiedIds) {
      try {
        const isRegistered = await sdk.isUnifiedIDAlreadyRegistered(unifiedId, config.rpcUrl);
        console.log(`   ${unifiedId}: ${isRegistered ? '✅ Registered' : '❌ Not Registered'}`);
      } catch (error) {
        const errorMessage = extractReadableError(error);
        console.log(`   ${unifiedId}: ❌ Error - ${errorMessage}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 5. Test getMasterWalletforUnifiedID ---
    console.log('5. Testing getMasterWalletforUnifiedID...');
    const masterWalletUnifiedIds = ['safle_2', 'karan_test_2', 'nonexistent_id', '5Aug_2'];
    for (const unifiedId of masterWalletUnifiedIds) {
      try {
        const masterWallet = await sdk.getMasterWalletforUnifiedID(unifiedId, config.rpcUrl);
        console.log(`   ${unifiedId}: ${masterWallet}`);
      } catch (error) {
        const errorMessage = extractReadableError(error);
        console.log(`   ${unifiedId}: ❌ Error - ${errorMessage}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 6. Test getPrimaryWalletforUnifiedID ---
    console.log('6. Testing getPrimaryWalletforUnifiedID...');
    const primaryWalletUnifiedIds = ['safle_2', 'karan_test_2', 'nonexistent_id'];
    for (const unifiedId of primaryWalletUnifiedIds) {
      try {
        const primaryWallet = await sdk.getPrimaryWalletforUnifiedID(unifiedId, config.rpcUrl);
        console.log(`   ${unifiedId}: ${primaryWallet}`);
      } catch (error) {
        const errorMessage = extractReadableError(error);
        console.log(`   ${unifiedId}: ❌ Error - ${errorMessage}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 7. Test getSecondaryWalletsforUnifiedID ---
    console.log('7. Testing getSecondaryWalletsforUnifiedID...');
    const secondaryWalletUnifiedIds = ['safle_2', 'karan_test_2', 'nonexistent_id', '5Aug_1'];
    for (const unifiedId of secondaryWalletUnifiedIds) {
      try {
        const secondaryWallets = await sdk.getSecondaryWalletsforUnifiedID(unifiedId, config.rpcUrl);
        console.log(`   ${unifiedId}: [${secondaryWallets.join(', ')}] (${secondaryWallets.length} wallets)`);
      } catch (error) {
        const errorMessage = extractReadableError(error);
        console.log(`   ${unifiedId}: ❌ Error - ${errorMessage}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 8. Test getUnifiedIDByPrimaryAddress ---
    console.log('8. Testing getUnifiedIDByPrimaryAddress...');
    const primaryAddressesForLookup = [
      '0xE4A39201c4585450BfE2144ba3Ec3aa9d2198Aa4', // safle_2 primary
      '0x2502875cC092d96792Ac1744A6CEFd04d2cf555F', // karan_test_2 primary
      '0x0000000000000000000000000000000000000000', // zero address
      '0x1234567890123456789012345678901234567890'  // random address
    ];
    for (const address of primaryAddressesForLookup) {
      try {
        const unifiedId = await sdk.getUnifiedIDByPrimaryAddress(address, config.chainId, config.rpcUrl);
        console.log(`   ${address}: "${unifiedId}"`);
      } catch (error) {
        const errorMessage = extractReadableError(error);
        console.log(`   ${address}: ❌ Error - ${errorMessage}`);
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 9. Test getRegistrationFees ---
    console.log('9. Testing getRegistrationFees...');
    const registrationTokens = [
      '0x0000000000000000000000000000000000000000', // ETH
      '0xA0b86a33E6441b8c4C8C0b4b8C8C0b4b8C8C0b4b', // Mock USDC
      '0xdAC17F958D2ee523a2206206994597C13D831ec7'  // USDT
    ];
    const registrationFees = [
      '100000000000000000',   // 0.1 ETH
      '1000000000000000000',  // 1 ETH
      '10000000000000000000'  // 10 ETH
    ];
    for (const token of registrationTokens) {
      for (const fees of registrationFees) {
        try {
          const requiredAmount = await sdk.getRegistrationFees(token, fees, config.rpcUrl);
          console.log(`   Token: ${token}, Fees: ${fees} → Required: ${requiredAmount}`);
        } catch (error) {
          const errorMessage = extractReadableError(error);
          console.log(`   Token: ${token}, Fees: ${fees} → ❌ Error - ${errorMessage}`);
        }
      }
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 10. Test validateSignature ---
    console.log('10. Testing validateSignature...');
    const signaturePrivateKeys = [
      '0x1234567890123456789012345678901234567890123456789012345678901234',
      '0x2345678901234567890123456789012345678901234567890123456789012345',
      '0x3456789012345678901234567890123456789012345678901234567890123456'
    ];
    for (let i = 0; i < signaturePrivateKeys.length; i++) {
      try {
        // Create a wallet and sign a message
        const wallet = new ethers.Wallet(signaturePrivateKeys[i]);
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
        const errorMessage = extractReadableError(error);
        console.log(`   Wallet ${i + 1}: ❌ Error - ${errorMessage}`);
      }
    }

    // Test invalid signature
    console.log('   Testing Invalid Signature...');
    try {
      const wallet = new ethers.Wallet(signaturePrivateKeys[0]);
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
      
      // Create an invalid signature (wrong signer)
      const wrongWallet = new ethers.Wallet(signaturePrivateKeys[1]);
      const invalidSignature = await wrongWallet.signMessage(ethers.utils.arrayify(ethers.utils.keccak256(packed)));
      
      // Validate signature using SDK - should fail because wrong signer
      const isValid = await sdk.validateSignature(packed, expectedSigner, invalidSignature, config.rpcUrl);
      console.log(`   Invalid Signature Test: ${isValid ? '✅ Valid (Unexpected)' : '❌ Invalid (Expected)'}`);
    } catch (error) {
      const errorMessage = extractReadableError(error);
      console.log(`   Invalid Signature Test: ❌ Error - ${errorMessage}`);
    }

    // Test completely malformed signature
    console.log('   Testing Malformed Signature...');
    try {
      const wallet = new ethers.Wallet(signaturePrivateKeys[0]);
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
      
      // Create a completely malformed signature
      const malformedSignature = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      // Validate signature using SDK - should fail because malformed signature
      const isValid = await sdk.validateSignature(packed, expectedSigner, malformedSignature, config.rpcUrl);
      console.log(`   Malformed Signature Test: ${isValid ? '✅ Valid (Unexpected)' : '❌ Invalid (Expected)'}`);
    } catch (error) {
      const errorMessage = extractReadableError(error);
      console.log(`   Malformed Signature Test: ❌ Error - ${errorMessage}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

  
    console.log('🎉 Utility Functions Test Completed!');
    console.log('📊 Check the results above for success/failure');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
utilityFunctionsTest(); 