# Bitespeed Identity Reconciliation API

This is a backend service that helps identify and reconcile customer identities across multiple orders using email and phone number information.

## How It Works

The `/identify` endpoint receives contact information (email and/or phone number) and:

1. **Finds matching contacts** - Searches the database for existing contacts with the same email or phone number
2. **Consolidates identities** - Links multiple contacts belonging to the same person
3. **Returns consolidated data** - Returns the primary contact ID and all linked emails/phones

### Key Features

- **Identity Linking**: Automatically links contacts that share email or phone numbers
- **Primary Contact**: Oldest contact for a customer is marked as "primary"
- **Secondary Contacts**: Newer contacts are marked as "secondary" and linked to the primary
- **Dynamic Unlinking**: When secondary contacts contain new info, they remain unlinked
- **Primary Contact Merging**: If two independently created primary contacts are found to be the same person, the older one remains primary and the newer becomes secondary

## Technology Stack

- **Backend**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Port**: 3000 (default)

## Setup Instructions

### Prerequisites

- Node.js 16+ 
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bitespeed-identity.git
cd bitespeed-identity
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate deploy
```

4. Create a `.env` file:
```
DATABASE_URL="file:./dev.db"
PORT=3000
```

5. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### POST `/identify`

Identifies or creates a contact and returns consolidated identity information.

**Request Body:**
```json
{
  "email": "customer@example.com",
  "phoneNumber": "9876543210"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["customer@example.com"],
    "phoneNumbers": ["9876543210"],
    "secondaryContactIds": []
  }
}
```

## Example Scenarios

### Scenario 1: New Customer
```
Request: { "email": "lorraine@example.com", "phoneNumber": "123456" }
Response: 
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@example.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

### Scenario 2: Same Customer with Different Email
```
Existing: Contact ID 1 with email=lorraine@example.com, phone=123456
Request: { "email": "mcfly@example.com", "phoneNumber": "123456" }
Response:
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@example.com", "mcfly@example.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [2]
  }
}
```

### Scenario 3: Merging Two Primary Contacts
```
Existing: Contact ID 1 (primary) and Contact ID 3 (primary)
Request: { "email": "contact1email@example.com", "phoneNumber": "contact3phone" }
Response: Contact 3 becomes secondary linked to Contact 1 (older)
```

## Project Structure

```
├── src/
│   ├── server.ts          # Main Express server with /identify endpoint
│   ├── prisma.ts          # Prisma client initialization
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
├── .env                   # Environment variables
├── package.json
└── tsconfig.json
```

## Database Schema

The `Contact` table stores:
- `id`: Unique identifier
- `email`: Customer email (optional)
- `phoneNumber`: Customer phone (optional)
- `linkedId`: ID of the primary contact if this is secondary
- `linkPrecedence`: "primary" or "secondary"
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `deletedAt`: Soft delete timestamp

## Running Tests

```bash
# Tests are currently handled via API calls
# Example using curl:
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"1234567890"}'
```

## Hosting

This application can be hosted on services like:
- **Render.com** (recommended - free tier available)
- Railway.app
- Vercel (with serverless functions)
- Heroku (paid tier)
- AWS Lambda

### ✅ Deploy on Render.com (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Account:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service:**
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Select the Bitespeed repo

4. **Configure Service:**
   - **Name:** bitespeed-identity (or your choice)
   - **Environment:** Docker
   - **Start Command:** Leave empty (uses Dockerfile)
   - **Region:** Choose closest to you

5. **Add Environment Variables:**
   Click "Add Environment Variable" and add:
   ```
   DATABASE_URL = file:./dev.db
   PORT = 3000
   NODE_ENV = production
   ```

6. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (2-5 minutes)
   - Your API will be at: `https://bitespeed-identity.onrender.com/identify`

### Deploy on Railway.app

1. **Push to GitHub** (same as above)

2. **Connect to Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"

3. **Configure:**
   - Select your Bitespeed repository
   - Railway auto-detects the Dockerfile
   - Add environment variables:
     ```
     DATABASE_URL = file:./dev.db
     PORT = 3000
     ```

4. **Deploy:**
   - Railway deploys automatically
   - Check the "Deployments" tab for your live URL

### ⚠️ Important: Database Persistence

**SQLite Limitation:**
- SQLite stores data in a file (`dev.db`)
- Free services have **ephemeral filesystems** - databases reset on restart
- **Recommended:** Use PostgreSQL for production

### 🚀 Use PostgreSQL (Recommended)

1. **Create Free PostgreSQL Database:**
   - Option A: [ElephantSQL](https://www.elephantsql.com) (Free tier with free databases)
   - Option B: Railway PostgreSQL add-on
   - Option C: Render PostgreSQL

2. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Set Environment Variable:**
   In your hosting service, set:
   ```
   DATABASE_URL = postgresql://user:password@host:port/database
   ```

4. **Run Migrations:**
   ```bash
   npx prisma migrate db push
   ```

5. **Deploy:**
   - Push to GitHub
   - Service will auto-deploy

### Environment Variables Reference

**Required:**
- `DATABASE_URL` - Database connection string
  - SQLite: `file:./dev.db`
  - PostgreSQL: `postgresql://user:password@host:port/database`

**Optional:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## License

ISC

## Contact

For questions or issues, please contact the development team or open an issue on GitHub.
