const CertificateService = require("../services/certificateService");
const NFTService = require("../services/nftService");
const { v4: uuidv4 } = require("uuid");

class CertificateController {
  constructor() {
    this.certificateService = new CertificateService();
    this.nftService = new NFTService();
  }

  async generateAndMintCertificate(req, res) {
    try {
      const { name, activity, date, recipientAddress } = req.body;

      if (!name || !activity || !date || !recipientAddress) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      // Create certificate data
      const certificateData = {
        id: Date.now().toString(),
        name,
        activity,
        date,
      };

      // Generate certificate image
      const certificateResult = await this.certificateService.generateCertificate(certificateData);
      console.log("Certificate generated:", certificateResult);

      // Create NFT metadata
      const metadataResult = await this.nftService.createNFTMetadata(certificateData, certificateResult.imagePath);
      console.log("NFT metadata created:", metadataResult);

      // Mint NFT
      const mintResult = await this.nftService.mintNFT(metadataResult, recipientAddress);
      console.log("NFT minted:", mintResult);

      return res.status(200).json({
        success: true,
        data: {
          certificate: certificateData,
          imageUrl: certificateResult.imageUrl,
          metadataUrl: metadataResult.metadataUri,
          mintResult,
        },
      });
    } catch (error) {
      console.error("Error in generateAndMintCertificate:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
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
      const certificate = await this.certificateService.generateCertificate(certificateData);

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

module.exports = CertificateController;
