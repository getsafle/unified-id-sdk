# Unified ID SDK Utility Functions

This document describes the utility functions available in the Unified ID SDK for checking contract states and validating data.

## Overview

The SDK provides utility functions to interact with both mother and child contracts, allowing you to check the existence of unified IDs, validate addresses, and verify chain data without making transaction requests.

## Available Utility Functions

### 1. `unifiedIdExistsOnMotherContract(unifiedId, rpcUrl)`

Checks if a unified ID exists on the mother contract.

**Parameters:**
- `unifiedId` (string): The unified ID to check
- `rpcUrl` (string): RPC URL for the network

**Returns:** Promise<Object>
```javascript
{
  isValid: boolean,
  masterAddress: string
}
```

**Example:**
```javascript
const sdk = new UnifiedIdSDK(config);
const result = await sdk.unifiedIdExistsOnMotherContract('example.id', rpcUrl);
console.log('Is valid:', result.isValid);
console.log('Master address:', result.masterAddress);
```

### 2. `unifiedIdExistsOnChildContract(unifiedId, rpcUrl)`

Checks if a unified ID exists on the child contract.

**Parameters:**
- `unifiedId` (string): The unified ID to check
- `rpcUrl` (string): RPC URL for the network

**Returns:** Promise<boolean>

**Example:**
```javascript
const sdk = new UnifiedIdSDK(config);
const exists = await sdk.unifiedIdExistsOnChildContract('example.id', rpcUrl);
console.log('Exists on child contract:', exists);
```

### 3. `isAddressAlreadyPresentOnChildContract(addressToCheck, rpcUrl)`

Checks if an address is already present on the child contract.

**Parameters:**
- `addressToCheck` (string): The address to check
- `rpcUrl` (string): RPC URL for the network

**Returns:** Promise<boolean>

**Example:**
```javascript
const sdk = new UnifiedIdSDK(config);
const isPresent = await sdk.isAddressAlreadyPresentOnChildContract('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', rpcUrl);
console.log('Address present:', isPresent);
```

### 4. `isAddressAlreadyInUseOnChildContract(unifiedId, addressToCheck, rpcUrl)`

Checks if an address is already in use on the child contract for a specific unified ID.

**Parameters:**
- `unifiedId` (string): The unified ID
- `addressToCheck` (string): The address to check
- `rpcUrl` (string): RPC URL for the network

**Returns:** Promise<boolean>

**Example:**
```javascript
const sdk = new UnifiedIdSDK(config);
const isInUse = await sdk.isAddressAlreadyInUseOnChildContract('example.id', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', rpcUrl);
console.log('Address in use:', isInUse);
```

### 5. `resolveAnyAddressToUnifiedId(addressToCheck, rpcUrl)`

Resolves any address to unified ID and provides role information (primary/secondary).

**Parameters:**
- `addressToCheck` (string): The address to check
- `rpcUrl` (string): RPC URL for the network

**Returns:** Promise<Object>
```javascript
{
  unifiedId: string,
  isPrimary: boolean,
  isSecondary: boolean
}
```

**Example:**
```javascript
const sdk = new UnifiedIdSDK(config);
const result = await sdk.resolveAnyAddressToUnifiedId('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', rpcUrl);
console.log('Unified ID:', result.unifiedId);
console.log('Is Primary:', result.isPrimary);
console.log('Is Secondary:', result.isSecondary);
```

### 6. `validateChainDataExists(unifiedId, chainId, rpcUrl)`

Validates if chain data exists for a unified ID.

**Parameters:**
- `unifiedId` (string): The unified ID
- `chainId` (number): The chain ID
- `rpcUrl` (string): RPC URL for the network

**Returns:** Promise<Object>
```javascript
{
  primary: string,
  secondaries: string[],
  isValid: boolean
}
```

**Example:**
```javascript
const sdk = new UnifiedIdSDK(config);
const chainData = await sdk.validateChainDataExists('example.id', 11155111, rpcUrl);
console.log('Is valid:', chainData.isValid);
console.log('Primary address:', chainData.primary);
console.log('Secondary addresses:', chainData.secondaries);
```

### 7. `isSecondaryAlreadyAddedOnMother(unifiedId, chainId, addressToCheck, rpcUrl)`

Checks if a secondary address is already added on the mother contract.

**Parameters:**
- `unifiedId` (string): The unified ID
- `chainId` (number): The chain ID
- `addressToCheck` (string): The address to check
- `rpcUrl` (string): RPC URL for the network

**Returns:** Promise<boolean>

**Example:**
```javascript
const sdk = new UnifiedIdSDK(config);
const isAdded = await sdk.isSecondaryAlreadyAddedOnMother('example.id', 11155111, '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', rpcUrl);
console.log('Secondary already added:', isAdded);
```

### 8. `isPrimaryAlreadyInUseOnMotherContract(chainId, addressToCheck, rpcUrl)`

Checks if a primary address is already in use on the mother contract.

**Parameters:**
- `chainId` (number): The chain ID
- `addressToCheck` (string): The address to check
- `rpcUrl` (string): RPC URL for the network

**Returns:** Promise<boolean>

**Example:**
```javascript
const sdk = new UnifiedIdSDK(config);
const isInUse = await sdk.isPrimaryAlreadyInUseOnMotherContract(11155111, '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', rpcUrl);
console.log('Primary already in use:', isInUse);
```

## Direct Function Usage

You can also use the utility functions directly without creating an SDK instance:

```javascript
const { 
  unifiedIdExistsOnMotherContract,
  unifiedIdExistsOnChildContract,
  isAddressAlreadyPresentOnChildContract,
  resolveAnyAddressToUnifiedId,
  validateChainDataExists,
  getMotherContractAddress,
  getChildContractAddress
} = require('unified-id-sdk');

// Get contract addresses
const motherAddress = getMotherContractAddress(config);
const childAddress = getChildContractAddress(config);

// Direct function calls
const motherResult = await unifiedIdExistsOnMotherContract(unifiedId, motherAddress, rpcUrl);
const childResult = await unifiedIdExistsOnChildContract(unifiedId, childAddress, rpcUrl);
const addressPresent = await isAddressAlreadyPresentOnChildContract(addressToCheck, childAddress, rpcUrl);
const addressResolution = await resolveAnyAddressToUnifiedId(addressToCheck, childAddress, rpcUrl);
const chainData = await validateChainDataExists(unifiedId, chainId, motherAddress, rpcUrl);
```

## Error Handling

All utility functions throw descriptive errors when:
- Required parameters are missing
- Contract calls fail
- Network issues occur
- Invalid addresses are provided

**Example error handling:**
```javascript
try {
  const result = await sdk.unifiedIdExistsOnMotherContract(unifiedId, rpcUrl);
  console.log('Result:', result);
} catch (error) {
  console.error('Error checking unified ID:', error.message);
}
```

## Configuration Requirements

Make sure your SDK configuration includes:
- `chainId`: The chain ID for the network
- `environment`: Either 'testnet' or 'mainnet'

The utility functions will automatically use the appropriate contract addresses based on your configuration.

## Contract Addresses

The SDK automatically resolves contract addresses based on your configuration:
- Mother contract addresses are defined in `CONTRACT_ADDRESS_MAP`
- Child contract addresses are defined in `CHILD_CONTRACT_ADDRESS_MAP`

Make sure to update these addresses in the config file for your specific networks.

## Best Practices

1. **Always provide valid RPC URLs**: Use reliable RPC providers for consistent results
2. **Handle errors gracefully**: Wrap utility calls in try-catch blocks
3. **Validate inputs**: Ensure addresses and unified IDs are properly formatted
4. **Use appropriate networks**: Make sure you're using the correct network for your use case
5. **Cache results when possible**: For frequently accessed data, consider caching results

## Example Use Cases

### Pre-validation before registration
```javascript
// Check if unified ID already exists before attempting registration
const motherExists = await sdk.unifiedIdExistsOnMotherContract(unifiedId, rpcUrl);
const childExists = await sdk.unifiedIdExistsOnChildContract(unifiedId, rpcUrl);

if (motherExists.isValid || childExists) {
  console.log('Unified ID already exists');
  return;
}

// Proceed with registration
```

### Address validation
```javascript
// Check if address is available before adding as secondary
const isPresent = await sdk.isAddressAlreadyPresentOnChildContract(address, rpcUrl);
const isInUse = await sdk.isAddressAlreadyInUseOnChildContract(unifiedId, address, rpcUrl);

if (isPresent || isInUse) {
  console.log('Address is not available');
  return;
}

// Proceed with adding secondary address
```

### Chain data verification
```javascript
// Verify chain data exists before operations
const chainData = await sdk.validateChainDataExists(unifiedId, chainId, rpcUrl);

if (!chainData.isValid) {
  console.log('Chain data does not exist for this unified ID');
  return;
}

// Proceed with operations that require chain data
``` 