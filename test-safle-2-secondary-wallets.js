const { UnifiedIdSDK, getSecondaryWalletsforUnifiedID } = require('./src');

// Configuration
const config = {
  baseURL: 'https://api.example.com',
  authToken: 'your-auth-token',
  environment: 'testnet',
  chainId: '11155111'
};

const rpcUrl = 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925';

// Test the specific unified ID
const testUnifiedId = 'safle_2';

console.log('🚀 Testing Secondary Wallets for safle_2...\n');

async function testSDKInstance() {
  console.log('=== Testing SDK Instance Method ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    console.log('✅ SDK initialized successfully');
    console.log(`🌐 RPC URL: ${rpcUrl}`);
    console.log(`🔗 Chain ID: ${config.chainId}`);
    console.log(`🌍 Environment: ${config.environment}\n`);

    console.log(`🔍 Testing unified ID: "${testUnifiedId}"`);
    
    const secondaryWallets = await sdk.getSecondaryWalletsforUnifiedID(testUnifiedId, rpcUrl);
    console.log(secondaryWallets, "111");
    console.log(`   Secondary Wallets: [${secondaryWallets.join(', ')}]`);
    console.log(`   Count: ${secondaryWallets.length}`);
    
    if (secondaryWallets.length > 0) {
      console.log('✅ Successfully found secondary wallets for safle_2');
      console.log(`   Found ${secondaryWallets.length} secondary wallet(s):`);
      secondaryWallets.forEach((wallet, index) => {
        console.log(`   ${index + 1}. ${wallet}`);
      });
    } else {
      console.log('ℹ️  No secondary wallets found for safle_2');
    }
    
  } catch (error) {
    console.log(`❌ SDK test failed: ${error.message}`);
  }
}

async function testDirectFunction() {
  console.log('\n=== Testing Direct Utility Function ===\n');
  
  try {
    console.log(`🔍 Testing unified ID: "${testUnifiedId}"`);
    
    const secondaryWallets = await getSecondaryWalletsforUnifiedID(testUnifiedId, '0x5f5DAD00aDa66c5bAEE539f4C6DA8975e21bC5c9', rpcUrl);
    console.log(`   Secondary Wallets: [${secondaryWallets.join(', ')}]`);
    console.log(`   Count: ${secondaryWallets.length}`);
    
    if (secondaryWallets.length > 0) {
      console.log('✅ Successfully found secondary wallets for safle_2');
      console.log(`   Found ${secondaryWallets.length} secondary wallet(s):`);
      secondaryWallets.forEach((wallet, index) => {
        console.log(`   ${index + 1}. ${wallet}`);
      });
    } else {
      console.log('ℹ️  No secondary wallets found for safle_2');
    }
    
  } catch (error) {
    console.log(`❌ Direct function test failed: ${error.message}`);
  }
}

async function testComparison() {
  console.log('\n=== Testing Comparison with Other Functions ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    
    const testIds = [
      'safle_2',        // The target ID
      'karan_test_2',   // Previous test ID
      'nonexistent_id'  // Non-existent ID
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

async function testArrayValidation() {
  console.log('\n=== Testing Array Validation for safle_2 ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(config);
    
    console.log(`🔍 Testing array validation for unified ID: "${testUnifiedId}"`);
    
    const secondaryWallets = await sdk.getSecondaryWalletsforUnifiedID(testUnifiedId, rpcUrl);
    
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
        
        // Test for duplicates
        const uniqueAddresses = [...new Set(secondaryWallets)];
        if (uniqueAddresses.length === secondaryWallets.length) {
          console.log('✅ No duplicate addresses found');
        } else {
          console.log(`⚠️  Found ${secondaryWallets.length - uniqueAddresses.length} duplicate address(es)`);
        }
      } else {
        console.log('ℹ️  Empty array - no secondary wallets to validate');
      }
    } else {
      console.log('❌ Did not return array');
    }
    
  } catch (error) {
    console.log(`❌ Array validation test failed: ${error.message}`);
  }
}

async function runTests() {
  await testSDKInstance();
  await testDirectFunction();
  await testComparison();
  await testArrayValidation();
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error); 