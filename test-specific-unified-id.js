const { UnifiedIdSDK, isUnifiedIDAlreadyRegistered } = require('./src');

// Configuration
const config = {
  baseURL: 'https://api.example.com',
  authToken: 'your-auth-token',
  environment: 'testnet',
  chainId: '11155111'
};

const rpcUrl = 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925';

// Test the specific unified ID
const testUnifiedId = 'karan_test_2';

console.log('🚀 Testing Specific Unified ID Registration...\n');

async function testSDKInstance() {
  console.log('=== Testing SDK Instance Method ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    console.log('✅ SDK initialized successfully');
    console.log(`🌐 RPC URL: ${rpcUrl}`);
    console.log(`🔗 Chain ID: ${config.chainId}`);
    console.log(`🌍 Environment: ${config.environment}\n`);

    console.log(`🔍 Testing unified ID: "${testUnifiedId}"`);
    
    const isRegistered = await sdk.isUnifiedIDAlreadyRegistered(testUnifiedId, rpcUrl);
    console.log(`   Registration Status: ${isRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
    
    if (isRegistered) {
      console.log('✅ Successfully detected registered unified ID');
    } else {
      console.log('ℹ️  Unified ID is not registered');
    }
    
  } catch (error) {
    console.log(`❌ SDK test failed: ${error.message}`);
  }
}

async function testDirectFunction() {
  console.log('\n=== Testing Direct Utility Function ===\n');
  
  try {
    console.log(`🔍 Testing unified ID: "${testUnifiedId}"`);
    
    const isRegistered = await isUnifiedIDAlreadyRegistered(testUnifiedId, '0x21068b37d05575B4D7DFa5393c7b140f65dA0355', rpcUrl);
    console.log(`   Registration Status: ${isRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
    
    if (isRegistered) {
      console.log('✅ Successfully detected registered unified ID');
    } else {
      console.log('ℹ️  Unified ID is not registered');
    }
    
  } catch (error) {
    console.log(`❌ Direct function test failed: ${error.message}`);
  }
}

async function testComparison() {
  console.log('\n=== Testing Comparison with Other IDs ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    
    const testIds = [
      'karan_test_2',    // The target ID
      'karan_test_1',    // Previous test ID
      'nonexistent_id'   // Non-existent ID
    ];
    
    for (const id of testIds) {
      console.log(`🔍 Testing unified ID: "${id}"`);
      
      try {
        const isRegistered = await sdk.isUnifiedIDAlreadyRegistered(id, rpcUrl);
        console.log(`   Registration Status: ${isRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
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
  await testDirectFunction();
  await testComparison();
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error); 