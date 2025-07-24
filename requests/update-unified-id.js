#!/usr/bin/env node
/**
 * Generate the master signature + options blob for updateUnifiedId
 *
 *   node sign-update-unifiedid.js \
 *        --pk    0x<MASTER_PRIVATE_KEY> \
 *        --addr  0x<MASTER_ADDRESS> \
 *        --old   oldId123 \
 *        --new   newId456 \
 *        --mother 0x<MOTHER_CONTRACT> \
 *        --rpc  https://ethereum-sepolia-rpc.publicnode.com
 *
 * You can also put PK, ADDR, RPC, MOTHER in a .env file.
 */


const { ethers } = require("ethers");
const testKeys={
    pk :"0xcfaf995a2968cfc61a432f6b5ae70db9d2c5cdcd9f8b6101a9b9ad191beb92eb",
    addr:"0x2C21b519B8999CBe3e3eac3273f42A2Ce67f1eEd",
    old:"10Feb",
    new:"11Feb",
    mother:"0x21068b37d05575B4D7DFa5393c7b140f65dA0355",
    rpc:"https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925"
  }

;(async () => {
  /* 1. Provider + master wallet ------------------------------------------------ */
  const provider = new ethers.providers.JsonRpcProvider(testKeys.rpc);
  const wallet   = new ethers.Wallet(testKeys.pk, provider);

  if (wallet.address.toLowerCase() !== testKeys.addr.toLowerCase()) {
    throw new Error("Provided --addr does not match --pk");
  }

  /* 2. Fetch nonce from Mother contract ---------------------------------------- */
  const motherAbi = ["function nonces(string) view returns (uint256)"];
  const mother    = new ethers.Contract(testKeys.mother, motherAbi, provider);
  const nonce     = await mother.nonces(testKeys.old);

  /* 3. Build packed data exactly like Solidity --------------------------------- */
  const inner  = ethers.utils.defaultAbiCoder.encode(
    ["string","string"],
    [testKeys.old, testKeys.new]
  );                              // abi.encode(oldId,newId)
  const packed = ethers.utils.solidityPack(["bytes","uint256"], [inner, nonce]);
  const hash   = ethers.utils.keccak256(packed);

  /* 4. Sign (EIP‑191, eth_sign) ------------------------------------------------ */
  const signature = await wallet.signMessage(ethers.utils.arrayify(hash));

  /* 5. Build options (nonce, deadline) ----------------------------------------- */
  const deadline = Math.floor(Date.now() / 1000) + 3600;        // +1 hour
  const options  = ethers.utils.defaultAbiCoder.encode(
    ["uint256","uint256"],
    [nonce, deadline]
  );

  /* 6. Output payload ---------------------------------------------------------- */
  const payload = {
    "action": "initiate-update-unifiedid",
    previousUnifiedId:  testKeys.old,
    newUnifiedId:  testKeys.new,
    nonce:         nonce.toString(),
    deadline,
    signature,
    options
  };

  console.log(JSON.stringify(payload, null, 2));
})();
