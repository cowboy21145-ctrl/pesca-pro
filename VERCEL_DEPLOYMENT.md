# Deploy Frontend to Vercel

## Quick Setup

1. **Sign up at Vercel**: https://vercel.com
2. **Import Project**:
   - Click "Add New Project"
   - Connect your GitHub account
   - Select your `pesca-pro` repository
   - Click "Import"

## Vercel Configuration

### Framework Preset
- **Framework Preset**: `Create React App` (auto-detected)

### Root Directory
- **Root Directory**: `frontend`

### Build Settings

Vercel will auto-detect these, but you can verify:

- **Build Command**: `npm run build`
  - This runs `react-scripts build` (from package.json)
  
- **Output Directory**: `build`
  - This is where Create React App outputs the production build

- **Install Command**: `npm install` (auto-detected)

### Environment Variables

Add this in the **Environment Variables** section:

```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

Replace `https://your-backend.onrender.com/api` with your actual backend URL.

### Advanced Settings (Optional)

If auto-detection doesn't work, manually set:

- **Root Directory**: `frontend`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/build`
- **Install Command**: `npm install` (runs in root, but dependencies are in frontend/)

## Recommended Settings

```
Root Directory: frontend
Framework Preset: Create React App
Build Command: npm run build (auto-detected)
Output Directory: build (auto-detected)
Install Command: npm install (auto-detected)
```

## Environment Variables

Before deploying, add:

```
REACT_APP_API_URL = https://your-backend-url.onrender.com/api
```

## Deployment Steps

1. **Connect Repository**: Select your GitHub repo
2. **Configure Project**:
   - Root Directory: `frontend`
   - Framework: Create React App (auto)
3. **Add Environment Variable**:
   - Key: `REACT_APP_API_URL`
   - Value: Your backend API URL
4. **Deploy**: Click "Deploy"

Vercel will:
- Install dependencies (`npm install`)
- Build the app (`npm run build`)
- Deploy to a CDN
- Provide a URL like `https://pesca-pro.vercel.app`

## Custom Domain (Optional)

After deployment:
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Vercel will provide DNS instructions

## Troubleshooting

### Build Fails with Error 126

**Error 126** means "Command invoked cannot execute". Common fixes:

#### Solution 1: Specify Node Version
Add to `frontend/package.json`:
```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

#### Solution 2: Use Custom Build Command
In Vercel settings, try:
- **Build Command**: `cd frontend && npm ci && npm run build`
- **Install Command**: `cd frontend && npm ci`

#### Solution 3: Create vercel.json in frontend/
Create `frontend/vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "nodeVersion": "18.x"
}
```

#### Solution 4: Check Root Directory
- Make sure **Root Directory** is set to `frontend` (not empty)
- Vercel should build from the `frontend/` directory

#### Solution 5: Clear Build Cache
1. Go to Vercel project settings
2. Go to **Settings** → **Build & Development Settings**
3. Click **Clear Build Cache**
4. Redeploy

#### Solution 6: Fix Permission Denied (Error 126)
If you see "Permission denied" for react-scripts:

**Option A: Use CI=false in build command**
- **Build Command**: `CI=false npm run build`
- **Install Command**: `npm install --legacy-peer-deps`

**Option B: Use npx instead**
Update `package.json` build script:
```json
"build": "CI=false npx react-scripts build"
```

**Option C: Fix permissions in build command**
- **Build Command**: `chmod +x node_modules/.bin/* && CI=false npm run build`

The `CI=false` flag is important - it prevents React from treating the build as a CI environment which can cause permission issues.

### Build Fails
- Check that Root Directory is set to `frontend`
- Verify `package.json` exists in `frontend/` directory
- Check build logs for specific errors
- Ensure Node.js version is 18.x or higher

### API Calls Fail
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend URL includes `/api` at the end

### Environment Variables Not Working
- Variables must start with `REACT_APP_` to be available in React
- Redeploy after adding/changing variables
- Check browser console for API URL

