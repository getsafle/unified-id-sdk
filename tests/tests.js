// Example usage of UnifiedIdSDK
//
// INSTRUCTIONS:
// 1. Fill in your config and private keys below (replace all placeholder values).
// 2. This script will run all major API flows in sequence: registration, add secondary, remove secondary, update unified ID, and change primary address.
// 3. To test a specific API, comment out the other blocks as needed.
// 4. Run this file with: node tests/tests.js
//
// ⚠️ Never commit real private keys or tokens to version control!

const { ethers } = require('ethers');
const UnifiedIdSDK = require('../src/index');
const { createSignatureMessage, getNonce } = require('../src/index');

const config = {
  baseURL: 'https://your-api-base-url', // <-- Replace with your API base URL
  authToken: 'your-auth-token',         // <-- Replace with your auth token
  chainId: 11155111,                    // <-- Replace with your chain ID (Sepolia example)
  environment: 'testnet'                // 'testnet' or 'mainnet'
};

// ⚠️ REPLACE THESE WITH YOUR ACTUAL PRIVATE KEYS AND ADDRESSES
const testKeys = {
  unifiedId: 'your_unified_id',
  newUnifiedId: 'your_new_unified_id',
  secondaryAddress: '0xSECONDARY_ADDRESS',
  primaryPk: '0xYOUR_PRIMARY_PRIVATE_KEY',
  secondaryPk: '0xYOUR_SECONDARY_PRIVATE_KEY',
  currentPk: '0xYOUR_CURRENT_PRIMARY_PRIVATE_KEY',
  newPk: '0xYOUR_NEW_PRIMARY_PRIVATE_KEY',
  rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'
};

function checkConfig(cfg) {
  const required = ['baseURL', 'authToken', 'chainId', 'environment'];
  for (const key of required) {
    if (!cfg[key]) throw new Error(`Missing required config: ${key}`);
  }
}

async function quickRealTest() {
  checkConfig(config);
  console.log('🚀 Quick Real API Test\n');
  console.log(config, 'config');
  const sdk = new UnifiedIdSDK(config);

  try {
    // --- 1. Registration ---
    console.log('1. Testing Registration...');
    const wallet = new ethers.Wallet(testKeys.primaryPk, new ethers.providers.JsonRpcProvider(testKeys.rpcUrl));
    const userAddress = wallet.address;
    const nonce = await getNonce(testKeys.unifiedId, config, testKeys.rpcUrl);
    const hash = createSignatureMessage('register', {
      unifiedId: testKeys.unifiedId,
      userAddress,
      nonce: Number(nonce)
    });
    const signature = await wallet.signMessage(ethers.utils.arrayify(hash));
    const registerResult = await sdk.registerUnifiedId({
      unifiedId: testKeys.unifiedId,
      userAddress,
      nonce: Number(nonce),
      signature
    });
    console.log('Registration:', registerResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (registerResult.success) {
      console.log('Response:', JSON.stringify(registerResult.data, null, 2));
    } else {
      console.log('Error:', registerResult.error);
      console.log('Details:', registerResult.details);
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 2. Add Secondary Address ---
    console.log('2. Testing Add Secondary Address...');
    const primaryWallet2 = new ethers.Wallet(testKeys.primaryPk, new ethers.providers.JsonRpcProvider(testKeys.rpcUrl));
    const secondaryWallet = new ethers.Wallet(testKeys.secondaryPk, new ethers.providers.JsonRpcProvider(testKeys.rpcUrl));
    const secondaryAddress = secondaryWallet.address;
    const nonce2 = await getNonce(testKeys.unifiedId, config, testKeys.rpcUrl);
    const hash2 = createSignatureMessage('register', {
      unifiedId: testKeys.unifiedId,
      userAddress: secondaryAddress,
      nonce: Number(nonce2)
    });
    const primarySignature = await primaryWallet2.signMessage(ethers.utils.arrayify(hash2));
    const secondarySignature = await secondaryWallet.signMessage(ethers.utils.arrayify(hash2));
    const addResult = await sdk.addSecondaryAddress({
      unifiedId: testKeys.unifiedId,
      secondaryAddress,
      nonce: Number(nonce2),
      primarySignature,
      secondarySignature
    });
    console.log('Add Secondary:', addResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (addResult.success) {
      console.log('Response:', JSON.stringify(addResult.data, null, 2));
    } else {
      console.log('Error:', addResult.error);
      console.log('Details:', addResult.details);
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 3. Remove Secondary Address ---
    console.log('3. Testing Remove Secondary Address...');
    const primaryWallet3 = new ethers.Wallet(testKeys.primaryPk, new ethers.providers.JsonRpcProvider(testKeys.rpcUrl));
    const nonce3 = await getNonce(testKeys.unifiedId, config, testKeys.rpcUrl);
    const hash3 = createSignatureMessage('removeSecondary', {
      unifiedId: testKeys.unifiedId,
      secondaryAddress: testKeys.secondaryAddress,
      nonce: Number(nonce3)
    });
    const removeSignature = await primaryWallet3.signMessage(ethers.utils.arrayify(hash3));
    const removeResult = await sdk.removeSecondaryAddress({
      unifiedId: testKeys.unifiedId,
      secondaryAddress: testKeys.secondaryAddress,
      nonce: Number(nonce3),
      signature: removeSignature
    });
    console.log('Remove Secondary:', removeResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (removeResult.success) {
      console.log('Response:', JSON.stringify(removeResult.data, null, 2));
    } else {
      console.log('Error:', removeResult.error);
      console.log('Details:', removeResult.details);
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 4. Update Unified ID ---
    console.log('4. Testing Update Unified ID...');
    const primaryWallet4 = new ethers.Wallet(testKeys.primaryPk, new ethers.providers.JsonRpcProvider(testKeys.rpcUrl));
    const nonce4 = await getNonce(testKeys.unifiedId, config, testKeys.rpcUrl);
    const hash4 = createSignatureMessage('updateUnifiedId', {
      oldUnifiedId: testKeys.unifiedId,
      newUnifiedId: testKeys.newUnifiedId,
      nonce: Number(nonce4)
    });
    const updateSignature = await primaryWallet4.signMessage(ethers.utils.arrayify(hash4));
    const updateResult = await sdk.updateUnifiedId({
      oldUnifiedId: testKeys.unifiedId,
      newUnifiedId: testKeys.newUnifiedId,
      nonce: Number(nonce4),
      signature: updateSignature
    });
    console.log('Update Unified ID:', updateResult.success ? '✅ SUCCESS' : '❌ FAILED');
    if (updateResult.success) {
      console.log('Response:', JSON.stringify(updateResult.data, null, 2));
    } else {
      console.log('Error:', updateResult.error);
      console.log('Details:', updateResult.details);
    }
    console.log('\n' + '='.repeat(50) + '\n');

    // --- 5. Change Primary Address ---
    console.log('5. Testing Change Primary Address...');
    const currentWallet = new ethers.Wallet(testKeys.currentPk, new ethers.providers.JsonRpcProvider(testKeys.rpcUrl));
    const newWallet = new ethers.Wallet(testKeys.newPk, new ethers.providers.JsonRpcProvider(testKeys.rpcUrl));
    const newAddress = newWallet.address;
    const nonce5 = await getNonce(testKeys.newUnifiedId, config, testKeys.rpcUrl);
    const hash5 = createSignatureMessage('primaryChange', {
      unifiedId: testKeys.newUnifiedId,
      newAddress,
      nonce: Number(nonce5)
    });
    const currentPrimarySignature = await currentWallet.signMessage(ethers.utils.arrayify(hash5));
    const newPrimarySignature = await newWallet.signMessage(ethers.utils.arrayify(hash5));
    const changeResult = await sdk.changePrimaryAddress({
      unifiedId: testKeys.newUnifiedId,
      newAddress,
      nonce: Number(nonce5),
      currentPrimarySignature,
      newPrimarySignature
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