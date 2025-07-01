process.env.SOLANA_PRIVATE_KEY = JSON.stringify(Array(64).fill(1));
process.env.SOLANA_RPC_URL = "https://api.devnet.solana.com";
process.env.PINATA_API_KEY = "test";
process.env.PINATA_SECRET_KEY = "test";

const nftroutes = require("../src/routes/nftroutes");

jest.mock("../src/services/nftService", () => {
  return jest.fn().mockImplementation(() => ({
    createNFTMetadata: jest.fn().mockResolvedValue({ metadata: {}, metadataUri: "ipfs://dummy" }),
    mintNFT: jest.fn().mockResolvedValue({ success: true }),
  }));
});

describe("nftroutes", () => {
  it("should be a function (Express router)", () => {
    expect(typeof nftroutes).toBe("function");
  });
});
