# How to Update MySQL Database on Railway

## Quick Update (Recommended)

Run the safe migration script that checks for existing columns:

```bash
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway < backend/database/MIGRATION_SAFE.sql
```

Then run the structure type migration:

```bash
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway < backend/database/MIGRATION_STRUCTURE_TYPE.sql
```

## Step-by-Step Instructions

### Option 1: Using Command Line (Windows PowerShell)

1. **Open PowerShell** in your project directory

2. **Run the safe migration first** (adds bank_name, payment_details_image, draft status):
   ```powershell
   mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway < backend/database/MIGRATION_SAFE.sql
   ```

3. **Run the structure type migration** (adds structure_type, pond price, zone price):
   ```powershell
   mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway < backend/database/MIGRATION_STRUCTURE_TYPE.sql
   ```

### Option 2: Using MySQL Command Line (Interactive)

1. **Connect to MySQL**:
   ```bash
   mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p railway
   ```
   When prompted, enter password: `fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp`

2. **Select the database**:
   ```sql
   USE railway;
   ```

3. **Run the migrations** - Copy and paste the contents of:
   - `backend/database/MIGRATION_SAFE.sql`
   - `backend/database/MIGRATION_STRUCTURE_TYPE.sql`

### Option 3: Using MySQL Workbench

1. **Connect to Railway MySQL**:
   - Hostname: `mainline.proxy.rlwy.net`
   - Port: `50942`
   - Username: `root`
   - Password: `fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp`
   - Default Schema: `railway`

2. **Open SQL Editor** and run the migration files:
   - Open `backend/database/MIGRATION_SAFE.sql`
   - Copy and paste into SQL Editor
   - Click Execute (⚡)
   - Repeat for `backend/database/MIGRATION_STRUCTURE_TYPE.sql`

### Option 4: Using Railway CLI (if installed)

If you have Railway CLI installed:

```bash
railway connect mysql
# Then run the SQL files
```

## What Each Migration Does

### MIGRATION_SAFE.sql
- ✅ Adds `bank_name` to `users` table (if not exists)
- ✅ Adds `bank_name` to `registrations` table (if not exists)
- ✅ Adds `payment_details_image` to `tournaments` table (if not exists)
- ✅ Updates `registrations.status` to include 'draft' status
- ✅ Removes unique constraint on registrations (if exists)

### MIGRATION_STRUCTURE_TYPE.sql
- ✅ Adds `structure_type` to `tournaments` table (ENUM: 'pond_only', 'pond_zone', 'pond_zone_area')
- ✅ Adds `price` to `ponds` table (for pond-only tournaments)
- ✅ Adds `price` to `zones` table (for pond+zone tournaments)

## Verify the Update

After running migrations, verify the changes:

```bash
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway -e "DESCRIBE tournaments;"
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway -e "DESCRIBE ponds;"
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway -e "DESCRIBE zones;"
```

You should see:
- `tournaments` table has: `structure_type`, `payment_details_image`
- `ponds` table has: `price`
- `zones` table has: `price`
- `users` table has: `bank_name`
- `registrations` table has: `bank_name` and `status` includes 'draft'

## Troubleshooting

### Error: "mysql: command not found"
**Solution**: Install MySQL client or use MySQL Workbench

### Error: "Access denied"
**Solution**: Check your password and connection details

### Error: "Duplicate column name"
**Solution**: The migration already ran. This is safe - the script will skip existing columns.

### Error: "Unknown database 'railway'"
**Solution**: The database might be named differently. Check Railway dashboard for the actual database name.

## All-in-One Command (Run Both Migrations)

```bash
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway < backend/database/MIGRATION_SAFE.sql && mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'fZQDcEvTxOHGRmxbseGYYXKQmjYEuogp' railway < backend/database/MIGRATION_STRUCTURE_TYPE.sql
```

## Notes

- ✅ All migrations are **safe to run multiple times** - they check if columns exist before adding
- ✅ No data will be lost - these are additive changes only
- ✅ Existing tournaments will default to `structure_type = 'pond_zone_area'` (full structure)
- ✅ Existing ponds and zones will have `price = 0.00` by default

