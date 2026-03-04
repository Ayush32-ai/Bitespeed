# Deployment Guide

## Quick Fix for DATABASE_URL Error

The error you're seeing means the hosting service doesn't have the `DATABASE_URL` environment variable.

### Solution

**When deploying, make sure to set the `DATABASE_URL` environment variable:**

```
DATABASE_URL=file:./dev.db
```

Or if using PostgreSQL:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## Step-by-Step Deployment on Render

### 1. Ensure GitHub is Updated
```bash
cd c:\Users\AYUSH\bitespeed-identity
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### 2. Create Render Account
- Visit [render.com](https://render.com)
- Click "Sign up"
- Choose "Continue with GitHub"
- Authorize Render

### 3. Create Web Service
1. Click "New +" button
2. Select "Web Service"
3. Select your "Bitespeed" repository
4. Click "Connect"

### 4. Configure Service
Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | `bitespeed-identity` |
| **Environment** | `Docker` |
| **Region** | Choose closest to you |
| **Branch** | `main` |

### 5. Add Environment Variables ⭐ IMPORTANT
Click "Add Environment Variable" and fill in:

```
Key: DATABASE_URL
Value: file:./dev.db
```

Click "+ Add" and add another:

```
Key: PORT
Value: 3000
```

### 6. Deploy
1. Click "Create Web Service"
2. Wait 2-5 minutes for deployment
3. You'll see a green checkmark when done
4. Your URL will be shown (e.g., `https://bitespeed-identity.onrender.com`)

### 7. Test Your API
```bash
curl -X POST https://bitespeed-identity.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"9876543210"}'
```

Or visit: `https://bitespeed-identity.onrender.com/` to use the web UI

---

## Common Issues & Solutions

### Issue 1: DATABASE_URL not found
**Solution:** Add `DATABASE_URL` environment variable in hosting service settings

### Issue 2: Timeout Error
**Solution:** Railway or Render builds can take 3-5 minutes. Wait longer.

### Issue 3: Database resets after restart
**Solution:** Use PostgreSQL instead of SQLite. See PostgreSQL section below.

### Issue 4: Build fails
**Solution:** 
1. Check that Dockerfile exists in root directory
2. Ensure `.env` file is in `.gitignore`
3. Run locally first: `npm run dev`

---

## Using PostgreSQL (Recommended)

### Step 1: Create Database
Choose one:
- [ElephantSQL](https://www.elephantsql.com) - Free PostgreSQL hosting
- Railway PostgreSQL add-on
- AWS RDS Free Tier

### Step 2: Connection String
Get your connection string, e.g.:
```
postgresql://user:pass@server.com:5432/dbname
```

### Step 3: Update Dockerfile Environment
In your Render/Railway project settings, set:
```
DATABASE_URL = postgresql://user:pass@server.com:5432/dbname
```

### Step 4: Update Schema (Optional)
If needed, update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 5: Deploy Changes
```bash
git add .
git commit -m "Use PostgreSQL"
git push origin main
```

---

## Testing Your Deployment

### Using Browser
Visit: `https://your-app-name.onrender.com/`

### Using cURL
```bash
curl -X POST https://your-app-name.onrender.com/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","phoneNumber":"1234567890"}'
```

### Using PowerShell
```powershell
$body = @{
  email = "test@example.com"
  phoneNumber = "9876543210"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://your-app-name.onrender.com/identify" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

---

## Environment Variables Summary

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Database connection | `file:./dev.db` or PostgreSQL connection |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `production` |

---

## Next Steps

Once deployed, you can:
1. ✅ Share your API URL
2. ✅ Integrate with your frontend
3. ✅ Monitor logs in Render/Railway dashboard
4. ✅ Scale with paid plans if needed

---

## Support

If you encounter issues:
1. Check Render/Railway deployment logs
2. Verify all environment variables are set
3. Ensure DATABASE_URL is correct
4. Test locally first: `npm run dev`

Happy deploying! 🚀
