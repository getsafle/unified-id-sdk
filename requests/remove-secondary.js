const { ethers } = require("ethers");
const motherAbiFile = require("../../artifacts/contracts/MotherContract.sol/RegistrarStorageMother.json")
const motherAbi = motherAbiFile.abi;



// ───── configuration (env overrides) ──────────────────────────
const cfg = {
  rpc          : "https://sepolia.infura.io/v3/0611b8c478b14db0b7d29e51466ff925",

  id    : "5Feb",

  sec    :"0xD85f078d9d6292E229b3dcf5DAeC401DAb290941",

  pk   :"0xec604ccb73ef29d94043928cafc2d23adbe17b648e32cc7a3f2937609c76afa1",

  mother       : "0x21068b37d05575B4D7DFa5393c7b140f65dA0355"
};

// ───── main ───────────────────────────────────────────────────

// ── main ───────────────────────────────────────────────────────
(async () => {
    const provider = new ethers.providers.JsonRpcProvider(cfg.rpc);
    const wallet   = new ethers.Wallet(cfg.pk, provider);
  
    /* 1. fetch nonce from Mother */
    const mother    = new ethers.Contract(cfg.mother, motherAbi, provider);
    const nonce     = await mother.getNonce(cfg.id);
    /* 2. build packed data: abi.encodePacked( abi.encode(id, secAddr), nonce ) */
    const inner  = ethers.utils.defaultAbiCoder.encode(
      ["string","address"], [cfg.id, cfg.sec]
    );
    const packed = ethers.utils.solidityPack(["bytes","uint256"], [inner, nonce]);
    const hash   = ethers.utils.keccak256(packed);
  
    /* 3. sign with PRIMARY */
    const signature = await wallet.signMessage(ethers.utils.arrayify(hash));
  
    /* 4. options (nonce, deadline) → abi.encode(uint256,uint256) */
    const deadline = Math.floor(Date.now()/1e3) + 3600; // +1 hour
    const options  = ethers.utils.defaultAbiCoder.encode(
      ["uint256","uint256"], [nonce, deadline]
    );
  
    /* 5. output */
    const payload = {
      "action": "initiate-remove-secondary-address",
      "chainId":"11155111",
      unifiedId        : cfg.id,
      secondaryAddress : cfg.sec,
      nonce            : nonce.toString(),
      signature,
      options
    };
  
    console.log(JSON.stringify(payload, null, 2));
  })().catch(err => {
    console.error("❌ Script error:", err.message);
    process.exit(1);
  });