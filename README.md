# Therapy Case Management System

A full-stack case management system for therapy workflows built with React + Vite frontend and Node.js + Express + MongoDB backend.

## Tech Stack

### Frontend
- React + Vite (JSX)
- Clerk for authentication
- React Router for routing
- CSS for styling
- Fetch API for HTTP requests

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication via Clerk
- REST API architecture
- CORS enabled

## Features

- **User Authentication**: Clerk integration with role-based access control
- **Patient Management**: CRUD operations for patient records
- **Therapy Planning**: Create, submit, and review therapy plans
- **Session Documentation**: Log therapy sessions with progress tracking
- **Progress Reports**: Automated reminders and report generation
- **Clinical Ratings**: Supervisor evaluation system
- **Patient Allocation**: Automated and manual assignment algorithms
- **Analytics Dashboard**: Comprehensive reporting and data visualization
- **User Management**: Role-based permissions (therapist, supervisor, admin)

## User Roles

- **Therapists**: View assigned cases, create therapy plans, document sessions, submit progress reports
- **Supervisors**: Manage allocations, review/approve plans, evaluate therapists, view team analytics
- **Admin**: User management, global settings, data import/export

## Setup Instructions

### Prerequisites
- Node.js (v20.19+ or v22.12+)
- MongoDB Atlas account (or local MongoDB installation)
- Clerk account for authentication

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your MongoDB URI:
   ```
   PORT=4000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/therapy_casemgmt
   ```

4. Seed the database with sample data:
   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Clerk configuration:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_cGxlYXNhbnQtdmVydmV0LTgzLmNsZXJrLmFjY291bnRzLmRldiQ
   VITE_API_BASE_URL=http://localhost:4000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Project Structure

```
therapy-casemgmt-app/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── App.jsx         # Main application component
│   │   ├── main.jsx        # Application entry point
│   │   └── api.js          # API client utilities
│   ├── .env.local          # Environment variables
│   └── package.json
├── server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── models/         # Mongoose data models
│   │   ├── routes/         # Express route handlers
│   │   └── middleware/     # Custom middleware functions
│   ├── server.js           # Server entry point
│   ├── seed.js            # Database seeding script
│   ├── .env               # Environment variables
│   └── package.json
└── README.md
```

## API Endpoints

### Users
- `GET /api/users` - List users (with filtering)
- `GET /api/users/me` - Get current user info
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user

### Patients
- `GET /api/patients` - List patients (with filtering/pagination)
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Therapy Plans
- `GET /api/plans` - List therapy plans
- `POST /api/plans` - Create new plan
- `GET /api/plans/:id` - Get plan details
- `PUT /api/plans/:id` - Update plan
- `POST /api/plans/:id/submit` - Submit plan for review
- `POST /api/plans/:id/review` - Review plan (approve/revision)

### Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Log new session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session

### Progress Reports
- `GET /api/progress-reports` - List progress reports
- `POST /api/progress-reports` - Create progress report
- `POST /api/progress-reports/:id/review` - Review progress report

### Clinical Ratings
- `GET /api/ratings` - List clinical ratings
- `POST /api/ratings` - Create new rating
- `GET /api/ratings/:id` - Get rating details

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments/auto-assign` - Auto-assign patient to therapist
- `POST /api/assignments/manual-assign` - Manually assign patient

## Sample Users (from seed data)

After running `npm run seed`, you'll have these sample users:

- **Therapist 1**: therapist1@example.com (Dr. Sarah Johnson)
- **Therapist 2**: therapist2@example.com (Dr. Michael Chen)
- **Supervisor**: supervisor1@example.com (Dr. Emily Rodriguez)
- **Admin**: admin@example.com (Admin User)

## Authentication

This application uses Clerk for authentication. The provided publishable key in the setup is for development purposes. For production, you'll need to:

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Set up your application
3. Replace the publishable key in `.env.local`
4. Configure proper JWT verification in the backend middleware

## Development Notes

- The backend currently uses placeholder authentication middleware
- CORS is configured to allow requests from `http://localhost:5173`
- MongoDB connection uses the provided Atlas URI
- All API endpoints require authentication (placeholder implementation)
- The auto-assignment algorithm considers therapist specialties and current caseload

## Available Scripts

### Backend
- `npm run dev` - Start development server with file watching
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
