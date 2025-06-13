const { Connection, PublicKey, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction, TransactionInstruction } = require("@solana/web3.js");
const { Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");

// Program IDs
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

class NFTService {
  constructor() {
    this.connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com");
    this.payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.SOLANA_PRIVATE_KEY)));
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
  }

  async uploadToPinata(filePath, fileName) {
    try {
      let fileBuffer;

      // Check if the filePath is a URL or local path
      if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        // Download from URL
        const response = await axios.get(filePath, { responseType: "arraybuffer" });
        fileBuffer = Buffer.from(response.data);
      } else {
        // Read local file
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }
        fileBuffer = fs.readFileSync(filePath);
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", fileBuffer, {
        filename: fileName,
        contentType: "image/png",
      });

      // Upload to Pinata
      const uploadResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
        },
      });

      return `ipfs://${uploadResponse.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  }

  async createNFTMetadata(certificateData, imagePath) {
    try {
      if (!certificateData) {
        throw new Error("Certificate data is required for creating metadata");
      }

      // Upload image to Pinata
      const imageIpfsUrl = await this.uploadToPinata(imagePath, path.basename(imagePath));
      console.log("Image uploaded to IPFS:", imageIpfsUrl);

      const metadata = {
        name: `Certificate - ${certificateData.name}`,
        symbol: "CERT",
        description: `Digital certificate for ${certificateData.activity} issued to ${certificateData.name}`,
        image: imageIpfsUrl,
        external_url: imageIpfsUrl,
        attributes: [
          {
            trait_type: "Recipient",
            value: certificateData.name,
          },
          {
            trait_type: "Activity",
            value: certificateData.activity,
          },
          {
            trait_type: "Date Issued",
            value: certificateData.date,
          },
          {
            trait_type: "Institution",
            value: "Universitas Yudharta Pasuruan",
          },
          {
            trait_type: "Certificate ID",
            value: certificateData.id,
          },
        ],
        properties: {
          category: "image",
          files: [
            {
              uri: imageIpfsUrl,
              type: "image/png",
            },
          ],
          creators: [
            {
              address: this.payer.publicKey.toBase58(),
              share: 100,
            },
          ],
        },
      };

      // Save metadata to temporary file
      const tempDir = path.join(__dirname, "../../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const metadataPath = path.join(tempDir, "metadata.json");
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // Upload metadata to Pinata
      const metadataIpfsUrl = await this.uploadToPinata(metadataPath, "metadata.json");
      console.log("Metadata uploaded to IPFS:", metadataIpfsUrl);

      // Clean up temporary metadata file
      fs.unlinkSync(metadataPath);

      // Return both the metadata and the IPFS URL
      return {
        metadata,
        metadataUri: metadataIpfsUrl,
      };
    } catch (error) {
      console.error("Error creating NFT metadata:", error);
      throw error;
    }
  }

  // Helper function to serialize string with length prefix
  serializeString(str) {
    const buffer = Buffer.from(str, "utf8");
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(buffer.length, 0);
    return Buffer.concat([lengthBuffer, buffer]);
  }

  // Helper function to serialize Option<T> where T is a string
  serializeOptionString(str) {
    if (str === null || str === undefined) {
      return Buffer.from([0]); // None
    }
    return Buffer.concat([
      Buffer.from([1]), // Some
      this.serializeString(str),
    ]);
  }

  // Helper function to create metadata instruction manually with correct serialization
  createMetadataInstruction(metadataAccount, mint, mintAuthority, payer, updateAuthority, name, symbol, uri) {
    const keys = [
      { pubkey: metadataAccount, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: mintAuthority, isSigner: true, isWritable: false },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: updateAuthority, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    // CreateMetadataAccountV3 instruction data
    const instructionData = Buffer.concat([
      Buffer.from([33]), // CreateMetadataAccountV3 discriminator

      // DataV2 struct
      this.serializeString(name), // name
      this.serializeString(symbol), // symbol
      this.serializeString(uri), // uri

      Buffer.from([0, 0]), // seller_fee_basis_points (u16 = 0)

      // Option<Vec<Creator>>
      Buffer.from([1]), // Some
      Buffer.from([1, 0, 0, 0]), // Vec length = 1 (u32)
      updateAuthority.toBuffer(), // creator address (32 bytes)
      Buffer.from([1]), // verified = true
      Buffer.from([100]), // share = 100

      // Option<Collection>
      Buffer.from([0]), // None

      // Option<Uses>
      Buffer.from([0]), // None

      // is_mutable
      Buffer.from([0]), // false

      // Option<CollectionDetails>
      Buffer.from([0]), // None
    ]);

    return new TransactionInstruction({
      keys,
      programId: TOKEN_METADATA_PROGRAM_ID,
      data: instructionData,
    });
  }

  async mintNFT(metadataUri, recipientWallet, certificateData) {
    try {
      console.log("Starting NFT minting process...");
      console.log("Metadata URI:", metadataUri);
      console.log("Recipient wallet:", recipientWallet);
      console.log("Certificate data:", certificateData);

      if (!certificateData) {
        throw new Error("Certificate data is required for minting NFT");
      }

      if (!metadataUri || metadataUri.includes("localhost")) {
        throw new Error("Invalid metadata URI. Must be an IPFS URL");
      }

      // Create mint account
      const mint = await Token.createMint(
        this.connection,
        this.payer,
        this.payer.publicKey,
        this.payer.publicKey,
        0, // 0 decimals for NFT
        TOKEN_PROGRAM_ID
      );

      console.log("Mint created:", mint.publicKey.toBase58());

      // Get the associated token account address
      const recipientPublicKey = new PublicKey(recipientWallet);
      const associatedTokenAddress = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint.publicKey, recipientPublicKey);

      console.log("Associated token address:", associatedTokenAddress.toBase58());

      // Create the associated token account if it doesn't exist and mint to it
      const transaction = new Transaction();

      // Check if the account exists
      const accountInfo = await this.connection.getAccountInfo(associatedTokenAddress);

      if (!accountInfo) {
        console.log("Creating associated token account...");
        const createAtaIx = Token.createAssociatedTokenAccountInstruction(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, mint.publicKey, associatedTokenAddress, recipientPublicKey, this.payer.publicKey);
        transaction.add(createAtaIx);
      }

      // Add mint instruction
      const mintIx = Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        associatedTokenAddress,
        this.payer.publicKey,
        [],
        1 // Mint 1 NFT
      );
      transaction.add(mintIx);

      // Send and confirm transaction
      console.log("Sending mint transaction...");
      const mintSignature = await sendAndConfirmTransaction(this.connection, transaction, [this.payer], {
        commitment: "confirmed",
      });

      console.log("Mint transaction signature:", mintSignature);

      // Create metadata account
      const [metadataAccount] = await PublicKey.findProgramAddress([Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()], TOKEN_METADATA_PROGRAM_ID);

      console.log("Creating metadata account...");
      console.log("Metadata account address:", metadataAccount.toBase58());

      // Create metadata instruction with proper name and URI
      const metadataInstruction = this.createMetadataInstruction(metadataAccount, mint.publicKey, this.payer.publicKey, this.payer.publicKey, this.payer.publicKey, `Certificate - ${certificateData.name}`, "CERT", metadataUri);

      const metadataTransaction = new Transaction().add(metadataInstruction);

      console.log("Sending metadata transaction...");
      const metadataSignature = await sendAndConfirmTransaction(this.connection, metadataTransaction, [this.payer], {
        commitment: "confirmed",
      });

      console.log("Metadata transaction signature:", metadataSignature);
      console.log("NFT minted successfully!");

      return {
        mintAddress: mint.publicKey.toBase58(),
        tokenAccount: associatedTokenAddress.toBase58(),
        metadataAccount: metadataAccount.toBase58(),
        mintSignature: mintSignature,
        metadataSignature: metadataSignature,
        success: true,
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      console.error("Error stack:", error.stack);
      throw error;
    }
  }
}

module.exports = NFTService;
