# SpotMe - Design Document

## Overview

SpotMe is a full-stack workspace management application built on the MERN stack (MongoDB, Express.js, React.js, Node.js) that enables hybrid workplace seat booking and management. The system provides employees with an intuitive interface to reserve office seats while giving administrators comprehensive analytics and management capabilities.

### Key Design Goals

- **Simplicity**: Minimize cognitive load with a clean, minimalistic lavender purple UI
- **Performance**: Fast page loads (<3s) and quick booking confirmations (<2s)
- **Scalability**: Support concurrent users and thousands of bookings efficiently
- **Security**: Role-based access control with JWT authentication and encrypted data transmission
- **Maintainability**: Modular component architecture for easy updates and extensions

### Technology Stack

**Frontend:**
- React.js 18+ with functional components and hooks
- Tailwind CSS for styling with custom lavender purple theme
- React Router for navigation
- Axios for API communication
- React Query for server state management

**Backend:**
- Node.js with Express.js framework
- JWT for authentication (access + refresh tokens)
- Bcrypt for password hashing
- Multer for file uploads
- MongoDB with Mongoose ODM

**Database:**
- MongoDB Atlas (cloud-hosted)
- Indexed collections for performance

**Deployment:**
- Frontend: Render
- Backend: Vercel
- Database: MongoDB Atlas

## Architecture

### System Architecture

The application follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                         │
│  (React SPA - Responsive UI with Tailwind CSS)          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS/REST API
                     │ (JSON)
┌────────────────────▼────────────────────────────────────┐
│                  Application Layer                       │
│  (Node.js + Express.js - Business Logic & Auth)         │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
                     │
┌────────────────────▼────────────────────────────────────┐
│                    Data Layer                            │
│         (MongoDB Atlas - Document Storage)               │
└──────────────────────────────────────────────────────────┘
```

### Component Architecture

**Frontend Components:**

```
App
├── AuthProvider (Context)
├── Router
│   ├── PublicRoutes
│   │   ├── LoginPage
│   │   └── RegisterPage
│   └── ProtectedRoutes
│       ├── EmployeeRoutes
│       │   ├── DashboardPage
│       │   ├── SeatMapPage
│       │   ├── MyBookingsPage
│       │   └── ProfilePage
│       └── AdminRoutes
│           ├── AdminDashboardPage
│           ├── AnalyticsPage
│           ├── UserManagementPage
│           ├── LayoutManagementPage
│           └── BookingManagementPage
└── SharedComponents
    ├── Navbar
    ├── SeatMap (interactive canvas/SVG)
    ├── BookingCard
    ├── NotificationBell
    └── LoadingSpinner
```

**Backend Structure:**

```
src/
├── config/
│   ├── database.js
│   ├── jwt.js
│   └── upload.js
├── models/
│   ├── User.js
│   ├── Layout.js
│   ├── Seat.js
│   ├── Booking.js
│   ├── Notification.js
│   └── CheckIn.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── layoutController.js
│   ├── bookingController.js
│   ├── checkinController.js
│   ├── analyticsController.js
│   ├── notificationController.js
│   └── uploadController.js
├── middleware/
│   ├── auth.js
│   ├── roleCheck.js
│   ├── validation.js
│   ├── errorHandler.js
│   └── rateLimiter.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── layoutRoutes.js
│   ├── bookingRoutes.js
│   ├── checkinRoutes.js
│   ├── analyticsRoutes.js
│   ├── adminRoutes.js
│   ├── notificationRoutes.js
│   └── uploadRoutes.js
├── utils/
│   ├── validators.js
│   ├── dateHelpers.js
│   └── logger.js
└── server.js
```

## Components and Interfaces

### Authentication System

**JWT Token Strategy:**
- Access tokens: Short-lived (15 minutes), stored in memory
- Refresh tokens: Long-lived (7 days), stored in httpOnly cookies
- Token rotation on refresh to prevent replay attacks

**Auth Middleware:**
```javascript
// Validates JWT and attaches user to request
authenticateToken(req, res, next)

// Checks user role
requireRole(['admin', 'employee'])(req, res, next)
```

### User Management

**User Model:**
- Fields: email, password (hashed), firstName, lastName, role, avatarUrl, isBlocked, createdAt
- Roles: 'employee', 'admin'
- Methods: comparePassword(), generateAuthToken()

**User Controller:**
- GET /api/users - List all users (admin only)
- GET /api/users/:id - Get user details
- PUT /api/users/:id - Update user profile
- DELETE /api/users/:id - Delete user (admin only)
- PUT /api/users/:id/role - Change user role (admin only)
- PUT /api/users/:id/avatar - Update avatar

### Layout and Seat Management

**Layout Model:**
- Fields: name, description, imageUrl, floor, capacity, isActive, createdAt
- Virtual: seats (populated from Seat collection)

**Seat Model:**
- Fields: layoutId, seatNumber, xCoordinate, yCoordinate, type, amenities[], isActive
- Types: 'desk', 'meeting-room', 'phone-booth'
- Amenities: ['monitor', 'standing-desk', 'window-view', 'quiet-zone']

**Layout Controller:**
- GET /api/layouts - List all active layouts
- POST /api/layouts - Create layout (admin)
- GET /api/layouts/:layoutId - Get layout with seats
- PUT /api/layouts/:layoutId - Update layout (admin)
- DELETE /api/layouts/:layoutId - Delete layout (admin)
- GET /api/layouts/:layoutId/seats - Get all seats in layout
- POST /api/layouts/:layoutId/seats - Add seat (admin)
- PUT /api/layouts/:layoutId/seats/:seatId - Update seat (admin)
- DELETE /api/layouts/:layoutId/seats/:seatId - Delete seat (admin)

### Booking System

**Booking Model:**
- Fields: userId, seatId, layoutId, date, status, createdAt, cancelledAt
- Status: 'active', 'cancelled', 'completed', 'no-show'
- Indexes: userId + date, seatId + date (for conflict detection)

**Booking Business Rules:**
- One booking per user per date
- Cannot book past dates
- Cannot book same seat twice for same date
- Cancellation only allowed for future bookings
- Admin can override any booking

**Booking Controller:**
- POST /api/bookings - Create booking
- GET /api/bookings - Get user's bookings (or all for admin)
- GET /api/bookings/:bookingId - Get booking details
- PUT /api/bookings/:bookingId/cancel - Cancel booking
- PUT /api/bookings/:bookingId/override - Override booking (admin)
- DELETE /api/bookings/:bookingId - Delete booking (admin)
- GET /api/bookings/user/:userId - Get bookings by user
- GET /api/bookings/date/:date - Get bookings by date
- GET /api/bookings/seat/:seatId - Get bookings by seat

### Check-in System

**CheckIn Model:**
- Fields: bookingId, userId, seatId, checkInTime, method, verifiedBy
- Method: 'qr', 'manual'

**Check-in Controller:**
- POST /api/checkin/qr - QR code check-in
- POST /api/checkin/manual - Manual check-in (admin)
- GET /api/checkin/booking/:bookingId/status - Get check-in status
- GET /api/checkin/user/:userId - Get user check-in history

**QR Code Flow:**
1. Each seat has a unique QR code containing seatId
2. User scans QR with mobile device
3. Frontend sends seatId + userId to backend
4. Backend validates active booking for that user/seat/date
5. Creates CheckIn record if valid

### Analytics System

**Analytics Controller:**
- GET /api/analytics/summary - Overall metrics (total bookings, occupancy, active users)
- GET /api/analytics/usage - Usage data by date range
- GET /api/analytics/daily-occupancy - Occupancy percentage for specific date
- GET /api/analytics/layout/:layoutId/heatmap - Seat usage frequency
- GET /api/analytics/users/active - Active users in date range
- GET /api/analytics/bookings/peak-hours - Booking creation patterns

**Metrics Calculated:**
- Occupancy rate: (booked seats / total seats) × 100
- Utilization rate: (checked-in bookings / total bookings) × 100
- Popular seats: Booking frequency per seat
- Peak booking times: Histogram of booking creation times
- No-show rate: Bookings without check-ins

### Notification System

**Notification Model:**
- Fields: userId, title, message, type, isRead, createdAt
- Types: 'booking-confirmed', 'booking-cancelled', 'booking-reminder', 'system-alert'

**Notification Controller:**
- GET /api/notifications - Get user notifications
- GET /api/notifications/:id - Get specific notification
- POST /api/notifications/send - Send notification (admin)
- DELETE /api/notifications/:id - Delete notification

**Auto-notifications:**
- Booking created → "Booking confirmed for [date]"
- Booking cancelled → "Your booking for [date] has been cancelled"
- Day before booking → "Reminder: You have a booking tomorrow"

### File Upload System

**Upload Controller:**
- POST /api/uploads/avatar - Upload user avatar
- POST /api/uploads/layout - Upload layout image
- POST /api/uploads/document - Upload general document

**Upload Configuration:**
- Max file size: 5MB for images, 10MB for documents
- Allowed formats: jpg, png, pdf
- Storage: Cloud storage (AWS S3 or similar)
- Validation: File type checking, virus scanning

### Admin Panel

**Admin Controller:**
- GET /api/admin/users - List all users with filters
- GET /api/admin/users/:id - Get user details
- POST /api/admin/users/:id/block - Block user
- POST /api/admin/users/:id/unblock - Unblock user
- GET /api/admin/bookings - List all bookings with filters
- DELETE /api/admin/bookings/:bookingId - Delete booking
- POST /api/admin/layouts/clone - Clone existing layout
- POST /api/admin/config/update - Update system configuration

### System Utilities

**Health Check:**
- GET /api/health - Returns system status
  - Database connection status
  - API response time
  - Memory usage
  - Uptime

**Version Info:**
- GET /api/version - Returns version and build info

**Logging:**
- GET /api/logs - Returns recent logs (admin only)
- Log levels: error, warn, info, debug
- Log storage: File-based with rotation

## Data Models

### User Schema

```javascript
{
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
  avatarUrl: { type: String },
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Layout Schema

```javascript
{
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  floor: { type: String },
  capacity: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Seat Schema

```javascript
{
  layoutId: { type: ObjectId, ref: 'Layout', required: true },
  seatNumber: { type: String, required: true },
  xCoordinate: { type: Number, required: true },
  yCoordinate: { type: Number, required: true },
  type: { type: String, enum: ['desk', 'meeting-room', 'phone-booth'], default: 'desk' },
  amenities: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Booking Schema

```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  seatId: { type: ObjectId, ref: 'Seat', required: true },
  layoutId: { type: ObjectId, ref: 'Layout', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'completed', 'no-show'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  cancelledAt: { type: Date }
}

// Compound indexes
Index: { userId: 1, date: 1 }, unique: true
Index: { seatId: 1, date: 1, status: 1 }
```

### CheckIn Schema

```javascript
{
  bookingId: { type: ObjectId, ref: 'Booking', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  seatId: { type: ObjectId, ref: 'Seat', required: true },
  checkInTime: { type: Date, default: Date.now },
  method: { type: String, enum: ['qr', 'manual'], required: true },
  verifiedBy: { type: ObjectId, ref: 'User' } // For manual check-ins
}
```

### Notification Schema

```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['booking-confirmed', 'booking-cancelled', 'booking-reminder', 'system-alert'], required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

## UI De
sign System

### Color Palette (Lavender Purple Theme)

```css
:root {
  /* Primary Colors */
  --primary-50: #faf5ff;   /* Lightest lavender */
  --primary-100: #f3e8ff;  /* Very light lavender */
  --primary-200: #e9d5ff;  /* Light lavender */
  --primary-300: #d8b4fe;  /* Soft lavender */
  --primary-400: #c084fc;  /* Medium lavender */
  --primary-500: #a855f7;  /* Main lavender purple */
  --primary-600: #9333ea;  /* Deep lavender */
  --primary-700: #7e22ce;  /* Dark purple */
  --primary-800: #6b21a8;  /* Darker purple */
  --primary-900: #581c87;  /* Darkest purple */

  /* Neutral Colors */
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #e5e5e5;
  --gray-300: #d4d4d4;
  --gray-400: #a3a3a3;
  --gray-500: #737373;
  --gray-600: #525252;
  --gray-700: #404040;
  --gray-800: #262626;
  --gray-900: #171717;

  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Typography

- **Font Family**: Inter or System UI fallback
- **Headings**: 
  - H1: 2.5rem (40px), font-weight: 700
  - H2: 2rem (32px), font-weight: 600
  - H3: 1.5rem (24px), font-weight: 600
- **Body**: 1rem (16px), font-weight: 400
- **Small**: 0.875rem (14px)

### Component Styling Guidelines

**Buttons:**
- Primary: bg-primary-500, hover:bg-primary-600, rounded-lg, px-4 py-2
- Secondary: bg-gray-200, hover:bg-gray-300
- Danger: bg-error, hover:bg-red-600
- Ghost: transparent with border

**Cards:**
- White background with subtle shadow
- Rounded corners (8px)
- Padding: 1.5rem
- Border: 1px solid gray-200

**Seat Map:**
- Available seats: primary-100 with primary-400 border
- Booked seats: gray-300 with gray-500 border
- Selected seat: primary-500 with glow effect
- Hover state: scale(1.05) transition

**Forms:**
- Input fields: border-gray-300, focus:border-primary-500, focus:ring-primary-200
- Labels: text-gray-700, font-medium
- Error messages: text-error, text-sm

### Responsive Design

- Mobile: < 640px (single column, bottom navigation)
- Tablet: 640px - 1024px (two columns, side navigation)
- Desktop: > 1024px (multi-column, full sidebar)

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- ARIA labels for interactive elements
- Color contrast ratio > 4.5:1
- Focus indicators on all interactive elements

## API Design

### RESTful Conventions

- Use HTTP methods semantically (GET, POST, PUT, DELETE)
- Use plural nouns for resources (/api/bookings, not /api/booking)
- Use nested routes for relationships (/api/layouts/:id/seats)
- Return appropriate status codes

### Status Codes

- 200 OK - Successful GET, PUT
- 201 Created - Successful POST
- 204 No Content - Successful DELETE
- 400 Bad Request - Validation error
- 401 Unauthorized - Missing/invalid token
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource doesn't exist
- 409 Conflict - Duplicate booking, constraint violation
- 500 Internal Server Error - Server error

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* resource or array */ },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "This seat is already booked for the selected date",
    "details": { /* additional context */ }
  }
}
```

### Pagination

For list endpoints:
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

Query parameters: `?page=1&limit=20&sort=-createdAt`

### Authentication Headers

```
Authorization: Bearer <access_token>
```

Refresh token sent as httpOnly cookie.

## Database Design

### Indexing Strategy

**User Collection:**
- email (unique)
- role
- isBlocked

**Booking Collection:**
- { userId: 1, date: 1 } (unique compound index)
- { seatId: 1, date: 1, status: 1 }
- { date: 1, status: 1 }
- createdAt (for time-series queries)

**Seat Collection:**
- layoutId
- { layoutId: 1, seatNumber: 1 } (unique compound)

**Notification Collection:**
- { userId: 1, createdAt: -1 }
- { userId: 1, isRead: 1 }

### Data Relationships

```
User (1) ──────< (N) Booking
Seat (1) ──────< (N) Booking
Layout (1) ────< (N) Seat
Booking (1) ───< (1) CheckIn
User (1) ──────< (N) Notification
```

### Data Integrity Rules

- Cascade delete: Layout deletion removes associated Seats and Bookings
- Soft delete: User deletion marks as inactive but preserves booking history
- Referential integrity: Foreign keys validated at application layer
- Unique constraints: One booking per user per date, unique seat numbers per layout

## Cor
rectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Authentication and Authorization Properties

**Property 1: User registration creates valid accounts**
*For any* valid registration data (email, password, name), creating a new user account should result in a stored user with a hashed password (not plaintext) and the ability to subsequently log in with those credentials.
**Validates: Requirements 1.1, 1.2**

**Property 2: Token refresh round-trip**
*For any* authenticated user with a valid refresh token, using that refresh token should produce a new valid access token that can be used to access protected resources.
**Validates: Requirements 1.4**

**Property 3: Logout invalidates tokens**
*For any* authenticated user, after logging out, their previous access token should no longer grant access to protected resources.
**Validates: Requirements 1.3**

**Property 4: Invalid credentials are rejected**
*For any* invalid credentials (wrong password, non-existent email, or malformed data), authentication attempts should be rejected with an appropriate error.
**Validates: Requirements 1.5**

### User Management Properties

**Property 5: Profile update round-trip**
*For any* user and any valid profile updates (name, avatar, etc.), updating the profile then fetching it should return the updated values.
**Validates: Requirements 2.1, 2.2**

**Property 6: Role changes affect permissions**
*For any* user, when an administrator changes their role from employee to admin (or vice versa), the user's ability to access role-specific endpoints should change accordingly.
**Validates: Requirements 2.4, 9.5**

**Property 7: User deletion cascades to bookings**
*For any* user with existing bookings, deleting that user should also remove all their associated bookings from the system.
**Validates: Requirements 2.5**

**Property 8: User blocking prevents access**
*For any* user, when an administrator blocks their account, that user should be unable to log in or create new bookings until unblocked.
**Validates: Requirements 9.2, 9.3**

### Layout and Seat Management Properties

**Property 9: Layout creation round-trip**
*For any* valid layout data (name, floor, capacity), creating a layout then retrieving it should return the same layout information.
**Validates: Requirements 3.1, 3.4**

**Property 10: Layout updates preserve seat associations**
*For any* layout with associated seats, updating the layout's properties (name, description) should not break the relationship between the layout and its seats.
**Validates: Requirements 3.2**

**Property 11: Layout deletion cascades**
*For any* layout with associated seats and bookings, deleting the layout should also remove all associated seats and bookings.
**Validates: Requirements 3.3**

**Property 12: Seat creation with coordinates**
*For any* valid seat data (seat number, coordinates, type), adding a seat to a layout should create a seat with all specified properties that can be retrieved.
**Validates: Requirements 3.5**

### Booking Creation and Conflict Detection Properties

**Property 13: Booking makes seat unavailable**
*For any* available seat and future date, when an employee creates a booking, querying seat availability for that date should show the seat as booked.
**Validates: Requirements 4.1**

**Property 14: Booking conflicts are prevented**
*For any* seat and date, if a booking already exists, attempting to create another booking for the same seat and date should be rejected, regardless of which user attempts it.
**Validates: Requirements 4.2**

**Property 15: One booking per user per date**
*For any* user and date, if the user already has a booking for that date, attempting to create another booking for the same date (even for a different seat) should be rejected.
**Validates: Requirements 4.3**

**Property 16: Booking contains required data**
*For any* successful booking creation, the stored booking should contain userId, seatId, layoutId, date, status, and createdAt timestamp.
**Validates: Requirements 4.4**

**Property 17: Booking confirmation includes details**
*For any* successful booking, the response should include seat location information and a booking reference identifier.
**Validates: Requirements 4.5**

### Booking Management Properties

**Property 18: User bookings are retrievable**
*For any* user with bookings, requesting their booking history should return all bookings (past and future) associated with that user.
**Validates: Requirements 5.1**

**Property 19: Cancellation frees the seat**
*For any* active future booking, when cancelled by the user or admin, the seat should become available for that date and the booking status should be marked as cancelled.
**Validates: Requirements 5.2, 5.5**

**Property 20: Past bookings cannot be cancelled**
*For any* booking with a date in the past, attempting to cancel it should be rejected.
**Validates: Requirements 5.3**

**Property 21: Admin override modifies booking**
*For any* booking, when an administrator performs an override, the booking should be modified and a notification should be created for the affected user.
**Validates: Requirements 5.4**

### Availability Query Properties

**Property 22: Seat availability reflects bookings**
*For any* date and layout, querying seat availability should return each seat with a status that accurately reflects whether it has an active booking for that date.
**Validates: Requirements 6.1**

**Property 23: Date filtering returns correct bookings**
*For any* specific date, filtering bookings by that date should return only bookings where the booking date matches the query date.
**Validates: Requirements 6.3**

**Property 24: Seat schedule is accurate**
*For any* seat, querying its booking schedule should return all bookings for that seat ordered by date.
**Validates: Requirements 6.4**

**Property 25: User booking queries with optional date filter**
*For any* user, querying their bookings with an optional date parameter should return all their bookings (if no date) or only bookings for the specified date (if date provided).
**Validates: Requirements 6.5**

### Check-in System Properties

**Property 26: Valid QR check-in updates status**
*For any* active booking, when the booking owner scans the correct QR code for their booked seat, the booking should be marked as checked-in with a timestamp.
**Validates: Requirements 7.1**

**Property 27: Manual check-in updates status**
*For any* active booking, when an administrator performs manual check-in, the booking should be marked as checked-in with the method set to 'manual'.
**Validates: Requirements 7.2**

**Property 28: Check-in status round-trip**
*For any* booking, after performing check-in (QR or manual), querying the check-in status should return checked-in state with the timestamp.
**Validates: Requirements 7.3**

**Property 29: Invalid check-in is rejected**
*For any* seat and user, if the user does not have an active booking for that seat on the current date, attempting to check in should be rejected.
**Validates: Requirements 7.4**

**Property 30: Check-in history is retrievable**
*For any* user with check-ins, querying their check-in history should return all check-in records for that user.
**Validates: Requirements 7.5**

### Analytics Properties

**Property 31: Analytics summary calculates correctly**
*For any* set of bookings, the analytics summary should return total booking count, occupancy rate (booked seats / total seats), and count of unique users who made bookings.
**Validates: Requirements 8.1**

**Property 32: Date range filtering in analytics**
*For any* date range, querying usage data should return only bookings created within that date range.
**Validates: Requirements 8.2**

**Property 33: Daily occupancy calculation**
*For any* date with bookings, the daily occupancy percentage should equal (number of booked seats for that date / total seats) × 100.
**Validates: Requirements 8.3**

**Property 34: Heatmap reflects usage frequency**
*For any* layout and date range, the heatmap data should show each seat's booking count, with more frequently booked seats having higher counts.
**Validates: Requirements 8.4**

**Property 35: Active users identification**
*For any* date range, querying active users should return only users who created at least one booking within that date range.
**Validates: Requirements 8.5**

**Property 36: Peak hours analysis**
*For any* set of bookings, the peak hours analysis should group bookings by the hour they were created and return counts for each hour.
**Validates: Requirements 8.6**

### Admin User Management Properties

**Property 37: Admin user list is complete**
*For any* set of users in the system, the admin user list endpoint should return all users with their roles and status information.
**Validates: Requirements 9.1**

**Property 38: User details include booking history**
*For any* user, when an administrator queries their details, the response should include comprehensive information including all their bookings.
**Validates: Requirements 9.4**

### Notification Properties

**Property 39: User notifications are ordered**
*For any* user with notifications, requesting their notifications should return all notifications ordered by timestamp (most recent first).
**Validates: Requirements 10.1**

**Property 40: Notification creation and delivery**
*For any* valid notification data and recipient list, sending a notification should create notification records for all specified recipients.
**Validates: Requirements 10.2**

**Property 41: Viewing marks as read**
*For any* unread notification, when a user views it, the notification's isRead status should change to true.
**Validates: Requirements 10.3**

**Property 42: Notification deletion removes it**
*For any* notification, when a user deletes it, subsequent queries for that user's notifications should not include the deleted notification.
**Validates: Requirements 10.4**

**Property 43: Automatic notifications on booking events**
*For any* booking creation or cancellation, the system should automatically generate a notification for the user associated with that booking.
**Validates: Requirements 10.5**

### File Upload Properties

**Property 44: Avatar upload returns URL**
*For any* valid image file within size limits, uploading it as an avatar should store the file and return a URL that can be used to access the image.
**Validates: Requirements 11.1**

**Property 45: Layout image association**
*For any* valid layout image, uploading it should store the image and associate the URL with the specified layout.
**Validates: Requirements 11.2**

**Property 46: Document upload returns reference**
*For any* valid document file within size limits, uploading it should store the file and return a reference identifier.
**Validates: Requirements 11.3**

**Property 47: Oversized files are rejected**
*For any* file exceeding the size limit (5MB for images, 10MB for documents), the upload should be rejected with an appropriate error.
**Validates: Requirements 11.4**

### System Monitoring Properties

**Property 48: Error logging includes context**
*For any* critical error that occurs, the system should create a log entry containing the error message, timestamp, and relevant context information.
**Validates: Requirements 12.5**

### Data Serialization Properties

**Property 49: JSON serialization round-trip**
*For any* data model (user, booking, layout, etc.), serializing it to JSON then deserializing should produce an equivalent object with the same field values.
**Validates: Requirements 13.1, 13.2**

**Property 50: HTTP status codes are appropriate**
*For any* API request, the response should include an HTTP status code that matches the outcome (200 for success, 400 for validation errors, 401 for auth failures, 404 for not found, etc.).
**Validates: Requirements 13.3**

**Property 51: Sensitive data is excluded**
*For any* user data serialization, the response should not include the password hash or other sensitive fields.
**Validates: Requirements 13.4**

**Property 52: Date format consistency**
*For any* date/time value in API responses, the format should be ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ).
**Validates: Requirements 13.5**

### Error Handling Properties

**Property 53: Error messages are informative**
*For any* error condition (validation failure, conflict, not found), the error response should include a clear message explaining what went wrong.
**Validates: Requirements 14.4**

### Rate Limiting Properties

**Property 54: Rate limiting prevents abuse**
*For any* API endpoint, making requests at a rate exceeding the limit should result in 429 (Too Many Requests) responses until the rate limit window resets.
**Validates: Requirements 15.5**

## Error Handling

### Error Handling Strategy

The application implements a centralized error handling approach with consistent error responses across all endpoints.

**Error Categories:**

1. **Validation Errors (400)**
   - Missing required fields
   - Invalid data formats
   - Business rule violations (e.g., booking past dates)

2. **Authentication Errors (401)**
   - Missing or invalid JWT token
   - Expired access token
   - Invalid credentials

3. **Authorization Errors (403)**
   - Insufficient permissions for the requested operation
   - Blocked user attempting access

4. **Not Found Errors (404)**
   - Resource doesn't exist
   - Invalid resource ID

5. **Conflict Errors (409)**
   - Duplicate booking attempts
   - Unique constraint violations
   - Concurrent modification conflicts

6. **Server Errors (500)**
   - Database connection failures
   - Unexpected exceptions
   - Third-party service failures

### Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context",
      "timestamp": "2025-11-30T10:30:00Z"
    }
  }
}
```

### Error Codes

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
- `FILE_TOO_LARGE` - Upload exceeds size limit
- `INVALID_FILE_TYPE` - Unsupported file format
- `DATABASE_ERROR` - Database operation failed
- `INTERNAL_ERROR` - Unexpected server error

### Error Handling Middleware

```javascript
// Global error handler
app.use((err, req, res, next) => {
  logger.error(err);
  
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred',
      details: err.details || {}
    }
  });
});
```

### Validation Error Handling

- Use express-validator or Joi for input validation
- Validate all user inputs before processing
- Return specific field-level errors for forms
- Sanitize inputs to prevent injection attacks

### Database Error Handling

- Catch and transform MongoDB errors into user-friendly messages
- Handle connection timeouts gracefully
- Implement retry logic for transient failures
- Log all database errors for debugging

### Graceful Degradation

- If analytics service fails, return cached data or empty results
- If notification service fails, log error but don't block main operation
- If file upload fails, allow user to retry without losing form data

## Testing Strategy

### Overview

SpotMe employs a comprehensive testing strategy combining unit tests, property-based tests, and integration tests to ensure correctness and reliability.

### Testing Framework

**Backend Testing:**
- **Framework**: Jest
- **Property-Based Testing**: fast-check
- **API Testing**: Supertest
- **Database**: MongoDB Memory Server (for isolated tests)

**Frontend Testing:**
- **Framework**: Vitest
- **Component Testing**: React Testing Library
- **Property-Based Testing**: fast-check
- **E2E Testing**: Playwright (optional)

### Unit Testing

Unit tests verify specific examples, edge cases, and error conditions for individual functions and components.

**Backend Unit Tests:**
- Controller functions with mocked services
- Middleware functions (auth, validation, error handling)
- Utility functions (date helpers, validators)
- Model methods (password comparison, token generation)

**Frontend Unit Tests:**
- Component rendering with various props
- Event handlers and user interactions
- Form validation logic
- API client functions

**Example Unit Test:**
```javascript
describe('Booking Controller', () => {
  it('should reject booking for past date', async () => {
    const pastDate = '2024-01-01';
    const response = await request(app)
      .post('/api/bookings')
      .send({ seatId: 'seat123', date: pastDate })
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('PAST_DATE_BOOKING');
  });
});
```

### Property-Based Testing

Property-based tests verify universal properties that should hold across all inputs. Each property test runs a minimum of 100 iterations with randomly generated inputs.

**Property Test Configuration:**
```javascript
// Configure fast-check to run 100 iterations
fc.assert(
  fc.property(/* generators */, (/* inputs */) => {
    // Test property
  }),
  { numRuns: 100 }
);
```

**Property Test Tagging:**
Each property-based test must include a comment explicitly referencing the correctness property from the design document:

```javascript
/**
 * Feature: spotme-seat-booking, Property 13: Booking makes seat unavailable
 * Validates: Requirements 4.1
 */
test('booking a seat makes it unavailable', () => {
  fc.assert(
    fc.property(
      fc.date({ min: new Date() }), // Future date
      fc.string(), // Seat ID
      async (date, seatId) => {
        // Create booking
        await createBooking({ seatId, date });
        
        // Check availability
        const availability = await getSeatAvailability(seatId, date);
        
        // Property: seat should be unavailable
        expect(availability.isAvailable).toBe(false);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Key Property Tests:**

1. **Authentication round-trip** (Property 2)
   - Generate random valid credentials
   - Register, login, use token
   - Verify access granted

2. **Booking conflict prevention** (Property 14)
   - Generate random seat and date
   - Create first booking
   - Attempt second booking
   - Verify rejection

3. **One booking per user per date** (Property 15)
   - Generate random user and date
   - Create booking for seat A
   - Attempt booking for seat B same date
   - Verify rejection

4. **Cancellation frees seat** (Property 19)
   - Generate random booking
   - Cancel it
   - Check seat availability
   - Verify seat is available

5. **JSON serialization round-trip** (Property 49)
   - Generate random data models
   - Serialize to JSON
   - Deserialize back
   - Verify equivalence

### Integration Testing

Integration tests verify that multiple components work together correctly.

**API Integration Tests:**
- Complete user flows (register → login → book → cancel)
- Authentication and authorization across endpoints
- Database operations with real MongoDB instance
- File upload and retrieval

**Example Integration Test:**
```javascript
describe('Booking Flow', () => {
  it('should complete full booking lifecycle', async () => {
    // Register user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Pass123!', firstName: 'Test', lastName: 'User' });
    
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Pass123!' });
    
    const token = loginRes.body.data.accessToken;
    
    // Create booking
    const bookingRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ seatId: 'seat123', date: '2025-12-15' });
    
    expect(bookingRes.status).toBe(201);
    
    // Verify booking exists
    const myBookings = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${token}`);
    
    expect(myBookings.body.data).toHaveLength(1);
    
    // Cancel booking
    const cancelRes = await request(app)
      .put(`/api/bookings/${bookingRes.body.data.id}/cancel`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(cancelRes.status).toBe(200);
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: 80% code coverage minimum
- **Property Tests**: All 54 correctness properties implemented
- **Integration Tests**: All critical user flows covered
- **API Tests**: All endpoints tested with valid and invalid inputs

### Testing Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Reset database state between tests
3. **Mocking**: Mock external services (email, file storage) in unit tests
4. **Realistic Data**: Use realistic test data that resembles production data
5. **Edge Cases**: Test boundary conditions (empty arrays, null values, max limits)
6. **Error Paths**: Test error handling as thoroughly as success paths
7. **Performance**: Keep tests fast (< 5 seconds for unit tests)

### Continuous Integration

- Run all tests on every commit
- Block merges if tests fail
- Generate coverage reports
- Run property tests with increased iterations (1000+) nightly

## Performance Optimization

### Frontend Performance

**Code Splitting:**
- Lazy load admin routes
- Split vendor bundles
- Dynamic imports for heavy components

**Caching:**
- Cache layout and seat data in React Query
- Implement stale-while-revalidate strategy
- Cache static assets with service workers

**Rendering Optimization:**
- Use React.memo for expensive components
- Virtualize long lists (booking history)
- Debounce search inputs
- Optimize seat map rendering with canvas/SVG

### Backend Performance

**Database Optimization:**
- Proper indexing on frequently queried fields
- Use projection to limit returned fields
- Implement pagination for large result sets
- Use aggregation pipelines for analytics

**Caching Strategy:**
- Redis cache for frequently accessed data
- Cache layout configurations (TTL: 1 hour)
- Cache analytics summaries (TTL: 15 minutes)
- Invalidate cache on data updates

**Query Optimization:**
- Use lean() for read-only queries
- Batch database operations where possible
- Avoid N+1 queries with proper population
- Use indexes for sorting and filtering

**API Optimization:**
- Implement response compression (gzip)
- Use connection pooling for database
- Rate limiting to prevent abuse
- CDN for static assets

### Monitoring and Metrics

**Performance Metrics:**
- API response times (p50, p95, p99)
- Database query times
- Page load times
- Time to interactive (TTI)

**Monitoring Tools:**
- Application Performance Monitoring (APM)
- Error tracking (Sentry or similar)
- Log aggregation
- Uptime monitoring

## Security Considerations

### Authentication Security

- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens with short expiration (15 minutes)
- Refresh tokens stored in httpOnly cookies
- Token rotation on refresh
- Account lockout after failed login attempts

### Authorization Security

- Role-based access control (RBAC)
- Middleware validates user permissions
- Admin-only endpoints protected
- Users can only access their own data

### Data Security

- All API communication over HTTPS
- Input validation and sanitization
- SQL/NoSQL injection prevention
- XSS protection with Content Security Policy
- CSRF protection for state-changing operations

### File Upload Security

- File type validation (whitelist)
- File size limits enforced
- Virus scanning for uploads
- Secure file storage with access controls
- Sanitize file names

### Rate Limiting

- Global rate limit: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP
- Booking endpoints: 20 requests per minute per user
- Admin endpoints: 200 requests per 15 minutes per user

### Security Headers

```javascript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

### Audit Logging

- Log all authentication attempts
- Log all admin actions
- Log booking creation and cancellation
- Log permission changes
- Retain logs for compliance

## Deployment Architecture

### Environment Configuration

**Development:**
- Local MongoDB instance
- Hot reload enabled
- Detailed error messages
- Debug logging enabled

**Staging:**
- MongoDB Atlas (staging cluster)
- Production-like configuration
- Error tracking enabled
- Performance monitoring

**Production:**
- MongoDB Atlas (production cluster)
- Optimized builds
- Error tracking and monitoring
- Automated backups

### Environment Variables

```
# Database
MONGODB_URI=mongodb+srv://...
DB_NAME=spotme

# JWT
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://spotme.app

# File Upload
UPLOAD_MAX_SIZE=5242880
STORAGE_BUCKET=spotme-uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Monitoring
SENTRY_DSN=<sentry-url>
LOG_LEVEL=info
```

### Deployment Process

1. **Build**: Compile frontend and backend
2. **Test**: Run all tests in CI/CD pipeline
3. **Deploy Backend**: Deploy to Vercel
4. **Deploy Frontend**: Deploy to Render
5. **Smoke Test**: Verify critical endpoints
6. **Monitor**: Watch for errors and performance issues

### Backup Strategy

- Automated daily database backups
- Point-in-time recovery enabled
- Backup retention: 30 days
- Test restore process monthly

### Scaling Strategy

**Horizontal Scaling:**
- Stateless backend allows multiple instances
- Load balancer distributes traffic
- Session data in database, not memory

**Database Scaling:**
- MongoDB Atlas auto-scaling
- Read replicas for analytics queries
- Sharding if data grows beyond single server

**Caching Layer:**
- Redis cluster for distributed caching
- Cache warming for frequently accessed data
- Cache invalidation strategy

## Future Enhancements

### Phase 2 Features

1. **Calendar Integration**
   - Sync bookings with Google Calendar
   - Sync bookings with Outlook Calendar
   - iCal export

2. **Team Features**
   - Book seats near teammates
   - Team booking templates
   - Department-based seat allocation

3. **Advanced Analytics**
   - Predictive occupancy modeling
   - Personalized seat recommendations
   - Cost analysis per seat

4. **Mobile App**
   - Native iOS and Android apps
   - Push notifications
   - Offline booking queue

5. **IoT Integration**
   - Automatic occupancy detection with sensors
   - Smart desk features
   - Environmental monitoring (temperature, noise)

6. **Accessibility Features**
   - Screen reader optimization
   - Keyboard-only navigation
   - High contrast mode
   - Seat filtering by accessibility needs

### Technical Debt Considerations

- Migrate to TypeScript for better type safety
- Implement GraphQL for more flexible queries
- Add real-time updates with WebSockets
- Implement event sourcing for audit trail
- Add comprehensive E2E test suite

## Conclusion

This design document provides a comprehensive blueprint for building SpotMe, a modern workspace management application. The architecture emphasizes simplicity, security, and scalability while maintaining a delightful user experience through a minimalistic lavender purple design.

The correctness properties defined in this document serve as formal specifications that will guide implementation and testing, ensuring the system behaves correctly across all scenarios. By combining traditional unit tests with property-based testing, we achieve high confidence in the system's reliability and correctness.