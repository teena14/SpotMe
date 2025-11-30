# SpotMe API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "employee"
    },
    "accessToken": "..."
  },
  "message": "User registered successfully"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

### Refresh Token
```http
POST /auth/refresh
Cookie: refreshToken=...
```

---

## 👤 User Endpoints

### Get All Users (Admin Only)
```http
GET /users
Authorization: Bearer <token>
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com"
}
```

### Delete User (Admin Only)
```http
DELETE /users/:id
Authorization: Bearer <token>
```

### Update User Role (Admin Only)
```http
PUT /users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

### Update User Avatar
```http
PUT /users/:id/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

avatar: <file>
```

---

## 🗺️ Layout Endpoints

### Get All Layouts
```http
GET /layouts
Authorization: Bearer <token>
```

### Create Layout (Admin Only)
```http
POST /layouts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Floor 1",
  "description": "Main office floor",
  "floor": "1",
  "capacity": 50,
  "imageUrl": "https://..."
}
```

### Get Layout by ID
```http
GET /layouts/:layoutId
Authorization: Bearer <token>
```

### Update Layout (Admin Only)
```http
PUT /layouts/:layoutId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Floor 1 - Updated",
  "capacity": 60
}
```

### Delete Layout (Admin Only)
```http
DELETE /layouts/:layoutId
Authorization: Bearer <token>
```

---

## 💺 Seat Endpoints

### Get All Seats in Layout
```http
GET /layouts/:layoutId/seats
Authorization: Bearer <token>
```

### Get Seat by ID
```http
GET /layouts/:layoutId/seats/:seatId
Authorization: Bearer <token>
```

### Create Seat (Admin Only)
```http
POST /layouts/:layoutId/seats
Authorization: Bearer <token>
Content-Type: application/json

{
  "seatNumber": "A1",
  "xCoordinate": 100,
  "yCoordinate": 200,
  "type": "desk",
  "amenities": ["monitor", "standing-desk"]
}
```

### Update Seat (Admin Only)
```http
PUT /layouts/:layoutId/seats/:seatId
Authorization: Bearer <token>
Content-Type: application/json

{
  "seatNumber": "A2",
  "isActive": true
}
```

### Delete Seat (Admin Only)
```http
DELETE /layouts/:layoutId/seats/:seatId
Authorization: Bearer <token>
```

---

## 🎫 Booking Endpoints

### Create Booking
```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "seatId": "...",
  "date": "2025-12-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "seatId": {...},
    "layoutId": {...},
    "date": "2025-12-01T00:00:00.000Z",
    "status": "active",
    "createdAt": "..."
  },
  "message": "Booking created successfully"
}
```

### Get All Bookings
```http
GET /bookings
Authorization: Bearer <token>
```
Returns user's own bookings (or all bookings if admin)

### Get Booking by ID
```http
GET /bookings/:bookingId
Authorization: Bearer <token>
```

### Cancel Booking
```http
PUT /bookings/:bookingId/cancel
Authorization: Bearer <token>
```

### Override Booking (Admin Only)
```http
PUT /bookings/:bookingId/override
Authorization: Bearer <token>
Content-Type: application/json

{
  "seatId": "...",
  "date": "2025-12-02",
  "status": "active"
}
```

### Delete Booking (Admin Only)
```http
DELETE /bookings/:bookingId
Authorization: Bearer <token>
```

### Get Bookings by User
```http
GET /bookings/user/:userId?date=2025-12-01
Authorization: Bearer <token>
```

### Get Bookings by Date
```http
GET /bookings/date/:date
Authorization: Bearer <token>
```

### Get Bookings by Seat
```http
GET /bookings/seat/:seatId?date=2025-12-01
Authorization: Bearer <token>
```

---

## 📢 Notification Endpoints

### Get User Notifications
```http
GET /notifications
Authorization: Bearer <token>
```

### Get Notification by ID
```http
GET /notifications/:id
Authorization: Bearer <token>
```
Automatically marks notification as read

### Send Notification (Admin Only)
```http
POST /notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["...", "..."],
  "title": "System Maintenance",
  "message": "The system will be down for maintenance...",
  "type": "system-alert"
}
```

### Delete Notification
```http
DELETE /notifications/:id
Authorization: Bearer <token>
```

---

## 🔧 Admin Endpoints

### Get All Users (with filters)
```http
GET /admin/users?role=employee&isBlocked=false
Authorization: Bearer <token>
```

### Get User Details with Booking History
```http
GET /admin/users/:id
Authorization: Bearer <token>
```

### Block User
```http
POST /admin/users/:id/block
Authorization: Bearer <token>
```

### Unblock User
```http
POST /admin/users/:id/unblock
Authorization: Bearer <token>
```

### Get All Bookings (with filters)
```http
GET /admin/bookings?status=active&date=2025-12-01
Authorization: Bearer <token>
```

### Delete Booking
```http
DELETE /admin/bookings/:bookingId
Authorization: Bearer <token>
```

---

## ⚙️ System Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-30T12:30:00.000Z",
    "uptime": 1234.56,
    "environment": "development"
  }
}
```

### Version Info
```http
GET /version
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `BOOKING_CONFLICT` - Seat already booked
- `USER_ALREADY_BOOKED` - User has booking for that date
- `INVALID_CREDENTIALS` - Login failed
- `TOKEN_EXPIRED` - JWT token expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required role
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `USER_BLOCKED` - Account is blocked
- `PAST_DATE_BOOKING` - Cannot book past dates
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Rate Limits

- **Global**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Booking endpoints**: 20 requests per minute
- **Admin endpoints**: 200 requests per 15 minutes

---

## Testing with cURL

### Register and Login
```bash
# Register
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

### Create Layout (save token from login)
```bash
curl -X POST http://localhost:5000/api/layouts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Floor 1",
    "description": "Main office floor",
    "floor": "1",
    "capacity": 50
  }'
```

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "seatId": "SEAT_ID_HERE",
    "date": "2025-12-15"
  }'
```
