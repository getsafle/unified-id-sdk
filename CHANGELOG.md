# Changelog

## [1.0.3] - 2025-08-04

### Summary
- Enhanced utility functions with comprehensive contract state checking capabilities
- Improved documentation with detailed examples and use cases
- Fixed test data and improved test coverage
- Added advanced contract interaction utilities

### Major Enhancements

#### New Utility Functions (SDK Instance Methods)
- `isValidUnifiedID(unifiedId, rpcUrl)` - Check if unified ID is valid
- `isPrimaryAddressAlreadyRegistered(address, rpcUrl)` - Check if address is registered as primary
- `isSecondaryAddressAlreadyRegistered(address, rpcUrl)` - Check if address is registered as secondary
- `isUnifiedIDAlreadyRegistered(unifiedId, rpcUrl)` - Check if unified ID is already registered
- `getMasterWalletforUnifiedID(unifiedId, rpcUrl)` - Get master wallet for unified ID
- `getPrimaryWalletforUnifiedID(unifiedId, rpcUrl)` - Get primary wallet for unified ID
- `getSecondaryWalletsforUnifiedID(unifiedId, rpcUrl)` - Get secondary wallets for unified ID
- `getUnifiedIDByPrimaryAddress(address, chainId, rpcUrl)` - Get unified ID by primary address
- `getRegistrationFees(token, registrarFees, rpcUrl)` - Get registration fees for token
- `validateSignature(data, expectedSigner, signature, rpcUrl)` - Validate signatures

#### Contract Address Utilities
- `getChildContractAddress(config)` - Get child contract address
- `getMotherContractAddress(config)` - Get mother contract address
- `getStorageUtilContractAddress(config)` - Get storage util contract address

### Documentation Improvements
- **Comprehensive README.md Update**: Added detailed utility functions documentation
- **Example Use Cases**: Added practical examples for pre-validation, address validation, wallet retrieval, and signature validation
- **Error Handling**: Enhanced error handling documentation with try-catch examples
- **Security Considerations**: Added address validation as security consideration
- **Multiple Usage Patterns**: Documented both SDK instance methods and direct function usage

### Testing Improvements
- **Fixed Test Data**: Corrected invalid Ethereum address format in test data
- **Enhanced Test Coverage**: Improved utility functions test with real contract data
- **Better Error Handling**: Added proper error handling in test scenarios

### Breaking Changes
- None


## [1.0.1] - 2025-07-25

### Summary
- Updated main branch pipeline

## [1.0.0] - 2025-07-25

### Summary
- Initial public release of the JavaScript SDK for Unified ID registration and management.
- Class-based SDK with utility functions for signature hash generation and nonce retrieval.

### Major Features
- Unified ID registration
- Add/remove secondary address
- Change primary address
- Update unified ID
- Utility helpers for signature hash and nonce

### Public API (Exposed Functions & Class Methods)

#### Class: `UnifiedIdSDK`
- `constructor(config)`
- `registerUnifiedId({ unifiedId, userAddress, nonce, signature })`
- `addSecondaryAddress({ unifiedId, secondaryAddress, nonce, primarySignature, secondarySignature })`
- `removeSecondaryAddress({ unifiedId, secondaryAddress, nonce, signature })`
- `changePrimaryAddress({ unifiedId, newAddress, nonce, currentPrimarySignature, newPrimarySignature })`
- `updateUnifiedId({ oldUnifiedId, newUnifiedId, nonce, signature })`

#### Utility Functions (named exports)
- `getProvider(rpcUrl)`
- `getNonce(unifiedId, config, rpcUrl)`
- `createSignatureMessage(operation, params)`
- `createOptions(nonce, deadlineOffset)`
