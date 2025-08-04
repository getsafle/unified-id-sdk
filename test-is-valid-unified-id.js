const { UnifiedIdSDK } = require('./src/index');

// Test configuration
const config = {
  baseURL: 'https://dev-rq-id.getsafle.com',
  authToken: 'eJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Imh1c2llbiIsImlhdCI6MTUxNjIzOTAyMn0.I6C9sJ9JD1j21td45PwLKMyJTqbhaefFSfcYcTN2GWQ',
  chainId: 11155111, // Sepolia testnet
  environment: 'testnet'
};

// Test unified IDs
const testUnifiedIds = [
  'karan_test_1',           // Should be valid (we know this exists)
  'test_valid_id',          // Test another valid ID
  'invalid@id',             // Invalid characters
  'a',                      // Too short
  'very_long_unified_id_that_exceeds_maximum_length_should_be_invalid', // Too long
  '',                       // Empty string
  'test@#$%^&*()',         // Invalid characters
  'test-id-with-dashes',    // Valid format
  'test_id_with_underscores', // Valid format
  'TEST_UPPERCASE',         // Valid format
  'test123numbers',         // Valid format
];

// RPC URL for Sepolia testnet
const rpcUrl = 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925';

async function testIsValidUnifiedID() {
  try {
    console.log('=== Testing isValidUnifiedID ===\n');
    
    // Initialize SDK
    const sdk = new UnifiedIdSDK(config);
    console.log('✅ SDK initialized successfully');
    
    console.log(`🌐 RPC URL: ${rpcUrl}`);
    console.log(`🔗 Chain ID: ${config.chainId}`);
    console.log(`🌍 Environment: ${config.environment}`);
    console.log('');
    
    // Test each unified ID
    for (const unifiedId of testUnifiedIds) {
      try {
        console.log(`🔍 Testing unified ID: "${unifiedId}"`);
        const isValid = await sdk.isValidUnifiedID(unifiedId, rpcUrl);
        
        console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        console.log('');
        
      } catch (error) {
        console.log(`   Error: ${error.message}`);
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing isValidUnifiedID:');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
  }
}

// Also test the direct utility function
async function testDirectUtilityFunction() {
  try {
    console.log('\n=== Testing Direct Utility Function ===\n');
    
    const { isValidUnifiedID, getStorageUtilContractAddress } = require('./src/index');
    
    // Get storage util contract address
    const utilAddress = getStorageUtilContractAddress(config);
    console.log(`🏗️  Storage util contract address: ${utilAddress}`);
    
    // Test a few specific cases
    const testCases = [
      'karan_test_1',
      'invalid@id',
      'test_valid_id'
    ];
    
    for (const unifiedId of testCases) {
      try {
        console.log(`📡 Testing direct isValidUnifiedID for: "${unifiedId}"`);
        const isValid = await isValidUnifiedID(unifiedId, utilAddress, rpcUrl);
        console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        console.log('');
      } catch (error) {
        console.log(`   Error: ${error.message}`);
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing direct utility function:');
    console.error('   Error message:', error.message);
  }
}

// Test with specific known cases
async function testSpecificCases() {
  try {
    console.log('\n=== Testing Specific Known Cases ===\n');
    
    const sdk = new UnifiedIdSDK(config);
    
    // Test the unified ID we know exists
    console.log('🔍 Testing known valid unified ID: "karan_test_1"');
    const isValid = await sdk.isValidUnifiedID('karan_test_1', rpcUrl);
    console.log(`   Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (isValid) {
      console.log('✅ Successfully validated existing unified ID');
    } else {
      console.log('❌ Failed to validate existing unified ID');
    }
    
  } catch (error) {
    console.error('❌ Error testing specific cases:');
    console.error('   Error message:', error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting isValidUnifiedID tests...\n');
  
  await testIsValidUnifiedID();
  await testDirectUtilityFunction();
  await testSpecificCases();
  
  console.log('\n✨ Tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testIsValidUnifiedID,
  testDirectUtilityFunction,
  testSpecificCases
}; 