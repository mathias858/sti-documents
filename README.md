# Ministry Flow - Electronic Document & Records Management System (EDRMS)

A modern, secure, and paperless document management system for government and organizational workflows.

## Prerequisites

Before setting up the system, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **pnpm** (Performant npm) - Install via `npm install -g pnpm`
- **PostgreSQL** database (Local or Cloud-based like Neon)

## Setup Instructions

Follow these steps to get the system running on a new computer:

### 1. Environment Configuration
Copy the example environment file and update it with your database credentials:
```bash
cp .env.example .env
```
Open the `.env` file and set your `DATABASE_URL`:
`DATABASE_URL="postgresql://username:password@localhost:5432/your_database"`

### 2. Install Dependencies
Run the following command in the root directory:
```bash
pnpm install
```

### 3. Database Schema Setup
Push the database schema to your PostgreSQL instance:
```bash
pnpm -C artifacts/api-node run db:push
```

### 4. Seed Initial Data
Create the default administrator account and initial roles:
```bash
npx tsx artifacts/api-node/src/db/seed.ts
```

### 5. Start the System
Launch both the backend and frontend development servers simultaneously:
```bash
pnpm dev
```

## Accessing the System

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### Default Administrator Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`

## Project Structure

- `artifacts/api-node`: Node.js/Express backend with Drizzle ORM.
- `artifacts/ministry-flow`: React/Vite/Tailwind frontend.
- `uploads/`: Directory where document attachments are stored.

## Troubleshooting

- **Database Connection**: Ensure your `DATABASE_URL` is correct and the PostgreSQL server is reachable.
- **Port Conflict**: If port 5000 or 5173 is already in use, you may need to change the port in `.env` or `vite.config.ts`.
