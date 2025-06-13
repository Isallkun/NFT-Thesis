const express = require("express");
const CertificateController = require("../controllers/certificateController");

const router = express.Router();
const certificateController = new CertificateController();

router.post("/generate", certificateController.generateAndMintCertificate.bind(certificateController));
router.post("/generate-and-mint", certificateController.generateAndMintCertificate.bind(certificateController));

module.exports = router;
