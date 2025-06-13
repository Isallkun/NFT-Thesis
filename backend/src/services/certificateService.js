const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

class CertificateService {
  constructor() {
    this.certificatesDir = path.join(__dirname, "../../certificates");
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true });
    }
  }

  async generateCertificate(certificateData) {
    try {
      // Create canvas
      const width = 1200;
      const height = 800;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Set background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Add border
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 5;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Add title
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.fillText("Certificate of Achievement", width / 2, 100);

      // Add recipient name
      ctx.font = "bold 36px Arial";
      ctx.fillText(certificateData.name, width / 2, 250);

      // Add activity
      ctx.font = "24px Arial";
      ctx.fillText(`For: ${certificateData.activity}`, width / 2, 350);

      // Add date
      ctx.fillText(`Date: ${certificateData.date}`, width / 2, 450);

      // Add institution
      ctx.fillText("Universitas Yudharta Pasuruan", width / 2, 550);

      // Add certificate ID
      ctx.font = "16px Arial";
      ctx.fillText(`Certificate ID: ${certificateData.id}`, width / 2, 650);

      // Save the certificate
      const fileName = `certificate_${certificateData.id}.png`;
      const filePath = path.join(this.certificatesDir, fileName);
      const out = fs.createWriteStream(filePath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      return new Promise((resolve, reject) => {
        out.on("finish", () => {
          resolve({
            imagePath: filePath,
            imageUrl: `/certificates/${fileName}`,
            fileName,
          });
        });
        out.on("error", reject);
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      throw error;
    }
  }
}

module.exports = CertificateService;
