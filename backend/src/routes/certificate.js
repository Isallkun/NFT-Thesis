const express = require("express");
const certificateController = require("../controllers/certificateController");

const router = express.Router();

router.post("/generate", certificateController.generateCertificateOnly.bind(certificateController));
router.post("/generate-and-mint", certificateController.generateAndMintCertificate.bind(certificateController));

module.exports = router;
