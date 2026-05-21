# 🌟 Vitality - Wellness Tracking Platform

A full-stack wellness tracking application built with Next.js 16, TypeScript, MongoDB, and Tailwind CSS. Track your mood, water intake, sleep, exercise, habits, goals, and journal entries all in one beautiful, intuitive platform.

## ✨ Features

### 🔐 Authentication System
- Email & password registration/login
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes with middleware
- Session management

### 📊 Dashboard
- Real-time wellness score calculation
- Today's summary with all metrics
- Quick stats cards (water, sleep, exercise, habits)
- Quick action buttons for logging activities
- Beautiful, responsive UI

### 😊 Mood Tracker
- Log daily moods (Happy, Calm, Neutral, Tired, Stress, Sad)
- Add notes to mood entries
- View mood history (daily, weekly, monthly)
- Mood analytics and trends

### 💧 Water Intake Tracker
- Track daily water consumption
- Set and monitor hydration goals
- Increment/decrement water intake
- Weekly water analytics
- Progress visualization

### 😴 Sleep Tracker
- Log sleep and wake times
- Automatic sleep duration calculation
- Sleep quality ratings (Excellent, Good, Fair, Poor)
- Sleep history and analytics
- Average sleep duration tracking

### 🏃 Exercise Logger
- Multiple exercise types (Walking, Running, Gym, Yoga, Cycling)
- Duration and calories tracking
- Intensity levels (Low, Medium, High)
- Exercise history and statistics
- Calories burned analytics

### ✅ Habit Tracker
- Create custom habits
- Daily/weekly frequency tracking
- Streak counter (current and best)
- Check/uncheck daily completion
- Habit progress visualization

### 🎯 Goals System
- Create wellness goals
- Track progress percentage
- Multiple goal categories (Water, Sleep, Exercise, Habit, Weight)
- Deadline management
- Auto-completion when target reached

### 📝 Journal System
- Write daily journal entries
- Add mood tags to entries
- Rich text content
- Search and filter journals
- Edit and delete entries

### 🏆 Achievement System
- Auto-unlock badges based on activity
- Achievement categories (Streak, Water, Sleep, Exercise, Habit)
- Achievement history
- Motivational rewards

### 📈 Analytics Dashboard
- Mood analytics with charts
- Water intake trends
- Sleep quality analysis
- Exercise statistics
- Habit streak visualization

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Hooks** - State management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

## 📁 Project Structure

```
wellness/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── api/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── moods/
│   │   ├── water/
│   │   ├── sleep/
│   │   ├── exercise/
│   │   ├── habits/
│   │   ├── goals/
│   │   ├── journals/
│   │   ├── achievements/
│   │   ├── dashboard/
│   │   └── analytics/
│   ├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
├── src/
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Features.tsx
│   │   ├── Statistics.tsx
│   │   ├── Community.tsx
│   │   └── Footer.tsx
│   ├── models/
│   │   ├── User.ts
│   │   ├── Mood.ts
│   │   ├── WaterLog.ts
│   │   ├── SleepLog.ts
│   │   ├── ExerciseLog.ts
│   │   ├── Habit.ts
│   │   ├── Goal.ts
│   │   ├── Journal.ts
│   │   └── Achievement.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── dashboardService.ts
│   │   ├── moodService.ts
│   │   ├── waterService.ts
│   │   └── habitService.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useDashboard.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   └── middleware.ts
├── lib/
│   └── mongodb.ts
├── .env.local
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd wellness
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/wellness?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Mood
- `GET /api/moods` - Get mood history
- `GET /api/moods/today` - Get today's mood
- `POST /api/moods` - Create mood entry
- `PUT /api/moods/[id]` - Update mood entry
- `DELETE /api/moods/[id]` - Delete mood entry

### Water
- `GET /api/water` - Get water logs
- `GET /api/water/today` - Get today's water intake
- `POST /api/water` - Update water intake
- `PATCH /api/water/today` - Increment/decrement water

### Sleep
- `GET /api/sleep` - Get sleep logs
- `GET /api/sleep/latest` - Get latest sleep log
- `POST /api/sleep` - Create sleep log
- `PUT /api/sleep/[id]` - Update sleep log
- `DELETE /api/sleep/[id]` - Delete sleep log

### Exercise
- `GET /api/exercise` - Get exercise logs
- `POST /api/exercise` - Create exercise log
- `PUT /api/exercise/[id]` - Update exercise log
- `DELETE /api/exercise/[id]` - Delete exercise log

### Habits
- `GET /api/habits` - Get habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/[id]` - Update habit
- `DELETE /api/habits/[id]` - Delete habit
- `POST /api/habits/[id]/toggle` - Toggle habit completion

### Goals
- `GET /api/goals` - Get goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Delete goal

### Journals
- `GET /api/journals` - Get journals
- `GET /api/journals/[id]` - Get single journal
- `POST /api/journals` - Create journal
- `PUT /api/journals/[id]` - Update journal
- `DELETE /api/journals/[id]` - Delete journal

### Achievements
- `GET /api/achievements` - Get achievements
- `POST /api/achievements` - Create achievement

### Dashboard & Analytics
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/analytics/mood` - Get mood analytics
- `GET /api/analytics/water` - Get water analytics
- `GET /api/analytics/sleep` - Get sleep analytics
- `GET /api/analytics/exercise` - Get exercise analytics

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- Protected API routes with middleware
- Input validation on all endpoints
- MongoDB injection prevention with Mongoose
- CORS configuration
- Environment variable protection

## 🎨 UI/UX Features

- Fully responsive design (mobile, tablet, desktop)
- Dark mode support
- Smooth animations and transitions
- Loading states
- Error handling with user-friendly messages
- Toast notifications
- Optimistic UI updates
- Beautiful gradient designs
- Glass morphism effects

## 📦 Database Schema

### User
- name, email, password (hashed)
- age, gender, height, weight
- photoUrl
- timestamps

### Mood
- userId, mood, note
- timestamps

### WaterLog
- userId, amount, date
- timestamps

### SleepLog
- userId, sleepTime, wakeUpTime
- totalHours, quality, note
- timestamps

### ExerciseLog
- userId, type, duration
- calories, intensity, note
- timestamps

### Habit
- userId, name, icon, color
- frequency, targetDays
- completedDates, streak, bestStreak
- isActive, timestamps

### Goal
- userId, title, description
- category, targetValue, currentValue
- unit, deadline, status, progress
- timestamps

### Journal
- userId, title, content
- mood, tags
- timestamps

### Achievement
- userId, title, description
- icon, category, unlockedAt
- timestamps

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
npm run build
```

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `MONGODB_URI`
- `JWT_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `NEXTAUTH_SECRET`

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!

---

**Happy Tracking! 🌟**
