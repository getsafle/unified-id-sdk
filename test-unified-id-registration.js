const { UnifiedIdSDK, isUnifiedIDAlreadyRegistered } = require('./src');

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
  'karan_test_1',                    // Known existing unified ID
  'test_valid_id',                   // Another test ID
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

console.log('🚀 Starting Unified ID Registration Tests...\n');

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
        const isRegistered = await sdk.isUnifiedIDAlreadyRegistered(unifiedId, rpcUrl);
        console.log(`   Registration Status: ${isRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
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
        const isRegistered = await isUnifiedIDAlreadyRegistered(unifiedId, '0x21068b37d05575B4D7DFa5393c7b140f65dA0355', rpcUrl);
        console.log(`   Registration Status: ${isRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
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
    
    // Test with the known existing unified ID
    const knownUnifiedId = 'karan_test_1';
    console.log(`🔍 Testing known unified ID: "${knownUnifiedId}"`);
    
    const isRegistered = await sdk.isUnifiedIDAlreadyRegistered(knownUnifiedId, rpcUrl);
    console.log(`   Registration Status: ${isRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
    
    if (isRegistered) {
      console.log('✅ Successfully detected registered unified ID');
    } else {
      console.log('ℹ️  Unified ID is not registered (this is expected for test IDs)');
    }
    
    // Test with a non-existent ID
    const nonExistentId = 'definitely_not_registered_id_12345';
    console.log(`\n🔍 Testing non-existent unified ID: "${nonExistentId}"`);
    
    const isNonExistentRegistered = await sdk.isUnifiedIDAlreadyRegistered(nonExistentId, rpcUrl);
    console.log(`   Registration Status: ${isNonExistentRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
    
    if (!isNonExistentRegistered) {
      console.log('✅ Correctly identified non-existent unified ID');
    } else {
      console.log('⚠️  Unexpected result for non-existent unified ID');
    }
    
  } catch (error) {
    console.log(`❌ Specific case test failed: ${error.message}`);
  }
}

async function testEdgeCases() {
  console.log('=== Testing Edge Cases ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    
    // Test empty string
    console.log('🔍 Testing empty string: ""');
    try {
      const isEmptyRegistered = await sdk.isUnifiedIDAlreadyRegistered('', rpcUrl);
      console.log(`   Registration Status: ${isEmptyRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    // Test null/undefined
    console.log('\n🔍 Testing null value');
    try {
      const isNullRegistered = await sdk.isUnifiedIDAlreadyRegistered(null, rpcUrl);
      console.log(`   Registration Status: ${isNullRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Edge case test failed: ${error.message}`);
  }
}

async function runTests() {
  await testSDKInstance();
  console.log('\n' + '='.repeat(50) + '\n');
  await testDirectFunctions();
  console.log('\n' + '='.repeat(50) + '\n');
  await testSpecificCases();
  console.log('\n' + '='.repeat(50) + '\n');
  await testEdgeCases();
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error); 