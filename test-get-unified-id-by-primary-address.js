const { UnifiedIdSDK, getUnifiedIDByPrimaryAddress } = require('./src/index');
const config = require('./src/config');

// Test configuration
const testConfig = {
  environment: 'testnet',
  chainId: '11155111',
  rpcUrl: 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925',
  baseURL: 'https://api.example.com', // Adding baseURL for SDK initialization
  authToken: 'test-token' // Adding authToken for SDK initialization
};

console.log('🚀 Testing getUnifiedIDByPrimaryAddress...\n');

// Test addresses (known primary addresses)
const testAddresses = [
  '0xE4A39201c4585450BfE2144ba3Ec3aa9d2198Aa4', // safle_2 primary
  '0x2502875cC092d96792Ac1744A6CEFd04d2cf555F', // karan_test_2 primary
  '0x87530f4AA554Ac2e6f420848450342b0971afa74', // karan_test_2 master
  '0xfEfD8f17d4C10b9ebC93EA67858147178aa11677', // safle_2 master
  '0x0000000000000000000000000000000000000000', // zero address
  '0x1234567890123456789012345678901234567890'  // random address
];

async function testSDKInstance() {
  console.log('=== Testing SDK Instance Method ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(testConfig);
    console.log('✅ SDK initialized successfully');
    console.log(`🌐 RPC URL: ${testConfig.rpcUrl}`);
    console.log(`🔗 Chain ID: ${testConfig.chainId}`);
    console.log(`🌍 Environment: ${testConfig.environment}\n`);

    for (const address of testAddresses) {
      console.log(`🔍 Testing address: "${address}"`);
      try {
        const unifiedId = await sdk.getUnifiedIDByPrimaryAddress(address, testConfig.chainId, testConfig.rpcUrl);
        console.log(`   ✅ Unified ID: "${unifiedId}"`);
        console.log(`   📝 Status: ${unifiedId ? 'Found' : 'Not found'}\n`);
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
    const contractAddress = config.MOTHER_CONTRACT_ADDRESS_MAP[testConfig.environment][testConfig.chainId];
    console.log(`🏗️  Contract Address: ${contractAddress}\n`);

    for (const address of testAddresses) {
      console.log(`🔍 Testing address: "${address}"`);
      try {
        const unifiedId = await getUnifiedIDByPrimaryAddress(address, testConfig.chainId, contractAddress, testConfig.rpcUrl);
        console.log(`   ✅ Unified ID: "${unifiedId}"`);
        console.log(`   📝 Status: ${unifiedId ? 'Found' : 'Not found'}\n`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.log(`❌ Direct function test failed: ${error.message}\n`);
  }
}

async function testComparison() {
  console.log('=== Testing Comparison with Other Functions ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(testConfig);
    
    for (const address of testAddresses) {
      console.log(`🔍 Testing address: "${address}"`);
      try {
        // Test getUnifiedIDByPrimaryAddress
        const unifiedId = await sdk.getUnifiedIDByPrimaryAddress(address, testConfig.chainId, testConfig.rpcUrl);
        console.log(`   ✅ Unified ID: "${unifiedId}"`);
        
        if (unifiedId && unifiedId !== '') {
          // Test reverse lookup
          const primaryWallet = await sdk.getPrimaryWalletforUnifiedID(unifiedId, testConfig.rpcUrl);
          const masterWallet = await sdk.getMasterWalletforUnifiedID(unifiedId, testConfig.rpcUrl);
          
          console.log(`   🔄 Reverse Lookup:`);
          console.log(`      Primary Wallet: ${primaryWallet}`);
          console.log(`      Master Wallet: ${masterWallet}`);
          
          // Verify consistency
          if (primaryWallet === address || masterWallet === address) {
            console.log(`   ✅ Address consistency verified`);
          } else {
            console.log(`   ⚠️  Address consistency check failed`);
          }
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.log(`❌ Comparison test failed: ${error.message}\n`);
  }
}

async function testEdgeCases() {
  console.log('=== Testing Edge Cases ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(testConfig);
    
    // Test with empty string
    console.log('🔍 Testing with empty string:');
    try {
      const result = await sdk.getUnifiedIDByPrimaryAddress('', testConfig.chainId, testConfig.rpcUrl);
      console.log(`   Result: ${result}`);
    } catch (error) {
      console.log(`   ✅ Expected error: ${error.message}`);
    }
    
    // Test with null
    console.log('\n🔍 Testing with null:');
    try {
      const result = await sdk.getUnifiedIDByPrimaryAddress(null, testConfig.chainId, testConfig.rpcUrl);
      console.log(`   Result: ${result}`);
    } catch (error) {
      console.log(`   ✅ Expected error: ${error.message}`);
    }
    
    // Test with undefined
    console.log('\n🔍 Testing with undefined:');
    try {
      const result = await sdk.getUnifiedIDByPrimaryAddress(undefined, testConfig.chainId, testConfig.rpcUrl);
      console.log(`   Result: ${result}`);
    } catch (error) {
      console.log(`   ✅ Expected error: ${error.message}`);
    }
    
    // Test with invalid chainId
    console.log('\n🔍 Testing with invalid chainId:');
    try {
      const result = await sdk.getUnifiedIDByPrimaryAddress('0xE4A39201c4585450BfE2144ba3Ec3aa9d2198Aa4', null, testConfig.rpcUrl);
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
  await testDirectFunction();
  await testComparison();
  await testEdgeCases();
  
  console.log('✨ Tests completed!');
}

runAllTests().catch(console.error); 