# SpotMe - Workspace Management Application

A full-stack MERN application for managing office seat bookings in hybrid work environments.

## Features

- 🔐 JWT Authentication with refresh tokens
- 👥 User management (Employee & Admin roles)
- 🗺️ Interactive seat maps with booking system
- 📱 QR code check-in functionality
- 📊 Analytics dashboard for administrators
- 🎨 Minimalistic lavender purple UI design
- ✅ Property-based testing for correctness

## Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- Bcrypt for password hashing

**Frontend:**
- React.js 18+ with Vite
- Tailwind CSS
- React Router v6
- Axios + TanStack React Query v5
- date-fns

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd spotme
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running on localhost:27017
mongod
```

5. **Start the backend server**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

6. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

7. **Start the frontend dev server**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation.

#### Quick Reference

**Authentication:**
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

**Users:**
- `GET /api/users` - List users (admin)
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)
- `PUT /api/users/:id/role` - Update role (admin)
- `PUT /api/users/:id/avatar` - Update avatar

**Layouts:**
- `GET /api/layouts` - List layouts
- `POST /api/layouts` - Create layout (admin)
- `GET /api/layouts/:id` - Get layout
- `PUT /api/layouts/:id` - Update layout (admin)
- `DELETE /api/layouts/:id` - Delete layout (admin)

**Seats:**
- `GET /api/layouts/:layoutId/seats` - List seats
- `POST /api/layouts/:layoutId/seats` - Create seat (admin)
- `GET /api/layouts/:layoutId/seats/:seatId` - Get seat
- `PUT /api/layouts/:layoutId/seats/:seatId` - Update seat (admin)
- `DELETE /api/layouts/:layoutId/seats/:seatId` - Delete seat (admin)

**Bookings:**
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings
- `GET /api/bookings/:id` - Get booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/override` - Override (admin)
- `DELETE /api/bookings/:id` - Delete (admin)
- `GET /api/bookings/user/:userId` - User bookings
- `GET /api/bookings/date/:date` - Date bookings
- `GET /api/bookings/seat/:seatId` - Seat bookings

**Notifications:**
- `GET /api/notifications` - List notifications
- `GET /api/notifications/:id` - Get notification
- `POST /api/notifications/send` - Send (admin)
- `DELETE /api/notifications/:id` - Delete

**Admin:**
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - User details
- `POST /api/admin/users/:id/block` - Block user
- `POST /api/admin/users/:id/unblock` - Unblock user
- `GET /api/admin/bookings` - List all bookings
- `DELETE /api/admin/bookings/:id` - Delete booking

**System:**
- `GET /api/health` - Health check
- `GET /api/version` - Version info

#### Testing the API

**Register a new user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spotme.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spotme.com",
    "password": "admin123"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── uploads/             # File uploads directory
├── .env                 # Environment variables
└── package.json

frontend/
├── src/
│   ├── components/      # Shared components (Navbar, ProtectedRoute)
│   ├── contexts/        # React context (AuthContext)
│   ├── pages/           # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── SeatMapPage.jsx
│   │   ├── MyBookingsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── admin/       # Admin-only pages
│   │       ├── AdminDashboardPage.jsx
│   │       ├── UserManagementPage.jsx
│   │       └── LayoutManagementPage.jsx
│   ├── services/        # Axios API client
│   └── App.jsx          # Routes & providers
├── index.html
├── vite.config.js
└── package.json
```

## Development

The backend uses nodemon for hot-reloading during development.

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev
```

## Testing

```bash
npm test
```

## License

ISC

## Author

Teena Kaintura
