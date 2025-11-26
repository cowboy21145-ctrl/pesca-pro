# Update Deployment Guide - Vercel, Render & Railway

Quick guide to update your Pesca Pro application on all platforms after making code changes.

## 📋 Prerequisites

- Code pushed to GitHub repository
- All platforms already set up (initial deployment done)
- Git installed and configured

---

## 🚀 Quick Update Process

### Step 1: Commit and Push Changes

```bash
# Navigate to project root
cd "C:\Users\User\OneDrive\Desktop\Pesca Pro"

# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Update: [describe your changes]"

# Push to GitHub
git push origin main
```

**Example commit messages:**
- `"Update: Add bank name field and token validation"`
- `"Update: Improve custom registration UI with countdown timer"`
- `"Update: Add payment details image upload for organizers"`

---

## 🔄 Auto-Deployment

All three platforms are configured for **auto-deployment** from GitHub:

- ✅ **Vercel** - Auto-deploys on push to `main` branch
- ✅ **Render** - Auto-deploys on push to `main` branch  
- ✅ **Railway** - Auto-deploys on push to `main` branch

**After pushing to GitHub, deployments will start automatically!**

---

## 📍 Platform-Specific Update Instructions

### 1. 🎨 Vercel (Frontend)

#### Automatic Update (Recommended)
1. Push code to GitHub → Vercel auto-deploys
2. Check deployment status at: https://vercel.com/dashboard
3. Wait for build to complete (usually 2-3 minutes)

#### Manual Update (If Needed)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **"Deployments"** tab
4. Click **"Redeploy"** on latest deployment
5. Or click **"Deploy"** → **"Deploy Latest Commit"**

#### Verify Update
- Visit your Vercel URL (e.g., `https://pesca-pro.vercel.app`)
- Check browser console for errors
- Test the new features

#### If Build Fails
1. Go to **Deployments** → Click failed deployment
2. Check **Build Logs** for errors
3. Common fixes:
   - Clear build cache: **Settings** → **Build & Development Settings** → **Clear Build Cache**
   - Check environment variables are set
   - Verify `frontend/package.json` has correct dependencies

---

### 2. ⚙️ Render (Backend)

#### Automatic Update (Recommended)
1. Push code to GitHub → Render auto-deploys
2. Check deployment status at: https://dashboard.render.com
3. Wait for build to complete (usually 3-5 minutes)

#### Manual Update (If Needed)
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

#### Verify Update
- Check service logs: **Logs** tab
- Test API endpoint: `https://your-backend.onrender.com/api/health`
- Should return: `{"status":"OK","message":"Pesca Pro API is running"}`

#### If Deployment Fails
1. Go to **Logs** tab
2. Check for error messages
3. Common issues:
   - **Database connection**: Verify Railway MySQL variables are correct
   - **Build errors**: Check `backend/package.json` dependencies
   - **Port issues**: Ensure `PORT=10000` in environment variables

#### Environment Variables Update
If you need to update environment variables:
1. Go to **Environment** tab
2. Add/Edit variables
3. Click **"Save Changes"**
4. Service will automatically restart

**Important Variables:**
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-secret-key
MYSQLHOST=mainline.proxy.rlwy.net
MYSQLPORT=50942
MYSQLUSER=root
MYSQLPASSWORD=your-password
MYSQLDATABASE=railway
FRONTEND_URL=https://pesca-pro.vercel.app
CLIENT_URL=https://pesca-pro.vercel.app
```

---

### 3. 🗄️ Railway (MySQL Database)

#### Database Schema Updates
If you modified `backend/database/schema.sql`, you need to run migrations:

#### Option 1: Using MySQL Command Line
```bash
# Get connection details from Railway MySQL service → Variables tab
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'YOUR_PASSWORD' railway < backend/database/schema.sql
```

#### Option 2: Using MySQL Workbench
1. Connect to Railway MySQL (use public hostname from Variables tab)
2. Open SQL Editor
3. Run only the new/changed SQL statements
4. **Important**: Don't run `DROP TABLE` commands on production!

#### Option 3: Using Railway MySQL Query Tab
1. Go to Railway dashboard
2. Click on MySQL service
3. Look for **"Query"** or **"Connect"** button
4. Paste and execute new SQL statements

#### Adding New Columns (Safe Migration)
If you added new columns (like `bank_name`, `payment_details_image`):

```sql
-- Example: Add bank_name to users table
ALTER TABLE users ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;

-- Example: Add payment_details_image to tournaments table
ALTER TABLE tournaments ADD COLUMN payment_details_image VARCHAR(255) AFTER banner_image;

-- Example: Add bank_name to registrations table
ALTER TABLE registrations ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;
```

**⚠️ Important**: Always backup your database before running migrations!

#### Railway MySQL Variables
Railway MySQL variables don't need updates unless you:
- Reset the database
- Created a new MySQL service
- Changed database credentials

**To check/update:**
1. Go to Railway dashboard
2. Click on MySQL service
3. Go to **Variables** tab
4. Copy values if needed for Render backend

---

## 🔍 Verification Checklist

After updating, verify everything works:

### Frontend (Vercel)
- [ ] Site loads without errors
- [ ] Login/Register works
- [ ] New features are visible
- [ ] API calls succeed (check browser console)
- [ ] No CORS errors

### Backend (Render)
- [ ] Health check endpoint works: `/api/health`
- [ ] Database connection successful (check logs)
- [ ] API endpoints respond correctly
- [ ] File uploads work (if applicable)
- [ ] CORS allows frontend requests

### Database (Railway)
- [ ] New columns/tables exist (if added)
- [ ] Data integrity maintained
- [ ] No connection errors in backend logs

---

## 🐛 Troubleshooting

### Vercel Build Fails

**Error: Build timeout**
- Solution: Clear build cache and redeploy

**Error: Module not found**
- Solution: Check `package.json` has all dependencies
- Run `npm install` locally to verify

**Error: Environment variable missing**
- Solution: Add `REACT_APP_API_URL` in Vercel settings

### Render Deployment Fails

**Error: Database connection failed**
- Solution: Verify Railway MySQL variables in Render environment
- Check MySQL service is running in Railway

**Error: Port already in use**
- Solution: Ensure `PORT=10000` in environment variables

**Error: Build failed**
- Solution: Check `backend/package.json` dependencies
- Verify Root Directory is set to `backend`

### Railway MySQL Issues

**Error: Can't connect to database**
- Solution: Use public hostname (`xxx.proxy.rlwy.net`) not internal
- Verify port is correct (5-digit number, not 3306)

**Error: Table doesn't exist**
- Solution: Run database schema/migrations
- Check if schema was executed successfully

---

## 📝 Update Workflow Summary

```
1. Make code changes locally
   ↓
2. Test changes locally
   ↓
3. Commit and push to GitHub
   git add .
   git commit -m "Update: description"
   git push origin main
   ↓
4. Wait for auto-deployment (2-5 minutes)
   - Vercel: Frontend auto-deploys
   - Render: Backend auto-deploys
   - Railway: No action needed (unless DB changes)
   ↓
5. Verify deployment
   - Check Vercel dashboard
   - Check Render logs
   - Test the application
   ↓
6. If database changes:
   - Run SQL migrations on Railway MySQL
   - Verify new columns/tables exist
```

---

## 🔄 Rollback (If Something Goes Wrong)

### Vercel Rollback
1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **"..."** → **"Promote to Production"**

### Render Rollback
1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **"Rollback"**

### Railway Rollback
- Database changes are harder to rollback
- Always backup before migrations
- Use Railway's backup feature if available

---

## 📞 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Railway Dashboard**: https://railway.app/dashboard
- **GitHub Repository**: Your repo URL

---

## 💡 Pro Tips

1. **Always test locally first** before pushing to production
2. **Commit frequently** with descriptive messages
3. **Monitor deployment logs** for any errors
4. **Keep environment variables updated** across all platforms
5. **Backup database** before running migrations
6. **Use feature branches** for major changes (optional)

---

## 🎯 Common Update Scenarios

### Scenario 1: Frontend UI Changes Only
```bash
git add frontend/
git commit -m "Update: Improve registration UI"
git push origin main
# Vercel auto-deploys, no other action needed
```

### Scenario 2: Backend API Changes Only
```bash
git add backend/
git commit -m "Update: Add token validation endpoint"
git push origin main
# Render auto-deploys, no other action needed
```

### Scenario 3: Database Schema Changes
```bash
# 1. Push code
git add .
git commit -m "Update: Add bank_name field"
git push origin main

# 2. Run SQL migration on Railway MySQL
ALTER TABLE users ADD COLUMN bank_name VARCHAR(100);
```

### Scenario 4: Environment Variable Changes
1. Update in platform dashboard (Vercel/Render)
2. Service restarts automatically
3. No code push needed

---

## ✅ Success Indicators

You'll know the update was successful when:

- ✅ Vercel shows "Ready" status
- ✅ Render shows "Live" status  
- ✅ Application loads without errors
- ✅ New features work as expected
- ✅ No errors in browser console
- ✅ API endpoints respond correctly

---

**Last Updated**: Based on current deployment setup
**Platforms**: Vercel (Frontend), Render (Backend), Railway (MySQL)

