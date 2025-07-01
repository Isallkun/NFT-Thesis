process.env.SOLANA_PRIVATE_KEY = JSON.stringify(Array(64).fill(1));
process.env.SOLANA_RPC_URL = "https://api.devnet.solana.com";
process.env.PINATA_API_KEY = "test";
process.env.PINATA_SECRET_KEY = "test";

jest.mock("../src/services/nftService", () => {
  return jest.fn().mockImplementation(() => ({
    createNFTMetadata: jest.fn().mockResolvedValue({ metadata: {}, metadataUri: "ipfs://dummy" }),
    mintNFT: jest.fn().mockResolvedValue({ success: true }),
  }));
});

const certificateController = require("../src/controllers/certificateController");

describe("certificateController", () => {
  it("should return 400 if required fields are missing", async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await certificateController.generateCertificateOnly(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });
});
