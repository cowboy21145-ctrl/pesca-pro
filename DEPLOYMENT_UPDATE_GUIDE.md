# How to Update Vercel (Frontend) and Render (Backend)

## Quick Update Process

Both Vercel and Render automatically deploy when you push to your GitHub repository. Here's how to update:

## Step 1: Commit Your Changes

```bash
# Check what files have changed
git status

# Add all changed files
git add .

# Or add specific files
git add frontend/src/pages/organizer/PondManager.js
git add backend/routes/areas.js
git add frontend/src/components/Layout.js
git add frontend/src/index.css

# Commit with a descriptive message
git commit -m "Fix mobile responsiveness and remove price minimum requirement"
```

## Step 2: Push to GitHub

```bash
# Push to your main/master branch
git push origin main

# Or if your branch is named 'master'
git push origin master
```

## Step 3: Automatic Deployment

### Vercel (Frontend)
- ✅ **Auto-deploys** when you push to the connected branch
- Check deployment status at: https://vercel.com/dashboard
- Your project will show "Building..." then "Ready"
- Usually takes 1-3 minutes

### Render (Backend)
- ✅ **Auto-deploys** when you push to the connected branch
- Check deployment status at: https://dashboard.render.com
- Your service will show "Building..." then "Live"
- Usually takes 2-5 minutes

## Manual Deployment (If Auto-Deploy is Disabled)

### Vercel Manual Deploy

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click **"Redeploy"** on the latest deployment
5. Or click **"Deploy"** → **"Deploy Latest Commit"**

### Render Manual Deploy

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Go to **Manual Deploy** section
4. Click **"Deploy latest commit"**

## Check Deployment Status

### Vercel
- Dashboard: https://vercel.com/dashboard
- Look for green checkmark ✅ = Success
- Look for red X ❌ = Failed (check logs)

### Render
- Dashboard: https://dashboard.render.com
- Look for "Live" status = Success
- Look for "Build failed" = Failed (check logs)

## View Deployment Logs

### Vercel Logs
1. Go to your project → **Deployments**
2. Click on a deployment
3. Click **"View Function Logs"** or check build logs

### Render Logs
1. Go to your service
2. Click **"Logs"** tab
3. View real-time build and runtime logs

## Troubleshooting

### Build Fails on Vercel
- Check **Deployments** → Click failed deployment → View logs
- Common issues:
  - Missing environment variables
  - Build command errors
  - Dependency installation failures

### Build Fails on Render
- Check **Logs** tab in your service
- Common issues:
  - Missing environment variables
  - Database connection errors
  - Port configuration issues

### Changes Not Reflecting
1. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. **Check deployment status**: Make sure deployment completed successfully
3. **Verify branch**: Ensure you pushed to the correct branch
4. **Wait a few minutes**: Sometimes takes time to propagate

## Environment Variables

If you added new environment variables:

### Vercel
1. Go to project → **Settings** → **Environment Variables**
2. Add new variable
3. **Redeploy** (automatic or manual)

### Render
1. Go to service → **Environment** tab
2. Add new variable
3. **Save Changes** (auto-redeploys)

## Quick Commands Summary

```bash
# 1. Check status
git status

# 2. Add changes
git add .

# 3. Commit
git commit -m "Your commit message"

# 4. Push (triggers auto-deploy)
git push origin main

# 5. Wait 2-5 minutes for deployments
# 6. Check Vercel and Render dashboards
```

## Best Practices

1. **Test locally first**: Run `npm start` (frontend) and `npm run dev` (backend) before pushing
2. **Use descriptive commit messages**: Helps track what changed
3. **Check logs if deployment fails**: Both platforms provide detailed error logs
4. **Monitor deployments**: Check dashboards after pushing to ensure success

## Current Setup

- **Frontend**: Vercel (https://pesca-pro-dev.vercel.app)
- **Backend**: Render (https://pesca-pro.onrender.com)
- **Database**: Railway MySQL
- **Auto-deploy**: Enabled for both (pushes to main branch)

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Check deployment logs** for specific error messages

