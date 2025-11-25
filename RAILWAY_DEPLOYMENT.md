# Deploy Pesca Pro to Railway with MySQL

Based on [this guide](https://dev.to/sharanappa_m/deploying-a-nodejs-project-with-mysql-on-railway-2k7n), here's how to deploy your Pesca Pro system to Railway.

## Prerequisites

1. GitHub account
2. Railway account (sign up at https://railway.app)
3. Your code pushed to GitHub

## Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Pesca Pro"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pesca-pro.git
git push -u origin main
```

## Step 2: Create Railway Account & Log In

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with GitHub

## Step 3: Deploy MySQL Database

1. Click **"New Project"** → **"Empty Project"**
2. Click **"+ New"** → **"Database"** → **"Add MySQL"**
3. Wait for MySQL to start (takes 1-2 minutes)
4. Click on the MySQL service
5. Go to **"Variables"** tab
6. Note these variables (you'll need them):
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

## Step 4: Run Database Schema

1. In MySQL service, go to **"Data"** tab
2. Click **"Connect"** → Copy the connection string
3. Or use MySQL Workbench/DBeaver to connect
4. Run your schema:
   ```bash
   # Using MySQL command line
   mysql -h MYSQLHOST -P MYSQLPORT -u MYSQLUSER -pMYSQLPASSWORD MYSQLDATABASE < backend/database/schema.sql
   ```
   
   Or connect via MySQL client and paste the contents of `backend/database/schema.sql`

## Step 5: Deploy Backend

1. In your Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your `pesca-pro` repository
3. Railway will detect it's a Node.js project
4. **Important**: Set **Root Directory** to `backend`
   - Go to **Settings** → **Root Directory** → Set to `backend`
5. Go to **Variables** tab and add:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-very-secret-key-change-this

# Railway MySQL Variables (use the ones from MySQL service)
MYSQLHOST=your-mysql-host
MYSQLPORT=your-mysql-port
MYSQLUSER=your-mysql-user
MYSQLPASSWORD=your-mysql-password
MYSQLDATABASE=your-mysql-database
```

6. Railway will auto-deploy. Check **Deployments** tab for logs

## Step 6: Update Database Connection

Update `backend/config/database.js` to support Railway MySQL:

```javascript
const mysql = require('mysql2/promise');
require('dotenv').config();

// Use Railway MySQL variables if available, otherwise use local
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'pesca_pro',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;
```

## Step 7: Deploy Frontend

1. In Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select the same repository
3. Set **Root Directory** to `frontend`
4. Go to **Settings**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s build -l 3000`
5. Go to **Variables** and add:
   ```env
   REACT_APP_API_URL=https://your-backend-service.up.railway.app/api
   ```
   (Replace with your actual backend URL from Railway)

## Step 8: Get Custom Domains

1. **Backend**: Go to backend service → **Settings** → **Networking**
   - Click **"Generate Domain"** or add custom domain
   - Copy the URL (e.g., `https://pesca-pro-backend.up.railway.app`)

2. **Frontend**: Go to frontend service → **Settings** → **Networking**
   - Click **"Generate Domain"** or add custom domain
   - Copy the URL (e.g., `https://pesca-pro-frontend.up.railway.app`)

3. **Update Frontend Environment Variable**:
   - Update `REACT_APP_API_URL` in frontend service to use your backend domain

## Step 9: Update CORS in Backend

Update `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'https://pesca-pro-frontend.up.railway.app',
    'http://localhost:3000' // for local development
  ],
  credentials: true
}));
```

## Step 10: File Uploads

Railway has ephemeral storage. For production, use:

### Option 1: Cloudinary (Recommended - Free 25GB)
1. Sign up at https://cloudinary.com
2. Get API keys
3. Install: `npm install cloudinary multer-storage-cloudinary`
4. Update upload middleware

### Option 2: Railway Volume (Paid)
- Add persistent volume for uploads folder

## Environment Variables Summary

### Backend Service Variables:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key-here

# Railway MySQL (from MySQL service)
MYSQLHOST=xxx.proxy.rlwy.net
MYSQLPORT=xxxxx
MYSQLUSER=root
MYSQLPASSWORD=xxxxx
MYSQLDATABASE=railway
```

### Frontend Service Variables:
```env
REACT_APP_API_URL=https://your-backend.up.railway.app/api
```

## Troubleshooting

### Database Connection Fails
- Verify all `MYSQL*` variables are set correctly
- Check MySQL service is running
- Verify schema was run successfully

### Backend Won't Start
- Check **Deployments** → **Logs** for errors
- Verify Root Directory is set to `backend`
- Check all environment variables are set

### Frontend Can't Connect
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is deployed and running

### Build Fails
- Check Node.js version (Railway auto-detects)
- Verify all dependencies in `package.json`
- Check build logs for specific errors

## Railway Free Tier Limits

- **$5 credit/month** (enough for small projects)
- MySQL database included
- Auto-deploy from GitHub
- Custom domains
- SSL certificates included

## Next Steps After Deployment

1. Test all features:
   - User registration/login
   - Organizer registration/login
   - Tournament creation
   - Registration flow
   - Catch uploads

2. Set up file storage (Cloudinary recommended)

3. Monitor usage in Railway dashboard

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

