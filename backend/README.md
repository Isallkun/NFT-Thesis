# NFT Thesis Backend

This is the backend service for the NFT Thesis project, built with Node.js and Express. It provides the necessary APIs for interacting with the Solana blockchain and handling NFT-related operations.

## Features

- Solana blockchain integration
- NFT minting and management
- Wallet generation and management
- File upload handling
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Solana CLI tools
- A Solana wallet

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3001
   SOLANA_RPC_URL=your_solana_rpc_url
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm run generate-wallet` - Generate a new Solana wallet

## Project Structure

```
backend/
├── src/              # Source code
├── scripts/          # Utility scripts
├── certificates/     # SSL certificates
├── metadata/        # NFT metadata
├── temp/            # Temporary files
└── wallet.json      # Wallet configuration
```

## Dependencies

- @metaplex-foundation/js - Metaplex SDK for Solana
- @solana/web3.js - Solana web3 library
- express - Web framework
- cors - Cross-origin resource sharing
- dotenv - Environment variables
- multer - File upload handling
- canvas - Image processing
- uuid - Unique identifier generation

## API Documentation

The API documentation will be available at `/api-docs` when the server is running.

## License

ISC
