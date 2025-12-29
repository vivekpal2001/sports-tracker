# 🏃 SportTrack AI - AI-Powered Sports Performance Tracker

A production-ready, full-featured MERN stack web application for athletes to log training data, connect with other athletes, and receive AI-powered performance insights.

![Sports Performance Tracker](https://img.shields.io/badge/Sports-Tracker-00d4ff)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

### 🏋️ Workout Tracking
- **Smart Workout Logging** - Log runs, weightlifting, cardio, and biometrics
- **GPX/CSV Import** - Import data from Strava, Garmin, Apple Watch, Fitbit
- **Data Import Help** - Step-by-step guides for exporting from popular apps
- **PR Detection** - Automatic personal record tracking

### 🤖 AI-Powered Features
- **AI Insights** - Personalized training recommendations powered by Groq/Gemini
- **AI Training Plans** - Generate weekly training schedules based on your history
- **Recovery Score** - Smart recovery analysis (0-100) with recommendations
- **AI Chat Coach** - Ask questions about your training

### 📊 Analytics & Visualization
- **Interactive Dashboard** - Overview of stats, charts, and progress
- **Training Heatmap** - Visual calendar of workout frequency
- **Performance Charts** - Weekly/monthly activity trends
- **Advanced Analytics** - Deep dive into your training data

### 🎯 Goals & Achievements
- **Goal Tracking** - Set distance, duration, or workout frequency goals
- **Progress Indicators** - Visual progress bars and percentages
- **50+ Badges** - Earn badges for streaks, PRs, milestones
- **Badge Categories** - Distance, strength, consistency, milestones

### 👥 Social Network
- **Activity Feed** - Share workouts and posts with followers
- **Manual Posts** - Create text, motivation, progress, or photo posts
- **Image Upload** - Share photos with up to 4 images per post
- **Reactions** - React with 💪🔥⚡🎯❤️ to posts
- **Comments** - Engage with others' activities
- **Follow System** - Follow friends and athletes
- **Leaderboards** - Weekly/monthly rankings by workouts, distance, duration
- **User Profiles** - Public/private profiles with stats and badges

### 🔔 Notifications
- **Real-time Notifications** - Reactions, comments, follows
- **Notification Bell** - Unread count badge in header
- **Mark as Read** - Individual or mark all as read

### 📄 PDF Export
- **Training Plans** - Export AI-generated weekly plans as PDF
- **Professional Design** - Beautiful formatted documents

### 🎨 Modern Design
- **Dark Athletic Theme** - Neon accents with glassmorphism
- **Responsive Design** - Mobile-first approach
- **Framer Motion Animations** - Smooth transitions throughout
- **Modern Landing Page** - Animated hero, testimonials, feature showcase

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vivekpal2001/sports-tracker.git
cd sportsWebApp
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env

# Edit .env with:
# MONGODB_URI=your-mongodb-uri
# JWT_SECRET=your-secret-key
# GROQ_API_KEY=your-groq-api-key
```

4. **Install frontend dependencies**
```bash
cd ../client
npm install
```

5. **Start development servers**

Backend:
```bash
cd server
npm run dev    # Runs on port 5001
```

Frontend:
```bash
cd client
npm run dev    # Runs on port 5173
```

6. **Open the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api

## 📁 Project Structure

```
sportsWebApp/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── ui/              # Base UI (Button, Card, etc.)
│   │   │   ├── layout/          # DashboardLayout
│   │   │   ├── NotificationDropdown.jsx
│   │   │   └── DataImportHelp.jsx
│   │   ├── pages/               # All page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Badges.jsx
│   │   │   ├── TrainingPlan.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── context/             # AuthContext
│   │   └── services/            # API services
├── server/                      # Express Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── workoutController.js
│   │   │   ├── feedController.js
│   │   │   ├── userController.js
│   │   │   ├── notificationController.js
│   │   │   ├── badgeController.js
│   │   │   ├── goalController.js
│   │   │   └── trainingPlanController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Workout.js
│   │   │   ├── Activity.js
│   │   │   ├── Notification.js
│   │   │   ├── Goal.js
│   │   │   ├── UserBadge.js
│   │   │   └── TrainingPlan.js
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── recoveryService.js
│   │   │   └── pdfService.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   └── routes/
└── README.md
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Workouts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workouts` | Get all workouts |
| POST | `/api/workouts` | Create workout |
| POST | `/api/workouts/upload` | Upload GPX/CSV |
| GET | `/api/workouts/recovery-score` | Get recovery score |
| GET | `/api/workouts/chart-data` | Get chart data |

### Feed & Social
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed` | Get activity feed |
| POST | `/api/feed/post` | Create manual post |
| POST | `/api/feed/:id/react` | React to activity |
| POST | `/api/feed/:id/comment` | Comment on activity |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get my profile |
| GET | `/api/users/:id` | Get public profile |
| POST | `/api/users/:id/follow` | Follow user |
| DELETE | `/api/users/:id/follow` | Unfollow user |
| GET | `/api/users/search` | Search users |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/count` | Get unread count |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | Get all goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id/progress` | Update progress |

### Badges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/badges` | Get all badges |
| GET | `/api/badges/earned` | Get earned badges |
| POST | `/api/badges/sync` | Sync/check badges |

### Training Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/training-plans/generate` | Generate AI plan |
| GET | `/api/training-plans/active` | Get active plan |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Friends leaderboard |
| GET | `/api/leaderboard/global` | Global leaderboard |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/images` | Upload images |

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Victory Charts** for visualization
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Groq API** for AI features
- **jsPDF** for PDF generation

## 🔧 Environment Variables

### Server (.env)
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/sports-tracker
JWT_SECRET=your-secret-key
GROQ_API_KEY=your-groq-api-key
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5001
```

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Electric Blue | `#00d4ff` | Primary actions |
| Lime Green | `#84ff00` | Success, positive |
| Crimson | `#ff3366` | Alerts |
| Orange | `#ff6b00` | Warnings |
| Dark | `#0a0a0f` | Background |

## 📜 Scripts

### Server
```bash
npm run dev      # Start with hot reload
npm start        # Production mode
npm run seed     # Seed demo data
```

### Client
```bash
npm run dev      # Development
npm run build    # Production build
npm run preview  # Preview build
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
