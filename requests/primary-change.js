
const { ethers } = require("ethers");
// ────────────────────────────────────────────────────────────────────────────────
// 1. PARAMETERS – edit as needed
// ────────────────────────────────────────────────────────────────────────────────

    
const params = {
    unifiedId:         "2Feb",
  
    currentPk:         "0x894788582fec906a4735628f296f8ea0b78678b65a6920c64c2af56ffeaf0d9e",
    currentAddr:       "0xc10270465E55Ba79BcC011d66f03B41A95C4271D",
  
    newPk:             "0x2972c9b48aa3a731f532a4d392cd5c15c599f8c9bdd8c818b7b359d6ae84aed2",
    newAddr:           "0x461d775EdED1357cF37Aee81b48B52Df1760D1fd",
  
    motherAddress:     "0x21068b37d05575B4D7DFa5393c7b140f65dA0355",
    rpc:               "https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925",
  
    // safety‑margin (seconds) the backend / relayer accepts
    deadlineSeconds:   3600
  };

// ────────────────────────────────────────────────────────────────────────────────
// 2. MAIN
// ────────────────────────────────────────────────────────────────────────────────
(async () => {
    try {
      /* Provider + wallets */
      const provider        = new ethers.providers.JsonRpcProvider(params.rpc);
      const currentWallet   = new ethers.Wallet(params.currentPk, provider);
      const newWallet       = new ethers.Wallet(params.newPk,     provider);
  
      /* Sanity‑checks */
      if (currentWallet.address.toLowerCase() !== params.currentAddr.toLowerCase()) {
        throw new Error("currentAddr does not match currentPk");
      }
      if (newWallet.address.toLowerCase() !== params.newAddr.toLowerCase()) {
        throw new Error("newAddr does not match newPk");
      }
  
      /* Fetch nonce from Mother contract */
      const motherAbi = ["function nonces(string) view returns (uint256)"];
      const mother    = new ethers.Contract(params.motherAddress, motherAbi, provider);
      const nonce     = await mother.nonces(params.unifiedId);
      console.log("nonce", nonce)
      console.log(`Nonce: ${nonce.toString()}`);
  
      /* Build message hash → keccak256( abi.encodePacked( abi.encode(id, newAddr), nonce ) ) */
      const inner  = ethers.utils.defaultAbiCoder.encode(
        ["string", "address"],
        [params.unifiedId, params.newAddr]
      );
      const packed = ethers.utils.solidityPack(["bytes","uint256"], [inner, nonce]);
      const hash   = ethers.utils.keccak256(packed);
  
      /* Sign with both wallets */
      const currentSig = await currentWallet.signMessage(ethers.utils.arrayify(hash));
      const newSig     = await newWallet.signMessage(   ethers.utils.arrayify(hash));
  
      /* Options blob (nonce, deadline) */
      const deadline = Math.floor(Date.now() / 1e3) + params.deadlineSeconds;
      const options  = ethers.utils.defaultAbiCoder.encode(
        ["uint256","uint256"], [nonce, deadline]
      );
  
      /* Final payload */
      const payload = {
        "chainId": 11155111,
        unifiedId:               params.unifiedId,
        newPrimaryAddress:       params.newAddr,
        nonce:                   nonce.toString(),
        deadline,
        currentPrimarySignature: currentSig,
        newPrimarySignature:     newSig,
        options
      };
  
      console.log("\nGenerated payload ↓↓↓");
      console.log(JSON.stringify(payload, null, 2));
    } catch (err) {
      console.error("❌  Error:", err.message);
      process.exit(1);
    }
  })();