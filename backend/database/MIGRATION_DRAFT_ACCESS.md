# Migration: Add pond_id and zone_id to registrations table

This migration adds `pond_id` and `zone_id` columns to the `registrations` table to support storing pond/zone selections for pond-only and pond+zone tournaments.

## Migration File
Run: `backend/database/MIGRATION_POND_ZONE_ID.sql`

## What This Does
1. Adds `pond_id INT NULL` column to `registrations` table (with foreign key to `ponds`)
2. Adds `zone_id INT NULL` column to `registrations` table (with foreign key to `zones`)
3. Both columns are nullable since they're only used for specific tournament structure types

## Backend Changes
- Updated `POST /registrations/draft` to accept and store `pond_id` and `zone_id`
- Updated `GET /registrations/draft/:tournamentId` to return pond/zone information with names and prices
- Updated payment calculation to handle pond-only and pond+zone tournaments

## Frontend Changes
- Updated draft loading to restore pond/zone selections
- Updated auto-save to include pond/zone selections
- Improved draft restoration from both server and localStorage

## Testing
1. Create a pond-only tournament
2. Start registration and select a pond
3. Save as draft
4. Go to user dashboard
5. Click "Continue Registration" on the draft
6. Verify pond selection is restored
7. Complete registration

Repeat for pond+zone tournaments.

