# Implementation Plan

## Backend Implementation

- [x] 1. Set up project structure and core configuration


  - Initialize Node.js project with Express.js
  - Configure MongoDB connection with Mongoose
  - Set up environment variables and configuration files
  - Configure JWT authentication strategy
  - Set up error handling middleware
  - Configure CORS and security headers (Helmet)
  - _Requirements: 1.1, 1.2, 13.1, 13.2_




- [ ] 2. Implement data models with validation
- [ ] 2.1 Create User model
  - Define User schema with email, password, firstName, lastName, role, avatarUrl, isBlocked
  - Implement password hashing with bcrypt
  - Add comparePassword() and generateAuthToken() methods
  - Add indexes for email, role, and isBlocked
  - _Requirements: 1.1, 2.1, 2.2_



- [ ] 2.2 Write property test for User model
  - **Property 1: User registration creates valid accounts**
  - **Validates: Requirements 1.1, 1.2**

- [ ] 2.3 Create Layout model
  - Define Layout schema with name, description, imageUrl, floor, capacity, isActive
  - Add virtual field for seats population


  - _Requirements: 3.1, 3.4_

- [ ] 2.4 Write property test for Layout model
  - **Property 9: Layout creation round-trip**
  - **Validates: Requirements 3.1, 3.4**

- [x] 2.5 Create Seat model


  - Define Seat schema with layoutId, seatNumber, coordinates, type, amenities
  - Add compound index for layoutId + seatNumber
  - _Requirements: 3.5_

- [ ] 2.6 Write property test for Seat model
  - **Property 12: Seat creation with coordinates**
  - **Validates: Requirements 3.5**

- [ ] 2.7 Create Booking model
  - Define Booking schema with userId, seatId, layoutId, date, status, timestamps
  - Add compound indexes for conflict detection (userId+date, seatId+date+status)


  - _Requirements: 4.1, 4.2, 4.3, 4.4_



- [ ] 2.8 Write property test for Booking conflict detection
  - **Property 14: Booking conflicts are prevented**
  - **Validates: Requirements 4.2**




- [ ] 2.9 Write property test for one booking per user per date
  - **Property 15: One booking per user per date**
  - **Validates: Requirements 4.3**

- [ ] 2.10 Create CheckIn model
  - Define CheckIn schema with bookingId, userId, seatId, checkInTime, method, verifiedBy
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 2.11 Create Notification model
  - Define Notification schema with userId, title, message, type, isRead
  - Add compound indexes for userId + createdAt and userId + isRead


  - _Requirements: 10.1, 10.2_

- [ ] 3. Implement authentication system
- [ ] 3.1 Create authentication middleware
  - Implement JWT token validation middleware
  - Implement role-based access control middleware
  - Add token refresh logic
  - _Requirements: 1.2, 1.3, 1.4_




- [ ] 3.2 Write property test for token refresh
  - **Property 2: Token refresh round-trip**
  - **Validates: Requirements 1.4**




- [ ] 3.3 Write property test for logout
  - **Property 3: Logout invalidates tokens**
  - **Validates: Requirements 1.3**

- [ ] 3.4 Create auth controller
  - Implement register endpoint with validation
  - Implement login endpoint with credential verification
  - Implement logout endpoint
  - Implement refresh token endpoint
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3.5 Write property test for invalid credentials
  - **Property 4: Invalid credentials are rejected**
  - **Validates: Requirements 1.5**

- [ ] 3.6 Create auth routes
  - Define POST /api/auth/register
  - Define POST /api/auth/login
  - Define POST /api/auth/logout
  - Define POST /api/auth/refresh
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Implement user management


- [ ] 4.1 Create user controller
  - Implement GET /api/users (admin only)
  - Implement GET /api/users/:id



  - Implement PUT /api/users/:id (profile update)
  - Implement DELETE /api/users/:id (admin only)
  - Implement PUT /api/users/:id/role (admin only)
  - Implement PUT /api/users/:id/avatar
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 9.1, 9.4, 9.5_

- [ ] 4.2 Write property test for profile update
  - **Property 5: Profile update round-trip**
  - **Validates: Requirements 2.1, 2.2**

- [ ] 4.3 Write property test for role changes
  - **Property 6: Role changes affect permissions**
  - **Validates: Requirements 2.4, 9.5**


- [ ] 4.4 Write property test for user deletion cascade
  - **Property 7: User deletion cascades to bookings**
  - **Validates: Requirements 2.5**

- [ ] 4.5 Write property test for user blocking
  - **Property 8: User blocking prevents access**
  - **Validates: Requirements 9.2, 9.3**



- [ ] 4.6 Create user routes
  - Define all user management endpoints



  - Apply authentication and authorization middleware
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ] 5. Implement layout and seat management
- [ ] 5.1 Create layout controller
  - Implement GET /api/layouts
  - Implement POST /api/layouts (admin only)
  - Implement GET /api/layouts/:layoutId
  - Implement PUT /api/layouts/:layoutId (admin only)
  - Implement DELETE /api/layouts/:layoutId with cascade (admin only)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5.2 Write property test for layout updates
  - **Property 10: Layout updates preserve seat associations**
  - **Validates: Requirements 3.2**

- [ ] 5.3 Write property test for layout deletion cascade
  - **Property 11: Layout deletion cascades**
  - **Validates: Requirements 3.3**

- [ ] 5.4 Create seat management endpoints
  - Implement GET /api/layouts/:layoutId/seats
  - Implement POST /api/layouts/:layoutId/seats (admin only)
  - Implement GET /api/layouts/:layoutId/seats/:seatId
  - Implement PUT /api/layouts/:layoutId/seats/:seatId (admin only)
  - Implement DELETE /api/layouts/:layoutId/seats/:seatId (admin only)
  - _Requirements: 3.5_

- [ ] 5.5 Create layout routes
  - Define all layout and seat management endpoints
  - Apply authentication and authorization middleware
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Implement booking system
- [ ] 6.1 Create booking controller with business logic
  - Implement POST /api/bookings with conflict detection
  - Implement GET /api/bookings (user's bookings or all for admin)

  - Implement GET /api/bookings/:bookingId
  - Implement PUT /api/bookings/:bookingId/cancel
  - Implement PUT /api/bookings/:bookingId/override (admin only)
  - Implement DELETE /api/bookings/:bookingId (admin only)
  - Add validation for past date bookings
  - Add validation for duplicate bookings
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6.2 Write property test for booking makes seat unavailable
  - **Property 13: Booking makes seat unavailable**
  - **Validates: Requirements 4.1**

- [ ] 6.3 Write property test for booking data completeness
  - **Property 16: Booking contains required data**
  - **Validates: Requirements 4.4**

- [ ] 6.4 Write property test for booking confirmation
  - **Property 17: Booking confirmation includes details**
  - **Validates: Requirements 4.5**

- [x] 6.5 Write property test for user bookings retrieval



  - **Property 18: User bookings are retrievable**
  - **Validates: Requirements 5.1**

- [ ] 6.6 Write property test for cancellation frees seat
  - **Property 19: Cancellation frees the seat**
  - **Validates: Requirements 5.2, 5.5**

- [ ] 6.7 Write property test for past booking cancellation
  - **Property 20: Past bookings cannot be cancelled**
  - **Validates: Requirements 5.3**

- [ ] 6.8 Write property test for admin override
  - **Property 21: Admin override modifies booking**
  - **Validates: Requirements 5.4**

- [ ] 6.9 Create availability query endpoints
  - Implement GET /api/bookings/user/:userId with optional date filter
  - Implement GET /api/bookings/date/:date
  - Implement GET /api/bookings/seat/:seatId with optional date filter
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [ ] 6.10 Write property test for seat availability
  - **Property 22: Seat availability reflects bookings**
  - **Validates: Requirements 6.1**

- [ ] 6.11 Write property test for date filtering
  - **Property 23: Date filtering returns correct bookings**
  - **Validates: Requirements 6.3**

- [ ] 6.12 Write property test for seat schedule
  - **Property 24: Seat schedule is accurate**
  - **Validates: Requirements 6.4**

- [ ] 6.13 Write property test for user booking queries
  - **Property 25: User booking queries with optional date filter**
  - **Validates: Requirements 6.5**

- [ ] 6.14 Create booking routes
  - Define all booking endpoints
  - Apply authentication and authorization middleware
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.3, 6.4, 6.5_

- [ ] 7. Implement check-in system
- [ ] 7.1 Create check-in controller
  - Implement POST /api/checkin/qr with booking validation
  - Implement POST /api/checkin/manual (admin only)
  - Implement GET /api/checkin/booking/:bookingId/status
  - Implement GET /api/checkin/user/:userId
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7.2 Write property test for valid QR check-in
  - **Property 26: Valid QR check-in updates status**
  - **Validates: Requirements 7.1**

- [ ] 7.3 Write property test for manual check-in
  - **Property 27: Manual check-in updates status**
  - **Validates: Requirements 7.2**

- [ ] 7.4 Write property test for check-in status round-trip
  - **Property 28: Check-in status round-trip**
  - **Validates: Requirements 7.3**

- [ ] 7.5 Write property test for invalid check-in rejection
  - **Property 29: Invalid check-in is rejected**
  - **Validates: Requirements 7.4**

- [ ] 7.6 Write property test for check-in history
  - **Property 30: Check-in history is retrievable**
  - **Validates: Requirements 7.5**

- [ ] 7.7 Create check-in routes
  - Define all check-in endpoints
  - Apply authentication and authorization middleware
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. Implement analytics system
- [ ] 8.1 Create analytics controller
  - Implement GET /api/analytics/summary with aggregate calculations
  - Implement GET /api/analytics/usage with date range filtering
  - Implement GET /api/analytics/daily-occupancy
  - Implement GET /api/analytics/layout/:layoutId/heatmap
  - Implement GET /api/analytics/users/active
  - Implement GET /api/analytics/bookings/peak-hours
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 8.2 Write property test for analytics summary
  - **Property 31: Analytics summary calculates correctly**
  - **Validates: Requirements 8.1**

- [ ] 8.3 Write property test for date range filtering
  - **Property 32: Date range filtering in analytics**
  - **Validates: Requirements 8.2**

- [ ] 8.4 Write property test for daily occupancy
  - **Property 33: Daily occupancy calculation**
  - **Validates: Requirements 8.3**

- [ ] 8.5 Write property test for heatmap
  - **Property 34: Heatmap reflects usage frequency**
  - **Validates: Requirements 8.4**

- [ ] 8.6 Write property test for active users
  - **Property 35: Active users identification**
  - **Validates: Requirements 8.5**

- [ ] 8.7 Write property test for peak hours
  - **Property 36: Peak hours analysis**
  - **Validates: Requirements 8.6**

- [ ] 8.8 Create analytics routes
  - Define all analytics endpoints (admin only)
  - Apply authentication and authorization middleware
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 9. Implement notification system
- [ ] 9.1 Create notification controller
  - Implement GET /api/notifications
  - Implement GET /api/notifications/:id
  - Implement POST /api/notifications/send (admin only)
  - Implement DELETE /api/notifications/:id
  - Add automatic notification generation for booking events
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 9.2 Write property test for notification ordering
  - **Property 39: User notifications are ordered**
  - **Validates: Requirements 10.1**

- [ ] 9.3 Write property test for notification creation
  - **Property 40: Notification creation and delivery**
  - **Validates: Requirements 10.2**

- [ ] 9.4 Write property test for marking as read
  - **Property 41: Viewing marks as read**
  - **Validates: Requirements 10.3**

- [ ] 9.5 Write property test for notification deletion
  - **Property 42: Notification deletion removes it**
  - **Validates: Requirements 10.4**

- [ ] 9.6 Write property test for automatic notifications
  - **Property 43: Automatic notifications on booking events**
  - **Validates: Requirements 10.5**

- [ ] 9.7 Create notification routes
  - Define all notification endpoints
  - Apply authentication and authorization middleware
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 10. Implement file upload system
- [ ] 10.1 Configure file upload middleware
  - Set up Multer for file handling
  - Configure file size limits (5MB images, 10MB documents)
  - Add file type validation
  - Set up cloud storage integration (AWS S3 or similar)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 10.2 Create upload controller
  - Implement POST /api/uploads/avatar
  - Implement POST /api/uploads/layout (admin only)
  - Implement POST /api/uploads/document
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 10.3 Write property test for avatar upload
  - **Property 44: Avatar upload returns URL**
  - **Validates: Requirements 11.1**

- [ ] 10.4 Write property test for layout image
  - **Property 45: Layout image association**
  - **Validates: Requirements 11.2**

- [ ] 10.5 Write property test for document upload
  - **Property 46: Document upload returns reference**
  - **Validates: Requirements 11.3**

- [ ] 10.6 Write property test for oversized files
  - **Property 47: Oversized files are rejected**
  - **Validates: Requirements 11.4**

- [ ] 10.7 Create upload routes
  - Define all upload endpoints
  - Apply authentication and file validation middleware
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 11. Implement admin panel endpoints
- [ ] 11.1 Create admin controller
  - Implement GET /api/admin/users with filters
  - Implement GET /api/admin/users/:id
  - Implement POST /api/admin/users/:id/block
  - Implement POST /api/admin/users/:id/unblock
  - Implement GET /api/admin/bookings with filters
  - Implement DELETE /api/admin/bookings/:bookingId
  - Implement POST /api/admin/layouts/clone
  - Implement POST /api/admin/config/update
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 11.2 Write property test for admin user list
  - **Property 37: Admin user list is complete**
  - **Validates: Requirements 9.1**

- [ ] 11.3 Write property test for user details
  - **Property 38: User details include booking history**
  - **Validates: Requirements 9.4**

- [ ] 11.4 Create admin routes
  - Define all admin endpoints
  - Apply admin-only authorization middleware
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 12. Implement system utilities
- [ ] 12.1 Create health check endpoint
  - Implement GET /api/health with database status check
  - Add API response time measurement
  - Add memory usage reporting
  - Add uptime tracking
  - _Requirements: 12.1, 12.4_

- [ ] 12.2 Create version endpoint
  - Implement GET /api/version
  - Return application version and build info
  - _Requirements: 12.2_

- [ ] 12.3 Create logging system
  - Implement GET /api/logs (admin only)
  - Set up log rotation
  - Add error logging with context
  - _Requirements: 12.3, 12.5_

- [ ] 12.4 Write property test for error logging
  - **Property 48: Error logging includes context**
  - **Validates: Requirements 12.5**

- [ ] 12.5 Create utility routes
  - Define health, version, and logs endpoints
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 13. Implement data serialization and validation
- [ ] 13.1 Create validation utilities
  - Implement input validators for all endpoints
  - Add date format validation
  - Add email format validation
  - _Requirements: 13.1, 13.2, 13.5_

- [ ] 13.2 Write property test for JSON serialization
  - **Property 49: JSON serialization round-trip**
  - **Validates: Requirements 13.1, 13.2**

- [ ] 13.3 Write property test for HTTP status codes
  - **Property 50: HTTP status codes are appropriate**
  - **Validates: Requirements 13.3**

- [ ] 13.4 Write property test for sensitive data exclusion
  - **Property 51: Sensitive data is excluded**
  - **Validates: Requirements 13.4**

- [ ] 13.5 Write property test for date format consistency
  - **Property 52: Date format consistency**
  - **Validates: Requirements 13.5**

- [ ] 14. Implement error handling
- [ ] 14.1 Create centralized error handler
  - Implement global error handling middleware
  - Define error response format
  - Add error code mapping
  - _Requirements: 14.4_

- [ ] 14.2 Write property test for error messages
  - **Property 53: Error messages are informative**
  - **Validates: Requirements 14.4**

- [ ] 15. Implement rate limiting
- [ ] 15.1 Configure rate limiting middleware
  - Set up global rate limits (100 req/15min)
  - Set up auth endpoint limits (5 req/15min)
  - Set up booking endpoint limits (20 req/min)
  - Set up admin endpoint limits (200 req/15min)
  - _Requirements: 15.5_

- [ ] 15.2 Write property test for rate limiting
  - **Property 54: Rate limiting prevents abuse**
  - **Validates: Requirements 15.5**

- [ ] 16. Backend checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Frontend Implementation

- [ ] 17. Set up frontend project structure
  - Initialize React project with Vite
  - Configure Tailwind CSS with lavender purple theme
  - Set up React Router for navigation
  - Configure Axios for API communication
  - Set up React Query for server state management
  - Create folder structure (components, pages, hooks, utils, contexts)
  - _Requirements: 14.1, 14.5_

- [ ] 18. Implement authentication context and hooks
- [ ] 18.1 Create AuthContext
  - Implement authentication state management
  - Add login, logout, and register functions
  - Handle token storage and refresh
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 18.2 Create ProtectedRoute component
  - Implement route protection based on authentication
  - Add role-based route protection
  - _Requirements: 1.2, 2.4_

- [ ] 18.3 Create useAuth hook
  - Expose authentication state and functions
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 19. Implement authentication pages
- [ ] 19.1 Create LoginPage
  - Build login form with email and password fields
  - Add form validation
  - Handle login submission and errors
  - Apply lavender purple styling
  - _Requirements: 1.2, 14.1, 14.3, 14.4_

- [ ] 19.2 Create RegisterPage
  - Build registration form with all required fields
  - Add form validation
  - Handle registration submission and errors
  - Apply lavender purple styling
  - _Requirements: 1.1, 14.1, 14.3, 14.4_

- [ ] 20. Implement shared components
- [ ] 20.1 Create Navbar component
  - Build responsive navigation bar
  - Add user menu with profile and logout
  - Add role-based navigation items
  - Apply lavender purple styling
  - _Requirements: 14.1, 14.5_

- [ ] 20.2 Create LoadingSpinner component
  - Build loading indicator
  - Apply lavender purple styling
  - _Requirements: 14.3_

- [ ] 20.3 Create NotificationBell component
  - Build notification dropdown
  - Show unread count badge
  - Apply lavender purple styling
  - _Requirements: 10.1, 14.1_

- [ ] 20.4 Create BookingCard component
  - Build booking display card
  - Show seat info, date, and status
  - Add cancel button for future bookings
  - Apply lavender purple styling
  - _Requirements: 5.1, 14.1_

- [ ] 21. Implement employee pages
- [ ] 21.1 Create DashboardPage
  - Display upcoming bookings
  - Show quick stats
  - Add navigation to seat map
  - Apply lavender purple styling
  - _Requirements: 5.1, 14.1, 14.5_

- [ ] 21.2 Create SeatMapPage with interactive map
  - Build interactive seat map using SVG or Canvas
  - Display seat availability with color coding
  - Implement seat selection
  - Add date picker for booking date
  - Show seat details on hover
  - Implement booking creation flow
  - Apply lavender purple styling with visual feedback
  - _Requirements: 4.1, 6.1, 6.2, 14.1, 14.2, 14.3_

- [ ] 21.3 Create MyBookingsPage
  - Display user's booking history
  - Add filters for past/future bookings
  - Implement booking cancellation
  - Apply lavender purple styling
  - _Requirements: 5.1, 5.2, 14.1, 14.3_

- [ ] 21.4 Create ProfilePage
  - Display user profile information
  - Implement profile editing
  - Add avatar upload
  - Apply lavender purple styling
  - _Requirements: 2.1, 2.2, 2.3, 14.1_

- [ ] 22. Implement admin pages
- [ ] 22.1 Create AdminDashboardPage
  - Display system overview
  - Show key metrics
  - Add navigation to admin features
  - Apply lavender purple styling
  - _Requirements: 8.1, 14.1_

- [ ] 22.2 Create AnalyticsPage
  - Display analytics charts and graphs
  - Implement date range selector
  - Show occupancy rates, usage trends, and heatmaps
  - Apply lavender purple styling
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 14.1_

- [ ] 22.3 Create UserManagementPage
  - Display user list with search and filters
  - Implement user blocking/unblocking
  - Implement role management
  - Apply lavender purple styling
  - _Requirements: 9.1, 9.2, 9.3, 9.5, 14.1_

- [ ] 22.4 Create LayoutManagementPage
  - Display layout list
  - Implement layout creation and editing
  - Add layout image upload
  - Implement seat management within layouts
  - Apply lavender purple styling
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 14.1_

- [ ] 22.5 Create BookingManagementPage
  - Display all bookings with filters
  - Implement booking override
  - Implement booking deletion
  - Apply lavender purple styling
  - _Requirements: 5.4, 5.5, 14.1_

- [ ] 23. Implement API client layer
- [ ] 23.1 Create API service modules
  - Create authService for authentication endpoints
  - Create userService for user management endpoints
  - Create layoutService for layout endpoints
  - Create bookingService for booking endpoints
  - Create checkinService for check-in endpoints
  - Create analyticsService for analytics endpoints
  - Create notificationService for notification endpoints
  - Create uploadService for file upload endpoints
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 23.2 Configure Axios interceptors
  - Add request interceptor for auth tokens
  - Add response interceptor for error handling
  - Implement token refresh logic
  - _Requirements: 1.4, 14.4_

- [ ] 24. Implement responsive design
- [ ] 24.1 Add mobile-specific layouts
  - Implement bottom navigation for mobile
  - Adjust seat map for touch interactions
  - Optimize forms for mobile input
  - _Requirements: 14.1, 14.5_

- [ ] 24.2 Add tablet-specific layouts
  - Implement side navigation for tablet
  - Adjust grid layouts for tablet screens
  - _Requirements: 14.1, 14.5_

- [ ] 25. Implement accessibility features
- [ ] 25.1 Add ARIA labels and roles
  - Add ARIA labels to all interactive elements
  - Implement proper heading hierarchy
  - Add screen reader announcements
  - _Requirements: 14.1_

- [ ] 25.2 Implement keyboard navigation
  - Add keyboard shortcuts for common actions
  - Ensure all interactive elements are keyboard accessible
  - Add visible focus indicators
  - _Requirements: 14.1_

- [ ] 26. Frontend checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Integration and Deployment

- [ ] 27. Set up deployment configuration
- [ ] 27.1 Configure backend deployment
  - Set up Vercel configuration
  - Configure environment variables
  - Set up MongoDB Atlas connection
  - _Requirements: 15.1, 15.2_

- [ ] 27.2 Configure frontend deployment
  - Set up Render configuration
  - Configure environment variables
  - Set up API endpoint configuration
  - _Requirements: 15.1, 15.2_

- [ ] 28. Implement performance optimizations
- [ ] 28.1 Optimize backend performance
  - Add database query optimization
  - Implement caching strategy
  - Add response compression
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ] 28.2 Optimize frontend performance
  - Implement code splitting
  - Add lazy loading for routes
  - Optimize asset loading
  - Implement React Query caching
  - _Requirements: 15.1, 15.3_

- [ ] 29. Final integration testing
- [ ] 29.1 Test complete user flows
  - Test registration → login → booking → cancellation flow
  - Test admin user management flow
  - Test admin layout management flow
  - Test analytics and reporting flow
  - _Requirements: All_

- [ ] 29.2 Test error scenarios
  - Test network failures
  - Test validation errors
  - Test authorization failures
  - _Requirements: 14.4_

- [ ] 30. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
