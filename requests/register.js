

const { ethers } = require("ethers");


 const testKeys={
    pk :"0xcfaf995a2968cfc61a432f6b5ae70db9d2c5cdcd9f8b6101a9b9ad191beb92eb",
    addr:"0x2C21b519B8999CBe3e3eac3273f42A2Ce67f1eEd",
    id:"10Feb",
    mother:"0x21068b37d05575B4D7DFa5393c7b140f65dA0355",
    rpc:"https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925"
  }
  ;(async () => {
    /* ------------------------------------------------------------------ */
    /* 1.  Provider + wallet                                              */
    const provider = new ethers.providers.JsonRpcProvider(testKeys.rpc);
    const wallet   = new ethers.Wallet(testKeys.pk, provider);
  
    if (wallet.address.toLowerCase() !== testKeys.addr.toLowerCase()) {
      throw new Error("Provided address does not match the private key");
    }
  
    /* ------------------------------------------------------------------ */
    /* 2.  Read current nonce from Mother contract                        */
    const motherAbi = ["function nonces(string) view returns (uint256)"];
    const mother    = new ethers.Contract(testKeys.mother, motherAbi, provider);
    const nonce     = await mother.nonces(testKeys.id);
  
    /* ------------------------------------------------------------------ */
    /* 3.  Build packed data exactly like Solidity                        */
    // abi.encode(string,address)
    const inner  = ethers.utils.defaultAbiCoder.encode(
      ["string","address"],
      [testKeys.id, testKeys.addr]
    );
    // abi.encodePacked(inner, nonce)
    const packed = ethers.utils.solidityPack(["bytes","uint256"], [inner, nonce]);
    const hash   = ethers.utils.keccak256(packed);                 // 32‑byte
  
    /* ------------------------------------------------------------------ */
    /* 4.  Sign the hash (EIP‑191 style)                                  */
    const signature = await wallet.signMessage(ethers.utils.arrayify(hash));
  
    /* ------------------------------------------------------------------ */
    /* 5.  Prepare 'options' blob (nonce, deadline)                       */
    const deadline = Math.floor(Date.now() / 1000) + 3600;          // 1 h
    const options  = ethers.utils.defaultAbiCoder.encode(
      ["uint256","uint256"],
      [nonce, deadline]
    );
  
    /* ------------------------------------------------------------------ */
    /* 6.  Output JSON payload                                            */
    const payload = {
      "chainId":"11155111",
      unifiedId:        testKeys.id,
      userAddress:   testKeys.addr,
      nonce:            nonce.toString(),
      "action": "initiate-register-unifiedid",
      masterSignature:  signature,     // first‑time registration → same sig
      primarySignature: signature,
      options
    };
  
    console.log(JSON.stringify(payload, null, 2));
  })();