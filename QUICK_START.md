# CloudQuote - Quick Start (5 Minutes)

**Want to see the app running ASAP?** Follow these minimal steps!

---

## 🎯 The Fastest Path to Running CloudQuote

### Prerequisites
- Railway account (sign up at https://railway.app)
- Already completed: ✅ Node.js installed, ✅ Railway CLI installed

---

## Step 1: Login to Railway (30 seconds)

Open your terminal and run:

```bash
railway login
```

→ Browser opens → Click "Authorize" → Done!

---

## Step 2: Create Project & Database (1 minute)

Navigate to CloudQuote folder:
```bash
cd "c:\Users\AWS-PC20\Downloads\SC\CloudQuote\CloudQuote"
```

Create Railway project:
```bash
railway init
```
- Press **Enter**
- Type: `cloudquote`
- Press **Enter**

Add PostgreSQL database:
```bash
railway add --database postgres
```

Wait 20 seconds...

---

## Step 3: Get Database URL (30 seconds)

```bash
railway variables
```

You'll see something like:
```
DATABASE_URL=postgresql://postgres:abc123@xyz.railway.app:5432/railway
```

**Copy** that entire URL (including `postgresql://`)

---

## Step 4: Update .env File (1 minute)

Open `.env` file in Notepad:
```bash
notepad .env
```

Find this line:
```
DATABASE_URL="postgresql://user:password@host:5432/database"
```

**Replace** it with your copied URL:
```
DATABASE_URL="postgresql://postgres:abc123@xyz.railway.app:5432/railway"
```

**Save** (Ctrl+S) and **close** Notepad.

---

## Step 5: Setup Database (1 minute)

Create database tables:
```bash
npm run db:push
```

Add sample data:
```bash
npm run db:seed
```

✅ You'll see: "Seed data created"

---

## Step 6: Start the App! (30 seconds)

```bash
npm run dev
```

✅ You'll see: "Ready in 2.5s"

---

## Step 7: Open in Browser (30 seconds)

1. Open browser
2. Go to: **http://localhost:3000**
3. Login with:
   - Email: `admin@yourcompany.com`
   - Password: `changeme123`

---

## 🎉 SUCCESS!

You should now see the CloudQuote dashboard!

**What you have:**
- ✅ Working local app
- ✅ Database in the cloud (Railway)
- ✅ Admin account ready to use

---

## 🚀 Next Steps (Optional)

**Want to deploy to production?**
- Read SETUP_GUIDE.md - Part 5: Deploy to Railway

**Want to customize?**
- Explore the dashboard
- Create a test quote
- Add products

**Need help?**
- Read SETUP_GUIDE.md for detailed instructions
- Check SETUP_CHECKLIST.md to track your progress

---

## 🆘 Troubleshooting

**Database connection error?**
```bash
# Check your DATABASE_URL is correct
railway variables
# Then update .env file again
```

**"Port 3000 already in use"?**
```bash
# Use a different port
npm run dev -- -p 3001
# Then visit http://localhost:3001
```

**Can't login?**
```bash
# Make sure you ran the seed command
npm run db:seed
```

---

**🎊 That's it! You're running CloudQuote in under 5 minutes!**

For more details, see:
- **SETUP_GUIDE.md** - Complete step-by-step guide
- **SETUP_CHECKLIST.md** - Printable checklist
- **README.md** - Full documentation
