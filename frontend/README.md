# NFT Thesis Frontend

This is the frontend application for the NFT Thesis project, built with React and Tailwind CSS. It provides a modern and responsive user interface for interacting with NFTs on the Solana blockchain.

## Features

- Modern React-based user interface
- Responsive design with Tailwind CSS
- Integration with Solana blockchain
- NFT viewing and management
- Wallet connection
- Real-time updates

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the production-ready application
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
frontend/
├── public/           # Static files
├── src/             # Source code
│   ├── components/  # React components
│   ├── pages/      # Page components
│   ├── styles/     # CSS styles
│   └── utils/      # Utility functions
└── tailwind.config.js # Tailwind CSS configuration
```

## Dependencies

- React - UI library
- Tailwind CSS - Utility-first CSS framework
- Axios - HTTP client
- Lucide React - Icon library
- Testing libraries (Jest, React Testing Library)

## Development

The application runs on port 3000 by default. Make sure the backend server is running on port 3001 for full functionality.

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Browser Support

The application supports all modern browsers and is optimized for:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
