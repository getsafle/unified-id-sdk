const { UnifiedIdSDK, getSecondaryWalletsforUnifiedID } = require('./src');

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

console.log('🚀 Starting Get Secondary Wallets Tests...\n');

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
        const secondaryWallets = await sdk.getSecondaryWalletsforUnifiedID(unifiedId, rpcUrl);
        console.log(`   Secondary Wallets: [${secondaryWallets.join(', ')}]`);
        console.log(`   Count: ${secondaryWallets.length}`);
        
        if (secondaryWallets.length === 0) {
          console.log(`   Status: ❌ NO SECONDARY WALLETS`);
        } else {
          console.log(`   Status: ✅ HAS SECONDARY WALLETS`);
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
        const secondaryWallets = await getSecondaryWalletsforUnifiedID(unifiedId, '0x5f5DAD00aDa66c5bAEE539f4C6DA8975e21bC5c9', rpcUrl);
        console.log(`   Secondary Wallets: [${secondaryWallets.join(', ')}]`);
        console.log(`   Count: ${secondaryWallets.length}`);
        
        if (secondaryWallets.length === 0) {
          console.log(`   Status: ❌ NO SECONDARY WALLETS`);
        } else {
          console.log(`   Status: ✅ HAS SECONDARY WALLETS`);
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
    
    const secondaryWallets = await sdk.getSecondaryWalletsforUnifiedID(knownUnifiedId, rpcUrl);
    console.log(`   Secondary Wallets: [${secondaryWallets.join(', ')}]`);
    console.log(`   Count: ${secondaryWallets.length}`);
    
    if (secondaryWallets.length > 0) {
      console.log('✅ Successfully retrieved secondary wallets for registered unified ID');
    } else {
      console.log('ℹ️  No secondary wallets found for this unified ID');
    }
    
    // Test with a non-existent ID
    const nonExistentId = 'definitely_not_registered_id_12345';
    console.log(`\n🔍 Testing non-existent unified ID: "${nonExistentId}"`);
    
    const nonExistentWallets = await sdk.getSecondaryWalletsforUnifiedID(nonExistentId, rpcUrl);
    console.log(`   Secondary Wallets: [${nonExistentWallets.join(', ')}]`);
    console.log(`   Count: ${nonExistentWallets.length}`);
    
    if (nonExistentWallets.length === 0) {
      console.log('✅ Correctly returned empty array for non-existent unified ID');
    } else {
      console.log('⚠️  Unexpected result for non-existent unified ID');
    }
    
  } catch (error) {
    console.log(`❌ Specific case test failed: ${error.message}`);
  }
}

async function testComparison() {
  console.log('=== Testing Comparison with Other Functions ===\n');
  
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
        // Get secondary wallets
        const secondaryWallets = await sdk.getSecondaryWalletsforUnifiedID(id, rpcUrl);
        console.log(`   Secondary Wallets: [${secondaryWallets.join(', ')}]`);
        console.log(`   Count: ${secondaryWallets.length}`);
        
        // Get primary wallet for comparison
        const primaryWallet = await sdk.getPrimaryWalletforUnifiedID(id, rpcUrl);
        console.log(`   Primary Wallet: ${primaryWallet}`);
        
        // Get master wallet for comparison
        const masterWallet = await sdk.getMasterWalletforUnifiedID(id, rpcUrl);
        console.log(`   Master Wallet: ${masterWallet}`);
        
        // Check if primary wallet is in secondary wallets (shouldn't be)
        if (primaryWallet !== "0x0000000000000000000000000000000000000000" && 
            secondaryWallets.includes(primaryWallet)) {
          console.log(`   ⚠️  Primary wallet found in secondary wallets list`);
        } else if (primaryWallet !== "0x0000000000000000000000000000000000000000") {
          console.log(`   ✅ Primary wallet correctly not in secondary wallets`);
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

async function testArrayHandling() {
  console.log('=== Testing Array Handling ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    
    const testId = 'karan_test_2';
    console.log(`🔍 Testing array handling for unified ID: "${testId}"`);
    
    const secondaryWallets = await sdk.getSecondaryWalletsforUnifiedID(testId, rpcUrl);
    
    console.log(`   Type: ${typeof secondaryWallets}`);
    console.log(`   Is Array: ${Array.isArray(secondaryWallets)}`);
    console.log(`   Length: ${secondaryWallets.length}`);
    
    if (Array.isArray(secondaryWallets)) {
      console.log('✅ Correctly returned array');
      
      // Test array methods
      if (secondaryWallets.length > 0) {
        console.log(`   First element: ${secondaryWallets[0]}`);
        console.log(`   Last element: ${secondaryWallets[secondaryWallets.length - 1]}`);
        
        // Test if all elements are valid addresses
        const allValidAddresses = secondaryWallets.every(addr => 
          addr && addr.startsWith('0x') && addr.length === 42
        );
        console.log(`   All valid addresses: ${allValidAddresses ? '✅' : '❌'}`);
      }
    } else {
      console.log('❌ Did not return array');
    }
    
  } catch (error) {
    console.log(`❌ Array handling test failed: ${error.message}`);
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
  console.log('\n' + '='.repeat(50) + '\n');
  await testArrayHandling();
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error); 