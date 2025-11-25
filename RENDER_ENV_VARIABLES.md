# Render Environment Variables Setup

## Correct Format

When setting environment variables in Render, use this format:

### FRONTEND_URL

**Correct:**
```
FRONTEND_URL=https://pesca-pro-dev.vercel.app,https://pesca-pro-d7rnzyuv6-cowboy21145-ctrls-projects.vercel.app
```

**Important:**
- ✅ Use `=` between variable name and value
- ✅ No trailing slashes (`/`) at the end of URLs
- ✅ Separate multiple URLs with commas (no spaces)
- ✅ No spaces around the `=`

**Incorrect Examples:**
```
❌ FRONTEND_URLhttps://pesca-pro-dev.vercel.app (missing =)
❌ FRONTEND_URL=https://pesca-pro-dev.vercel.app/ (trailing slash)
❌ FRONTEND_URL = https://pesca-pro-dev.vercel.app (spaces around =)
```

## Recommended Setup

Since the backend automatically allows all `pesca-pro*.vercel.app` URLs via regex, you can simplify to:

```
FRONTEND_URL=https://pesca-pro-dev.vercel.app
```

This will automatically allow:
- ✅ `https://pesca-pro-dev.vercel.app` (your production URL)
- ✅ `https://pesca-pro-d7rnzyuv6-cowboy21145-ctrls-projects.vercel.app` (preview URLs)
- ✅ Any other `pesca-pro*.vercel.app` URLs

## Complete Environment Variables for Render

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-very-secret-jwt-key-change-this

# Railway MySQL Connection
MYSQLHOST=mainline.proxy.rlwy.net
MYSQLPORT=50942
MYSQLUSER=root
MYSQLPASSWORD=fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp
MYSQLDATABASE=railway

# CORS - Frontend URL (simplified - regex handles preview URLs)
FRONTEND_URL=https://pesca-pro-dev.vercel.app
```

## How to Set in Render

1. Go to your Render service dashboard
2. Click **Environment** tab
3. Click **Add Environment Variable**
4. **Key**: `FRONTEND_URL`
5. **Value**: `https://pesca-pro-dev.vercel.app`
6. Click **Save Changes**
7. Render will automatically redeploy

## Verify It Works

After redeploying, test the CORS:
1. Open your Vercel frontend
2. Try to login or make an API call
3. Check browser console - CORS errors should be gone

If you still see CORS errors:
- Make sure there's no trailing slash in the URL
- Make sure there's an `=` sign
- Wait for Render to finish redeploying (takes 1-2 minutes)

