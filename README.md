# SpennyBucketTracker

A full-stack budget tracking application built with React, Express.js, and PostgreSQL. Track your spending using the "bucket" budgeting method with real-time balance updates and comprehensive transaction management.

## Features

- **User Authentication**: Email/password and Google OAuth login
- **Bucket Management**: Create and manage spending categories
- **Transaction Tracking**: Log expenses and see real-time balance updates
- **Income Management**: Record income and allocate funds to buckets
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Theme switching support

## Tech Stack

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI components
- TanStack Query for data fetching
- Wouter for routing

### Backend

- Express.js with TypeScript
- Passport.js for authentication
- Drizzle ORM with PostgreSQL
- Neon Database (serverless PostgreSQL)
- Express Session with PostgreSQL store

### Testing

- Vitest for unit and integration tests
- React Testing Library for component tests

## Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)
- Google OAuth credentials (optional)

## Setup Instructions

### 1. Install Dependencies

```bash
npm ci
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Update `.env` with your configuration:

```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-session-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5173/api/auth/google/callback
```

### 3. Database Setup

Apply database migrations:

```bash
npm run db:push
```

### 4. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5173/api/auth/google/callback`
6. Copy Client ID and Secret to your `.env` file

## Development

### Start Development Server

```bash
npm run dev
```

This starts both the Express server and Vite dev server with HMR.

**Default port**: 5000
**Recommended port**: 5173 (to avoid conflicts)

```bash
export PORT=5173
npm run dev
```

Open http://localhost:5173 (or your chosen port)

### Client-Only Development

If you only need the frontend:

```bash
cd client
npx vite
```

## Testing

Run all tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Production

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback

### Buckets

- `GET /api/buckets` - Get user's buckets
- `POST /api/buckets` - Create new bucket
- `GET /api/buckets/:id` - Get specific bucket
- `PATCH /api/buckets/:id` - Update bucket
- `DELETE /api/buckets/:id` - Delete bucket

### Transactions

- `GET /api/transactions` - Get user's transactions
- `POST /api/transactions` - Create new transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Income

- `GET /api/income` - Get income records
- `POST /api/income` - Add income record

## Database Schema

### Users

- id, username, email, name, password, googleId, createdAt, updatedAt

### Buckets

- id, userId, name, iconName, allocatedAmount, currentBalance, createdAt, updatedAt

### Transactions

- id, bucketId, userId, amount, description, date, createdAt

### Income Records

- id, userId, amount, description, date, createdAt

## Troubleshooting

### Port Conflicts

Check what's using a port:

```bash
lsof -i :5000
lsof -i :5173
```

Kill process on port:

```bash
lsof -ti :5173 | xargs -r kill
```

### Database Connection Issues

- Verify DATABASE_URL is correct
- Ensure database is running and accessible
- Check network connectivity

### Authentication Issues

- Verify SESSION_SECRET is set
- Check Google OAuth credentials
- Ensure callback URL matches exactly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details
