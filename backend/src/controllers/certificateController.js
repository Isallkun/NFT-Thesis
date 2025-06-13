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

      // Generate unique certificate ID
      const certificateId = uuidv4();

      // Generate certificate image
      const certificateData = { name, activity, date, id: certificateId };
      const certificate = await this.certificateGenerator.generateCertificate(certificateData);

      // Create image URL (adjust based on your deployment)
      const imageUrl = `${process.env.BASE_URL || "http://localhost:3000"}/certificates/${certificate.fileName}`;

      // Create NFT metadata
      const { metadata, metadataFileName } = await this.nftService.createNFTMetadata(certificateData, imageUrl);

      // Create metadata URL
      const metadataUrl = `${process.env.BASE_URL || "http://localhost:3000"}/metadata/${metadataFileName}`;

      // Mint NFT
      const nftResult = await this.nftService.mintNFT(metadataUrl, recipientWallet);

      res.json({
        success: true,
        certificate: {
          id: certificateId,
          imageUrl,
          metadataUrl,
          nft: nftResult,
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

      const imageUrl = `${process.env.BASE_URL || "http://localhost:3000"}/certificates/${certificate.fileName}`;

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
