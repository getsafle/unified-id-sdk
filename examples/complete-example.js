/**
 * @fileoverview Complete UnifiedID SDK Example
 * @author kunalmkv
 * @version 1.0.0
 */

const { UnifiedID, SUPPORTED_CHAINS } = require('../src/index');
const { ethers } = require('ethers');

// ========================================
// CONFIGURATION
// ========================================

const config = {
  apiUrl: 'http://localhost:3000',
  rpcUrls: {
    11155111: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID', // Sepolia
    1: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID', // Ethereum
    137: 'https://polygon-rpc.com', // Polygon
    42161: 'https://arb1.arbitrum.io/rpc' // Arbitrum
  },
  contractAddresses: {
    mother: {
      11155111: '0x6E88e069dA65b621b87FDbDdC2858A6F9d8A5202', // Sepolia
      1: '0x...', // Ethereum (replace with actual address)
      137: '0x...', // Polygon (replace with actual address)
      42161: '0x...' // Arbitrum (replace with actual address)
    },
    child: {
      11155111: '0x...', // Sepolia (replace with actual address)
      1: '0x...', // Ethereum (replace with actual address)
      137: '0x...', // Polygon (replace with actual address)
      42161: '0x...' // Arbitrum (replace with actual address)
    },
    resolver: {
      11155111: '0x...', // Sepolia (replace with actual address)
      1: '0x...', // Ethereum (replace with actual address)
      137: '0x...', // Polygon (replace with actual address)
      42161: '0x...' // Arbitrum (replace with actual address)
    }
  },
  logging: {
    level: 'info',
    enabled: true
  }
};

// ========================================
// MAIN EXAMPLE FUNCTION
// ========================================

async function runCompleteExample() {
  console.log('🚀 Starting UnifiedID SDK Complete Example...\n');

  try {
    // Initialize SDK
    const unifiedId = new UnifiedID(config);
    console.log('✅ SDK initialized successfully');

    // Health check
    console.log('\n📊 Performing health check...');
    const health = await unifiedId.healthCheck();
    console.log('Health status:', health.status);
    if (health.status === 'unhealthy') {
      console.log('❌ System is unhealthy, stopping example');
      return;
    }

    // Get system stats
    console.log('\n📈 Getting system statistics...');
    const stats = await unifiedId.getStats();
    console.log('System stats:', stats);

    // Validate configuration
    console.log('\n🔍 Validating configuration...');
    const validation = unifiedId.validateConfig();
    if (!validation.isValid) {
      console.log('❌ Configuration validation failed:', validation.errors);
      return;
    }
    console.log('✅ Configuration is valid');

    // Set up signer (in a real application, this would be from MetaMask or similar)
    console.log('\n🔐 Setting up signer...');
    // Note: In a real application, you would get the signer from MetaMask or similar
    // const provider = new ethers.BrowserProvider(window.ethereum);
    // const signer = await provider.getSigner();
    // unifiedId.setSigner(signer);
    console.log('⚠️  Signer setup skipped (would be from MetaMask in real app)');

    // Event listeners
    console.log('\n🎧 Setting up event listeners...');
    unifiedId.on('operation:started', (event) => {
      console.log(`🔄 Operation started: ${event.operationId} (${event.type})`);
    });

    unifiedId.on('operation:completed', (event) => {
      console.log(`✅ Operation completed: ${event.operationId} (${event.type})`);
    });

    unifiedId.on('operation:failed', (event) => {
      console.log(`❌ Operation failed: ${event.operationId} (${event.type})`);
      console.log('Error:', event.error);
    });

    // Validation examples
    console.log('\n🔍 Validation examples...');
    console.log('Valid UnifiedID:', unifiedId.isValidUnifiedId('alice.eth')); // true
    console.log('Invalid UnifiedID:', unifiedId.isValidUnifiedId('invalid@id')); // false
    console.log('Valid address:', unifiedId.isValidAddress('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6')); // true
    console.log('Invalid address:', unifiedId.isValidAddress('invalid-address')); // false

    // Resolution examples (these will work without a signer)
    console.log('\n🔍 Resolution examples...');
    
    try {
      // Resolve UnifiedID to primary address
      const primaryAddress = await unifiedId.resolvers.resolvePrimaryAddress('alice.eth', 11155111);
      console.log('Primary address for alice.eth:', primaryAddress);
    } catch (error) {
      console.log('❌ Failed to resolve primary address:', error.message);
    }

    try {
      // Resolve address to UnifiedID
      const resolvedUnifiedId = await unifiedId.resolvers.resolveUnifiedId('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 11155111);
      console.log('UnifiedID for address:', resolvedUnifiedId);
    } catch (error) {
      console.log('❌ Failed to resolve UnifiedID:', error.message);
    }

    try {
      // Get complete UnifiedID information
      const info = await unifiedId.resolvers.getUnifiedIdInfo('alice.eth', 11155111);
      console.log('Complete UnifiedID info:', info);
    } catch (error) {
      console.log('❌ Failed to get UnifiedID info:', error.message);
    }

    try {
      // Get multi-chain information
      const multiChainInfo = await unifiedId.resolvers.getMultiChainUnifiedIdInfo('alice.eth');
      console.log('Multi-chain info:', multiChainInfo);
    } catch (error) {
      console.log('❌ Failed to get multi-chain info:', error.message);
    }

    // Batch resolution examples
    console.log('\n📦 Batch resolution examples...');
    
    try {
      const batchResults = await unifiedId.resolvers.batchResolveUnifiedIds(
        ['alice.eth', 'bob.eth', 'charlie.eth'],
        11155111
      );
      console.log('Batch UnifiedID resolution results:', batchResults);
    } catch (error) {
      console.log('❌ Failed to batch resolve UnifiedIDs:', error.message);
    }

    try {
      const batchAddressResults = await unifiedId.resolvers.batchResolveAddresses(
        ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '0x1234567890123456789012345678901234567890'],
        11155111
      );
      console.log('Batch address resolution results:', batchAddressResults);
    } catch (error) {
      console.log('❌ Failed to batch resolve addresses:', error.message);
    }

    // Search examples
    console.log('\n🔍 Search examples...');
    
    try {
      const searchResults = await unifiedId.resolvers.searchUnifiedIds('alice', 11155111, {
        limit: 5,
        offset: 0
      });
      console.log('Search results for "alice":', searchResults);
    } catch (error) {
      console.log('❌ Failed to search UnifiedIDs:', error.message);
    }

    // Statistics examples
    console.log('\n📊 Statistics examples...');
    
    try {
      const unifiedIdStats = await unifiedId.resolvers.getUnifiedIdStats(11155111);
      console.log('UnifiedID statistics for Sepolia:', unifiedIdStats);
    } catch (error) {
      console.log('❌ Failed to get statistics:', error.message);
    }

    // Recent registrations
    console.log('\n🆕 Recent registrations...');
    
    try {
      const recentRegistrations = await unifiedId.resolvers.getRecentRegistrations(11155111, {
        limit: 10,
        offset: 0
      });
      console.log('Recent registrations:', recentRegistrations);
    } catch (error) {
      console.log('❌ Failed to get recent registrations:', error.message);
    }

    // Activity examples
    console.log('\n📈 Activity examples...');
    
    try {
      const activity = await unifiedId.resolvers.getUnifiedIdActivity('alice.eth', 11155111, {
        limit: 20,
        offset: 0
      });
      console.log('Activity for alice.eth:', activity);
    } catch (error) {
      console.log('❌ Failed to get activity:', error.message);
    }

    // Signature utilities examples
    console.log('\n✍️ Signature utilities examples...');
    
    const domain = unifiedId.createDomain(
      config.contractAddresses.mother[11155111],
      11155111,
      'UnifiedID',
      '1'
    );
    console.log('Created domain:', domain);

    const deadline = unifiedId.createDeadline(30);
    console.log('Created deadline:', deadline);

    // Check address association
    console.log('\n🔗 Address association examples...');
    
    try {
      const association = await unifiedId.resolvers.checkAddressAssociation(
        'alice.eth',
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        11155111
      );
      console.log('Address association:', association);
    } catch (error) {
      console.log('❌ Failed to check address association:', error.message);
    }

    // Get all addresses
    console.log('\n📋 All addresses example...');
    
    try {
      const addresses = await unifiedId.resolvers.getAllAddresses('alice.eth', 11155111);
      console.log('All addresses for alice.eth:', addresses);
    } catch (error) {
      console.log('❌ Failed to get all addresses:', error.message);
    }

    // Check availability
    console.log('\n✅ Availability check...');
    
    try {
      const isAvailable = await unifiedId.resolvers.isUnifiedIdAvailable('newuser.eth', 11155111);
      console.log('Is newuser.eth available:', isAvailable);
    } catch (error) {
      console.log('❌ Failed to check availability:', error.message);
    }

    // Get queue status
    console.log('\n📋 Queue status...');
    const queueStatus = await unifiedId.getQueueStatus();
    console.log('Queue status:', queueStatus);

    // Get supported chains
    console.log('\n🔗 Supported chains...');
    const supportedChains = unifiedId.getSupportedChains();
    console.log('Supported chains:', supportedChains);

    // Check chain support
    console.log('\n🔍 Chain support checks...');
    console.log('Is Sepolia supported:', unifiedId.isChainSupported(11155111)); // true
    console.log('Is Ethereum supported:', unifiedId.isChainSupported(1)); // true
    console.log('Is unsupported chain supported:', unifiedId.isChainSupported(999999)); // false

    // Provider management
    console.log('\n🔌 Provider management...');
    try {
      const provider = unifiedId.getProvider(11155111);
      console.log('Provider for Sepolia:', provider.constructor.name);
    } catch (error) {
      console.log('❌ Failed to get provider:', error.message);
    }

    // Note: The following operations require a signer and would fail without one
    console.log('\n⚠️  Operations requiring signer (skipped in this example):');
    console.log('- registerUnifiedId()');
    console.log('- updateUnifiedId()');
    console.log('- updatePrimaryAddress()');
    console.log('- addSecondaryAddress()');
    console.log('- removeSecondaryAddress()');
    console.log('- batchCreateSignatures()');

    console.log('\n🎉 Complete example finished successfully!');

  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

// ========================================
// OPERATIONS EXAMPLE (REQUIRES SIGNER)
// ========================================

async function runOperationsExample() {
  console.log('\n🚀 Starting Operations Example (requires signer)...\n');

  try {
    const unifiedId = new UnifiedID(config);

    // Set up signer (uncomment and modify for your use case)
    // const provider = new ethers.BrowserProvider(window.ethereum);
    // const signer = await provider.getSigner();
    // unifiedId.setSigner(signer);

    console.log('⚠️  Operations example skipped - requires signer setup');
    console.log('To run operations example:');
    console.log('1. Set up a signer (MetaMask, etc.)');
    console.log('2. Uncomment the signer setup code');
    console.log('3. Run the operations');

    // Example operations (commented out as they require signer)
    /*
    // Register UnifiedID
    const registerResult = await unifiedId.registerUnifiedId({
      unifiedId: 'alice.eth',
      primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      chainId: 11155111
    });
    console.log('Registration result:', registerResult);

    // Update UnifiedID
    const updateResult = await unifiedId.updateUnifiedId({
      oldUnifiedId: 'alice.eth',
      newUnifiedId: 'alice_new.eth',
      chainId: 11155111
    });
    console.log('Update result:', updateResult);

    // Add secondary address
    const addSecondaryResult = await unifiedId.addSecondaryAddress({
      unifiedId: 'alice_new.eth',
      secondaryAddress: '0x1234567890123456789012345678901234567890',
      chainId: 11155111
    });
    console.log('Add secondary result:', addSecondaryResult);

    // Batch operations
    const batchOperations = [
      {
        type: 'register',
        params: {
          unifiedId: 'bob.eth',
          primaryAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          chainId: 11155111
        }
      },
      {
        type: 'add-secondary',
        params: {
          unifiedId: 'bob.eth',
          secondaryAddress: '0x1234567890123456789012345678901234567890',
          chainId: 11155111
        }
      }
    ];

    const batchResults = await unifiedId.operations.batchOperations(batchOperations);
    console.log('Batch operation results:', batchResults);
    */

  } catch (error) {
    console.error('❌ Operations example failed:', error);
  }
}

// ========================================
// ERROR HANDLING EXAMPLE
// ========================================

async function runErrorHandlingExample() {
  console.log('\n🚀 Starting Error Handling Example...\n');

  const unifiedId = new UnifiedID(config);

  // Validation error example
  console.log('🔍 Validation error example:');
  try {
    await unifiedId.resolvers.resolvePrimaryAddress('invalid@id', 11155111);
  } catch (error) {
    console.log('Expected validation error:', error.code, error.message);
  }

  // API error example
  console.log('\n🌐 API error example:');
  try {
    await unifiedId.resolvers.resolvePrimaryAddress('nonexistent.eth', 999999);
  } catch (error) {
    console.log('Expected API error:', error.code, error.message);
  }

  // Network error example
  console.log('\n📡 Network error example:');
  const badConfig = { ...config, apiUrl: 'http://invalid-url:9999' };
  const badUnifiedId = new UnifiedID(badConfig);
  
  try {
    await badUnifiedId.healthCheck();
  } catch (error) {
    console.log('Expected network error:', error.code, error.message);
  }

  console.log('\n✅ Error handling example completed');
}

// ========================================
// MAIN EXECUTION
// ========================================

async function main() {
  console.log('🎯 UnifiedID SDK Complete Example Suite\n');
  console.log('This example demonstrates all features of the UnifiedID SDK');
  console.log('Note: Some operations require a signer and will be skipped\n');

  // Run complete example
  await runCompleteExample();

  // Run operations example (requires signer)
  await runOperationsExample();

  // Run error handling example
  await runErrorHandlingExample();

  console.log('\n🎉 All examples completed!');
  console.log('\n📚 For more information, see the README.md file');
  console.log('🔗 GitHub: https://github.com/unifiedid/sdk');
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runCompleteExample,
  runOperationsExample,
  runErrorHandlingExample
}; 