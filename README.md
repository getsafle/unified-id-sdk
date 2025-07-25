# Unified ID SDK

A functional JavaScript SDK for Unified ID registration and management.

## Features

- 📝 **Unified ID Registration**: Register new unified IDs with cryptographic signatures
- 🔗 **Secondary Address Management**: Add and remove secondary addresses
- ⚡ **Class-based Design**: Easy-to-use UnifiedIdSDK class
- 🔒 **Security**: EIP-191 compliant signatures and secure nonce management

## Installation

```bash
npm install unified-id-sdk
```

## Quick Integration Checklist

1. **Install ethers.js** (if not already):
   ```bash
   npm install ethers
   ```
2. **Create wallets using ethers.Wallet** (not via SDK)
3. **Initialize the SDK with config** (see below)
4. **Use SDK utility functions for nonce and signature message**
5. **Sign messages with your wallet**
6. **Call the SDK class methods for API actions**

---

## SDK Initialization

You **must** provide all config values explicitly. There are no defaults or environment variable fallbacks. The contract address is set automatically based on `environment` and `chainId`.

```javascript
const UnifiedIdSDK = require('unified-id-sdk');

const config = {
  baseURL: 'https://api.unifiedid.com',           // API base URL (required)
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

### 1. Register a New Unified ID

```javascript
const { ethers } = require('ethers');
const { getNonce, createSignatureMessage } = require('unified-id-sdk');

const wallet = new ethers.Wallet('0xYOUR_PRIVATE_KEY', new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID'));
const userAddress = wallet.address;
const nonce = await getNonce('my-unified-id', config, 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
const hash = createSignatureMessage('register', {
  unifiedId: 'my-unified-id',
  userAddress,
  nonce: Number(nonce)
});
const signature = await wallet.signMessage(ethers.utils.arrayify(hash));

const result = await sdk.registerUnifiedId({
  unifiedId: 'my-unified-id',
  userAddress,
  nonce: Number(nonce),
  signature
});
```

### 2. Add a Secondary Address

```javascript
const primaryWallet = new ethers.Wallet('0xPRIMARY_PK', new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID'));
const secondaryWallet = new ethers.Wallet('0xSECONDARY_PK', new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID'));
const secondaryAddress = secondaryWallet.address;
const nonce = await getNonce('my-unified-id', config, 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
const hash = createSignatureMessage('register', {
  unifiedId: 'my-unified-id',
  userAddress: secondaryAddress,
  nonce: Number(nonce)
});
const primarySignature = await primaryWallet.signMessage(ethers.utils.arrayify(hash));
const secondarySignature = await secondaryWallet.signMessage(ethers.utils.arrayify(hash));

const result = await sdk.addSecondaryAddress({
  unifiedId: 'my-unified-id',
  secondaryAddress,
  nonce: Number(nonce),
  primarySignature,
  secondarySignature
});
```

### 3. Remove a Secondary Address

```javascript
const primaryWallet = new ethers.Wallet('0xPRIMARY_PK', new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID'));
const nonce = await getNonce('my-unified-id', config, 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
const hash = createSignatureMessage('removeSecondary', {
  unifiedId: 'my-unified-id',
  secondaryAddress: '0xSECONDARY_ADDRESS',
  nonce: Number(nonce)
});
const signature = await primaryWallet.signMessage(ethers.utils.arrayify(hash));

const result = await sdk.removeSecondaryAddress({
  unifiedId: 'my-unified-id',
  secondaryAddress: '0xSECONDARY_ADDRESS',
  nonce: Number(nonce),
  signature
});
```

### 4. Update Unified ID

```javascript
const primaryWallet = new ethers.Wallet('0xPRIMARY_PK', new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID'));
const nonce = await getNonce('old-unified-id', config, 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
const hash = createSignatureMessage('updateUnifiedId', {
  oldUnifiedId: 'old-unified-id',
  newUnifiedId: 'new-unified-id',
  nonce: Number(nonce)
});
const signature = await primaryWallet.signMessage(ethers.utils.arrayify(hash));

const result = await sdk.updateUnifiedId({
  oldUnifiedId: 'old-unified-id',
  newUnifiedId: 'new-unified-id',
  nonce: Number(nonce),
  signature
});
```

### 5. Change Primary Address

```javascript
const currentWallet = new ethers.Wallet('0xCURRENT_PK', new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID'));
const newWallet = new ethers.Wallet('0xNEW_PK', new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID'));
const newAddress = newWallet.address;
const nonce = await getNonce('my-unified-id', config, 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID');
const hash = createSignatureMessage('primaryChange', {
  unifiedId: 'my-unified-id',
  newAddress,
  nonce: Number(nonce)
});
const currentPrimarySignature = await currentWallet.signMessage(ethers.utils.arrayify(hash));
const newPrimarySignature = await newWallet.signMessage(ethers.utils.arrayify(hash));

const result = await sdk.changePrimaryAddress({
  unifiedId: 'my-unified-id',
  newAddress,
  nonce: Number(nonce),
  currentPrimarySignature,
  newPrimarySignature
});
```

---

## Utility Functions and Named Exports

You can use the following utility functions directly:

```javascript
const { getProvider, getNonce, createSignatureMessage, createOptions } = require('unified-id-sdk');
```
- `getProvider(rpcUrl)`
- `getNonce(unifiedId, config, rpcUrl)`
- `createSignatureMessage(operation, params)`
- `createOptions(nonce, deadlineOffset)`

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

---

## Security Considerations

1. **Private Keys**: Never expose private keys in client-side code
2. **Network Security**: Use HTTPS for all API communications
3. **Token Management**: Store authentication tokens securely
4. **Nonce Management**: The SDK provides utilities for nonce retrieval
5. **Signature Verification**: All signatures follow EIP-191 standards

---

## Development

### Building the Package

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team. 