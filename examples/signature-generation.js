#!/usr/bin/env node

/**
 * Signature Generation Example for Unified ID Relayer SDK
 * 
 * This example demonstrates:
 * 1. Manual signature generation for different operations
 * 2. EIP-712 signature creation
 * 3. Signature validation
 * 4. Custom domain and types
 */

const { createUnifiedIdSDK } = require('../dist/index');
const { ethers } = require('ethers');
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
  unifiedId: 'signature-test-' + Date.now(),
  primaryAddress: process.env.PRIMARY_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  masterAddress: process.env.MASTER_ADDRESS || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  secondaryAddress: process.env.SECONDARY_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
  masterPrivateKey: process.env.MASTER_PRIVATE_KEY,
  primaryPrivateKey: process.env.PRIMARY_PRIVATE_KEY,
  secondaryPrivateKey: process.env.SECONDARY_PRIVATE_KEY
};

/**
 * Validate signature
 */
function validateSignature(message, signature, expectedSigner) {
  try {
    const recoveredAddress = ethers.verifyMessage(JSON.stringify(message), signature);
    return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
  } catch (error) {
    console.log('Signature validation error:', error.message);
    return false;
  }
}

/**
 * Create custom EIP-712 domain
 */
function createCustomDomain(chainId, contractAddress, name = 'UnifiedID', version = '1') {
  return {
    name: name,
    version: version,
    chainId: chainId,
    verifyingContract: contractAddress
  };
}

/**
 * Generate custom signature types
 */
function createCustomTypes(operation) {
  const baseTypes = {
    RegisterUnifiedId: [
      { name: 'unifiedId', type: 'string' },
      { name: 'primaryAddress', type: 'address' },
      { name: 'chainId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ],
    UpdateUnifiedId: [
      { name: 'previousUnifiedId', type: 'string' },
      { name: 'newUnifiedId', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ],
    UpdatePrimaryAddress: [
      { name: 'unifiedId', type: 'string' },
      { name: 'newPrimaryAddress', type: 'address' },
      { name: 'chainId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ],
    AddSecondaryAddress: [
      { name: 'unifiedId', type: 'string' },
      { name: 'secondaryAddress', type: 'address' },
      { name: 'chainId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  return { [operation]: baseTypes[operation] };
}

async function main() {
  console.log('🔐 Unified ID Relayer SDK - Signature Generation Example');
  console.log('========================================================');
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
    // Step 1: Generate registration signatures using SDK
    console.log('1️⃣ Generating registration signatures using SDK...');
    if (!TEST_DATA.masterPrivateKey || !TEST_DATA.primaryPrivateKey) {
      console.log('⚠️  Skipping SDK signature generation - private keys not provided');
    } else {
      const signatureParams = {
        unifiedId: TEST_DATA.unifiedId,
        primaryAddress: TEST_DATA.primaryAddress,
        masterPrivateKey: TEST_DATA.masterPrivateKey,
        primaryPrivateKey: TEST_DATA.primaryPrivateKey
      };

      const signatures = await sdk.generateRegistrationSignatures(signatureParams);
      console.log('✅ SDK-generated signatures:');
      console.log('Master signature:', signatures.masterSignature);
      console.log('Primary signature:', signatures.primarySignature);
      console.log('Nonce:', signatures.nonce);
      console.log('Deadline:', signatures.deadline);
    }
    console.log('');

    // Step 2: Manual signature generation
    console.log('2️⃣ Manual signature generation...');
    if (!TEST_DATA.masterPrivateKey) {
      console.log('⚠️  Skipping manual signature generation - private key not provided');
    } else {
      const domain = createCustomDomain(CONFIG.chainId, CONFIG.motherContractAddress);
      const types = createCustomTypes('RegisterUnifiedId');
      const nonce = Date.now();
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const message = {
        unifiedId: TEST_DATA.unifiedId + '-manual',
        primaryAddress: TEST_DATA.primaryAddress,
        chainId: CONFIG.chainId,
        nonce: nonce,
        deadline: deadline
      };

      const wallet = new ethers.Wallet(TEST_DATA.masterPrivateKey);
      const signature = await wallet.signTypedData(domain, types, message);

      console.log('✅ Manual signature generated:');
      console.log('Domain:', domain);
      console.log('Types:', types);
      console.log('Message:', message);
      console.log('Signature:', signature);
      console.log('Signer address:', wallet.address);
    }
    console.log('');

    // Step 3: Update signature generation
    console.log('3️⃣ Generating update signature...');
    if (!TEST_DATA.masterPrivateKey) {
      console.log('⚠️  Skipping update signature generation - private key not provided');
    } else {
      const updateParams = {
        previousUnifiedId: TEST_DATA.unifiedId,
        newUnifiedId: TEST_DATA.unifiedId + '-updated',
        masterPrivateKey: TEST_DATA.masterPrivateKey
      };

      const updateSignature = await sdk.generateUpdateSignature(updateParams);
      console.log('✅ Update signature generated:');
      console.log('Signature:', updateSignature);
    }
    console.log('');

    // Step 4: Custom signature types demonstration
    console.log('4️⃣ Custom signature types demonstration...');
    if (!TEST_DATA.masterPrivateKey) {
      console.log('⚠️  Skipping custom types - private key not provided');
    } else {
      const customDomain = createCustomDomain(
        CONFIG.chainId, 
        CONFIG.motherContractAddress,
        'CustomUnifiedID',
        '2.0'
      );

      const customTypes = {
        CustomOperation: [
          { name: 'unifiedId', type: 'string' },
          { name: 'operation', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'chainId', type: 'uint256' }
        ]
      };

      const customMessage = {
        unifiedId: TEST_DATA.unifiedId + '-custom',
        operation: 'CUSTOM_OPERATION',
        timestamp: Math.floor(Date.now() / 1000),
        chainId: CONFIG.chainId
      };

      const wallet = new ethers.Wallet(TEST_DATA.masterPrivateKey);
      const customSignature = await wallet.signTypedData(customDomain, customTypes, customMessage);

      console.log('✅ Custom signature generated:');
      console.log('Custom domain:', customDomain);
      console.log('Custom types:', customTypes);
      console.log('Custom message:', customMessage);
      console.log('Custom signature:', customSignature);
    }
    console.log('');

    // Step 5: Signature validation demonstration
    console.log('5️⃣ Signature validation demonstration...');
    if (!TEST_DATA.masterPrivateKey) {
      console.log('⚠️  Skipping signature validation - private key not provided');
    } else {
      const wallet = new ethers.Wallet(TEST_DATA.masterPrivateKey);
      const testMessage = { test: 'data', timestamp: Date.now() };
      const testSignature = await wallet.signMessage(JSON.stringify(testMessage));

      const isValid = validateSignature(testMessage, testSignature, wallet.address);
      console.log('✅ Signature validation result:', isValid);
      console.log('Expected signer:', wallet.address);
      console.log('Test message:', testMessage);
      console.log('Test signature:', testSignature);
    }
    console.log('');

    // Step 6: Multiple signature types
    console.log('6️⃣ Multiple signature types demonstration...');
    if (!TEST_DATA.masterPrivateKey || !TEST_DATA.primaryPrivateKey) {
      console.log('⚠️  Skipping multiple signatures - private keys not provided');
    } else {
      const operations = [
        {
          name: 'RegisterUnifiedId',
          message: {
            unifiedId: TEST_DATA.unifiedId + '-multi-1',
            primaryAddress: TEST_DATA.primaryAddress,
            chainId: CONFIG.chainId,
            nonce: Date.now(),
            deadline: Math.floor(Date.now() / 1000) + 3600
          }
        },
        {
          name: 'UpdateUnifiedId',
          message: {
            previousUnifiedId: TEST_DATA.unifiedId + '-multi-1',
            newUnifiedId: TEST_DATA.unifiedId + '-multi-2',
            chainId: CONFIG.chainId,
            nonce: Date.now(),
            deadline: Math.floor(Date.now() / 1000) + 3600
          }
        }
      ];

      const domain = createCustomDomain(CONFIG.chainId, CONFIG.motherContractAddress);
      const masterWallet = new ethers.Wallet(TEST_DATA.masterPrivateKey);
      const primaryWallet = new ethers.Wallet(TEST_DATA.primaryPrivateKey);

      console.log('✅ Multiple signatures generated:');
      
      for (const operation of operations) {
        const types = createCustomTypes(operation.name);
        const masterSignature = await masterWallet.signTypedData(domain, types, operation.message);
        const primarySignature = await primaryWallet.signTypedData(domain, types, operation.message);

        console.log(`\n${operation.name}:`);
        console.log('  Master signature:', masterSignature);
        console.log('  Primary signature:', primarySignature);
        console.log('  Message:', operation.message);
      }
    }
    console.log('');

    console.log('🎉 Signature generation example completed successfully!');
    console.log('');
    console.log('Key features demonstrated:');
    console.log('- SDK signature generation');
    console.log('- Manual EIP-712 signature creation');
    console.log('- Custom domain and types');
    console.log('- Signature validation');
    console.log('- Multiple signature types');
    console.log('- Custom operation signatures');

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

module.exports = { 
  main, 
  CONFIG, 
  TEST_DATA, 
  validateSignature, 
  createCustomDomain, 
  createCustomTypes 
}; 