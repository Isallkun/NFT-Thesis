const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

class CertificateGenerator {
  constructor() {
    this.width = 1200;
    this.height = 850;
    // Register custom fonts if needed
    // registerFont('path/to/font.ttf', { family: 'CustomFont' });
  }

  async generateCertificate(data) {
    const { name, activity, date, id } = data;

    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext("2d");

    // Background
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, this.width - 80, this.height - 80);

    // Inner border
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, this.width - 120, this.height - 120);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SERTIFIKAT", this.width / 2, 150);
    ctx.fillText("PESERTA", this.width / 2, 210);

    // Subtitle
    ctx.font = "24px Arial";
    ctx.fillText("Diberikan kepada:", this.width / 2, 280);

    // Name
    ctx.font = "bold 42px Arial";
    ctx.fillStyle = "#ffd700";
    ctx.fillText(name.toUpperCase(), this.width / 2, 350);

    // Activity description
    ctx.fillStyle = "#ffffff";
    ctx.font = "28px Arial";
    ctx.fillText("Atas partisipasi dalam kegiatan:", this.width / 2, 420);

    ctx.font = "bold 32px Arial";
    ctx.fillText(activity, this.width / 2, 480);

    // Date
    ctx.font = "22px Arial";
    ctx.fillText(`Tanggal: ${date}`, this.width / 2, 550);

    // Certificate ID
    ctx.font = "18px Arial";
    ctx.fillStyle = "#e0e0e0";
    ctx.fillText(`ID Sertifikat: ${id}`, this.width / 2, 620);

    // Institution info
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("UNIVERSITAS YUDHARTA PASURUAN", this.width / 2, 700);
    ctx.font = "18px Arial";
    ctx.fillText("Sistem Sertifikasi Digital Berbasis Blockchain", this.width / 2, 730);

    // Blockchain verification info
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffd700";
    ctx.fillText("✓ Terverifikasi di Blockchain Solana", this.width / 2, 780);

    // Save certificate
    const fileName = `certificate_${id}_${Date.now()}.png`;
    const filePath = path.join(__dirname, "../../certificates", fileName);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(filePath, buffer);

    return {
      fileName,
      filePath,
      buffer,
    };
  }
}

module.exports = CertificateGenerator;
