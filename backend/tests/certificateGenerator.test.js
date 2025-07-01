const path = require("path");
const fs = require("fs");
const CertificateGenerator = require("../src/services/certificateGenerator");

describe("certificateGenerator", () => {
  let generator;
  beforeAll(() => {
    generator = new CertificateGenerator();
  });

  it("should throw error if required fields are missing", async () => {
    await expect(generator.generateCertificate({})).rejects.toThrow();
  });

  it("should generate certificate and return file path", async () => {
    const data = {
      name: "Test User",
      activity: "Test Event",
      date: "2024-06-01",
      id: "CERT123",
    };
    const result = await generator.generateCertificate(data);
    expect(typeof result.filePath).toBe("string");
    expect(result.filePath.endsWith(".png")).toBe(true);
    // Clean up generated file
    if (fs.existsSync(result.filePath)) fs.unlinkSync(result.filePath);
  });
});
