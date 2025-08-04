const { UnifiedIdSDK, validateSignature, createSignatureMessage } = require('./src/index');
const { ethers } = require('ethers');

// Test configuration
const testConfig = {
  environment: 'testnet',
  chainId: '11155111',
  rpcUrl: 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925',
  baseURL: 'https://api.example.com',
  authToken: 'test-token'
};

console.log('🚀 Testing validateSignature...\n');

// Test data
const testData = {
  // Test private keys (for generating signatures)
  privateKeys: [
    '0x1234567890123456789012345678901234567890123456789012345678901234', // Test key 1
    '0x2345678901234567890123456789012345678901234567890123456789012345', // Test key 2
    '0x3456789012345678901234567890123456789012345678901234567890123456'  // Test key 3
  ],
  
  // Test messages to sign
  messages: [
    'Hello World',
    'Test Message',
    'Another Test Message'
  ],
  
  // Test data for signature validation
  testCases: [
    {
      name: 'Valid signature test',
      data: '0x1234567890abcdef',
      expectedSigner: '0xE4A39201c4585450BfE2144ba3Ec3aa9d2198Aa4',
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b'
    },
    {
      name: 'Invalid signature test',
      data: '0x1234567890abcdef',
      expectedSigner: '0xE4A39201c4585450BfE2144ba3Ec3aa9d2198Aa4',
      signature: '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    }
  ]
};

async function testSDKInstance() {
  console.log('=== Testing SDK Instance Method ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(testConfig);
    console.log('✅ SDK initialized successfully');
    console.log(`🌐 RPC URL: ${testConfig.rpcUrl}`);
    console.log(`🔗 Chain ID: ${testConfig.chainId}`);
    console.log(`🌍 Environment: ${testConfig.environment}\n`);

    // Test with real signature generation
    for (let i = 0; i < testData.privateKeys.length; i++) {
      const privateKey = testData.privateKeys[i];
      const message = testData.messages[i];
      
      try {
        // Create a wallet and sign a message
        const wallet = new ethers.Wallet(privateKey);
        const expectedSigner = wallet.address;
        
        // Create signature message using SDK function
        const signatureMessage = createSignatureMessage('register', {
          unifiedId: 'test_unified_id',
          userAddress: expectedSigner,
          nonce: 1
        });
        
        // Sign the message
        const signature = await wallet.signMessage(ethers.utils.arrayify(signatureMessage));
        
        console.log(`🔍 Testing signature validation for wallet: ${expectedSigner}`);
        console.log(`   Message: ${signatureMessage}`);
        console.log(`   Signature: ${signature}`);
        
        // Validate signature using SDK
        const isValid = await sdk.validateSignature(signatureMessage, expectedSigner, signature, testConfig.rpcUrl);
        console.log(`   ✅ Validation Result: ${isValid ? 'Valid' : 'Invalid'}\n`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.log(`❌ SDK test failed: ${error.message}\n`);
  }
}

async function testDirectFunction() {
  console.log('=== Testing Direct Utility Function ===\n');
  
  try {
    const contractAddress = require('./src/config').STORAGE_UTIL_CONTRACT_ADDRESS_MAP[testConfig.environment][testConfig.chainId];
    console.log(`🏗️  Contract Address: ${contractAddress}\n`);

    // Test with real signature generation
    for (let i = 0; i < testData.privateKeys.length; i++) {
      const privateKey = testData.privateKeys[i];
      const message = testData.messages[i];
      
      try {
        // Create a wallet and sign a message
        const wallet = new ethers.Wallet(privateKey);
        const expectedSigner = wallet.address;
        
        // Create signature message using SDK function
        const signatureMessage = createSignatureMessage('register', {
          unifiedId: 'test_unified_id',
          userAddress: expectedSigner,
          nonce: 1
        });
        
        // Sign the message
        const signature = await wallet.signMessage(ethers.utils.arrayify(signatureMessage));
        
        console.log(`🔍 Testing signature validation for wallet: ${expectedSigner}`);
        console.log(`   Message: ${signatureMessage}`);
        console.log(`   Signature: ${signature}`);
        
        // Validate signature using direct function
        const isValid = await validateSignature(signatureMessage, expectedSigner, signature, contractAddress, testConfig.rpcUrl);
        console.log(`   ✅ Validation Result: ${isValid ? 'Valid' : 'Invalid'}\n`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.log(`❌ Direct function test failed: ${error.message}\n`);
  }
}

async function testComparison() {
  console.log('=== Testing SDK vs Direct Function Consistency ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(testConfig);
    const contractAddress = require('./src/config').STORAGE_UTIL_CONTRACT_ADDRESS_MAP[testConfig.environment][testConfig.chainId];
    
    // Test with one wallet
    const privateKey = testData.privateKeys[0];
    const wallet = new ethers.Wallet(privateKey);
    const expectedSigner = wallet.address;
    
    // Create signature message
    const signatureMessage = createSignatureMessage('register', {
      unifiedId: 'test_unified_id',
      userAddress: expectedSigner,
      nonce: 1
    });
    
    // Sign the message
    const signature = await wallet.signMessage(ethers.utils.arrayify(signatureMessage));
    
    console.log(`🔍 Testing consistency for wallet: ${expectedSigner}`);
    console.log(`   Message: ${signatureMessage}`);
    console.log(`   Signature: ${signature}\n`);
    
    // Test SDK method
    const sdkResult = await sdk.validateSignature(signatureMessage, expectedSigner, signature, testConfig.rpcUrl);
    console.log(`   SDK Result: ${sdkResult ? 'Valid' : 'Invalid'}`);
    
    // Test direct function
    const directResult = await validateSignature(signatureMessage, expectedSigner, signature, contractAddress, testConfig.rpcUrl);
    console.log(`   Direct Result: ${directResult ? 'Valid' : 'Invalid'}`);
    
    // Compare results
    console.log(`   Consistency: ${sdkResult === directResult ? '✅ Match' : '❌ Mismatch'}\n`);
    
  } catch (error) {
    console.log(`❌ Comparison test failed: ${error.message}\n`);
  }
}

async function testEdgeCases() {
  console.log('=== Testing Edge Cases ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(testConfig);
    
    console.log('🔍 Testing with empty/null parameters...\n');
    
    // Test with empty data
    console.log('📋 Testing with empty data:');
    try {
      const result = await sdk.validateSignature('', '0x1234567890123456789012345678901234567890', '0x1234567890abcdef', testConfig.rpcUrl);
      console.log(`   Result: ${result}`);
    } catch (error) {
      console.log(`   ✅ Expected error: ${error.message}`);
    }
    
    // Test with null expectedSigner
    console.log('\n📋 Testing with null expectedSigner:');
    try {
      const result = await sdk.validateSignature('0x1234567890abcdef', null, '0x1234567890abcdef', testConfig.rpcUrl);
      console.log(`   Result: ${result}`);
    } catch (error) {
      console.log(`   ✅ Expected error: ${error.message}`);
    }
    
    // Test with empty signature
    console.log('\n📋 Testing with empty signature:');
    try {
      const result = await sdk.validateSignature('0x1234567890abcdef', '0x1234567890123456789012345678901234567890', '', testConfig.rpcUrl);
      console.log(`   Result: ${result}`);
    } catch (error) {
      console.log(`   ✅ Expected error: ${error.message}`);
    }
    
    // Test with invalid signature format
    console.log('\n📋 Testing with invalid signature format:');
    try {
      const result = await sdk.validateSignature('0x1234567890abcdef', '0x1234567890123456789012345678901234567890', 'invalid_signature', testConfig.rpcUrl);
      console.log(`   Result: ${result}`);
    } catch (error) {
      console.log(`   ✅ Expected error: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Edge case test failed: ${error.message}\n`);
  }
}

async function runAllTests() {
  await testSDKInstance();
  console.log('='.repeat(50) + '\n');
  
  await testDirectFunction();
  console.log('='.repeat(50) + '\n');
  
  await testComparison();
  console.log('='.repeat(50) + '\n');
  
  await testEdgeCases();
  console.log('='.repeat(50) + '\n');
  
  console.log('🎉 validateSignature Tests Completed!\n');
  console.log('📊 Check the results above for success/failure');
}

runAllTests().catch(console.error); 