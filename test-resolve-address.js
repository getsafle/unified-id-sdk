const { UnifiedIdSDK } = require('./src/index');

// Test configuration
const config = {
  baseURL: 'https://dev-rq-id.getsafle.com',
  authToken: 'eJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Imh1c2llbiIsImlhdCI6MTUxNjIzOTAyMn0.I6C9sJ9JD1j21td45PwLKMyJTqbhaefFSfcYcTN2GWQ',
  chainId: 11155111, // Sepolia testnet
  environment: 'testnet'
};

// Test address
const testAddress = '0x87530f4aa554ac2e6f420848450342b0971afa74';

// RPC URL for Sepolia testnet
const rpcUrl = 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925'; // Replace with your actual RPC URL

async function testResolveAnyAddressToUnifiedId() {
  try {
    console.log('=== Testing resolveAnyAddressToUnifiedId ===\n');
    
    // Initialize SDK
    const sdk = new UnifiedIdSDK(config);
    console.log('✅ SDK initialized successfully');
    
    console.log(`🔍 Testing address: ${testAddress}`);
    console.log(`🌐 RPC URL: ${rpcUrl}`);
    console.log(`🔗 Chain ID: ${config.chainId}`);
    console.log(`🌍 Environment: ${config.environment}`);
    console.log('');
    
    // Test the function
    console.log('📡 Calling resolveAnyAddressToUnifiedId...');
    const result = await sdk.resolveAnyAddressToUnifiedId(testAddress, rpcUrl);
    
    console.log('✅ Function executed successfully!');
    console.log('');
    console.log('📊 Results:');
    console.log(`   Unified ID: "${result.unifiedId}"`);
    console.log(`   Is Primary: ${result.isPrimary}`);
    console.log(`   Is Secondary: ${result.isSecondary}`);
    console.log('');
    
    // Additional analysis
    if (result.unifiedId === '') {
      console.log('ℹ️  This address is not associated with any unified ID');
    } else {
      console.log(`✅ This address is associated with unified ID: "${result.unifiedId}"`);
      if (result.isPrimary) {
        console.log('👑 This address is a PRIMARY address');
      } else if (result.isSecondary) {
        console.log('🔗 This address is a SECONDARY address');
      } else {
        console.log('❓ This address has an unknown role');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing resolveAnyAddressToUnifiedId:');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    // Provide helpful debugging information
    console.log('');
    console.log('🔧 Debugging tips:');
    console.log('   1. Make sure you have a valid RPC URL');
    console.log('   2. Check if the child contract is deployed on the network');
    console.log('   3. Verify the contract address in config');
    console.log('   4. Ensure the address format is correct');
  }
}

// Also test the direct utility function
async function testDirectUtilityFunction() {
  try {
    console.log('\n=== Testing Direct Utility Function ===\n');
    
    const { resolveAnyAddressToUnifiedId, getChildContractAddress } = require('./src/index');
    
    // Get child contract address
    const childAddress = getChildContractAddress(config);
    console.log(`🏗️  Child contract address: ${childAddress}`);
    
    console.log('📡 Calling direct resolveAnyAddressToUnifiedId...');
    const result = await resolveAnyAddressToUnifiedId(testAddress, childAddress, rpcUrl);
    
    console.log('✅ Direct function executed successfully!');
    console.log('');
    console.log('📊 Results:');
    console.log(`   Unified ID: "${result.unifiedId}"`);
    console.log(`   Is Primary: ${result.isPrimary}`);
    console.log(`   Is Secondary: ${result.isSecondary}`);
    
  } catch (error) {
    console.error('❌ Error testing direct utility function:');
    console.error('   Error message:', error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting resolveAnyAddressToUnifiedId tests...\n');
  
  await testResolveAnyAddressToUnifiedId();
  await testDirectUtilityFunction();
  
  console.log('\n✨ Tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testResolveAnyAddressToUnifiedId,
  testDirectUtilityFunction
}; 