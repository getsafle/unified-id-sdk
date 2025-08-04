const { UnifiedIdSDK, isPrimaryAddressAlreadyRegistered, isSecondaryAddressAlreadyRegistered } = require('./src');

// Configuration
const config = {
  baseURL: 'https://api.example.com',
  authToken: 'your-auth-token',
  environment: 'testnet',
  chainId: '11155111'
};

const rpcUrl = 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925';

// Test addresses
const testAddresses = [
  '0x87530f4aa554ac2e6f420848450342b0971afa74', // Known address from previous tests
  '0x1234567890123456789012345678901234567890', // Random address
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', // Another random address
  '0x0000000000000000000000000000000000000000'  // Zero address
];

console.log('🚀 Starting Primary/Secondary Address Registration Tests...\n');

async function testSDKInstance() {
  console.log('=== Testing SDK Instance Methods ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    console.log('✅ SDK initialized successfully');
    console.log(`🌐 RPC URL: ${rpcUrl}`);
    console.log(`🔗 Chain ID: ${config.chainId}`);
    console.log(`🌍 Environment: ${config.environment}\n`);

    for (const address of testAddresses) {
      console.log(`🔍 Testing address: ${address}`);
      
      try {
        const isPrimary = await sdk.isPrimaryAddressAlreadyRegistered(address, rpcUrl);
        console.log(`   Primary Registration: ${isPrimary ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
        
        const isSecondary = await sdk.isSecondaryAddressAlreadyRegistered(address, rpcUrl);
        console.log(`   Secondary Registration: ${isSecondary ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
        
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
    for (const address of testAddresses) {
      console.log(`🔍 Testing address: ${address}`);
      
      try {
        const isPrimary = await isPrimaryAddressAlreadyRegistered(address, '0x5f5DAD00aDa66c5bAEE539f4C6DA8975e21bC5c9', rpcUrl);
        console.log(`   Primary Registration: ${isPrimary ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
        
        const isSecondary = await isSecondaryAddressAlreadyRegistered(address, '0x5f5DAD00aDa66c5bAEE539f4C6DA8975e21bC5c9', rpcUrl);
        console.log(`   Secondary Registration: ${isSecondary ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
        
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
    
    // Test with the known address from previous tests
    const knownAddress = '0x87530f4aa554ac2e6f420848450342b0971afa74';
    console.log(`🔍 Testing known address: ${knownAddress}`);
    
    const isPrimary = await sdk.isPrimaryAddressAlreadyRegistered(knownAddress, rpcUrl);
    const isSecondary = await sdk.isSecondaryAddressAlreadyRegistered(knownAddress, rpcUrl);
    
    console.log(`   Primary Registration: ${isPrimary ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
    console.log(`   Secondary Registration: ${isSecondary ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
    
    if (isPrimary || isSecondary) {
      console.log('✅ Successfully detected registered address');
    } else {
      console.log('ℹ️  Address is not registered (this is expected for test addresses)');
    }
    
  } catch (error) {
    console.log(`❌ Specific case test failed: ${error.message}`);
  }
}

async function runTests() {
  await testSDKInstance();
  console.log('\n' + '='.repeat(50) + '\n');
  await testDirectFunctions();
  console.log('\n' + '='.repeat(50) + '\n');
  await testSpecificCases();
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error); 