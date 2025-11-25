# Railway MySQL Connection Details

## Your Connection String

```
mysql://root:fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp@mainline.proxy.rlwy.net:50942/railway
```

## Connection Details Breakdown

- **Host**: `mainline.proxy.rlwy.net`
- **Port**: `50942`
- **Username**: `root`
- **Password**: `fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp`
- **Database**: `railway`

## How to Use

### 1. For Local MySQL Clients (MySQL Workbench, DBeaver, Command Line)

Use these details to connect from your local machine:

**MySQL Command Line:**
```bash
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p railway
# Enter password: fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp
```

Or with password in command (no space after -p):
```bash
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway
```

**Run Schema:**
```bash
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway < backend/database/schema.sql
```

**MySQL Workbench:**
- Hostname: `mainline.proxy.rlwy.net`
- Port: `50942`
- Username: `root`
- Password: `fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp`
- Default Schema: `railway`

**DBeaver:**
- Host: `mainline.proxy.rlwy.net`
- Port: `50942`
- Database: `railway`
- Username: `root`
- Password: `fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp`

### 2. For Backend Service on Render/Other Platforms

In your backend service **Variables** tab, use:

```env
MYSQLHOST=mainline.proxy.rlwy.net
MYSQLPORT=50942
MYSQLUSER=root
MYSQLPASSWORD=fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp
MYSQLDATABASE=railway
```

**Note**: For external services (like Render), use the public hostname `mainline.proxy.rlwy.net` (not `mysql.railway.internal`)

## Running the Schema

Once connected, run your schema:

```bash
# From command line (correct syntax)
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway < backend/database/schema.sql
```

Or connect and paste the SQL:
```bash
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p railway
# Enter password when prompted: fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp
# Then paste contents of backend/database/schema.sql
```

## Quick Test Connection

Test if you can connect:
```bash
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway -e "SHOW TABLES;"
```

If successful, you'll see the tables (or empty if schema not run yet).
