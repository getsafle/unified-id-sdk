require('dotenv').config();
const { 
  registerUnifiedId, 
  addSecondaryAddress, 
  removeSecondaryAddress,
  changePrimaryAddress,
  updateUnifiedId,
  getUnifiedIdInfo 
} = require('../src/index');

const config = {
  baseURL: process.env.API_URL,        
  authToken: process.env.AUTH_TOKEN,
  chainId: process.env.CHAIN_ID, 
  motherContractAddress: process.env.MOTHER_CONTRACT_ADDRESS
};

// ⚠️ REPLACE THESE WITH YOUR ACTUAL PRIVATE KEYS
const testKeys = {
  unifiedId: 'safle_sdk_1',
  newUnifiedId: 'safle_sdk_2',
  secondaryAddress: '0x2a020915b860FD13Eb64Df541fFc817f61EAFAC1',
  primaryPk: '0xbfcd47bad366f7f00f3f42e0b50c566d8d699e1d59fd6f7fcdf554b618ae5a77',  // ← Replace with your primary private key
  secondaryPk: '0x229c646c9a4076356baa24ffa849bba2f3c1b5134f4dc7a2439e14adfe6c73d0', // ← Replace with your secondary private key
  currentPk: '0xbfcd47bad366f7f00f3f42e0b50c566d8d699e1d59fd6f7fcdf554b618ae5a77',   // ← Replace with your current private key
  newPk: '0xbf22d81c79a9d81f5315635eb2d6a02dec9277f76c36e923b50b1c958759967c',      // ← Replace with your new private key
  rpcUrl: 'https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925' // ← Replace with your RPC URL
};

async function quickRealTest() {
  console.log('🚀 Quick Real API Test\n');
  console.log(config, "config");
  try {
    // Test 1: Registration
    // console.log('1. Testing Registration...');
    // const registerResult = await registerUnifiedId({
    //   unifiedId: 'test_real_1',
    //   wallet: testKeys.primaryPk,
    //   rpcUrl: testKeys.rpcUrl,
    //   config: config
    // });

    // console.log('Registration:', registerResult.success ? '✅ SUCCESS' : '❌ FAILED');
    // if (registerResult.success) {
    //   console.log('Response:', JSON.stringify(registerResult.data, null, 2));
    // } else {
    //   console.log('Error:', registerResult.error);
    //   console.log('Details:', registerResult.details);
    // }

    // console.log('\n' + '='.repeat(50) + '\n');
    // // Test 3: Add Secondary Address
    // console.log('3. Testing Add Secondary Address...');
    // const addResult = await addSecondaryAddress({
    //   unifiedId: testKeys.unifiedId,
    //   primaryWallet: testKeys.primaryPk,
    //   secondaryWallet: testKeys.secondaryPk,
    //   rpcUrl: testKeys.rpcUrl,
    //   config: config
    // });

    // console.log('Add Secondary:', addResult.success ? '✅ SUCCESS' : '❌ FAILED');
    // if (addResult.success) {
    //   console.log('Response:', JSON.stringify(addResult.data, null, 2));
    // } else {
    //   console.log('Error:', addResult.error);
    //   console.log('Details:', addResult.details);
    // }

    // console.log('\n' + '='.repeat(50) + '\n');

    // // Test 4: Remove Secondary Address
    // console.log('4. Testing Remove Secondary Address...');
    // const removeResult = await removeSecondaryAddress({
    //   unifiedId: testKeys.unifiedId,
    //   secondaryAddress: testKeys.secondaryAddress,
    //   primaryWallet: testKeys.primaryPk,
    //   rpcUrl: testKeys.rpcUrl,
    //   config: config
    // });

    // console.log('Remove Secondary:', removeResult.success ? '✅ SUCCESS' : '❌ FAILED');
    // if (removeResult.success) {
    //   console.log('Response:', JSON.stringify(removeResult.data, null, 2));
    // } else {
    //   console.log('Error:', removeResult.error);
    //   console.log('Details:', removeResult.details);
    // }

    // console.log('\n' + '='.repeat(50) + '\n');

    // // Test 5: Update Unified ID
    // console.log('5. Testing Update Unified ID...');
    // const updateResult = await updateUnifiedId({
    //   oldUnifiedId: testKeys.unifiedId,
    //   newUnifiedId: testKeys.newUnifiedId,
    //   wallet: testKeys.primaryPk,
    //   rpcUrl: testKeys.rpcUrl,
    //   config: config
    // });

    // console.log('Update Unified ID:', updateResult.success ? '✅ SUCCESS' : '❌ FAILED');
    // if (updateResult.success) {
    //   console.log('Response:', JSON.stringify(updateResult.data, null, 2));
    // } else {
    //   console.log('Error:', updateResult.error);
    //   console.log('Details:', updateResult.details);
    // }

    // console.log('\n' + '='.repeat(50) + '\n');

    // // Test 6: Change Primary Address
    // console.log('6. Testing Change Primary Address...');
    // const changeResult = await changePrimaryAddress({
    //   unifiedId: testKeys.newUnifiedId,
    //   currentWallet: testKeys.currentPk,
    //   newWallet: testKeys.newPk,
    //   rpcUrl: testKeys.rpcUrl,
    //   config: config
    // });

    // console.log('Change Primary:', changeResult.success ? '✅ SUCCESS' : '❌ FAILED');
    // if (changeResult.success) {
    //   console.log('Response:', JSON.stringify(changeResult.data, null, 2));
    // } else {
    //   console.log('Error:', changeResult.error);
    //   console.log('Details:', changeResult.details);
    // }

    // console.log('\n' + '='.repeat(50) + '\n');

    // Summary
    console.log('🎉 Real API Test Completed!');
    console.log('📊 Check the results above for success/failure');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
quickRealTest(); 