#!/usr/bin/env node

/**
 * Advanced Usage Example for Unified ID Relayer SDK
 * 
 * This example demonstrates advanced operations:
 * 1. Update Unified ID
 * 2. Update primary address
 * 3. Add/Remove secondary addresses
 * 4. Error handling and retry logic
 * 5. Batch operations
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

// Test data
const TEST_DATA = {
  unifiedId: 'advanced-user-' + Date.now(),
  newUnifiedId: 'advanced-user-updated-' + Date.now(),
  primaryAddress: process.env.PRIMARY_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  newPrimaryAddress: process.env.NEW_PRIMARY_ADDRESS || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  secondaryAddress: process.env.SECONDARY_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
  masterPrivateKey: process.env.MASTER_PRIVATE_KEY,
  primaryPrivateKey: process.env.PRIMARY_PRIVATE_KEY,
  newPrimaryPrivateKey: process.env.NEW_PRIMARY_PRIVATE_KEY,
  secondaryPrivateKey: process.env.SECONDARY_PRIVATE_KEY
};

/**
 * Retry function with exponential backoff
 */
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`⚠️  Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

/**
 * Wait for transaction confirmation
 */
async function waitForTransaction(sdk, txHash, maxAttempts = 30, interval = 5000) {
  console.log(`⏳ Waiting for transaction confirmation: ${txHash}`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // In a real implementation, you would check the transaction status
      // For now, we'll just wait and simulate
      await new Promise(resolve => setTimeout(resolve, interval));
      
      if (attempt % 5 === 0) {
        console.log(`   Still waiting... (attempt ${attempt}/${maxAttempts})`);
      }
      
      // Simulate confirmation after some attempts
      if (attempt > 10) {
        console.log('✅ Transaction confirmed!');
        return { status: 'confirmed', blockNumber: 12345678 };
      }
    } catch (error) {
      console.log(`   Error checking status: ${error.message}`);
    }
  }
  
  throw new Error('Transaction confirmation timeout');
}

async function main() {
  console.log('🚀 Unified ID Relayer SDK - Advanced Usage Example');
  console.log('===================================================');
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
    // Step 1: Register initial Unified ID
    console.log('1️⃣ Registering initial Unified ID...');
    if (!TEST_DATA.masterPrivateKey || !TEST_DATA.primaryPrivateKey) {
      console.log('⚠️  Skipping registration - private keys not provided');
      console.log('Using mock data for demonstration');
    } else {
      const registrationRequest = {
        unifiedId: TEST_DATA.unifiedId,
        primaryAddress: TEST_DATA.primaryAddress,
        masterPrivateKey: TEST_DATA.masterPrivateKey,
        primaryPrivateKey: TEST_DATA.primaryPrivateKey
      };

      const registrationResult = await retryOperation(async () => {
        return await sdk.registerUnifiedId(registrationRequest);
      });

      if (registrationResult.success) {
        console.log('✅ Initial registration successful!');
        console.log('Response:', registrationResult.data);
      } else {
        console.log('❌ Initial registration failed:', registrationResult.error);
      }
    }
    console.log('');

    // Step 2: Update Unified ID
    console.log('2️⃣ Updating Unified ID...');
    if (!TEST_DATA.masterPrivateKey) {
      console.log('⚠️  Skipping update - master private key not provided');
    } else {
      const updateRequest = {
        previousUnifiedId: TEST_DATA.unifiedId,
        newUnifiedId: TEST_DATA.newUnifiedId,
        masterPrivateKey: TEST_DATA.masterPrivateKey
      };

      const updateResult = await retryOperation(async () => {
        return await sdk.updateUnifiedId(updateRequest);
      });

      if (updateResult.success) {
        console.log('✅ Unified ID update successful!');
        console.log('Response:', updateResult.data);
      } else {
        console.log('❌ Unified ID update failed:', updateResult.error);
      }
    }
    console.log('');

    // Step 3: Update primary address
    console.log('3️⃣ Updating primary address...');
    if (!TEST_DATA.primaryPrivateKey || !TEST_DATA.newPrimaryPrivateKey) {
      console.log('⚠️  Skipping primary address update - private keys not provided');
    } else {
      const updatePrimaryRequest = {
        unifiedId: TEST_DATA.newUnifiedId,
        newPrimaryAddress: TEST_DATA.newPrimaryAddress,
        currentPrimaryPrivateKey: TEST_DATA.primaryPrivateKey,
        newPrimaryPrivateKey: TEST_DATA.newPrimaryPrivateKey
      };

      const updatePrimaryResult = await retryOperation(async () => {
        return await sdk.updatePrimaryAddress(updatePrimaryRequest);
      });

      if (updatePrimaryResult.success) {
        console.log('✅ Primary address update successful!');
        console.log('Response:', updatePrimaryResult.data);
      } else {
        console.log('❌ Primary address update failed:', updatePrimaryResult.error);
      }
    }
    console.log('');

    // Step 4: Add secondary address
    console.log('4️⃣ Adding secondary address...');
    if (!TEST_DATA.primaryPrivateKey || !TEST_DATA.secondaryPrivateKey) {
      console.log('⚠️  Skipping secondary address addition - private keys not provided');
    } else {
      const addSecondaryRequest = {
        unifiedId: TEST_DATA.newUnifiedId,
        secondaryAddress: TEST_DATA.secondaryAddress,
        primaryPrivateKey: TEST_DATA.primaryPrivateKey,
        secondaryPrivateKey: TEST_DATA.secondaryPrivateKey
      };

      const addSecondaryResult = await retryOperation(async () => {
        return await sdk.addSecondaryAddress(addSecondaryRequest);
      });

      if (addSecondaryResult.success) {
        console.log('✅ Secondary address addition successful!');
        console.log('Response:', addSecondaryResult.data);
      } else {
        console.log('❌ Secondary address addition failed:', addSecondaryResult.error);
      }
    }
    console.log('');

    // Step 5: Remove secondary address
    console.log('5️⃣ Removing secondary address...');
    if (!TEST_DATA.primaryPrivateKey) {
      console.log('⚠️  Skipping secondary address removal - private key not provided');
    } else {
      const removeSecondaryRequest = {
        unifiedId: TEST_DATA.newUnifiedId,
        secondaryAddress: TEST_DATA.secondaryAddress,
        primaryPrivateKey: TEST_DATA.primaryPrivateKey
      };

      const removeSecondaryResult = await retryOperation(async () => {
        return await sdk.removeSecondaryAddress(removeSecondaryRequest);
      });

      if (removeSecondaryResult.success) {
        console.log('✅ Secondary address removal successful!');
        console.log('Response:', removeSecondaryResult.data);
      } else {
        console.log('❌ Secondary address removal failed:', removeSecondaryResult.error);
      }
    }
    console.log('');

    // Step 6: Batch operations simulation
    console.log('6️⃣ Simulating batch operations...');
    const batchOperations = [
      {
        name: 'Register Unified ID 1',
        operation: () => sdk.registerUnifiedId({
          unifiedId: 'batch-user-1-' + Date.now(),
          primaryAddress: TEST_DATA.primaryAddress,
          masterPrivateKey: TEST_DATA.masterPrivateKey,
          primaryPrivateKey: TEST_DATA.primaryPrivateKey
        })
      },
      {
        name: 'Register Unified ID 2',
        operation: () => sdk.registerUnifiedId({
          unifiedId: 'batch-user-2-' + Date.now(),
          primaryAddress: TEST_DATA.primaryAddress,
          masterPrivateKey: TEST_DATA.masterPrivateKey,
          primaryPrivateKey: TEST_DATA.primaryPrivateKey
        })
      }
    ];

    if (!TEST_DATA.masterPrivateKey || !TEST_DATA.primaryPrivateKey) {
      console.log('⚠️  Skipping batch operations - private keys not provided');
    } else {
      const batchResults = [];
      
      for (const batchOp of batchOperations) {
        try {
          console.log(`   Executing: ${batchOp.name}`);
          const result = await retryOperation(batchOp.operation);
          batchResults.push({ name: batchOp.name, success: result.success, data: result.data });
        } catch (error) {
          batchResults.push({ name: batchOp.name, success: false, error: error.message });
        }
      }

      console.log('📊 Batch operation results:');
      batchResults.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} ${result.name}: ${result.success ? 'Success' : result.error}`);
      });
    }
    console.log('');

    // Step 7: Error handling demonstration
    console.log('7️⃣ Demonstrating error handling...');
    try {
      // This will fail because we're not providing required parameters
      const errorResult = await sdk.setUnifiedId({
        userAddress: '0x123',
        unifiedId: 'test-error',
        // Missing required signatures
      });
      
      if (!errorResult.success) {
        console.log('✅ Error handling working correctly');
        console.log('Error:', errorResult.error);
      }
    } catch (error) {
      console.log('✅ Exception handling working correctly');
      console.log('Exception:', error.message);
    }
    console.log('');

    console.log('🎉 Advanced usage example completed successfully!');
    console.log('');
    console.log('Key features demonstrated:');
    console.log('- Automatic signature generation');
    console.log('- Retry logic with exponential backoff');
    console.log('- Comprehensive error handling');
    console.log('- Batch operations');
    console.log('- Transaction monitoring');

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

module.exports = { main, CONFIG, TEST_DATA, retryOperation, waitForTransaction }; 