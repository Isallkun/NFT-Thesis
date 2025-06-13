const express = require("express");
const NFTService = require("../services/nftService");
const router = express.Router();

const nftService = new NFTService();

// Route to mint a new NFT
router.post("/mint", async (req, res) => {
  try {
    const { metadataUri, recipientWallet } = req.body;

    if (!metadataUri || !recipientWallet) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: metadataUri, recipientWallet",
      });
    }

    const result = await nftService.mintNFT(metadataUri, recipientWallet);

    res.json({
      success: true,
      nft: result,
    });
  } catch (error) {
    console.error("Error minting NFT:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mint NFT",
      details: error.message,
    });
  }
});

// Route to create NFT metadata
router.post("/metadata", async (req, res) => {
  try {
    const { certificateData, imageUrl } = req.body;

    if (!certificateData || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: certificateData, imageUrl",
      });
    }

    const result = await nftService.createNFTMetadata(certificateData, imageUrl);

    res.json({
      success: true,
      metadata: result,
    });
  } catch (error) {
    console.error("Error creating NFT metadata:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create NFT metadata",
      details: error.message,
    });
  }
});

module.exports = router;
