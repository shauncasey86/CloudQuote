# CloudQuote Setup Checklist ✅

Print this page or keep it open as you follow the setup guide.

---

## 🎯 Part 1: Railway Setup

- [ ] 1. Create Railway account at https://railway.app
- [ ] 2. Run `railway login` in terminal
- [ ] 3. Run `railway init` to create project
- [ ] 4. Run `railway add --database postgres` to add database
- [ ] 5. Run `railway variables` and copy DATABASE_URL

---

## 🔧 Part 2: Configure Local Environment

- [ ] 6. Open `.env` file in text editor
- [ ] 7. Replace DATABASE_URL with the one from Railway
- [ ] 8. Save and close `.env` file

---

## 🗄️ Part 3: Initialize Database

- [ ] 9. Run `npm run db:push` to create tables
- [ ] 10. Run `npm run db:seed` to add sample data
- [ ] 11. Write down credentials:
  - Email: admin@yourcompany.com
  - Password: changeme123

---

## 🚀 Part 4: Test Locally

- [ ] 12. Run `npm run dev` to start server
- [ ] 13. Open http://localhost:3000 in browser
- [ ] 14. Login with admin credentials
- [ ] 15. Explore the dashboard!

---

## 🌐 Part 5: Deploy to Railway (Optional)

- [ ] 16. Run `git add .` and `git commit -m "Initial setup"`
- [ ] 17. (Optional) Push to GitHub
- [ ] 18. Run `railway link` to link project
- [ ] 19. Set environment variables:
  ```bash
  railway variables set NEXTAUTH_SECRET="prod-secret-key"
  railway variables set NEXTAUTH_URL="your-railway-url"
  ```
- [ ] 20. Run `railway up` to deploy
- [ ] 21. Run `railway run npm run db:seed` for production data
- [ ] 22. Run `railway domain` to get your URL
- [ ] 23. Visit your production site!

---

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ No errors in terminal when running commands
- ✅ You can access http://localhost:3000
- ✅ You can login with the admin credentials
- ✅ You see the CloudQuote dashboard with sidebar

---

## ⏱️ Estimated Time

- Parts 1-4 (Local setup): **20-25 minutes**
- Part 5 (Railway deployment): **10-15 minutes**
- **Total**: ~35-40 minutes

---

## 🆘 Quick Help

**Terminal won't run commands?**
- Make sure you're in the right folder:
  ```bash
  cd "c:\Users\AWS-PC20\Downloads\SC\CloudQuote\CloudQuote"
  ```

**Database connection error?**
- Double-check your DATABASE_URL in `.env` file
- Make sure you copied it correctly from `railway variables`

**Can't login?**
- Did you run `npm run db:seed`?
- Use: admin@yourcompany.com / changeme123

**Need more help?**
- Read SETUP_GUIDE.md for detailed explanations
- Check the Troubleshooting section

---

*Save this page - you can check off items as you complete them!*
