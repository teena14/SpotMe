# 🚀 SpotMe Quick Start Guide

## ✅ Your App is Running!

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Database:** MongoDB Atlas (Connected ✅)

---

## 📝 Step-by-Step Usage

### 1. Register Your Account

1. Go to http://localhost:3000/register
2. Fill in your details:
   - Email
   - Password (min 6 characters)
   - First Name
   - Last Name
3. Click "Register"

### 2. Login

1. Go to http://localhost:3000/login
2. Enter your email and password
3. Click "Login"

### 3. Book a Seat

1. Click "Seat Map" in the navigation
2. Select a floor/layout (Main Office or Executive Floor)
3. Select a date (today or future)
4. Click on an available seat (purple/lavender colored)
5. Click "Confirm Booking" at the bottom

**Legend:**
- 🟣 Purple/Lavender = Available
- ⚫ Gray = Already Booked
- 🔵 Dark Purple = Your Selection

**Seat Amenities:**
- 🖥️ = Monitor
- ⬆️ = Standing Desk
- 🪟 = Window View

### 4. View Your Bookings

1. Click "My Bookings" in the navigation
2. See all your bookings
3. Cancel future bookings if needed

### 5. View Dashboard

1. Click "Dashboard" in the navigation
2. See your upcoming bookings
3. Quick stats and actions

---

## 👑 Become an Admin

To access admin features:

1. Go to https://cloud.mongodb.com
2. Login to your MongoDB Atlas account
3. Click "Browse Collections"
4. Select `spotme` database → `users` collection
5. Find your user (by email)
6. Click "Edit Document"
7. Change `"role": "employee"` to `"role": "admin"`
8. Click "Update"
9. Refresh your browser

### Admin Features:

Once you're an admin, you'll see:
- **Admin** link in navigation
- User Management (coming soon)
- Layout Management (coming soon)
- Analytics (coming soon)

---

## 🗺️ Current Layouts

Your database now has:

**Floor 1 - Main Office:**
- 40 seats (A1-A8, B1-B8, C1-C8, D1-D8, E1-E8)
- Various amenities (monitors, standing desks, window views)

**Floor 2 - Executive Floor:**
- 24 seats (A1-A6, B1-B6, C1-C6, D1-D6)
- Row A: Meeting rooms
- Rows B-D: Premium desks with all amenities

---

## 🔧 Useful Commands

### Reseed Database (Reset all layouts and seats):
```bash
cd backend
npm run seed
```

### Restart Backend:
```bash
cd backend
npm run dev
```

### Restart Frontend:
```bash
cd frontend
npm run dev
```

---

## 📊 API Testing

You can test the API directly:

### Register via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Get All Layouts:
```bash
curl http://localhost:5000/api/layouts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 Features Available

✅ **Working Now:**
- User Registration & Login
- Interactive Seat Map (8x5 grid)
- Book Seats by Date
- View My Bookings
- Cancel Bookings
- Dashboard with Stats
- 2 Office Layouts with 64 Seats
- Seat Amenities Display
- Booking Conflict Prevention

🔄 **Coming Soon:**
- Admin User Management
- Admin Layout Management
- Analytics Dashboard
- QR Code Check-in
- Notifications Panel

---

## 🐛 Troubleshooting

### Can't see seats on the map?
- Make sure you ran `npm run seed` in the backend folder
- Check that MongoDB is connected (look for ✅ in backend console)

### Can't book a seat?
- Make sure you're logged in
- Check that the date is today or in the future
- Make sure the seat isn't already booked (gray color)

### Backend not connecting to MongoDB?
- Check your `.env` file has the correct `MONGODB_URI`
- Verify your IP is whitelisted in MongoDB Atlas Network Access

---

## 📚 Documentation

- **Full API Docs:** `API_DOCUMENTATION.md`
- **Setup Instructions:** `SETUP_INSTRUCTIONS.md`
- **README:** `README.md`

---

## 🎉 You're All Set!

Your SpotMe workspace management app is fully functional!

Start by booking your first seat at: http://localhost:3000/seat-map

Enjoy! 🚀
