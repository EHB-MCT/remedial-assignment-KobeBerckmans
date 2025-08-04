# Football Transfer Market Simulation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)

A comprehensive football transfer market simulation platform with real-time auctions, AI bidding, and player form analysis. Built with modern web technologies and following SOLID principles.

## Features

### Core Functionality
- **Live Auctions**: Real-time bidding system with countdown timers
- **AI Bidding**: Intelligent AI clubs with dynamic bidding strategies
- **Player Form Analysis**: Comprehensive performance tracking and analytics
- **Club Management**: Complete squad management with budget tracking
- **Transfer History**: Detailed transaction logs and analytics

### Technical Features
- **Real-time Updates**: WebSocket-like polling for live data
- **Atomic Operations**: MongoDB transactions for data consistency
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Error Handling**: Comprehensive error management and recovery
- **Performance Optimization**: Efficient data loading and caching

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

## Installation

### Prerequisites

- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/EHB-MCT/remedial-assignment-KobeBerckmans.git
cd remedial-assignment-KobeBerckmans

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start the backend server
npm start
```

### Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend
npm install

# Start the React development server
npm start
```

The application will be available at `http://localhost:3001` (frontend) and `http://localhost:3000` (backend API)

## Usage

### Getting Started

1. **Register/Login**: Create an account or log in to access the platform
2. **Choose Club**: Select your preferred football club
3. **Explore Features**:
   - **My Club**: Manage your squad and budget
   - **Players**: Browse the complete player database
   - **Transfer Market**: Participate in live auctions
   - **Player Form**: Analyze player performance and form

### Key Features

#### Live Auctions
- Real-time bidding with countdown timers
- Buy Now functionality for immediate purchases
- AI competition with intelligent bidding strategies
- Comprehensive bid history and analytics

#### Player Form Analysis
- Performance ratings (70-100 scale)
- Recent match statistics
- Form trend visualization
- Filtering and sorting options

#### Club Management
- Squad overview with detailed player information
- Budget tracking and management
- Transfer history and analytics
- Player selling functionality

## Architecture

### Backend Architecture

```
backend/
├── controllers/     # Business logic layer
├── models/         # Data models and schemas
├── routes/         # API endpoints
├── scripts/        # Utility and maintenance scripts
├── middleware/     # Custom middleware
└── utils/          # Helper functions and utilities
```

### Frontend Architecture

```
frontend/src/
├── components/     # Reusable UI components
├── pages/         # Page-level components
├── hooks/         # Custom React hooks
├── utils/         # Helper functions
├── styles/        # CSS and styling
└── services/      # API service layer
```

### Design Patterns

- **MVC Pattern**: Separation of concerns in backend
- **Repository Pattern**: Data access abstraction
- **Factory Pattern**: Object creation for complex entities
- **Observer Pattern**: Real-time updates and notifications
- **Strategy Pattern**: AI bidding algorithms

### SOLID Principles Implementation

- **Single Responsibility**: Each class/module has one purpose
- **Open/Closed**: Extensible without modification
- **Liskov Substitution**: Interchangeable implementations
- **Interface Segregation**: Focused, specific interfaces
- **Dependency Inversion**: High-level modules independent of low-level

## API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
```

### Club Management

```http
GET /api/clubs
GET /api/clubs/:id
GET /api/clubs/:id/players
PUT /api/clubs/:id
```

### Auction System

```http
GET /api/auctions
POST /api/auctions
POST /api/auctions/:id/bid
POST /api/auctions/:id/buy-now
POST /api/auctions/:id/process
```

### Player Management

```http
GET /api/players
GET /api/players/:id
```

### Simulation

```http
POST /api/simulation/transfer
POST /api/simulation/day
```

## Development

### Code Style

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

### Git Workflow

1. **Feature Branches**: `feature/description`
2. **Bug Fixes**: `fix/description`
3. **Documentation**: `docs/description`
4. **Refactoring**: `refactor/description`

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(auth): add JWT token validation`
- `fix(auctions): resolve race condition in bidding`
- `docs(readme): update installation instructions`

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Debugging

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running
2. **Port Conflicts**: Check if ports 3000/3001 are available
3. **CORS Issues**: Verify backend CORS configuration

### Debug Scripts

```bash
# Check player assignments
node backend/scripts/checkPlayerAssignments.js

# Fix player assignments
node backend/scripts/fixPlayerAssignments.js

# Restart auto-bidder
node backend/scripts/restartAutoBidder.js
```

## Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Commit your changes: `git commit -m 'feat: add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the established design patterns

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to kobe.berckmans@student.ehb.be.

## Performance

### Optimization Techniques

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis-like caching for frequently accessed data
- **Lazy Loading**: Component-level code splitting
- **Image Optimization**: Compressed assets and lazy loading
- **Bundle Optimization**: Tree shaking and code splitting

### Monitoring

- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring
- **User Analytics**: Usage pattern analysis

## Security

### Implemented Measures

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Proper cross-origin settings
- **Rate Limiting**: API request throttling

## Roadmap

### Planned Features

- [ ] Real-time WebSocket implementation
- [ ] Advanced AI bidding algorithms
- [ ] Player injury simulation
- [ ] League table integration
- [ ] Mobile app development
- [ ] Multi-language support

### Technical Improvements

- [ ] TypeScript migration
- [ ] GraphQL API implementation
- [ ] Microservices architecture
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **React Team**: For the amazing frontend framework
- **Node.js Community**: For the robust backend runtime
- **MongoDB**: For the flexible database solution
- **Open Source Contributors**: For inspiration and best practices

## Support

For support and questions:

- **Issues**: [GitHub Issues](https://github.com/EHB-MCT/remedial-assignment-KobeBerckmans/issues)
- **Discussions**: [GitHub Discussions](https://github.com/EHB-MCT/remedial-assignment-KobeBerckmans/discussions)
- **Email**: kobe.berckmans@student.ehb.be

## Technology Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express.js, MongoDB
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **Real-time**: Polling-based live updates
- **Styling**: CSS3 with responsive design

---

**Made by Kobe Berckmans**

