
const { ethers } = require("ethers");

const motherAbiFile = require("../../artifacts/contracts/MotherContract.sol/RegistrarStorageMother.json")
const motherAbi = motherAbiFile.abi;



  const testKeys={
    primaryPk:   "0xec604ccb73ef29d94043928cafc2d23adbe17b648e32cc7a3f2937609c76afa1",
    secondaryPk: "0xaa5d0b114967a37046562b6872ad582a496e18273cdb2315ab3fcd0700ea48e6",
    primaryAddr: "0xd91c2b3bb4A1BD99993643485Aa9f4c640963401",
    secondaryAddr:"0xD85f078d9d6292E229b3dcf5DAeC401DAb290941",
    id: "5Feb",
    mother:"0x21068b37d05575B4D7DFa5393c7b140f65dA0355",
    rpc:"https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925"
  };


;(async () => {
  try {
    /* ----------------------------------------------------------------- */
    /* provider & wallets                                                */
    const provider      = new ethers.providers.JsonRpcProvider(testKeys.rpc);
    const primaryWallet = new ethers.Wallet(testKeys.primaryPk,   provider);
    const secondaryWallet = new ethers.Wallet(testKeys.secondaryPk, provider);

    if (primaryWallet.address.toLowerCase() !== testKeys.primaryAddr.toLowerCase()) {
      throw new Error("--primaryAddr does not match --primaryPk");
    }
    if (secondaryWallet.address.toLowerCase() !== testKeys.secondaryAddr.toLowerCase()) {
      throw new Error("--secondaryAddr does not match --secondaryPk");
    }

    /* ----------------------------------------------------------------- */
    /* nonce from Mother contract                                        */
  
    const mother    = new ethers.Contract(testKeys.mother, motherAbi, provider);
    const nonce     = await mother.getNonce(testKeys.id);

    console.log("nonce", nonce);

    /* ----------------------------------------------------------------- */
    /* build packed data                                                 */
    const inner  = ethers.utils.defaultAbiCoder.encode(
      ["string","address"],
      [testKeys.id, testKeys.secondaryAddr]
    );
    const packed = ethers.utils.solidityPack(["bytes","uint256"], [inner, nonce]);
    const hash   = ethers.utils.keccak256(packed);

    /* ----------------------------------------------------------------- */
    /* sign with both wallets                                            */
    const primarySignature = await primaryWallet.signMessage(ethers.utils.arrayify(hash));
    const secondarySignature = await secondaryWallet.signMessage(ethers.utils.arrayify(hash));

    /* ----------------------------------------------------------------- */
    /* options blob (nonce, deadline)                                    */
    const deadline = Math.floor(Date.now()/1e3) + 3600;          // +1 hour
    const options  = ethers.utils.defaultAbiCoder.encode(
      ["uint256","uint256"], [nonce, deadline]
    );

    /* ----------------------------------------------------------------- */
    /* output JSON payload                                               */
    const payload = {
      "action": "initiate-add-secondary-address",
      unifiedId:         testKeys.id,
      secondaryAddress:  testKeys.secondaryAddr,
      nonce:             nonce.toString(),
      primarySignature,
      secondarySignature,
      "chainId":"11155111",
      options
    };

    console.log(JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error("❌  Error:", err.message);
    process.exit(1);
  }
})();