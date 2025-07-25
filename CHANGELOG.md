# Changelog

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

## [1.0.1] - 2025-07-25

### Summary
- Removed build step from package file