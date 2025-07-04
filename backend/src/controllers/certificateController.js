const CertificateGenerator = require("../services/certificateGenerator");
const NFTService = require("../services/nftService");
const { v4: uuidv4 } = require("uuid");

class CertificateController {
  constructor() {
    this.certificateGenerator = new CertificateGenerator();
    this.nftService = new NFTService();
  }

  async generateAndMintCertificate(req, res) {
    try {
      const { name, activity, date, recipientWallet } = req.body;

      // Validate input
      if (!name || !activity || !date || !recipientWallet) {
        return res.status(400).json({
          error: "Missing required fields: name, activity, date, recipientWallet",
        });
      }

      // Validasi panjang nama NFT (maksimal 32 karakter untuk name di metadata)
      const maxNameLength = 32;
      const prefix = "Certificate - ";
      if ((prefix + name).length > maxNameLength) {
        return res.status(400).json({
          error: `Nama sertifikat terlalu panjang. Maksimal ${maxNameLength - prefix.length} karakter untuk nama.`,
        });
      }

      // Generate unique certificate ID
      const certificateId = uuidv4();

      // Generate certificate image
      const certificateData = { name, activity, date, id: certificateId };
      const certificate = await this.certificateGenerator.generateCertificate(certificateData);

      // Create image URL (adjust based on your deployment)
      let baseUrl = process.env.BASE_URL || "http://localhost:3000";
      if (!process.env.BASE_URL && process.env.NODE_ENV === "production") {
        throw new Error("BASE_URL environment variable must be set in production.");
      }
      const imageUrl = `${baseUrl}/certificates/${certificate.fileName}`;

      // Create NFT metadata and get IPFS URL
      const { metadata, metadataUri } = await this.nftService.createNFTMetadata(certificateData, imageUrl);
      console.log("Using metadata URI:", metadataUri);

      // Mint NFT with certificate data and IPFS metadata URI
      const nftResult = await this.nftService.mintNFT(metadataUri, recipientWallet, certificateData);

      // Tambahkan link Solscan untuk transaksi mint
      let transactionLink = null;
      if (nftResult && nftResult.mintSignature) {
        transactionLink = `https://solscan.io/tx/${nftResult.mintSignature}?cluster=devnet`;
      }

      res.json({
        success: true,
        certificate: {
          id: certificateId,
          imageUrl,
          metadataUrl: metadataUri,
          nft: nftResult,
          transactionLink,
        },
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({
        error: "Failed to generate certificate",
        details: error.message,
      });
    }
  }

  async generateCertificateOnly(req, res) {
    try {
      const { name, activity, date } = req.body;

      if (!name || !activity || !date) {
        return res.status(400).json({
          error: "Missing required fields: name, activity, date",
        });
      }

      const certificateId = uuidv4();
      const certificateData = { name, activity, date, id: certificateId };
      const certificate = await this.certificateGenerator.generateCertificate(certificateData);

      let baseUrl = process.env.BASE_URL || "http://localhost:3000";
      if (!process.env.BASE_URL && process.env.NODE_ENV === "production") {
        throw new Error("BASE_URL environment variable must be set in production.");
      }
      const imageUrl = `${baseUrl}/certificates/${certificate.fileName}`;

      res.json({
        success: true,
        certificate: {
          id: certificateId,
          imageUrl,
          fileName: certificate.fileName,
        },
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({
        error: "Failed to generate certificate",
        details: error.message,
      });
    }
  }
}

module.exports = new CertificateController();
