# SpennyBucketTracker

A full-stack expense tracking application built with React, Express, and PostgreSQL. This guide will help you set up and run the project locally, even if you're new to coding!

## Prerequisites

Before you start, make sure you have these installed on your computer:

1. **Node.js** (version 18 or higher)

   - Download from [nodejs.org](https://nodejs.org/)
   - This includes npm (Node Package Manager) which we'll use to install dependencies

2. **A PostgreSQL database**

   - You can use a free database service like [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)
   - Or install PostgreSQL locally on your computer

3. **Git** (to clone the repository)
   - Download from [git-scm.com](https://git-scm.com/)

## Step 1: Clone and Setup the Project

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <your-repository-url>
   cd SpennyBucketTracker
   ```

2. **Install all dependencies**:
   ```bash
   npm ci
   ```
   _This command installs all the packages the project needs. It's like installing all the ingredients before cooking!_

## Step 2: Environment Variables Setup

The app needs some configuration to work properly. You'll need to create a `.env` file:

1. **Copy the example environment file**:

   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file** with your actual values:

   ```bash
   # Database connection (replace with your actual database URL)
   DATABASE_URL=postgresql://username:password@host:port/database

   # Session secret (create a random string for security)
   SESSION_SECRET=your-super-secret-session-key-here-make-it-long-and-random

   # Google OAuth (optional - for Google login)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5173/api/auth/google/callback
   ```

   **Important**: Replace the placeholder values with your actual database credentials and create a random session secret.

## Step 3: Database Setup

1. **Push the database schema** to your database:
   ```bash
   npm run db:push
   ```
   _This creates all the necessary tables in your database_

## Step 4: Run the Application

### Development Mode (Recommended for beginners)

This runs both the backend server and frontend together with hot reloading (changes appear instantly):

```bash
npm run dev
```

**The app will be available at: http://localhost:5173**

_What this does: Starts both the Express server (backend) and Vite development server (frontend) together. Any changes you make to the code will automatically refresh in your browser._

### Alternative: Run on a Different Port

If you need to run on a different port:

```bash
# On Mac/Linux
export PORT=3000
npm run dev

# On Windows Command Prompt
set PORT=3000
npm run dev

# On Windows PowerShell
$env:PORT=3000
npm run dev
```

## Step 5: Production Build (Optional)

If you want to build the app for production:

```bash
npm run build
npm start
```

**The production app will be available at: http://localhost:5173**

## Additional Commands

### Client-Only Development

If you only want to work on the frontend (React components):

```bash
cd client
npx vite
# Opens at http://localhost:5173 (Vite's default port)
```

### Testing

Run the test suite:

```bash
npm test
```

Run tests with a visual interface:

```bash
npm run test:ui
```

## Troubleshooting

### Common Issues and Solutions

1. **"Command not found: npm"**

   - Make sure Node.js is installed correctly
   - Restart your terminal/command prompt

2. **Database connection errors**

   - Double-check your `DATABASE_URL` in the `.env` file
   - Make sure your database is running and accessible

3. **Port already in use**

   - Try a different port: `export PORT=3001 && npm run dev`
   - Or stop other applications using port 5173

4. **"Module not found" errors**

   - Run `npm ci` again to reinstall dependencies
   - Make sure you're in the project root directory

5. **Environment variables not working**
   - Make sure your `.env` file is in the root directory (same level as package.json)
   - Restart the development server after changing `.env`

### Getting Help

- Check the console/terminal for error messages
- Make sure all prerequisites are installed
- Verify your environment variables are set correctly

## Project Structure

- `client/` - Frontend React application
- `server/` - Backend Express server
- `shared/` - Shared code between frontend and backend
- `migrations/` - Database migration files

## Notes

- The development server uses hot module replacement (HMR) - changes appear instantly
- The production build outputs to `dist/public` directory
- The app uses TypeScript, so you'll get helpful error messages if something goes wrong
- All API routes are prefixed with `/api`
