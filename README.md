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
- Render (free tier available)
- Heroku
- Railway
- Vercel (with serverless functions)
- AWS Lambda

## License

ISC

## Contact

For questions or issues, please contact the development team or open an issue on GitHub.
