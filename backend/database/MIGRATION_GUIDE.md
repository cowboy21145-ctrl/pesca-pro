# Database Migration Guide

This guide explains how to update your existing Pesca Pro database with all the latest changes.

## 📋 What's Changed

The following changes have been made to the database schema:

1. **Users Table**: Added `bank_name` column
2. **Registrations Table**: 
   - Added `bank_name` column
   - Added `'draft'` status to status enum
   - Removed unique constraint to allow multiple drafts
3. **Tournaments Table**: Added `payment_details_image` column

## 🚀 Quick Migration

### Option 1: Using MySQL Command Line (Recommended)

```bash
# Connect to your Railway MySQL database
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'YOUR_PASSWORD' railway < backend/database/migrations.sql
```

### Option 2: Using MySQL Workbench

1. Connect to your Railway MySQL database
2. Open `backend/database/migrations.sql`
3. Copy all SQL statements
4. Paste into MySQL Workbench SQL editor
5. Execute the script

### Option 3: Using DBeaver

1. Connect to your Railway MySQL database
2. Right-click on database → **SQL Editor** → **New SQL Script**
3. Open `backend/database/migrations.sql`
4. Copy and paste all SQL statements
5. Execute script (F5 or Execute button)

## 📝 Manual Migration (Step by Step)

If you prefer to run migrations one by one:

### Step 1: Add bank_name to users table

```sql
ALTER TABLE users 
ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;
```

### Step 2: Add bank_name to registrations table

```sql
ALTER TABLE registrations 
ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;
```

### Step 3: Add payment_details_image to tournaments table

```sql
ALTER TABLE tournaments 
ADD COLUMN payment_details_image VARCHAR(255) AFTER banner_image;
```

### Step 4: Add 'draft' status to registrations

```sql
ALTER TABLE registrations 
MODIFY COLUMN status ENUM('draft', 'pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'draft';
```

### Step 5: Remove unique constraint (allows multiple drafts)

```sql
-- Check if constraint exists first
ALTER TABLE registrations DROP INDEX unique_user_tournament;
```

**Note**: If you get an error that the constraint doesn't exist, that's okay - it means it was already removed or never existed.

## ✅ Verification

After running migrations, verify the changes:

```sql
-- Check users table
DESCRIBE users;
-- Should show bank_name column

-- Check registrations table
DESCRIBE registrations;
-- Should show bank_name column and 'draft' in status enum

-- Check tournaments table
DESCRIBE tournaments;
-- Should show payment_details_image column
```

## 🔍 Check Current Schema

To see what columns exist in your tables:

```sql
-- Users table
SHOW COLUMNS FROM users;

-- Registrations table
SHOW COLUMNS FROM registrations;

-- Tournaments table
SHOW COLUMNS FROM tournaments;
```

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before running migrations
2. **Test Environment**: Test migrations on a test database first if possible
3. **Downtime**: These migrations should not cause downtime
4. **Data Safety**: No data will be lost - we're only adding columns and modifying enums

## 🐛 Troubleshooting

### Error: Column already exists
If you see "Duplicate column name", the column already exists. You can skip that migration step.

### Error: Unknown column in enum
If you see an error about enum values, make sure you're running the full ALTER TABLE statement that includes all enum values.

### Error: Constraint doesn't exist
If you see an error about dropping a constraint that doesn't exist, that's okay - it means the constraint was already removed or never existed.

## 📊 Migration Summary

| Table | Change | Type |
|-------|--------|------|
| `users` | Add `bank_name` | New Column |
| `registrations` | Add `bank_name` | New Column |
| `registrations` | Add `'draft'` status | Enum Modification |
| `registrations` | Remove unique constraint | Constraint Removal |
| `tournaments` | Add `payment_details_image` | New Column |

## 🎯 After Migration

Once migrations are complete:

1. ✅ Restart your backend service (Render/Railway)
2. ✅ Verify the application works correctly
3. ✅ Test draft registration functionality
4. ✅ Test bank name fields in registration forms
5. ✅ Test payment details image upload

## 📞 Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify you're connected to the correct database
3. Ensure you have proper permissions
4. Check that the database exists and is accessible

---

**Last Updated**: Based on latest schema changes
**Database**: MySQL 8.0+
**Compatibility**: Railway MySQL, Local MySQL, Any MySQL 8.0+ instance

