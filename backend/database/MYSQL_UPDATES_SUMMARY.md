# MySQL Database Updates Summary

Complete list of all database changes that need to be applied to your existing Pesca Pro database.

## 📋 All Database Changes

### 1. Users Table
**Change**: Add `bank_name` column
```sql
ALTER TABLE users 
ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;
```

### 2. Registrations Table
**Changes**:
- Add `bank_name` column
- Add `'draft'` status to status enum
- Remove unique constraint (allows multiple drafts)

```sql
-- Add bank_name column
ALTER TABLE registrations 
ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;

-- Add 'draft' status to enum
ALTER TABLE registrations 
MODIFY COLUMN status ENUM('draft', 'pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'draft';

-- Remove unique constraint (if exists)
ALTER TABLE registrations DROP INDEX unique_user_tournament;
```

### 3. Tournaments Table
**Change**: Add `payment_details_image` column
```sql
ALTER TABLE tournaments 
ADD COLUMN payment_details_image VARCHAR(255) AFTER banner_image;
```

---

## 🚀 Quick Migration Commands

### For Railway MySQL:

```bash
# Option 1: Run the simple migration file
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'YOUR_PASSWORD' railway < backend/database/MIGRATION_SIMPLE.sql

# Option 2: Run the safe migration file (checks if columns exist)
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'YOUR_PASSWORD' railway < backend/database/migrations.sql
```

### For Local MySQL:

```bash
mysql -u root -p pesca_pro < backend/database/MIGRATION_SIMPLE.sql
```

---

## 📝 Complete SQL (Copy & Paste)

If you prefer to copy-paste directly:

```sql
USE pesca_pro;

-- 1. Add bank_name to users
ALTER TABLE users 
ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;

-- 2. Add bank_name to registrations
ALTER TABLE registrations 
ADD COLUMN bank_name VARCHAR(100) AFTER bank_account_no;

-- 3. Add payment_details_image to tournaments
ALTER TABLE tournaments 
ADD COLUMN payment_details_image VARCHAR(255) AFTER banner_image;

-- 4. Add 'draft' status to registrations
ALTER TABLE registrations 
MODIFY COLUMN status ENUM('draft', 'pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'draft';

-- 5. Remove unique constraint (allows multiple drafts)
ALTER TABLE registrations DROP INDEX unique_user_tournament;
```

---

## ✅ Verification Queries

After running migrations, verify with these queries:

```sql
-- Check users table
DESCRIBE users;
-- Should show: bank_name VARCHAR(100)

-- Check registrations table
DESCRIBE registrations;
-- Should show: bank_name VARCHAR(100)
-- Should show: status ENUM with 'draft' included

-- Check tournaments table
DESCRIBE tournaments;
-- Should show: payment_details_image VARCHAR(255)

-- Check registrations constraints
SHOW INDEX FROM registrations;
-- Should NOT show: unique_user_tournament
```

---

## 📊 Change Summary Table

| Table | Column/Change | Type | Required |
|-------|---------------|------|----------|
| `users` | `bank_name` | VARCHAR(100) | ✅ Yes |
| `registrations` | `bank_name` | VARCHAR(100) | ✅ Yes |
| `registrations` | `status` enum | Add 'draft' | ✅ Yes |
| `registrations` | Constraint | Remove unique | ✅ Yes |
| `tournaments` | `payment_details_image` | VARCHAR(255) | ✅ Yes |

---

## ⚠️ Important Notes

1. **Backup First**: Always backup your database before migrations
2. **No Data Loss**: These are additive changes - no data will be deleted
3. **Safe to Run**: Can be run multiple times (will skip if columns exist)
4. **Downtime**: No downtime required - migrations are quick

---

## 🐛 Troubleshooting

### Error: Duplicate column name
- **Meaning**: Column already exists
- **Solution**: Skip that migration step, it's already done

### Error: Unknown column in enum
- **Meaning**: Enum modification failed
- **Solution**: Make sure you include ALL enum values in the ALTER statement

### Error: Can't DROP 'unique_user_tournament'
- **Meaning**: Constraint doesn't exist
- **Solution**: That's okay! It means it was already removed or never existed

---

## 📁 Migration Files

- **`MIGRATION_SIMPLE.sql`** - Simple version, run all at once
- **`migrations.sql`** - Safe version, checks if columns exist first
- **`MIGRATION_GUIDE.md`** - Detailed step-by-step guide

---

**Ready to migrate?** Use `MIGRATION_SIMPLE.sql` for the fastest update!

