# 🚀 LaunchpadAFRICA

> **The premier platform for discovering, supporting, and celebrating the next generation of Web2 and Web3 startups across Africa.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

---

## 📋 Table of Contents

- [Business Overview](#-business-overview)
- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
- [Development Guide](#-development-guide)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Support](#-support)

---

## 🎯 Business Overview

### What is Launchpad

LaunchpadAFRICA is a comprehensive startup ecosystem platform designed to showcase, support, and accelerate the growth of innovative startups across Africa. Our platform serves as a bridge between promising startups and the broader tech community, investors, and potential users.



### Mission Statement

To democratize access to startup discovery and support across Africa by providing a centralized platform where innovative companies can showcase their potential, connect with stakeholders, and accelerate their growth journey.

### Target Audience

- **Startup Founders**: Showcase their companies and track growth metrics
- **Investors**: Discover and evaluate promising investment opportunities
- **Tech Community**: Stay updated on the latest innovations and trends
- **Job Seekers**: Find opportunities with growing startups
- **Mentors**: Connect with startups that need guidance

### Value Proposition

- **For Startups**: Increased visibility, networking opportunities, and growth tracking
- **For Investors**: Curated pipeline of vetted opportunities with detailed metrics
- **For Community**: Access to cutting-edge innovations and career opportunities

---

## ✨ Key Features

### 🏢 Startup Showcase
- **Comprehensive Profiles**: Detailed startup information including founders, funding, and growth metrics
- **Category Filtering**: Browse by Web2/Web3, industry, or stage
- **Dynamic Rankings**: Real-time leaderboard based on growth and engagement
- **Submission Portal**: Easy startup onboarding process

### 📊 Analytics & Insights
- **Growth Tracking**: Monitor user acquisition and growth rates
- **Performance Metrics**: Track key startup KPIs
- **Trend Analysis**: Identify emerging sectors and technologies
- **Investment Pipeline**: Curated opportunities for investors

### 🤝 Community Features
- **Startup Discovery**: Advanced search and filtering capabilities
- **Profile Management**: Personalized user profiles and preferences
- **Engagement Tracking**: Monitor community interaction and interest
- **Networking Tools**: Connect founders with mentors and investors

### 🎯 Platform Benefits
- **Increased Visibility**: Get your startup in front of the right audience
- **Data-Driven Insights**: Make informed decisions with comprehensive analytics
- **Network Effects**: Leverage the power of community and connections
- **Growth Acceleration**: Access resources and opportunities for scaling

---

## 🚀 Getting Started

**Documentation:** All project docs (database setup, deployment, hackathon module, schema diagrams) live in the **[docs/](docs/)** folder. See [docs/INDEX.md](docs/INDEX.md) for the full index.

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v15 or higher)
- **npm** or **yarn** package manager

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/plp-spark-launch.git
   cd plp-spark-launch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb lift
   
   # Initialize database schema and data
   npm run init-db
   ```

4. **Start the application**
   ```bash
   # Development mode (frontend + API)
   npm run dev:full
   
   # Or run separately
   npm run dev    # Frontend only
   npm run api    # API server only
   ```

5. **Access the application**
   - Frontend: http://localhost:8080
   - API: http://localhost:3001

### Environment Configuration

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lift
DB_USER=postgres
DB_PASSWORD=your_password_here
```

---

## 🛠 Development Guide

### Technology Stack

#### Frontend
- **React 18** - Modern UI framework with hooks and concurrent features
- **TypeScript** - Type-safe development with enhanced IDE support
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing
- **React Query** - Server state management and caching

#### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web application framework
- **PostgreSQL** - Robust relational database
- **pg** - PostgreSQL client for Node.js
- **CORS** - Cross-origin resource sharing

#### Development Tools
- **ESLint** - Code linting and style enforcement
- **TypeScript** - Static type checking
- **Concurrently** - Run multiple processes simultaneously
- **tsx** - TypeScript execution for scripts

### Project Structure

```
plp-spark-launch/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Radix UI)
│   │   ├── Hero.tsx        # Landing page hero section
│   │   ├── Navigation.tsx  # Main navigation
│   │   ├── StartupCard.tsx # Startup display component
│   │   └── Leaderboard.tsx # Rankings display
│   ├── hooks/              # Custom React hooks
│   │   ├── useStartups.ts  # Startup data management
│   │   └── useLeaderboard.ts # Leaderboard logic
│   ├── lib/                # Utility libraries
│   │   ├── database.ts     # Database connection
│   │   ├── api.ts          # API functions
│   │   └── utils.ts        # Helper functions
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Home page
│   │   ├── StartupDetail.tsx # Startup details
│   │   └── StartupSubmission.tsx # Submit startup
│   ├── server/             # Backend API
│   │   └── api.ts          # Express server
│   └── scripts/            # Database scripts
│       ├── init-db.ts      # Database initialization
│       └── create-db.ts    # Database creation
├── public/                 # Static assets
├── .env                    # Environment variables
└── package.json           # Dependencies and scripts
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (frontend only) |
| `npm run api` | Start API server |
| `npm run dev:full` | Start both frontend and API |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run init-db` | Initialize database |
| `npm run test-db` | Test database connection |

### Database Schema

#### Startups Table
```sql
CREATE TABLE startups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(500),
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'Web2' or 'Web3'
  stage VARCHAR(50),             -- 'Pre-Seed', 'Seed', etc.
  founded_date DATE,
  users VARCHAR(50),
  growth VARCHAR(50),
  founder_name VARCHAR(255),
  founder_email VARCHAR(255),
  website VARCHAR(255),
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Leaderboard Table
```sql
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER REFERENCES startups(id),
  rank INTEGER,
  growth_rate VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Development Workflow

1. **Feature Development**
   - Create feature branch from `main`
   - Implement changes with proper TypeScript types
   - Add tests for new functionality
   - Update documentation as needed

2. **Database Changes**
   - Create migration scripts in `src/scripts/`
   - Test changes with `npm run test-db`
   - Update API functions in `src/lib/api.ts`

3. **Code Quality**
   - Run `npm run lint` before committing
   - Ensure all TypeScript types are properly defined
   - Follow existing code patterns and conventions

---

## 📡 API Documentation

### Base URL
```
http://localhost:3001
```

### Endpoints

#### Health Check
```http
GET /health
```
Returns server status and database connection info.

#### Startups
```http
GET /api/startups
```
Get all startups with optional filtering.

```http
GET /api/startups/category/:category
```
Filter startups by category (Web2/Web3).

```http
POST /api/startups
```
Create a new startup entry.

```http
PUT /api/startups/:id
```
Update an existing startup.

```http
DELETE /api/startups/:id
```
Remove a startup from the platform.

#### Leaderboard
```http
GET /api/leaderboard
```
Get ranked startups based on growth metrics.

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Bug Reports**: Found a bug? Please report it with detailed steps to reproduce
2. **Feature Requests**: Have an idea? Open an issue to discuss it
3. **Code Contributions**: Submit pull requests for bug fixes or new features
4. **Documentation**: Help improve our documentation and guides
5. **Testing**: Help us test new features and report issues

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run lint && npm run test-db`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure all new features are properly typed
- Test your changes thoroughly

---

## 📞 Support

### Getting Help

- **Documentation**: Check this README and other `.md` files in the project
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and community chat

### Common Issues

#### Database Connection Problems
```bash
# Check if PostgreSQL is running
pg_isready

# Test database connection
npm run test-db
```

#### Port Conflicts
- Frontend runs on port 8080
- API runs on port 3001
- Update ports in `vite.config.ts` or `src/server/api.ts` if needed

#### Environment Variables
Ensure your `.env` file has the correct database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lift
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

### Contact

- **GitHub Issues**: [Create an issue](https://github.com/your-org/plp-spark-launch/issues)
- **Email**: support@launchpadafrica.com
- **Community**: Join our Discord server

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Vercel** - For the excellent development tools
- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the utility-first CSS framework
- **PostgreSQL** - For the robust database system

---

<div align="center">

**Built with ❤️ for the African startup ecosystem**

[Website](https://launchpadafrica.com) • [Documentation](https://docs.launchpadafrica.com) • [Community](https://discord.gg/launchpadafrica)

</div>