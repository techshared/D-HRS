const { ethers } = require("ethers");

async function generateTestAccount() {
  const wallet = ethers.Wallet.createRandom();
  
  console.log("=== Test Account Generated ===");
  console.log("Address:", wallet.address);
  console.log("Private Key (USE CAUTION - KEEP SECRET):", wallet.privateKey);
  console.log("");
  console.log("NEXT STEPS:");
  console.log("1. Go to https://sepoliafaucet.com or https://cloud.google.com/blog/products/infrastructure/multi-cloud-crypto-faucet");
  console.log("2. Enter this address to receive free SepoliaETH");
  console.log("3. Create a .env file in /contracts with:");
  console.log("   PRIVATE_KEY=" + wallet.privateKey.replace("0x", ""));
  console.log("   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY");
  console.log("");
  console.log("NOTE: This account is for TESTNET use only. Never use on mainnet!");
}

generateTestAccount()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
