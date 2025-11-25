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
   - `MYSQLHOST` - **Important**: This shows `mysql.railway.internal` (internal) or `xxx.proxy.rlwy.net` (external)
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

### Understanding Railway MySQL Hostnames

Railway provides two hostnames:

1. **`mysql.railway.internal`** - Internal hostname
   - Use this when connecting **from another Railway service** (e.g., your backend service)
   - Only works within Railway's network
   - Faster connection (no external routing)

2. **`xxx.proxy.rlwy.net`** - External/public hostname
   - Use this when connecting **from outside Railway** (your local machine, MySQL Workbench, etc.)
   - Works from anywhere on the internet
   - Required for local development tools

**For your backend service on Railway**: Use `mysql.railway.internal`  
**For local MySQL clients**: Use the `xxx.proxy.rlwy.net` hostname (check the "Connect" tab or use the public hostname)

## Step 4: Run Database Schema

You need to run the database schema to create all tables. Here are the options:

### Option 1: Using MySQL Command Line (Recommended)

1. Get your MySQL connection details from Railway:
   - In Railway dashboard, click on your **MySQL service**
   - Go to **"Variables"** tab
   - Note down these values:
     - `MYSQLHOST` (e.g., `xxx.proxy.rlwy.net`)
     - `MYSQLPORT` (e.g., `17091`)
     - `MYSQLUSER` (usually `root`)
     - `MYSQLPASSWORD` (your generated password)
     - `MYSQLDATABASE` (usually `railway`)

2. Run the schema using MySQL command line:
   ```bash
   # Replace with your actual values from Railway
   mysql -h xxx.proxy.rlwy.net -P 17091 -u root -p'YOUR_PASSWORD' railway < backend/database/schema.sql
   ```
   
   Or connect interactively:
   ```bash
   mysql -h xxx.proxy.rlwy.net -P 17091 -u root -p railway
   # Enter password when prompted
   # Then paste the contents of backend/database/schema.sql
   ```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Click **"+"** to create new connection
3. Enter connection details:
   - **Hostname**: Use the **public hostname** from Railway (e.g., `xxx.proxy.rlwy.net`)
     - **NOT** `mysql.railway.internal` (that's only for internal Railway connections)
     - Find it in MySQL service → **"Connect"** tab or enable "Public Networking"
   - **Port**: The public port (5-digit number like `17091`, NOT `3306`)
   - **Username**: Your `MYSQLUSER` value from Variables tab (usually `root`)
   - **Password**: Click "Store in Keychain" and enter your `MYSQLPASSWORD`
   - **Default Schema**: Your `MYSQLDATABASE` value (usually `railway`)
4. Click **"Test Connection"** to verify
5. Click **"OK"** to save
6. Open the connection
7. Open `backend/database/schema.sql` file
8. Copy and paste all SQL commands into MySQL Workbench
9. Execute the script

### Option 3: Using DBeaver (Free Database Tool)

1. Download DBeaver from https://dbeaver.io
2. Create new MySQL connection
3. Enter Railway MySQL details:
   - **Host**: Use the **public hostname** (e.g., `xxx.proxy.rlwy.net`)
     - **NOT** `mysql.railway.internal` (internal only)
     - Find in MySQL service → **"Connect"** tab
   - **Port**: Public port (5-digit number like `17091`)
   - **Database**: Your `MYSQLDATABASE` value from Variables (usually `railway`)
   - **Username**: Your `MYSQLUSER` value from Variables (usually `root`)
   - **Password**: Your `MYSQLPASSWORD` value from Variables
4. Test connection and connect
5. Right-click on database → **SQL Editor** → **New SQL Script**
6. Paste contents of `backend/database/schema.sql`
7. Execute script

### Option 4: Using Railway MySQL Query Tab (If Available)

Some Railway MySQL services have a **"Query"** or **"Connect"** button:
1. Click on your MySQL service in Railway
2. Look for **"Query"**, **"Connect"**, or **"Open"** button
3. This opens a web-based SQL editor
4. Paste and execute the contents of `backend/database/schema.sql`

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

# Railway MySQL Variables (from MySQL service Variables tab)
# Use mysql.railway.internal for internal Railway connections
MYSQLHOST=mysql.railway.internal
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=your-mysql-password
MYSQLDATABASE=railway
```

**Important Notes:**
- For `MYSQLHOST`: Use `mysql.railway.internal` (this is the internal hostname for Railway-to-Railway connections)
- For `MYSQLPORT`: Usually `3306` (the default MySQL port, not the proxy port)
- Copy `MYSQLPASSWORD` and `MYSQLDATABASE` from your MySQL service Variables tab
- The backend service will connect internally, so `mysql.railway.internal` is correct

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

