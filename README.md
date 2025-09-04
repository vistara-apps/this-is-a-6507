# SampleSource Pro

**Clear sample rights and avoid DMCA takedowns with AI-powered tools.**

<!-- Build status: Fixed JSX syntax issues -->

SampleSource Pro is a comprehensive platform for remix artists to efficiently secure sample rights, negotiate licenses, and detect uncleared samples in their creations.

## 🚀 Features

### Core Features

- **🎵 Sample Identification & Source Finder**: Leverages audio fingerprinting and extensive music databases to automatically identify the original song and its copyright holders for any given audio sample.

- **📋 Rights Negotiation & Licensing Portal**: A centralized platform to digitally track, manage, and negotiate sample licensing agreements with rights holders.

- **🔍 Uncleared Sample Detection**: Scans user-uploaded music projects to identify potentially uncleared samples with risk assessment.

- **⚖️ DMCA Response Toolkit**: Provides users with editable templates and step-by-step guidance for responding to DMCA takedown notices.

### Additional Features

- **👤 User Authentication & Subscription Management**: Tiered subscription system (Free, Basic, Premium)
- **📊 Risk Assessment**: AI-powered risk scoring for sample usage
- **💬 Secure Messaging**: Built-in communication system for rights negotiations
- **📄 License Agreement Management**: Digital contract management and tracking
- **📈 Analytics Dashboard**: Project and sample statistics

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- Modern responsive design

### Backend
- **Node.js** with Express
- **SQLite** database
- **JWT** authentication
- **Multer** for file uploads
- **Joi** for validation

### External Integrations
- **MusicBrainz API** for music metadata
- **Audio Fingerprinting** (mock implementation - ready for ACRCloud, Shazam API)
- **Copyright Database** integration ready

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-6507.git
   cd this-is-a-6507
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Create required directories**
   ```bash
   mkdir -p backend/uploads/audio backend/data
   ```

6. **Start the development servers**

   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend (Terminal 2):**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# External API Keys (for production)
ACRCLOUD_ACCESS_KEY=your-acrcloud-access-key
SHAZAM_API_KEY=your-shazam-api-key
```

See `.env.example` for complete configuration options.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/limits` - Get subscription limits

### Project Endpoints
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project with audio upload
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/reanalyze` - Reanalyze project

### Sample Endpoints
- `GET /api/samples` - List samples
- `PUT /api/samples/:id` - Update sample
- `GET /api/samples/:id/risk` - Get risk assessment

### Negotiation Endpoints
- `GET /api/negotiations` - List negotiations
- `POST /api/negotiations` - Start negotiation
- `POST /api/negotiations/:id/messages` - Send message

## 🏗️ Architecture

### Data Models

**User**
- userId, email, password, subscriptionTier
- Subscription limits and usage tracking

**Project** 
- projectId, userId, projectName, audioFileUrl
- Analysis results and detection data

**Sample**
- sampleId, projectId, identifiedSampleName
- Copyright holder, licensing status, confidence

**LicenseAgreement**
- agreementId, sampleId, terms, status
- Rights holder contact and signed date

### User Flows

1. **Sample Analysis Flow**
   - Upload audio file → Analysis → Sample detection → Results display

2. **Rights Negotiation Flow**
   - Select sample → Contact rights holder → Negotiate terms → Sign agreement

3. **DMCA Response Flow**
   - Receive notice → Use toolkit → Generate response → Submit

## 🔒 Security Features

- JWT-based authentication
- Rate limiting
- Input validation with Joi
- File upload restrictions
- CORS protection
- Helmet security headers
- TruffleHog secret scanning (pre-push hook)

## 📊 Subscription Tiers

### Free Tier
- 5 projects per month
- 10 samples per project
- 2 negotiations per month
- 1 DMCA response per month

### Basic Tier
- 25 projects per month
- 50 samples per project
- 10 negotiations per month
- 5 DMCA responses per month

### Premium Tier
- Unlimited projects
- Unlimited samples
- Unlimited negotiations
- Unlimited DMCA responses

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Start production server
cd backend
npm start
```

### Docker Deployment

```bash
# Build and run with Docker
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@samplesourcepro.com or create an issue in this repository.

## 🗺️ Roadmap

- [ ] Real audio fingerprinting integration (ACRCloud, Shazam)
- [ ] Advanced AI-powered sample detection
- [ ] Integration with major rights organizations (ASCAP, BMI, SESAC)
- [ ] Mobile app development
- [ ] Blockchain-based rights management
- [ ] Advanced analytics and reporting
- [ ] Multi-language support

---

**Built with ❤️ for the music community**
