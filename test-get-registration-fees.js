const { UnifiedIdSDK, getRegistrationFees } = require('./src/index');
const config = require('./src/config');
const { ethers } = require('ethers');

// Test configuration
const testConfig = {
  environment: 'testnet',
  chainId: '11155111',
  rpcUrl: 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925',
  baseURL: 'https://api.example.com',
  authToken: 'test-token'
};

console.log('🚀 Testing getRegistrationFees...\n');

// Test cases
const testCases = [
  {
    name: 'ETH Registration (Zero Address)',
    token: '0x0000000000000000000000000000000000000000',
    registrarFees: '1000000000000000000', // 1 ETH in wei
    description: 'Testing ETH registration fees'
  },
  {
    name: 'USDC Registration',
    token: '0xA0b86a33E6441b8c4C8C0b4b8C8C0b4b8C8C0b4b', // Mock USDC address
    registrarFees: '1000000000000000000', // 1 ETH in wei
    description: 'Testing USDC registration fees'
  },
  {
    name: 'USDT Registration',
    token: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT address
    registrarFees: '500000000000000000', // 0.5 ETH in wei
    description: 'Testing USDT registration fees'
  },
  {
    name: 'Small Fee Test',
    token: '0x0000000000000000000000000000000000000000',
    registrarFees: '100000000000000000', // 0.1 ETH in wei
    description: 'Testing small registration fees'
  },
  {
    name: 'Large Fee Test',
    token: '0x0000000000000000000000000000000000000000',
    registrarFees: '10000000000000000000', // 10 ETH in wei
    description: 'Testing large registration fees'
  }
];

async function testSDKInstance() {
  console.log('=== Testing SDK Instance Method ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(testConfig);
    console.log('✅ SDK initialized successfully');
    console.log(`🌐 RPC URL: ${testConfig.rpcUrl}`);
    console.log(`🔗 Chain ID: ${testConfig.chainId}`);
    console.log(`🌍 Environment: ${testConfig.environment}\n`);

    for (const testCase of testCases) {
      console.log(`🔍 Testing: ${testCase.name}`);
      console.log(`📝 Description: ${testCase.description}`);
      console.log(`🏷️  Token: ${testCase.token}`);
      console.log(`💰 Registrar Fees: ${testCase.registrarFees} wei`);
      
      try {
        const requiredAmount = await sdk.getRegistrationFees(testCase.token, testCase.registrarFees, testConfig.rpcUrl);
        console.log(`   ✅ Required Amount: ${requiredAmount}`);
        
        // Convert to readable format
        const ethAmount = ethers.utils.formatEther(testCase.registrarFees);
        console.log(`   📊 ETH Equivalent: ${ethAmount} ETH`);
        
        if (testCase.token === '0x0000000000000000000000000000000000000000') {
          console.log(`   💡 ETH Registration: Fees should match registrar fees`);
        } else {
          console.log(`   💡 Token Registration: Fees converted to token amount`);
        }
        console.log('');
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
    const contractAddress = config.STORAGE_UTIL_CONTRACT_ADDRESS_MAP[testConfig.environment][testConfig.chainId];
    console.log(`🏗️  Contract Address: ${contractAddress}\n`);

    for (const testCase of testCases) {
      console.log(`🔍 Testing: ${testCase.name}`);
      console.log(`📝 Description: ${testCase.description}`);
      console.log(`🏷️  Token: ${testCase.token}`);
      console.log(`💰 Registrar Fees: ${testCase.registrarFees} wei`);
      
      try {
        const requiredAmount = await getRegistrationFees(testCase.token, testCase.registrarFees, contractAddress, testConfig.rpcUrl);
        console.log(`   ✅ Required Amount: ${requiredAmount}`);
        
        // Convert to readable format
        const ethAmount = ethers.utils.formatEther(testCase.registrarFees);
        console.log(`   📊 ETH Equivalent: ${ethAmount} ETH`);
        
        if (testCase.token === '0x0000000000000000000000000000000000000000') {
          console.log(`   💡 ETH Registration: Fees should match registrar fees`);
        } else {
          console.log(`   💡 Token Registration: Fees converted to token amount`);
        }
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
  } catch (error) {
    console.log(`❌ Direct function test failed: ${error.message}\n`);
  }
}

async function testComparison() {
  console.log('=== Testing Comparison with Different Scenarios ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(testConfig);
    
    // Test ETH vs Token registration
    const ethToken = '0x0000000000000000000000000000000000000000';
    const usdcToken = '0xA0b86a33E6441b8c4C8C0b4b8C8C0b4b8C8C0b4b'; // Mock USDC
    const registrarFees = '1000000000000000000'; // 1 ETH
    
    console.log('🔍 Comparing ETH vs Token Registration:');
    console.log(`💰 Registrar Fees: ${registrarFees} wei (1 ETH)\n`);
    
    try {
      const ethAmount = await sdk.getRegistrationFees(ethToken, registrarFees, testConfig.rpcUrl);
      console.log(`   ✅ ETH Registration Amount: ${ethAmount}`);
      
      const usdcAmount = await sdk.getRegistrationFees(usdcToken, registrarFees, testConfig.rpcUrl);
      console.log(`   ✅ USDC Registration Amount: ${usdcAmount}`);
      
      console.log(`   📊 Comparison: ETH vs USDC registration fees`);
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
    
    // Test different fee amounts
    console.log('🔍 Testing Different Fee Amounts:');
    const feeAmounts = [
      '100000000000000000',   // 0.1 ETH
      '1000000000000000000',  // 1 ETH
      '10000000000000000000'  // 10 ETH
    ];
    
    for (const fee of feeAmounts) {
      try {
        const amount = await sdk.getRegistrationFees(ethToken, fee, testConfig.rpcUrl);
        const ethEquivalent = ethers.utils.formatEther(fee);
        console.log(`   💰 ${ethEquivalent} ETH → ${amount} required amount`);
      } catch (error) {
        console.log(`   ❌ Error for ${fee}: ${error.message}`);
      }
    }
    console.log('');
    
  } catch (error) {
    console.log(`❌ Comparison test failed: ${error.message}\n`);
  }
}

async function testEdgeCases() {
  console.log('=== Testing Edge Cases ===\n');
  
  try {
    const sdk = new UnifiedIdSDK(testConfig);
    
    // Test with zero fees
    console.log('🔍 Testing with zero fees:');
    try {
      const result = await sdk.getRegistrationFees('0x0000000000000000000000000000000000000000', '0', testConfig.rpcUrl);
      console.log(`   Result: ${result}`);
    } catch (error) {
      console.log(`   ✅ Expected error: ${error.message}`);
    }
    
    // Test with empty token address
    console.log('\n🔍 Testing with empty token address:');
    try {
      const result = await sdk.getRegistrationFees('', '1000000000000000000', testConfig.rpcUrl);
      console.log(`   Result: ${result}`);
    } catch (error) {
      console.log(`   ✅ Expected error: ${error.message}`);
    }
    
    // Test with null token
    console.log('\n🔍 Testing with null token:');
    try {
      const result = await sdk.getRegistrationFees(null, '1000000000000000000', testConfig.rpcUrl);
      console.log(`   Result: ${result}`);
    } catch (error) {
      console.log(`   ✅ Expected error: ${error.message}`);
    }
    
    // Test with undefined fees
    console.log('\n🔍 Testing with undefined fees:');
    try {
      const result = await sdk.getRegistrationFees('0x0000000000000000000000000000000000000000', undefined, testConfig.rpcUrl);
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