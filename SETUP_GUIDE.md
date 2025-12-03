# CloudQuote - Complete Setup Guide for Beginners

This guide will walk you through every step needed to get CloudQuote running on your computer and deployed to Railway.

---

## ✅ Prerequisites Check

Before starting, verify you have:
- ✅ **Node.js** installed (You have v24.11.1 - Perfect!)
- ✅ **npm** installed (You have v11.6.4 - Perfect!)
- ⬜ **Railway account** (We'll create this)
- ⬜ **Text editor** (VS Code, Notepad++, or any editor)

---

## 📖 Part 1: Railway Setup (10 minutes)

Railway will host your database and application in the cloud.

### Step 1: Create Railway Account

1. Open your browser and go to: **https://railway.app**
2. Click **"Login"** (top right)
3. Choose **"Sign up with GitHub"** (recommended) or use email
4. Complete the signup process
5. You'll see your Railway dashboard

### Step 2: Login to Railway CLI

Open your **Command Prompt** or **PowerShell** and run:

```bash
railway login
```

What happens:
- Your browser will open automatically
- Click **"Authorize"** on the Railway page
- Return to your terminal - you should see "Logged in successfully"

### Step 3: Create Your Project

Navigate to your CloudQuote folder:

```bash
cd "c:\Users\AWS-PC20\Downloads\SC\CloudQuote\CloudQuote"
```

Create a new Railway project:

```bash
railway init
```

When prompted:
- Press **Enter** (to create a new project)
- Type: **cloudquote** (or any name you like)
- Press **Enter**

You'll see: "Project created successfully!"

### Step 4: Add PostgreSQL Database

Now add a database to your project:

```bash
railway add --database postgres
```

Wait 10-20 seconds. You'll see: "PostgreSQL added successfully!"

### Step 5: Get Your Database URL

Run this command:

```bash
railway variables
```

You'll see output like this:
```
DATABASE_URL=postgresql://postgres:abc123xyz@region.railway.app:5432/railway
```

**COPY** the entire DATABASE_URL value (everything after the = sign, including the quotes if present).

---

## 🔧 Part 2: Configure Your Local Environment (5 minutes)

### Step 6: Update Your .env File

1. Open the file: `c:\Users\AWS-PC20\Downloads\SC\CloudQuote\CloudQuote\.env`
   - Right-click → Open with → Notepad (or your preferred editor)

2. Find the line that says:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

3. **REPLACE** it with the DATABASE_URL you copied from Step 5.

   For example:
   ```
   DATABASE_URL="postgresql://postgres:abc123xyz@region.railway.app:5432/railway"
   ```

4. **Save the file** (Ctrl+S or File → Save)

5. Close the file

That's it! Your `.env` file is now configured.

---

## 🗄️ Part 3: Initialize Your Database (5 minutes)

Now we'll set up the database structure and add sample data.

### Step 7: Push Database Schema

Open your terminal in the CloudQuote folder and run:

```bash
npm run db:push
```

What this does:
- Creates all database tables (users, quotes, products, etc.)
- Sets up relationships between tables
- Creates indexes for fast searching

You'll see:
```
✅ Database schema pushed successfully
```

### Step 8: Add Sample Data

Now let's add some sample data (including an admin user):

```bash
npm run db:seed
```

What this does:
- Creates an admin user (email: admin@yourcompany.com, password: changeme123)
- Adds 4 house types (Standard, Premium, Luxury, Custom Build)
- Creates 8 product categories
- Adds sample products (base units, worktops, etc.)

You'll see:
```
✅ Seed data created
```

**Important**: Write down these login credentials:
- **Email**: admin@yourcompany.com
- **Password**: changeme123

---

## 🚀 Part 4: Run Your Application Locally (2 minutes)

### Step 9: Start the Development Server

In your terminal, run:

```bash
npm run dev
```

You'll see:
```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

**Your app is now running!**

### Step 10: Open in Browser

1. Open your browser
2. Go to: **http://localhost:3000**
3. You'll be redirected to the login page
4. Enter the credentials:
   - **Email**: admin@yourcompany.com
   - **Password**: changeme123
5. Click **"Sign in"**

**Success!** You should now see the CloudQuote dashboard.

---

## 🌐 Part 5: Deploy to Railway (10 minutes)

Now let's deploy your app to the cloud so it's accessible from anywhere.

### Step 11: Commit Your Code to Git

First, let's make sure your code is committed to Git:

```bash
git add .
git commit -m "Initial CloudQuote setup"
```

If you get an error about git config, run these first:
```bash
git config user.email "you@example.com"
git config user.name "Your Name"
```

Then try the commit again.

### Step 12: Push to GitHub (Optional but Recommended)

If you have a GitHub account:

1. Go to **https://github.com/new**
2. Create a new repository called **"cloudquote"**
3. **Don't initialize** with README (we already have files)
4. Copy the commands shown and run them in your terminal

Example:
```bash
git remote add origin https://github.com/yourusername/cloudquote.git
git branch -M main
git push -u origin main
```

### Step 13: Link Railway to Your Project

In your terminal, run:

```bash
railway link
```

Select your **cloudquote** project from the list.

### Step 14: Configure Railway Environment Variables

We need to set environment variables for the deployed app:

```bash
railway variables set NEXTAUTH_SECRET="production-secret-key-$(date +%s)"
railway variables set NEXTAUTH_URL="https://cloudquote-production.up.railway.app"
railway variables set NEXT_PUBLIC_APP_NAME="CloudQuote"
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
```

### Step 15: Deploy!

If you connected GitHub (Step 12):
```bash
git push
```
Railway will automatically deploy when you push to GitHub.

If you **didn't** connect GitHub, deploy directly:
```bash
railway up
```

Wait 2-3 minutes for the build and deployment.

### Step 16: Get Your Production URL

Run:
```bash
railway domain
```

This will show your app's URL, like:
```
https://cloudquote-production.up.railway.app
```

Copy this URL and open it in your browser!

### Step 17: Initialize Production Database

Your app is live, but the database is empty. Let's fix that:

```bash
railway run npm run db:push
railway run npm run db:seed
```

Now visit your production URL and login with:
- **Email**: admin@yourcompany.com
- **Password**: changeme123

---

## 🎉 Success!

You now have:
- ✅ CloudQuote running locally at http://localhost:3000
- ✅ CloudQuote deployed to Railway
- ✅ A PostgreSQL database in the cloud
- ✅ Admin account ready to use

---

## 📝 Quick Reference Commands

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Update database schema
npm run db:seed      # Add sample data
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Railway
```bash
railway login        # Login to Railway
railway variables    # View environment variables
railway logs         # View application logs
railway run <cmd>    # Run command in Railway environment
railway up           # Deploy current code
```

---

## 🆘 Troubleshooting

### Problem: "Cannot find module '@prisma/client'"
**Solution**: Run `npm install` to install dependencies

### Problem: "Error: P1001: Can't reach database server"
**Solution**: Check your DATABASE_URL in `.env` file is correct

### Problem: Login fails with "Invalid credentials"
**Solution**: Make sure you ran `npm run db:seed` to create the admin user

### Problem: "Port 3000 is already in use"
**Solution**:
- Stop any other apps using port 3000
- Or change the port: `npm run dev -- -p 3001`

### Problem: Railway deployment fails
**Solution**:
- Check logs: `railway logs`
- Make sure all environment variables are set: `railway variables`

---

## 🔐 Security Notes

**Before going to production:**
1. Change the default admin password
2. Generate a strong NEXTAUTH_SECRET: `openssl rand -base64 32`
3. Set up Google SMTP with a real email account (for sending quotes)
4. Enable Railway's custom domain (optional)

---

## 📚 Next Steps

Now that CloudQuote is running:
1. Explore the dashboard
2. Try creating a test quote
3. Add more products in the Products page
4. Customize the settings
5. Invite your team members (you'll need to create user accounts)

---

## 💡 Tips

- **Prisma Studio**: Run `npm run db:studio` to view/edit your database with a GUI
- **Hot Reload**: When running `npm run dev`, changes to your code automatically reload
- **Railway Dashboard**: Visit https://railway.app/dashboard to monitor your app
- **Logs**: Use `railway logs` to debug production issues

---

## 📞 Getting Help

If you get stuck:
1. Check the troubleshooting section above
2. Review the error message carefully
3. Check Railway logs: `railway logs`
4. Refer to DESIGN_DOCUMENT.md for technical details

---

*You're all set! Happy quoting! 🚀*
