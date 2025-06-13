const { Keypair, Connection, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

async function generateWallet() {
  try {
    // Generate new keypair
    const keypair = Keypair.generate();

    console.log("🎉 New Solana Wallet Generated!");
    console.log("====================================");
    console.log("Public Key (Address):", keypair.publicKey.toBase58());
    console.log("====================================");
    console.log("Private Key Array for .env:");
    console.log("[" + Array.from(keypair.secretKey).join(",") + "]");
    console.log("====================================");

    // Save to JSON file
    const walletData = {
      publicKey: keypair.publicKey.toBase58(),
      privateKey: Array.from(keypair.secretKey),
    };

    const walletPath = path.join(__dirname, "../wallet.json");
    fs.writeFileSync(walletPath, JSON.stringify(walletData, null, 2));

    console.log("✅ Wallet saved to:", walletPath);
    console.log("====================================");

    // Check balance on devnet
    console.log("Checking balance on Devnet...");
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    try {
      const balance = await connection.getBalance(keypair.publicKey);
      console.log("Current Balance:", balance / LAMPORTS_PER_SOL, "SOL");

      if (balance === 0) {
        console.log("⚠️  Wallet has 0 SOL balance");
        console.log("💰 Get free devnet SOL from: https://faucet.solana.com/");
        console.log("   Or run: solana airdrop 2 " + keypair.publicKey.toBase58() + " --url devnet");
      }
    } catch (error) {
      console.log("❌ Could not check balance:", error.message);
    }

    console.log("====================================");
    console.log("📝 Next Steps:");
    console.log("1. Copy the private key array to your .env file:");
    console.log("   SOLANA_PRIVATE_KEY=[" + Array.from(keypair.secretKey).join(",") + "]");
    console.log("2. Fund your wallet with devnet SOL for testing");
    console.log("3. Update your .env file with other required variables");
    console.log("====================================");
  } catch (error) {
    console.error("❌ Error generating wallet:", error);
  }
}

// Run if called directly
if (require.main === module) {
  generateWallet();
}

module.exports = { generateWallet };
