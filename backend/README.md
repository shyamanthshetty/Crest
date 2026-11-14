# Crest Backend

The backend service for the Crest Journaling App. Built with Node.js, Express, TypeScript, and Prisma.

## Features
- User Authentication (Signup/Login with JWT)
- Journal Entry Management
- PostgreSQL Database with Prisma ORM

## Prerequisites
- Node.js
- PostgreSQL

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory and define the following variables:
   ```env
   DATABASE_URL="your-postgres-url"
   JWT_SECRET="your-secret-key"
   ```

3. **Database Setup**
   Push the Prisma schema to your database or run migrations:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
