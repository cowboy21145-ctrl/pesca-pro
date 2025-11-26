# Fix: Unknown column 'updated_at' Error

## Problem
The backend was trying to use `updated_at` column in the `registrations` table, but this column doesn't exist in the database schema.

## Error
```
ER_BAD_FIELD_ERROR: Unknown column 'updated_at' in 'field list'
```

## Solution
1. **Added column existence checks** before using `updated_at` in UPDATE queries
2. **Created fallback queries** that work without `updated_at`
3. **Fixed ORDER BY clause** in `/my-drafts` endpoint to use `registered_at` as fallback
4. **Created migration** to add `updated_at` column (optional)

## Files Changed
- `backend/routes/registrations.js` - Added column checks and fallback queries
- `backend/database/MIGRATION_ADD_UPDATED_AT.sql` - Migration to add the column

## How It Works Now
- The code checks if `updated_at` column exists before using it
- If it doesn't exist, it uses `registered_at` for ordering
- UPDATE queries work without `updated_at` column
- The application continues to function normally

## Optional: Add updated_at Column
To add the `updated_at` column for better tracking:

```bash
mysql -h [host] -P [port] -u [user] -p [database] < backend/database/MIGRATION_ADD_UPDATED_AT.sql
```

**Note:** The application will work fine without this column. Adding it is optional but recommended for better tracking of when registrations are updated.

