const { UnifiedIdSDK, getMasterWalletforUnifiedID } = require('./src');

// Configuration
const config = {
  baseURL: 'https://api.example.com',
  authToken: 'your-auth-token',
  environment: 'testnet',
  chainId: '11155111'
};

const rpcUrl = 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925';

// Test unified IDs
const testUnifiedIds = [
  'karan_test_2',                    // Known registered unified ID
  'karan_test_1',                    // Previous test ID
  'nonexistent_id_12345',            // Non-existent ID
  'another_test_id',                 // Another test ID
  'very_long_unified_id_test_case',  // Long ID
  'test@#$%^&*()',                  // Special characters
  'TEST_UPPERCASE',                  // Uppercase
  'test123numbers',                  // With numbers
  '',                                // Empty string
  'a',                               // Too short
  'very_long_unified_id_that_exceeds_maximum_length_should_be_invalid' // Too long
];

console.log('🚀 Starting Get Master Wallet Tests...\n');

async function testSDKInstance() {
  console.log('=== Testing SDK Instance Methods ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    console.log('✅ SDK initialized successfully');
    console.log(`🌐 RPC URL: ${rpcUrl}`);
    console.log(`🔗 Chain ID: ${config.chainId}`);
    console.log(`🌍 Environment: ${config.environment}\n`);

    for (const unifiedId of testUnifiedIds) {
      console.log(`🔍 Testing unified ID: "${unifiedId}"`);
      
      try {
        const masterWallet = await sdk.getMasterWalletforUnifiedID(unifiedId, rpcUrl);
        console.log(`   Master Wallet: ${masterWallet}`);
        
        if (masterWallet === "0x0000000000000000000000000000000000000000") {
          console.log(`   Status: ❌ NOT REGISTERED (Zero Address)`);
        } else {
          console.log(`   Status: ✅ REGISTERED`);
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        console.log('');
      }
    }
  } catch (error) {
    console.log(`❌ SDK initialization failed: ${error.message}`);
  }
}

async function testDirectFunctions() {
  console.log('=== Testing Direct Utility Functions ===\n');
  
  try {
    for (const unifiedId of testUnifiedIds) {
      console.log(`🔍 Testing unified ID: "${unifiedId}"`);
      
      try {
        const masterWallet = await getMasterWalletforUnifiedID(unifiedId, '0x21068b37d05575B4D7DFa5393c7b140f65dA0355', rpcUrl);
        console.log(`   Master Wallet: ${masterWallet}`);
        
        if (masterWallet === "0x0000000000000000000000000000000000000000") {
          console.log(`   Status: ❌ NOT REGISTERED (Zero Address)`);
        } else {
          console.log(`   Status: ✅ REGISTERED`);
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        console.log('');
      }
    }
  } catch (error) {
    console.log(`❌ Direct function test failed: ${error.message}`);
  }
}

async function testSpecificCases() {
  console.log('=== Testing Specific Known Cases ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    
    // Test with the known registered unified ID
    const knownUnifiedId = 'karan_test_2';
    console.log(`🔍 Testing known registered unified ID: "${knownUnifiedId}"`);
    
    const masterWallet = await sdk.getMasterWalletforUnifiedID(knownUnifiedId, rpcUrl);
    console.log(`   Master Wallet: ${masterWallet}`);
    
    if (masterWallet !== "0x0000000000000000000000000000000000000000") {
      console.log('✅ Successfully retrieved master wallet for registered unified ID');
    } else {
      console.log('ℹ️  Unified ID is not registered (zero address returned)');
    }
    
    // Test with a non-existent ID
    const nonExistentId = 'definitely_not_registered_id_12345';
    console.log(`\n🔍 Testing non-existent unified ID: "${nonExistentId}"`);
    
    const nonExistentWallet = await sdk.getMasterWalletforUnifiedID(nonExistentId, rpcUrl);
    console.log(`   Master Wallet: ${nonExistentWallet}`);
    
    if (nonExistentWallet === "0x0000000000000000000000000000000000000000") {
      console.log('✅ Correctly returned zero address for non-existent unified ID');
    } else {
      console.log('⚠️  Unexpected result for non-existent unified ID');
    }
    
  } catch (error) {
    console.log(`❌ Specific case test failed: ${error.message}`);
  }
}

async function testComparison() {
  console.log('=== Testing Comparison with Registration Status ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    
    const testIds = [
      'karan_test_2',    // Known registered ID
      'karan_test_1',    // Previous test ID
      'nonexistent_id'   // Non-existent ID
    ];
    
    for (const id of testIds) {
      console.log(`🔍 Testing unified ID: "${id}"`);
      
      try {
        // Get master wallet
        const masterWallet = await sdk.getMasterWalletforUnifiedID(id, rpcUrl);
        console.log(`   Master Wallet: ${masterWallet}`);
        
        // Check registration status
        const isRegistered = await sdk.isUnifiedIDAlreadyRegistered(id, rpcUrl);
        console.log(`   Registration Status: ${isRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
        
        // Verify consistency
        const expectedRegistered = masterWallet !== "0x0000000000000000000000000000000000000000";
        if (isRegistered === expectedRegistered) {
          console.log(`   ✅ Consistency Check: PASSED`);
        } else {
          console.log(`   ❌ Consistency Check: FAILED`);
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        console.log('');
      }
    }
    
  } catch (error) {
    console.log(`❌ Comparison test failed: ${error.message}`);
  }
}

async function runTests() {
  await testSDKInstance();
  console.log('\n' + '='.repeat(50) + '\n');
  await testDirectFunctions();
  console.log('\n' + '='.repeat(50) + '\n');
  await testSpecificCases();
  console.log('\n' + '='.repeat(50) + '\n');
  await testComparison();
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error); 