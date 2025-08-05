# Unified ID SDK

A functional JavaScript SDK for Unified ID registration and management.

## Features

- 📝 **Unified ID Registration**: Register new unified IDs with cryptographic signatures
- 🔗 **Secondary Address Management**: Add and remove secondary addresses
- ⚡ **Class-based Design**: Easy-to-use UnifiedIdSDK class
- 🔒 **Security**: EIP-191 compliant signatures and secure nonce management
- 🔍 **Comprehensive Utility Functions**: Check contract states, validate addresses, and verify data

## Installation

```bash
npm install unified-id-sdk
```

## Quick Integration Checklist

1. **Initialize the SDK with config** (see below)
2. **Use SDK utility functions for nonce and signature hash**
3. **Sign the hash with your wallet or signing method**
4. **Call the SDK class methods for API actions**

---

## SDK Initialization

You **must** provide all config values explicitly. There are no defaults or environment variable fallbacks. The contract address is set automatically based on `environment` and `chainId`.

```javascript
const UnifiedIdSDK = require('unified-id-sdk');

const config = {
  baseURL: 'safle_api_base_url',           // API base URL (required)
  authToken: 'your-bearer-token-here',           // Auth token (required)
  chainId: 11155111,                             // Blockchain chain ID (required, e.g. Sepolia)
  environment: 'testnet'                         // 'testnet' or 'mainnet' (required)
};

const sdk = new UnifiedIdSDK(config);
```

If any config value is missing or invalid, the SDK will throw an error.

### Environment and Chain ID Validation

- `environment` must be either `'testnet'` or `'mainnet'`.
- The `chainId` must match the allowed values for the selected environment.
- The contract address is set automatically; **do not provide it manually**.

---

## Usage Examples

**Note:** For all flows, you must sign the hash returned by `createSignatureMessage` using your preferred wallet or signing method (e.g., MetaMask, ethers.js, hardware wallet, etc.).

### 1. Register a New Unified ID

**Step 1: Generate the signature hash**
```javascript
const { getNonce, createSignatureMessage } = require('unified-id-sdk');
const nonce = await getNonce('my-unified-id', config, 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
const hash = createSignatureMessage('register', {
  unifiedId: 'my-unified-id',
  userAddress: '0xUSER_ADDRESS',
  nonce: Number(nonce)
});
```
**Step 2: Sign the hash**
- Dapp/user must sign the hash using their wallet.

**Step 3: Call the SDK method**
```javascript
const result = await sdk.registerUnifiedId({
  unifiedId: 'my-unified-id',
  userAddress: '0xUSER_ADDRESS',
  nonce: Number(nonce),
  signature // <- the signature from the user
});
```

### 2. Add a Secondary Address

**Step 1: Generate the signature hash**
```javascript
const nonce = await getNonce('my-unified-id', config, 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
const hash = createSignatureMessage('register', {
  unifiedId: 'my-unified-id',
  userAddress: '0xSECONDARY_ADDRESS',
  nonce: Number(nonce)
});
```
**Step 2: Sign the hash**
- Both the primary and secondary wallets must sign the hash.
- Pass both signatures to the SDK method below.

**Step 3: Call the SDK method**
```javascript
const result = await sdk.addSecondaryAddress({
  unifiedId: 'my-unified-id',
  secondaryAddress: '0xSECONDARY_ADDRESS',
  nonce: Number(nonce),
  primarySignature,   // <- signature from primary wallet
  secondarySignature  // <- signature from secondary wallet
});
```

### 3. Remove a Secondary Address

**Step 1: Generate the signature hash**
```javascript
const nonce = await getNonce('my-unified-id', config, 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
const hash = createSignatureMessage('removeSecondary', {
  unifiedId: 'my-unified-id',
  secondaryAddress: '0xSECONDARY_ADDRESS',
  nonce: Number(nonce)
});
```
**Step 2: Sign the hash**
- The primary wallet must sign the hash.

**Step 3: Call the SDK method**
```javascript
const result = await sdk.removeSecondaryAddress({
  unifiedId: 'my-unified-id',
  secondaryAddress: '0xSECONDARY_ADDRESS',
  nonce: Number(nonce),
  signature // <- signature from primary wallet
});
```

### 4. Update Unified ID

**Step 1: Generate the signature hash**
```javascript
const nonce = await getNonce('old-unified-id', config, 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
const hash = createSignatureMessage('updateUnifiedId', {
  oldUnifiedId: 'old-unified-id',
  newUnifiedId: 'new-unified-id',
  nonce: Number(nonce)
});
```
**Step 2: Sign the hash**
- The primary wallet must sign the hash

**Step 3: Call the SDK method**
```javascript
const result = await sdk.updateUnifiedId({
  oldUnifiedId: 'old-unified-id',
  newUnifiedId: 'new-unified-id',
  nonce: Number(nonce),
  signature // <- signature from primary wallet
});
```

### 5. Change Primary Address

**Step 1: Generate the signature hash**
```javascript
const nonce = await getNonce('my-unified-id', config, 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
const hash = createSignatureMessage('primaryChange', {
  unifiedId: 'my-unified-id',
  newAddress: '0xNEW_PRIMARY_ADDRESS',
  nonce: Number(nonce)
});
```
**Step 2: Sign the hash**
- Both the current and new primary wallets must sign the hash.
- Pass both signatures to the SDK method below.

**Step 3: Call the SDK method**
```javascript
const result = await sdk.changePrimaryAddress({
  unifiedId: 'my-unified-id',
  newAddress: '0xNEW_PRIMARY_ADDRESS',
  nonce: Number(nonce),
  currentPrimarySignature, // <- signature from current primary wallet
  newPrimarySignature     // <- signature from new primary wallet
});
```

---

## Utility Functions

The SDK provides comprehensive utility functions for checking contract states, validating addresses, and verifying data. These functions can be used both as SDK instance methods and as direct exports.

### Core Utility Functions

You can use these functions directly:

```javascript
const { 
  getProvider, 
  getNonce, 
  createSignatureMessage, 
  createOptions,
  // Contract state utilities
  isValidUnifiedID,
  isPrimaryAddressAlreadyRegistered,
  isSecondaryAddressAlreadyRegistered,
  isUnifiedIDAlreadyRegistered,
  getMasterWalletforUnifiedID,
  getPrimaryWalletforUnifiedID,
  getSecondaryWalletsforUnifiedID,
  getUnifiedIDByPrimaryAddress,
  getRegistrationFees,
  validateSignature
} = require('unified-id-sdk');
```

### SDK Instance Methods

When using the SDK class, you can call utility functions as instance methods:

```javascript
const sdk = new UnifiedIdSDK(config);

// Check if unified ID is valid
const isValid = await sdk.isValidUnifiedID('example.id', rpcUrl);
console.log('Is valid:', isValid);

// Check if address is registered as primary
const isPrimary = await sdk.isPrimaryAddressAlreadyRegistered('0xPRIMARY_ADDRESS', rpcUrl);
console.log('Is primary:', isPrimary);

// Check if address is registered as secondary
const isSecondary = await sdk.isSecondaryAddressAlreadyRegistered('0xSECONDARY_ADDRESS',rpcUrl);
console.log('Is secondary:', isSecondary);

// Check if unified ID is already registered
const isRegistered = await sdk.isUnifiedIDAlreadyRegistered('example.id', rpcUrl);
console.log('Is registered:', isRegistered);

// Get master wallet for unified ID
const masterWallet = await sdk.getMasterWalletforUnifiedID('example.id', rpcUrl);
console.log('Master wallet:', masterWallet);

// Get primary wallet for unified ID
const primaryWallet = await sdk.getPrimaryWalletforUnifiedID('example.id', rpcUrl);
console.log('Primary wallet:', primaryWallet);

// Get secondary wallets for unified ID
const secondaryWallets = await sdk.getSecondaryWalletsforUnifiedID('example.id', rpcUrl);
console.log('Secondary wallets:', secondaryWallets);

// Get unified ID by primary address
const unifiedId = await sdk.getUnifiedIDByPrimaryAddress('0xPRIMARY_ADDRESS', chainId, rpcUrl);
console.log('Unified ID:', unifiedId);

// Get registration fees for a token
const fees = await sdk.getRegistrationFees('TOKEN_ADDRESS', '1000000000000000000', rpcUrl);
console.log('Registration fees:', fees);

// Validate signature
const isValidSignature = await sdk.validateSignature(data, expectedSigner, signature, rpcUrl);
console.log('Signature valid:', isValidSignature);
```

### Example Use Cases

#### Pre-validation before registration
```javascript
// Check if unified ID already exists before attempting registration
const isValid = await sdk.isValidUnifiedID(unifiedId, rpcUrl);
const isRegistered = await sdk.isUnifiedIDAlreadyRegistered(unifiedId, rpcUrl);

if (!isValid || isRegistered) {
  console.log('Unified ID is invalid or already registered');
  return;
}

// Proceed with registration
```

#### Address validation
```javascript
// Check if address is available before adding as secondary
const isPrimary = await sdk.isPrimaryAddressAlreadyRegistered(address, rpcUrl);
const isSecondary = await sdk.isSecondaryAddressAlreadyRegistered(address, rpcUrl);

if (isPrimary || isSecondary) {
  console.log('Address is already registered');
  return;
}

// Proceed with adding secondary address
```

#### Wallet information retrieval
```javascript
// Get all wallet information for a unified ID
const masterWallet = await sdk.getMasterWalletforUnifiedID(unifiedId, rpcUrl);
const primaryWallet = await sdk.getPrimaryWalletforUnifiedID(unifiedId, rpcUrl);
const secondaryWallets = await sdk.getSecondaryWalletsforUnifiedID(unifiedId, rpcUrl);

console.log('Master wallet:', masterWallet);
console.log('Primary wallet:', primaryWallet);
console.log('Secondary wallets:', secondaryWallets);
```

#### Signature validation
```javascript
// Validate a signature for a specific operation
const data = createSignatureMessage('register', {
  unifiedId: 'example.id',
  userAddress: 'USER_ADDRESS',
  nonce: 1
});

const isValid = await sdk.validateSignature(data, expectedSigner, signature, rpcUrl);
console.log('Signature valid:', isValid);
```

---

## Error Handling

All SDK methods return a result object:

```javascript
const result = await sdk.registerUnifiedId(params);
if (!result.success) {
  console.error('Error:', result.error);
  console.error('Details:', result.details);
}
```

Utility functions throw descriptive errors when:
- Required parameters are missing
- Contract calls fail
- Network issues occur
- Invalid addresses are provided

**Example error handling:**
```javascript
try {
  const result = await sdk.isValidUnifiedID(unifiedId, rpcUrl);
  console.log('Result:', result);
} catch (error) {
  console.error('Error checking unified ID:', error.message);
}
```

---

## Security Considerations

1. **Private Keys**: Never expose private keys in client-side code
2. **Network Security**: Use HTTPS for all API communications
3. **Token Management**: Store authentication tokens securely
4. **Nonce Management**: The SDK provides utilities for nonce retrieval
5. **Signature Verification**: All signatures follow EIP-191 standards
6. **Address Validation**: Always validate addresses before using them in operations

---

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team. 