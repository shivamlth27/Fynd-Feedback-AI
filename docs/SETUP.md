# Setup Instructions

## Quick Start

Follow these steps to get the project running locally.

### Step 1: Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** database access (local or managed service)
- **Git** - [Download here](https://git-scm.com/)

### Step 2: Clone the Repository

```bash
git clone <your-repository-url>
cd fynd
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Prisma
- OpenAI client
- TypeScript

### Step 4: Get an OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you'll need it in the next step)

**Alternative**: You can also use Gemini API from Google if you prefer.

### Step 5: Setup PostgreSQL Database

**Option A: Use a Managed Service (Recommended)**

Choose one of these free options:

1. **Supabase** (Recommended)
   - Go to [supabase.com](https://supabase.com/)
   - Create a new project
   - Go to Settings → Database
   - Copy the connection string (URI format)

2. **Neon**
   - Go to [neon.tech](https://neon.tech/)
   - Create a new project
   - Copy the connection string

3. **Railway**
   - Go to [railway.app](https://railway.app/)
   - Create PostgreSQL database
   - Copy the connection string

**Option B: Local PostgreSQL**

If you have PostgreSQL installed locally:
```bash
# Create a database
createdb fynd_feedback

# Your connection string will be:
# postgresql://username:password@localhost:5432/fynd_feedback
```

### Step 6: Configure Environment Variables

Create a file named `.env.local` in the root directory:

```bash
# Copy the example below and fill in your values
cp .env.example .env.local  # If example exists
# OR create manually
touch .env.local
```

Add the following to `.env.local`:

```env
# Database Connection
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# Replace with your actual database URL:
# Example for Supabase:
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# LLM Configuration
OPENROUTER_API_KEY="your-openrouter-api-key-here"

# Optional overrides (uncomment to customize):
# OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
# OPENROUTER_MODEL="openai/gpt-4o-mini"

# Admin Authentication (optional - for production security)
# ADMINS_BASIC_AUTH_TOKEN="your-random-secret-token"
# NEXT_PUBLIC_ADMINS_BASIC_AUTH_TOKEN="your-random-secret-token"
```

**Important**: Replace the placeholder values with your actual credentials!

### Step 7: Setup Database Schema

Run these commands to create your database tables:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database tables (first time setup)
npx prisma migrate dev --name init

# Alternative for quick development (no migration files):
# npm run prisma:push
```

You should see output indicating that the `Review` table was created.

### Step 8: Verify Database Connection

Optional but recommended - open Prisma Studio to view your database:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can see your tables.

### Step 9: Run the Development Server

```bash
npm run dev
```

The application will start at:
- **Local**: http://localhost:3000
- **User Dashboard**: http://localhost:3000/
- **Admin Dashboard**: http://localhost:3000/admin

### Step 10: Test the Application

1. **Test User Dashboard**:
   - Go to http://localhost:3000/
   - Select a rating (e.g., 5 stars)
   - Write a review: "Great experience!"
   - Click "Submit feedback"
   - You should see an AI-generated response

2. **Test Admin Dashboard**:
   - Go to http://localhost:3000/admin
   - You should see the review you just submitted
   - Try the filter dropdown
   - Click "Refresh now" button

## Troubleshooting

### Issue: Database Connection Error

**Error**: `Can't reach database server at ...`

**Solution**:
1. Check your `DATABASE_URL` is correct
2. Ensure your database is running
3. Check firewall settings (for managed databases)
4. Verify SSL mode is correct (try with/without `?sslmode=require`)

### Issue: Prisma Client Error

**Error**: `@prisma/client did not initialize yet`

**Solution**:
```bash
npm run prisma:generate
```

### Issue: Migration Failed

**Error**: Migration errors during `prisma migrate dev`

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or use push for development
npm run prisma:push
```

### Issue: LLM API Error

**Error**: `Failed to process review` or OpenRouter errors

**Solution**:
1. Check your `OPENROUTER_API_KEY` is correct
2. Verify you have API credits (free tier should work)
3. Check OpenRouter status page
4. Try a different model in your `.env.local`

### Issue: Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue: Module Not Found

**Error**: `Cannot find module ...`

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Create migration:
```bash
npx prisma migrate dev --name your_change_description
```
3. Prisma Client is automatically regenerated

### Viewing Database

```bash
npx prisma studio
```

### Checking Logs

- Server logs appear in your terminal
- Client errors in browser console (F12)

## Next Steps

- [Read the API Documentation](API_DOCUMENTATION.md)
- [Understand the Architecture](ARCHITECTURE.md)
- [Run Task 1 Notebook](../task1_rating_prediction.ipynb)

## Production Deployment

See the main [README.md](../README.md) for Vercel deployment instructions.

## Need Help?

Common issues:
1. **Database**: 90% of issues are incorrect `DATABASE_URL`
2. **LLM**: Check API key and credits
3. **Dependencies**: Try `npm install` again

Check the error message carefully - it usually tells you what's wrong!
