const { Connection, PublicKey, Keypair, SystemProgram, Transaction, sendAndConfirmTransaction, TransactionInstruction } = require("@solana/web3.js");
const { Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const axios = require("axios");
const { Metaplex, keypairIdentity } = require("@metaplex-foundation/js");
const { TokenStandard } = require("@metaplex-foundation/mpl-token-metadata");

// Program IDs
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

class NFTService {
  constructor() {
    this.connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com");

    // Parse private key from environment variable
    const privateKeyString = process.env.WALLET_PRIVATE_KEY;
    if (!privateKeyString) {
      throw new Error("WALLET_PRIVATE_KEY environment variable is not set");
    }

    let privateKeyArray;
    try {
      privateKeyArray = JSON.parse(privateKeyString);
    } catch (error) {
      throw new Error("Invalid WALLET_PRIVATE_KEY format. It should be a JSON array of numbers.");
    }

    this.payer = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    this.metaplex = Metaplex.make(this.connection).use(keypairIdentity(this.payer));
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    this.baseUrl = process.env.PUBLIC_URL || "https://your-domain.com"; // Ganti dengan domain publik Anda

    // Initialize Pinata
    this.pinata = new pinataSDK(this.pinataApiKey, this.pinataSecretKey);
  }

  async uploadToPinata(filePath, fileName) {
    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(filePath);
      formData.append("file", fileStream, {
        filename: fileName,
        contentType: "image/png",
      });

      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
        },
      });

      return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      throw error;
    }
  }

  async createNFTMetadata(certificateData, imagePath) {
    try {
      // Upload image to Pinata
      const imageIpfsUrl = await this.uploadToPinata(imagePath, path.basename(imagePath));
      console.log("Image uploaded to IPFS:", imageIpfsUrl);

      // Create metadata JSON
      const metadata = {
        name: `Certificate for ${certificateData.name}`,
        symbol: "CERT",
        description: `Certificate of Achievement for ${certificateData.activity}`,
        image: imageIpfsUrl,
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
            trait_type: "Date",
            value: certificateData.date,
          },
          {
            trait_type: "Certificate ID",
            value: certificateData.id,
          },
        ],
        properties: {
          files: [
            {
              uri: imageIpfsUrl,
              type: "image/png",
            },
          ],
          category: "image",
        },
      };

      // Save metadata to temporary file
      const metadataPath = path.join(path.dirname(imagePath), "metadata.json");
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // Upload metadata to Pinata
      const metadataIpfsUrl = await this.uploadToPinata(metadataPath, "metadata.json");
      console.log("Metadata uploaded to IPFS:", metadataIpfsUrl);

      // Clean up temporary metadata file
      fs.unlinkSync(metadataPath);

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

  async mintNFT(metadata, recipientAddress) {
    try {
      const recipientPublicKey = new PublicKey(recipientAddress);

      const { nft } = await this.metaplex.nfts().create({
        uri: metadata.metadataUri,
        name: metadata.metadata.name,
        symbol: metadata.metadata.symbol,
        sellerFeeBasisPoints: 0,
        isCollection: false,
        updateAuthority: this.payer,
        mintAuthority: this.payer,
        tokenStandard: TokenStandard.NonFungible,
        creators: [
          {
            address: this.payer.publicKey,
            share: 100,
            verified: true,
          },
        ],
      });

      console.log("NFT created:", nft);

      // Get the associated token account
      const associatedTokenAddress = await this.metaplex.nfts().pdas().associatedTokenAccount({
        mint: nft.address,
        owner: recipientPublicKey,
      });

      // Create the associated token account if it doesn't exist
      const createAtaIx = await this.metaplex.nfts().builders().createAssociatedTokenAccount({
        mint: nft.address,
        owner: recipientPublicKey,
      });

      // Transfer the NFT to the recipient
      const transferIx = await this.metaplex.nfts().builders().transfer({
        nftOrSft: nft,
        toOwner: recipientPublicKey,
      });

      // Send the transaction
      const { response } = await this.metaplex.rpc().sendAndConfirmTransaction({
        instructions: [createAtaIx, transferIx],
        signers: [this.payer],
      });

      console.log("Transaction sent:", response.signature);

      return {
        mint: nft.address.toBase58(),
        signature: response.signature,
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      throw error;
    }
  }
}

module.exports = NFTService;
