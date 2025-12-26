# 🏃 Sports Performance Tracker with AI Insights

A production-ready, visually stunning MERN stack web application for athletes to log training data and receive AI-powered performance insights and recommendations.

![Sports Performance Tracker](https://img.shields.io/badge/Sports-Tracker-00d4ff)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

### 🎯 Core Features
- **Smart Workout Logging** - Log runs, lifts, cardio, and biometrics with intuitive forms
- **GPX/CSV Import** - Import workout data from fitness devices
- **AI-Powered Insights** - Get personalized training recommendations powered by Google Gemini
- **Interactive Analytics** - Beautiful Victory Charts for performance visualization
- **PDF Export** - Generate weekly training plans as PDF documents

### 🎨 Design
- Dark athletic theme with neon accents
- Glassmorphism effects
- Smooth Framer Motion animations
- Responsive design for all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd sportsWebApp
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Configure environment variables**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your settings:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A secure secret for JWT tokens
# - GEMINI_API_KEY: Your Google Gemini API key (optional)
```

4. **Install frontend dependencies**
```bash
cd ../client
npm install
```

5. **Seed the database with demo data**
```bash
cd ../server
npm run seed
```

6. **Start the development servers**

In one terminal (backend):
```bash
cd server
npm run dev
```

In another terminal (frontend):
```bash
cd client
npm run dev
```

7. **Open the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

### Demo Account
After running the seed script, you can log in with:
- **Email:** demo@athlete.com
- **Password:** demo123

## 📁 Project Structure

```
sportsWebApp/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context (Auth)
│   │   ├── services/          # API services
│   │   └── index.css          # Global styles
│   └── package.json
├── server/                    # Express Backend
│   ├── src/
│   │   ├── config/            # Database config
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth & error handling
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── services/          # AI & PDF services
│   │   └── scripts/           # Seed scripts
│   └── package.json
└── README.md
```

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Victory Charts** - Data visualization
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Google Gemini** - AI analysis
- **jsPDF** - PDF generation

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts` | Get all workouts |
| POST | `/api/workouts` | Create workout |
| GET | `/api/workouts/:id` | Get single workout |
| PUT | `/api/workouts/:id` | Update workout |
| DELETE | `/api/workouts/:id` | Delete workout |
| POST | `/api/workouts/upload` | Upload GPX/CSV |
| GET | `/api/workouts/stats` | Get statistics |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/analyze` | Get AI analysis |
| POST | `/api/ai/chat` | Chat with AI coach |
| GET | `/api/ai/weekly-summary` | Get weekly summary |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export/training-plan` | Export PDF training plan |

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Electric Blue | `#00d4ff` | Primary actions, highlights |
| Lime Green | `#84ff00` | Success, positive trends |
| Crimson | `#ff3366` | Alerts, high priority |
| Orange | `#ff6b00` | Warnings, medium priority |
| Dark | `#0a0a0f` | Background |

## 🔧 Environment Variables

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sports-tracker
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

## 📜 Scripts

### Server
```bash
npm run dev      # Start development server
npm start        # Start production server
npm run seed     # Seed database with demo data
```

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for athletes who want to train smarter and perform better.
