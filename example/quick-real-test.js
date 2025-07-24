const { 
  registerUnifiedId, 
  addSecondaryAddress, 
  removeSecondaryAddress,
  changePrimaryAddress,
  updateUnifiedId,
  getUnifiedIdInfo 
} = require('../src/index');

// ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES
const config = {
  baseURL: 'http://127.0.0.1:3001',          // ← Replace with your real API URL
  authToken: 'eJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Imh1c2llbiIsImlhdCI6MTUxNjIzOTAyMn0.I6C9sJ9JD1j21td45PwLKMyJTqbhaefFSfcYcTN2GWQ',
  chainId: '11155111', // Sepolia testnet
  motherContractAddress: '0x3d362eD26df8A6cf54769F475ab9d46A16321962'
};

// ⚠️ REPLACE THESE WITH YOUR ACTUAL PRIVATE KEYS
const testKeys = {
  primaryPk: '0x31454c2f38dcd9e0eed113fc641368f2e0a82af599d84a35007346dc2c0a0211',  // ← Replace with your primary private key
  secondaryPk: '0x7f5299458055d41675e0df0009d4859a749971192b699330536f550947b1ca6a', // ← Replace with your secondary private key
  currentPk: '0xada558edae6bd79a6a1a447733b70b6f588dcdd78623f837bc141e4ce5e46c78',   // ← Replace with your current private key
  newPk: '0xba5bd26954443b5046ed901a2eb939001e2b1aeda2fe2c4d19c13c329a3029e5',      // ← Replace with your new private key
  rpcUrl: 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925' // ← Replace with your RPC URL
};

async function quickRealTest() {
  console.log('🚀 Quick Real API Test\n');

  try {
    // Test 1: Registration
    console.log('1. Testing Registration...');
    const registerResult = await registerUnifiedId({
      unifiedId: 'test_real_' + Date.now(),
      wallet: testKeys.primaryPk,
      rpcUrl: testKeys.rpcUrl,
      config: config
    });

    console.log('Registration:', registerResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (registerResult.success) {
      console.log('Response:', JSON.stringify(registerResult.data, null, 2));
    } else {
      console.log('Error:', registerResult.error);
      console.log('Details:', registerResult.details);
    }

    console.log('\n' + '='.repeat(50) + '\n');
    // Test 3: Add Secondary Address
    console.log('3. Testing Add Secondary Address...');
    const addResult = await addSecondaryAddress({
      unifiedId: 'test_kunal_3',
      primaryWallet: testKeys.primaryPk,
      secondaryWallet: testKeys.secondaryPk,
      rpcUrl: testKeys.rpcUrl,
      config: config
    });

    console.log('Add Secondary:', addResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (addResult.success) {
      console.log('Response:', JSON.stringify(addResult.data, null, 2));
    } else {
      console.log('Error:', addResult.error);
      console.log('Details:', addResult.details);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Remove Secondary Address
    console.log('4. Testing Remove Secondary Address...');
    const removeResult = await removeSecondaryAddress({
      unifiedId: 'test_kunal_3',
      secondaryAddress: '0xda75E90b816C7ef85061De268ADd237183E1e2c3',
      primaryWallet: testKeys.primaryPk,
      rpcUrl: testKeys.rpcUrl,
      config: config
    });

    console.log('Remove Secondary:', removeResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (removeResult.success) {
      console.log('Response:', JSON.stringify(removeResult.data, null, 2));
    } else {
      console.log('Error:', removeResult.error);
      console.log('Details:', removeResult.details);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Update Unified ID
    console.log('5. Testing Update Unified ID...');
    const updateResult = await updateUnifiedId({
      oldUnifiedId: 'test_kunal_1',
      newUnifiedId: 'test_kunal_2',
      wallet: testKeys.primaryPk,
      rpcUrl: testKeys.rpcUrl,
      config: config
    });

    console.log('Update Unified ID:', updateResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (updateResult.success) {
      console.log('Response:', JSON.stringify(updateResult.data, null, 2));
    } else {
      console.log('Error:', updateResult.error);
      console.log('Details:', updateResult.details);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 6: Change Primary Address
    console.log('6. Testing Change Primary Address...');
    const changeResult = await changePrimaryAddress({
      unifiedId: 'test_update_pk',
      currentWallet: testKeys.currentPk,
      newWallet: testKeys.newPk,
      rpcUrl: testKeys.rpcUrl,
      config: config
    });

    console.log('Change Primary:', changeResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (changeResult.success) {
      console.log('Response:', JSON.stringify(changeResult.data, null, 2));
    } else {
      console.log('Error:', changeResult.error);
      console.log('Details:', changeResult.details);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Summary
    console.log('🎉 Real API Test Completed!');
    console.log('📊 Check the results above for success/failure');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
quickRealTest(); 