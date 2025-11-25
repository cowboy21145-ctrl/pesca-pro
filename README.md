# Pesca Pro - Fishing Tournament Management System

 🎣

A comprehensive full-stack application for managing fishing tournaments, built with Node.js, React, Tailwind CSS, and MySQL.

![Pesca Pro](https://img.shields.io/badge/Pesca-Pro-0288d1?style=for-the-badge&logo=fish&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

## Features

### For Organizers
- ✅ Create and manage tournaments
- ✅ Configure multiple ponds with zones and fishing areas
- ✅ Set pricing per area
- ✅ Generate unique registration and leaderboard links
- ✅ Review and approve participant registrations
- ✅ Approve/reject catch submissions
- ✅ Real-time leaderboard management

### For Participants
- ✅ Easy registration with mobile number
- ✅ Visual area selection interface
- ✅ Multiple area selection across ponds/zones
- ✅ Payment receipt upload
- ✅ Catch photo submission
- ✅ View live leaderboard

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **File Upload**: Multer
- **Password Hashing**: bcryptjs

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: Context API
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites
- Node.js 16+ installed
- MySQL 8.0+ installed
- npm or yarn package manager

### Database Setup

1. Create the database and tables:
```bash
mysql -u root -p < backend/database/schema.sql
```

Or run the SQL commands in `backend/database/schema.sql` in your MySQL client.

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pesca_pro
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

The API will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will be running at `http://localhost:3000`

## Deployment

### Railway (Recommended - Free Tier Available)

Railway offers a free tier with $5 credit/month, perfect for deploying your full-stack application with MySQL.

**Quick Steps:**
1. Push your code to GitHub
2. Sign up at [Railway](https://railway.app) with GitHub
3. Create a new project and add MySQL database
4. Deploy backend and frontend as separate services
5. Configure environment variables

**Detailed Guide:** See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for step-by-step instructions.

**Key Features:**
- ✅ MySQL database included
- ✅ Auto-deploy from GitHub
- ✅ Custom domains with SSL
- ✅ Environment variable management
- ✅ Free tier: $5 credit/month

### Other Deployment Options

- **Vercel** (Frontend) + **PlanetScale** (MySQL) - Free tier available
- **Heroku** - Paid plans only
- **DigitalOcean** - VPS with MySQL
- **AWS** - EC2 + RDS (more complex setup)

## API Endpoints

### Authentication
- `POST /api/auth/user/register` - Register new user
- `POST /api/auth/user/login` - User login
- `POST /api/auth/user/check-mobile` - Check if mobile exists
- `POST /api/auth/organizer/register` - Register new organizer
- `POST /api/auth/organizer/login` - Organizer login

### Tournaments
- `GET /api/tournaments/my-tournaments` - Get organizer's tournaments
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments/:id` - Get tournament details
- `GET /api/tournaments/register/:link` - Get tournament by registration link
- `GET /api/tournaments/leaderboard/:link` - Get leaderboard
- `PATCH /api/tournaments/:id/status` - Update tournament status
- `DELETE /api/tournaments/:id` - Delete tournament

### Ponds, Zones & Areas
- `POST /api/ponds` - Create pond
- `GET /api/ponds/tournament/:id` - Get ponds for tournament
- `POST /api/zones` - Create zone
- `POST /api/areas` - Create area
- `POST /api/areas/bulk` - Bulk create areas

### Registrations
- `POST /api/registrations` - Create registration
- `GET /api/registrations/my-registrations` - Get user's registrations
- `GET /api/registrations/tournament/:id` - Get tournament registrations
- `PATCH /api/registrations/:id/status` - Update registration status

### Catches
- `POST /api/catches` - Upload catch
- `GET /api/catches/tournament/:id/pending` - Get pending catches
- `PATCH /api/catches/:id/status` - Approve/reject catch

## Project Structure

```
Pesca Pro/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── database/
│   │   └── schema.sql
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tournaments.js
│   │   ├── ponds.js
│   │   ├── zones.js
│   │   ├── areas.js
│   │   ├── registrations.js
│   │   └── catches.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── organizer/
│   │   │   ├── user/
│   │   │   └── public/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## Default Credentials

For testing purposes, a default organizer account is created:
- **Email**: `admin@pescapro.com`
- **Password**: `password`

> **Note**: Or simply register a new organizer account at `/organizer/register`

## Screenshots

The system includes:
- Beautiful landing page with gradient animations
- Modern authentication flows
- Intuitive dashboard for users and organizers
- Visual area selection interface
- Real-time leaderboard with podium display
- Responsive design for all devices

## License

This project is licensed under the MIT License.

## Acknowledgments

- Icons by [Heroicons](https://heroicons.com/)
- Fonts by [Google Fonts](https://fonts.google.com/) (DM Sans & Playfair Display)
- Animations by [Framer Motion](https://www.framer.com/motion/)

