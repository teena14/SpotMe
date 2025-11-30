# SpotMe Setup Instructions

## 🗄️ Database Setup (Required)

The backend needs a MongoDB database to function. You have 3 options:

### Option 1: MongoDB Atlas (Recommended - Free & Easy)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spotme?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

1. Download MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. The default connection string in `.env` should work:
   ```
   MONGODB_URI=mongodb://localhost:27017/spotme
   ```

### Option 3: Docker MongoDB

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🚀 Running the Application

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

## 🧪 Testing the API

Once MongoDB is connected:

```bash
# Register first user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spotme.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spotme.com",
    "password": "admin123"
  }'
```

## 📝 Making First User Admin

After registering the first user, you need to make them an admin:

### Using MongoDB Compass (GUI):
1. Connect to your database
2. Find the `users` collection
3. Find your user document
4. Change `role` field from `"employee"` to `"admin"`

### Using MongoDB Shell:
```javascript
use spotme
db.users.updateOne(
  { email: "admin@spotme.com" },
  { $set: { role: "admin" } }
)
```

## 🎨 Frontend Features

Once both backend and frontend are running:

1. **Login/Register** - Create your account
2. **Dashboard** - View your bookings
3. **Seat Map** - Interactive floor plan to book seats
4. **My Bookings** - Manage your reservations
5. **Admin Panel** - (Admin only) Manage users, layouts, and bookings

## 🔧 Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify MONGODB_URI in `.env`
- Check port 5000 is not in use

### Frontend won't start
- Check if backend is running on port 5000
- Verify VITE_API_URL in frontend `.env`
- Check port 3000 is not in use

### Can't login
- Verify MongoDB connection
- Check browser console for errors
- Verify backend is running

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [README](./README.md)
