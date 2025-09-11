# xRWA - Real World Asset Tokenization Platform

## Overview

xRWA is a comprehensive Real World Asset (RWA) tokenization platform built on the DS Token protocol. It provides a complete solution for tokenizing traditional assets with full regulatory compliance, investor management, and automated settlement processes.

## Features

### 🏗️ **Core Architecture**
- **DS Token Protocol**: ERC-20 based security tokens with regulatory hooks
- **Compliance Service**: Real-time regulatory validation and KYC/AML checks
- **Trust Service**: Role-based access control and permission management
- **Registry Service**: Investor information and wallet mapping management

### 👥 **User Management**
- **Issuer Dashboard**: Complete asset tokenization and investor management
- **Investor Portal**: Portfolio management and investment tracking
- **KYC/AML Integration**: Automated verification and compliance checks
- **Multi-role Support**: Issuer, Investor, and Admin roles

### 🔒 **Security & Compliance**
- **Regulatory Compliance**: Built-in compliance checks for all transactions
- **KYC/AML Verification**: Automated investor verification processes
- **Audit Trail**: Complete transaction history and compliance reporting
- **Role-based Access**: Granular permission management

### 💰 **Investment Management**
- **Token Lifecycle**: Complete token creation, issuance, and management
- **Locking/Vesting**: Flexible token locking and vesting mechanisms
- **Settlement**: Automated bank integration and fund verification
- **Portfolio Tracking**: Real-time investment and portfolio monitoring

## Technology Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with role-based access control
- **Blockchain**: Ethereum integration with ethers.js
- **Caching**: Redis for performance optimization

### Frontend
- **Framework**: Next.js with React and TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React hooks and context
- **Styling**: CSS-in-JS with MUI theming

### Blockchain
- **Smart Contracts**: Solidity 0.8.24
- **Development**: Hardhat framework
- **Testing**: Comprehensive test suite with Chai
- **Deployment**: Automated deployment scripts

## Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/blockbit-hama/xRWA.git
   cd xRWA
   ```

2. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Blockchain: http://localhost:8545

### Demo Credentials
- **Issuer**: issuer@xrwa.com / password123
- **Investor**: INV001 / password123

## Project Structure

```
xRWA/
├── back/                 # NestJS Backend API
│   ├── src/
│   │   ├── investors/    # Investor management
│   │   ├── tokens/       # Token management
│   │   ├── settlement/   # Settlement services
│   │   ├── blockchain/   # Blockchain integration
│   │   └── auth/         # Authentication
├── front/                # Next.js Frontend
│   ├── src/
│   │   ├── pages/        # Application pages
│   │   │   ├── issuer/   # Issuer dashboard
│   │   │   └── investor/ # Investor portal
│   │   └── components/   # Reusable components
├── contract/             # Smart Contracts
│   ├── contracts/        # Solidity contracts
│   ├── test/            # Contract tests
│   └── scripts/         # Deployment scripts
└── docs/                # Documentation
    ├── ARCHITECTURE.md   # System architecture
    ├── FLOW.md          # Business flow
    └── DEVELOPMENT_ROADMAP.md
```

## Development

### Backend Development
```bash
cd back
npm install
npm run start:dev
```

### Frontend Development
```bash
cd front
npm install
npm run dev
```

### Smart Contract Development
```bash
cd contract
npm install
npm test
npm run deploy
```

## API Documentation

The backend provides RESTful APIs for:
- Investor management and KYC
- Token creation and management
- Investment processing and settlement
- Blockchain integration and monitoring

API documentation is available at `/api/docs` when running the backend.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in the `docs/` folder

## Roadmap

See [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) for detailed development plans and upcoming features.

---

**Built with ❤️ by the xRWA Team**