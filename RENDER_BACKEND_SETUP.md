# Deploy Backend to Render

## Quick Setup

1. **Sign up at Render**: https://render.com
2. **New Web Service**:
   - Connect your GitHub repository
   - Select your `pesca-pro` repo

## Render Configuration

### Basic Settings

- **Name**: `pesca-pro-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install` (or leave empty)
- **Start Command**: `npm start`
- **Plan**: Free

### Environment Variables

Add these in the **Environment** section:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-very-secret-jwt-key-change-this

# Railway MySQL Connection (external)
MYSQLHOST=mainline.proxy.rlwy.net
MYSQLPORT=50942
MYSQLUSER=root
MYSQLPASSWORD=fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp
MYSQLDATABASE=railway

# CORS - Frontend URLs (comma-separated for multiple)
FRONTEND_URL=https://pesca-pro.vercel.app,https://pesca-pro-d7rnzyuv6-cowboy21145-ctrls-projects.vercel.app
CLIENT_URL=https://pesca-pro.vercel.app
```

**Important Notes:**
- Replace `fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp` with your actual Railway MySQL password
- Add your Vercel frontend URL(s) to `FRONTEND_URL`
- You can add multiple URLs separated by commas
- The backend will automatically allow all `*.vercel.app` preview URLs

### Advanced Settings

- **Auto-Deploy**: Yes (deploys on every push to main branch)
- **Health Check Path**: `/api/health` (optional)

## After Deployment

1. **Get your backend URL**: 
   - Render will provide: `https://pesca-pro-backend.onrender.com`
   - Or check in the Render dashboard

2. **Update Frontend Environment Variable**:
   - In Vercel, update `REACT_APP_API_URL` to:
   ```
   REACT_APP_API_URL=https://pesca-pro-backend.onrender.com/api
   ```

3. **Test the connection**:
   - Visit: `https://pesca-pro-backend.onrender.com/api/health`
   - Should return: `{"status":"OK","message":"Pesca Pro API is running"}`

## CORS Configuration

The backend now supports:
- ✅ Localhost (http://localhost:3000) for development
- ✅ Your Vercel production URL
- ✅ All Vercel preview URLs (automatically)
- ✅ Any URLs you add to `FRONTEND_URL` environment variable

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` includes your Vercel URL
- Check that the URL matches exactly (including https://)
- The backend automatically allows `*.vercel.app` preview URLs

### Database Connection Fails
- Verify all `MYSQL*` variables are correct
- Check Railway MySQL is running
- Test connection from local machine first

### Build Fails
- Check Root Directory is set to `backend`
- Verify `package.json` exists in `backend/` directory
- Check build logs for specific errors

