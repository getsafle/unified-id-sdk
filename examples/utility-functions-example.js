const { UnifiedIdSDK } = require('../src/index');

// Example configuration
const config = {
  baseURL: 'https://api.example.com',
  authToken: 'your-auth-token',
  chainId: 11155111, // Sepolia testnet
  environment: 'testnet'
};

// RPC URL for the network
const rpcUrl = 'https://sepolia.infura.io/v3/YOUR-PROJECT-ID';

async function demonstrateUtilityFunctions() {
  try {
    // Initialize SDK
    const sdk = new UnifiedIdSDK(config);
    
    console.log('=== Unified ID SDK Utility Functions Demo ===\n');

    // Example unified ID and addresses
    const unifiedId = 'example.unified.id';
    const addressToCheck = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
    const chainId = 11155111;

    console.log('1. Checking if unified ID exists on mother contract...');
    const motherResult = await sdk.unifiedIdExistsOnMotherContract(unifiedId, rpcUrl);
    console.log('Result:', motherResult);
    console.log('Is valid:', motherResult.isValid);
    console.log('Master address:', motherResult.masterAddress);
    console.log('');

    console.log('2. Checking if unified ID exists on child contract...');
    const childResult = await sdk.unifiedIdExistsOnChildContract(unifiedId, rpcUrl);
    console.log('Result:', childResult);
    console.log('');

    console.log('3. Checking if address is already present on child contract...');
    const addressPresent = await sdk.isAddressAlreadyPresentOnChildContract(addressToCheck, rpcUrl);
    console.log('Address present:', addressPresent);
    console.log('');

    console.log('4. Checking if address is already in use on child contract for specific unified ID...');
    const addressInUse = await sdk.isAddressAlreadyInUseOnChildContract(unifiedId, addressToCheck, rpcUrl);
    console.log('Address in use:', addressInUse);
    console.log('');

    console.log('5. Resolving any address to unified ID...');
    const addressResolution = await sdk.resolveAnyAddressToUnifiedId(addressToCheck, rpcUrl);
    console.log('Address resolution:', addressResolution);
    console.log('Unified ID:', addressResolution.unifiedId);
    console.log('Is Primary:', addressResolution.isPrimary);
    console.log('Is Secondary:', addressResolution.isSecondary);
    console.log('');

    console.log('6. Validating chain data exists...');
    const chainData = await sdk.validateChainDataExists(unifiedId, chainId, rpcUrl);
    console.log('Chain data:', chainData);
    console.log('Is valid:', chainData.isValid);
    console.log('Primary address:', chainData.primary);
    console.log('Secondary addresses:', chainData.secondaries);
    console.log('');

    console.log('7. Checking if secondary address is already added on mother...');
    const secondaryAdded = await sdk.isSecondaryAlreadyAddedOnMother(unifiedId, chainId, addressToCheck, rpcUrl);
    console.log('Secondary already added:', secondaryAdded);
    console.log('');

    console.log('8. Checking if primary address is already in use on mother contract...');
    const primaryInUse = await sdk.isPrimaryAlreadyInUseOnMotherContract(chainId, addressToCheck, rpcUrl);
    console.log('Primary already in use:', primaryInUse);
    console.log('');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Direct utility function usage (without SDK instance)
async function demonstrateDirectUtilityUsage() {
  try {
    console.log('\n=== Direct Utility Functions Usage ===\n');

    const { 
      unifiedIdExistsOnMotherContract,
      unifiedIdExistsOnChildContract,
      isAddressAlreadyPresentOnChildContract,
      resolveAnyAddressToUnifiedId,
      validateChainDataExists,
      getMotherContractAddress,
      getChildContractAddress
    } = require('../src/index');

    // Get contract addresses
    const motherAddress = getMotherContractAddress(config);
    const childAddress = getChildContractAddress(config);
    
    console.log('Mother contract address:', motherAddress);
    console.log('Child contract address:', childAddress);
    console.log('');

    const unifiedId = 'example.unified.id';
    const addressToCheck = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
    const chainId = 11155111;

    // Direct function calls
    console.log('1. Direct check - unified ID exists on mother contract...');
    const motherResult = await unifiedIdExistsOnMotherContract(unifiedId, motherAddress, rpcUrl);
    console.log('Result:', motherResult);
    console.log('');

    console.log('2. Direct check - unified ID exists on child contract...');
    const childResult = await unifiedIdExistsOnChildContract(unifiedId, childAddress, rpcUrl);
    console.log('Result:', childResult);
    console.log('');

    console.log('3. Direct check - address present on child contract...');
    const addressPresent = await isAddressAlreadyPresentOnChildContract(addressToCheck, childAddress, rpcUrl);
    console.log('Address present:', addressPresent);
    console.log('');

    console.log('4. Direct check - resolve any address to unified ID...');
    const addressResolution = await resolveAnyAddressToUnifiedId(addressToCheck, childAddress, rpcUrl);
    console.log('Address resolution:', addressResolution);
    console.log('');

    console.log('5. Direct check - validate chain data exists...');
    const chainData = await validateChainDataExists(unifiedId, chainId, motherAddress, rpcUrl);
    console.log('Chain data:', chainData);
    console.log('');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
if (require.main === module) {
  demonstrateUtilityFunctions()
    .then(() => demonstrateDirectUtilityUsage())
    .catch(console.error);
}

module.exports = {
  demonstrateUtilityFunctions,
  demonstrateDirectUtilityUsage
}; 