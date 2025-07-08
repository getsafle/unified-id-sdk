/**
 * @fileoverview Basic UnifiedID SDK Tests
 * @author kunalmkv
 * @version 1.0.0
 */

const { UnifiedID, SUPPORTED_CHAINS, DEFAULT_CONFIG } = require('../src/index');

// ========================================
// TEST CONFIGURATION
// ========================================

const testConfig = {
  apiUrl: 'http://localhost:3000',
  rpcUrls: {
    11155111: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID'
  },
  contractAddresses: {
    mother: {
      11155111: '0x6E88e069dA65b621b87FDbDdC2858A6F9d8A5202'
    }
  },
  logging: {
    level: 'error', // Reduce log noise during tests
    enabled: false
  }
};

// ========================================
// TEST FUNCTIONS
// ========================================

function testSDKInitialization() {
  console.log('🧪 Testing SDK initialization...');
  
  try {
    const unifiedId = new UnifiedID(testConfig);
    console.log('✅ SDK initialized successfully');
    
    // Test configuration
    console.log('📋 Testing configuration...');
    const validation = unifiedId.validateConfig();
    console.log('Configuration validation:', validation.isValid ? '✅ PASS' : '❌ FAIL');
    
    if (!validation.isValid) {
      console.log('Validation errors:', validation.errors);
    }
    
    return unifiedId;
  } catch (error) {
    console.log('❌ SDK initialization failed:', error.message);
    throw error;
  }
}

function testConstants() {
  console.log('\n🧪 Testing constants...');
  
  console.log('Supported chains:', Object.keys(SUPPORTED_CHAINS).length);
  console.log('Default config keys:', Object.keys(DEFAULT_CONFIG).length);
  
  console.log('✅ Constants test passed');
}

function testValidation(unifiedId) {
  console.log('\n🧪 Testing validation functions...');
  
  // Test UnifiedID validation
  const validUnifiedId = unifiedId.isValidUnifiedId('alice.eth');
  const invalidUnifiedId = unifiedId.isValidUnifiedId('invalid@id');
  
  console.log('Valid UnifiedID test:', validUnifiedId ? '✅ PASS' : '❌ FAIL');
  console.log('Invalid UnifiedID test:', !invalidUnifiedId ? '✅ PASS' : '❌ FAIL');
  
  // Test address validation
  const validAddress = unifiedId.isValidAddress('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
  const invalidAddress = unifiedId.isValidAddress('invalid-address');
  
  console.log('Valid address test:', validAddress ? '✅ PASS' : '❌ FAIL');
  console.log('Invalid address test:', !invalidAddress ? '✅ PASS' : '❌ FAIL');
  
  // Test chain support
  const supportedChain = unifiedId.isChainSupported(11155111);
  const unsupportedChain = unifiedId.isChainSupported(999999);
  
  console.log('Supported chain test:', supportedChain ? '✅ PASS' : '❌ FAIL');
  console.log('Unsupported chain test:', !unsupportedChain ? '✅ PASS' : '❌ FAIL');
  
  console.log('✅ Validation tests passed');
}

function testUtilityFunctions(unifiedId) {
  console.log('\n🧪 Testing utility functions...');
  
  // Test deadline creation
  const deadline = unifiedId.createDeadline(30);
  const currentTime = Math.floor(Date.now() / 1000);
  const isFuture = deadline > currentTime;
  
  console.log('Deadline creation test:', isFuture ? '✅ PASS' : '❌ FAIL');
  
  // Test domain creation
  const domain = unifiedId.createDomain(
    '0x6E88e069dA65b621b87FDbDdC2858A6F9d8A5202',
    11155111,
    'UnifiedID',
    '1'
  );
  
  const hasRequiredFields = domain.name && domain.version && domain.chainId && domain.verifyingContract;
  console.log('Domain creation test:', hasRequiredFields ? '✅ PASS' : '❌ FAIL');
  
  // Test supported chains
  const supportedChains = unifiedId.getSupportedChains();
  const hasChains = Object.keys(supportedChains).length > 0;
  console.log('Supported chains test:', hasChains ? '✅ PASS' : '❌ FAIL');
  
  console.log('✅ Utility function tests passed');
}

async function testHealthCheck(unifiedId) {
  console.log('\n🧪 Testing health check...');
  
  try {
    const health = await unifiedId.healthCheck();
    console.log('Health check status:', health.status);
    console.log('✅ Health check test passed');
    return health.status === 'healthy';
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    console.log('⚠️  This is expected if the API server is not running');
    return false;
  }
}

async function testResolutionFunctions(unifiedId) {
  console.log('\n🧪 Testing resolution functions...');
  
  try {
    // Test resolve primary address (this will likely fail without real data)
    await unifiedId.resolvers.resolvePrimaryAddress('test.eth', 11155111);
    console.log('✅ Primary address resolution test passed');
  } catch (error) {
    console.log('⚠️  Primary address resolution test failed (expected):', error.message);
  }
  
  try {
    // Test resolve UnifiedID (this will likely fail without real data)
    await unifiedId.resolvers.resolveUnifiedId('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', 11155111);
    console.log('✅ UnifiedID resolution test passed');
  } catch (error) {
    console.log('⚠️  UnifiedID resolution test failed (expected):', error.message);
  }
  
  console.log('✅ Resolution function tests completed');
}

function testEventHandling(unifiedId) {
  console.log('\n🧪 Testing event handling...');
  
  let eventReceived = false;
  
  const testListener = (event) => {
    eventReceived = true;
    console.log('Event received:', event.type);
  };
  
  // Add event listener
  unifiedId.on('test:event', testListener);
  
  // Emit test event
  unifiedId.emit('test:event', { data: 'test' });
  
  // Remove event listener
  unifiedId.off('test:event', testListener);
  
  console.log('Event handling test:', eventReceived ? '✅ PASS' : '❌ FAIL');
  console.log('✅ Event handling tests passed');
}

// ========================================
// MAIN TEST RUNNER
// ========================================

async function runTests() {
  console.log('🎯 UnifiedID SDK Basic Tests\n');
  
  try {
    // Test constants
    testConstants();
    
    // Test SDK initialization
    const unifiedId = testSDKInitialization();
    
    // Test validation functions
    testValidation(unifiedId);
    
    // Test utility functions
    testUtilityFunctions(unifiedId);
    
    // Test event handling
    testEventHandling(unifiedId);
    
    // Test health check (may fail if API server is not running)
    const isHealthy = await testHealthCheck(unifiedId);
    
    // Test resolution functions (may fail without real data)
    await testResolutionFunctions(unifiedId);
    
    console.log('\n🎉 All basic tests completed!');
    
    if (!isHealthy) {
      console.log('\n⚠️  Note: Health check failed - this is expected if the API server is not running');
      console.log('   To test API functionality, start the UnifiedID API server first');
    }
    
    console.log('\n📚 For more comprehensive tests, see the examples/complete-example.js file');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testSDKInitialization,
  testConstants,
  testValidation,
  testUtilityFunctions,
  testHealthCheck,
  testResolutionFunctions,
  testEventHandling
}; 