const NFTService = require("../src/services/nftService");

// Mock Keypair.fromSecretKey agar tidak error secretKey
jest.mock("@solana/web3.js", () => {
  const original = jest.requireActual("@solana/web3.js");
  return {
    ...original,
    Keypair: {
      ...original.Keypair,
      fromSecretKey: jest.fn(() => ({ publicKey: { toBase58: () => "dummyPubKey" } })),
    },
    PublicKey: jest.fn(() => ({ toBase58: () => "dummyPubKey", toBuffer: () => Buffer.alloc(32) })),
    Connection: jest.fn(() => ({})),
    SystemProgram: { programId: {} },
    Transaction: jest.fn(() => ({ add: jest.fn() })),
    sendAndConfirmTransaction: jest.fn(() => "dummySignature"),
    TransactionInstruction: jest.fn(),
  };
});

describe("NFTService", () => {
  let service;
  beforeAll(() => {
    // Mock environment variables
    process.env.SOLANA_RPC_URL = "https://api.devnet.solana.com";
    process.env.SOLANA_PRIVATE_KEY = JSON.stringify(Array(64).fill(1));
    process.env.PINATA_API_KEY = "test";
    process.env.PINATA_SECRET_KEY = "test";
    service = new NFTService();
  });

  it("should create NFT metadata with correct structure", async () => {
    const certificateData = {
      name: "Test User",
      activity: "Test Event",
      date: "2024-06-01",
      id: "CERT123",
    };
    const imagePath = "dummy/path/to/image.png";
    // Mock uploadToPinata to avoid real HTTP call
    service.uploadToPinata = jest.fn().mockResolvedValue("ipfs://testhash");
    const result = await service.createNFTMetadata(certificateData, imagePath);
    expect(result.metadata).toHaveProperty("name", "Certificate - Test User");
    expect(result.metadata).toHaveProperty("symbol", "CERT");
    expect(result.metadata).toHaveProperty("image", "ipfs://testhash");
    expect(result.metadata).toHaveProperty("attributes");
    expect(result.metadataUri).toBe("ipfs://testhash");
  });
});
