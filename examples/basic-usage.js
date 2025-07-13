#!/usr/bin/env node

/**
 * Basic Usage Example for Unified ID Relayer SDK
 * 
 * This example demonstrates the most common operations:
 * 1. SDK initialization
 * 2. Service health check
 * 3. Unified ID registration with automatic signature generation
 * 4. Manual signature generation
 * 5. Address management
 */

const { createUnifiedIdSDK } = require('../dist/index');
require('dotenv').config();

// Configuration
const CONFIG = {
  baseURL: process.env.RELAYER_URL || 'http://localhost:3001',
  authToken: process.env.AUTH_TOKEN || 'your-auth-token-here',
  chainId: parseInt(process.env.CHAIN_ID) || 11155111, // Sepolia
  motherContractAddress: process.env.MOTHER_CONTRACT_ADDRESS || '0x6E88e069dA65b621b87FDbDdC2858A6F9d8A5202',
  timeout: 30000
};

// Test data (replace with your actual addresses and private keys)
const TEST_DATA = {
  unifiedId: 'test-user-' + Date.now(),
  primaryAddress: process.env.PRIMARY_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  masterAddress: process.env.MASTER_ADDRESS || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  secondaryAddress: process.env.SECONDARY_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
  masterPrivateKey: process.env.MASTER_PRIVATE_KEY,
  primaryPrivateKey: process.env.PRIMARY_PRIVATE_KEY,
  secondaryPrivateKey: process.env.SECONDARY_PRIVATE_KEY
};

async function main() {
  console.log('🚀 Unified ID Relayer SDK - Basic Usage Example');
  console.log('================================================');
  console.log('Configuration:', {
    baseURL: CONFIG.baseURL,
    chainId: CONFIG.chainId,
    motherContractAddress: CONFIG.motherContractAddress
  });
  console.log('Test Unified ID:', TEST_DATA.unifiedId);
  console.log('');

  // Initialize SDK
  const sdk = createUnifiedIdSDK(CONFIG);

  try {
    // Step 1: Health Check
    console.log('1️⃣ Checking service health...');
    const health = await sdk.getHealth();
    if (health.success) {
      console.log('✅ Service health:', health.data);
    } else {
      console.log('❌ Health check failed:', health.error);
    }
    console.log('');

    // Step 2: Ping Service
    console.log('2️⃣ Pinging service...');
    const ping = await sdk.ping();
    if (ping.success) {
      console.log('✅ Service ping:', ping.data);
    } else {
      console.log('❌ Ping failed:', ping.error);
    }
    console.log('');

    // Step 3: Register Unified ID with automatic signature generation
    console.log('3️⃣ Registering Unified ID with automatic signatures...');
    if (!TEST_DATA.masterPrivateKey || !TEST_DATA.primaryPrivateKey) {
      console.log('⚠️  Skipping automatic registration - private keys not provided');
      console.log('Set MASTER_PRIVATE_KEY and PRIMARY_PRIVATE_KEY environment variables to test automatic registration');
    } else {
      const registrationRequest = {
        unifiedId: TEST_DATA.unifiedId,
        primaryAddress: TEST_DATA.primaryAddress,
        masterPrivateKey: TEST_DATA.masterPrivateKey,
        primaryPrivateKey: TEST_DATA.primaryPrivateKey
      };

      const registrationResult = await sdk.registerUnifiedId(registrationRequest);
      
      if (registrationResult.success) {
        console.log('✅ Registration successful!');
        console.log('Response:', registrationResult.data);
      } else {
        console.log('❌ Registration failed:', registrationResult.error);
      }
    }
    console.log('');

    // Step 4: Manual signature generation
    console.log('4️⃣ Generating signatures manually...');
    if (!TEST_DATA.masterPrivateKey || !TEST_DATA.primaryPrivateKey) {
      console.log('⚠️  Skipping signature generation - private keys not provided');
    } else {
      const signatureParams = {
        unifiedId: TEST_DATA.unifiedId + '-manual',
        primaryAddress: TEST_DATA.primaryAddress,
        masterPrivateKey: TEST_DATA.masterPrivateKey,
        primaryPrivateKey: TEST_DATA.primaryPrivateKey
      };

      const signatures = await sdk.generateRegistrationSignatures(signatureParams);
      console.log('✅ Signatures generated:');
      console.log('Master signature:', signatures.masterSignature);
      console.log('Primary signature:', signatures.primarySignature);
      console.log('Nonce:', signatures.nonce);
      console.log('Deadline:', signatures.deadline);
    }
    console.log('');

    // Step 5: Manual registration with pre-generated signatures
    console.log('5️⃣ Manual registration with pre-generated signatures...');
    if (!TEST_DATA.masterPrivateKey || !TEST_DATA.primaryPrivateKey) {
      console.log('⚠️  Skipping manual registration - private keys not provided');
    } else {
      const signatures = await sdk.generateRegistrationSignatures({
        unifiedId: TEST_DATA.unifiedId + '-manual',
        primaryAddress: TEST_DATA.primaryAddress,
        masterPrivateKey: TEST_DATA.masterPrivateKey,
        primaryPrivateKey: TEST_DATA.primaryPrivateKey
      });

      const manualRegistrationRequest = {
        userAddress: TEST_DATA.primaryAddress,
        unifiedId: TEST_DATA.unifiedId + '-manual',
        masterSignature: signatures.masterSignature,
        primarySignature: signatures.primarySignature
      };

      const manualResult = await sdk.setUnifiedId(manualRegistrationRequest);
      
      if (manualResult.success) {
        console.log('✅ Manual registration successful!');
        console.log('Response:', manualResult.data);
      } else {
        console.log('❌ Manual registration failed:', manualResult.error);
      }
    }
    console.log('');

    console.log('🎉 Basic usage example completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('- Check the blockchain for your transactions');
    console.log('- Explore the advanced features in the documentation');
    console.log('- Try the advanced usage example');

  } catch (error) {
    console.error('❌ Example failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, CONFIG, TEST_DATA }; 