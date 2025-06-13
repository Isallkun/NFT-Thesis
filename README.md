# NFT Thesis Project

A full-stack application for managing and interacting with NFTs on the Solana blockchain. This project consists of a React frontend and a Node.js backend.

## Project Overview

This project is divided into two main parts:

- Frontend: A modern React application with Tailwind CSS
- Backend: A Node.js/Express server with Solana blockchain integration

## Features

### Frontend

- Modern React-based user interface
- Responsive design with Tailwind CSS
- Integration with Solana blockchain
- NFT viewing and management
- Wallet connection
- Real-time updates

### Backend

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
- Modern web browser

## Installation

### Clone the Repository

```bash
git clone <repository-url>
cd NFT-Thesis
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3001
   SOLANA_RPC_URL=your_solana_rpc_url
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

   The backend will run on http://localhost:3001

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on http://localhost:3000

### Production Build

1. Build the frontend:

   ```bash
   cd frontend
   npm run build
   ```

2. Start the backend in production mode:
   ```bash
   cd backend
   npm start
   ```

## Project Structure

```
NFT-Thesis/
├── backend/
│   ├── src/              # Source code
│   ├── scripts/          # Utility scripts
│   ├── certificates/     # SSL certificates
│   ├── metadata/        # NFT metadata
│   ├── temp/            # Temporary files
│   └── wallet.json      # Wallet configuration
│
└── frontend/
    ├── public/           # Static files
    ├── src/             # Source code
    │   ├── components/  # React components
    │   ├── pages/      # Page components
    │   ├── styles/     # CSS styles
    │   └── utils/      # Utility functions
    └── tailwind.config.js # Tailwind CSS configuration
```

## Available Scripts

### Backend Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm run generate-wallet` - Generate a new Solana wallet

### Frontend Scripts

- `npm start` - Start the development server
- `npm run build` - Build the production-ready application
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Dependencies

### Backend Dependencies

- @metaplex-foundation/js - Metaplex SDK for Solana
- @solana/web3.js - Solana web3 library
- express - Web framework
- cors - Cross-origin resource sharing
- dotenv - Environment variables
- multer - File upload handling
- canvas - Image processing
- uuid - Unique identifier generation

### Frontend Dependencies

- React - UI library
- Tailwind CSS - Utility-first CSS framework
- Axios - HTTP client
- Lucide React - Icon library
- Testing libraries (Jest, React Testing Library)

## Browser Support

The frontend application supports all modern browsers and is optimized for:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)

## API Documentation

The backend API documentation will be available at `/api-docs` when the server is running.

## License

This project is licensed under the MIT License for the frontend and ISC License for the backend.
