# Tour Booking Web Application

Production-ready MERN tour booking platform with JWT authentication, role-based access, user bookings, wishlists, and an admin dashboard.

## 1. Folder Structure

```text
Tour App/
  backend/
    package.json
    package-lock.json
    .env.example
    src/
      app.js
      server.js
      config/
        db.js
        env.js
      controllers/
        authController.js
        bookingController.js
        tourController.js
        userController.js
      middleware/
        authMiddleware.js
        errorMiddleware.js
        validateRequest.js
      models/
        Booking.js
        Tour.js
        User.js
      routes/
        authRoutes.js
        bookingRoutes.js
        tourRoutes.js
        userRoutes.js
      scripts/
        seed.js
      utils/
        AppError.js
        catchAsync.js
        jwt.js
      validators/
        authValidators.js
        bookingValidators.js
        tourValidators.js
        userValidators.js
  frontend/
    package.json
    package-lock.json
    .env.example
    index.html
    vite.config.js
    src/
      App.jsx
      main.jsx
      api/
        auth.js
        bookings.js
        client.js
        tours.js
        users.js
      components/
        EmptyState.jsx
        LoadingState.jsx
        Navbar.jsx
        ProtectedRoute.jsx
        SearchFilters.jsx
        StatusBadge.jsx
        TourCard.jsx
      context/
        AuthContext.jsx
      pages/
        AdminDashboard.jsx
        Home.jsx
        Login.jsx
        NotFound.jsx
        Register.jsx
        TourDetails.jsx
        Tours.jsx
        UserDashboard.jsx
      styles/
        index.css
```

## 2. Backend Setup Step-by-Step

1. Install Node.js 20+ and MongoDB locally, or prepare a MongoDB Atlas connection string.
2. Open `backend/` and install dependencies:

   ```bash
   npm install
   ```

3. Copy `backend/.env.example` to `backend/.env` and set:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/tour_booking
   JWT_SECRET=replace_with_a_long_random_secret
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
   ```

4. Seed demo data:

   ```bash
   npm run seed
   ```

5. Start the API:

   ```bash
   npm run dev
   ```

## 3. API Routes List

### Auth

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a user |
| POST | `/api/auth/login` | Public | Login user or admin |
| GET | `/api/auth/me` | Authenticated | Get current profile |

### Tours

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/tours` | Public | List tours with search/filter/pagination |
| GET | `/api/tours/:id` | Public | Get tour details |
| POST | `/api/tours` | Admin | Create tour |
| PATCH | `/api/tours/:id` | Admin | Update tour |
| DELETE | `/api/tours/:id` | Admin | Delete tour |

### Bookings

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/bookings` | Authenticated | Book a tour |
| GET | `/api/bookings/my` | Authenticated | View own booking history |
| GET | `/api/bookings` | Admin | Manage all bookings |
| GET | `/api/bookings/:id` | Owner or Admin | View one booking |
| PATCH | `/api/bookings/:id/status` | Admin | Confirm or cancel booking |

### Users and Wishlist

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/users` | Admin | List users |
| GET | `/api/users/:id` | Admin | Get user details |
| PATCH | `/api/users/:id/role` | Admin | Update role |
| DELETE | `/api/users/:id` | Admin | Delete user |
| GET | `/api/users/me/wishlist` | Authenticated | View wishlist |
| POST | `/api/users/me/wishlist/:tourId` | Authenticated | Add tour to wishlist |
| DELETE | `/api/users/me/wishlist/:tourId` | Authenticated | Remove tour from wishlist |

## 4. Backend Implementation

The backend uses a clean MVC layout:

- `models/`: Mongoose schemas with validation and indexes.
- `controllers/`: Request handlers and business logic.
- `routes/`: REST endpoints grouped by resource.
- `middleware/`: JWT auth, role authorization, validation, and global errors.
- `config/`: Environment and MongoDB connection.

Passwords are hashed with bcrypt before save. JWTs are signed server-side and must be sent as `Authorization: Bearer <token>`.

## 5. Frontend Setup

1. Open `frontend/` and install dependencies:

   ```bash
   npm install
   ```

2. Copy `frontend/.env.example` to `frontend/.env`:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start React:

   ```bash
   npm run dev
   ```

## 6. Frontend Implementation

The frontend is a Vite React app with hooks, functional components, React Router, auth context, protected routes, dashboards, responsive layouts, and reusable API clients.

Pages included:

- Home
- Tours listing
- Tour details
- Login
- Register
- User dashboard
- Admin dashboard

## 7. How to Run Project Locally

Run MongoDB, then in separate terminals:

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

Demo credentials after seeding:

- Admin: `admin@tourapp.com` / `Admin123!`
- User: `user@tourapp.com` / `User123!`
