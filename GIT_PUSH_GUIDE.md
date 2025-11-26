# Git Push Instructions

## Quick Push (All Changes)

If you want to commit and push all changes at once:

```bash
# 1. Add all changes (modified + new files)
git add .

# 2. Commit with a message
git commit -m "Add database migrations, auto-save features, and UI improvements"

# 3. Push to remote repository
git push origin main
```

## Step-by-Step Push (Selective)

If you want to review and commit files selectively:

### 1. Check what files have changed
```bash
git status
```

### 2. Add specific files or all files
```bash
# Add all changes
git add .

# OR add specific files
git add backend/database/MIGRATION_SAFE.sql
git add frontend/src/pages/public/PublicRegister.js
```

### 3. Commit your changes
```bash
git commit -m "Your commit message here"
```

**Good commit message examples:**
- `"Add safe database migration script"`
- `"Implement auto-save for registration forms"`
- `"Add bank name field and payment details image"`
- `"Fix mobile responsive design issues"`
- `"Add token validation and auto-logout feature"`

### 4. Push to remote repository
```bash
git push origin main
```

## If You Get Errors

### Error: "Your branch is ahead of 'origin/main'"
This means you have local commits that haven't been pushed. Just run:
```bash
git push origin main
```

### Error: "Updates were rejected because the remote contains work"
This means someone else (or you from another machine) pushed changes. Pull first:
```bash
git pull origin main
# Resolve any conflicts if they occur
git push origin main
```

### Error: "Authentication failed"
You need to set up authentication. Options:
1. **Personal Access Token** (recommended for GitHub):
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` permissions
   - Use the token as your password when pushing

2. **SSH Key** (recommended for frequent use):
   ```bash
   # Generate SSH key (if you don't have one)
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add to SSH agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   
   # Copy public key and add to GitHub/GitLab
   cat ~/.ssh/id_ed25519.pub
   ```

## Current Changes Summary

Based on `git status`, you have:

**Modified Files:**
- `backend/database/schema.sql` - Database schema updates
- `backend/middleware/upload.js` - Upload configuration
- `backend/routes/auth.js` - Authentication routes
- `backend/routes/registrations.js` - Registration routes
- `backend/routes/tournaments.js` - Tournament routes
- `frontend/src/context/AuthContext.js` - Auth context updates
- `frontend/src/pages/auth/UserRegister.js` - User registration form
- `frontend/src/pages/organizer/PondManager.js` - Pond manager
- `frontend/src/pages/organizer/TournamentCreate.js` - Tournament creation
- `frontend/src/pages/organizer/TournamentEdit.js` - Tournament editing
- `frontend/src/pages/public/PublicRegister.js` - Public registration page
- `frontend/src/pages/user/Dashboard.js` - User dashboard
- `frontend/src/pages/user/RegistrationDetail.js` - Registration details
- `frontend/src/services/api.js` - API service updates

**New Files:**
- `QUICK_UPDATE.md` - Quick update guide
- `UPDATE_DEPLOYMENT_GUIDE.md` - Deployment update guide
- `backend/database/MIGRATION_GUIDE.md` - Migration guide
- `backend/database/MIGRATION_REMAINING.sql` - Remaining migrations
- `backend/database/MIGRATION_SAFE.sql` - Safe migration script
- `backend/database/MIGRATION_SIMPLE.sql` - Simple migration script
- `backend/database/MYSQL_UPDATES_SUMMARY.md` - MySQL updates summary
- `backend/database/migrations.sql` - Full migration script

## Recommended Commit Message

```bash
git add .
git commit -m "Add database migrations, auto-save features, token validation, and UI improvements

- Add safe database migration scripts (MIGRATION_SAFE.sql)
- Implement auto-save for registration forms with draft support
- Add token validation and auto-logout functionality
- Add bank name field for users and registrations
- Add payment details image upload for tournaments
- Improve public registration page with countdown and better UI
- Fix mobile responsive design issues
- Add deployment update guides"
git push origin main
```

## Verify Your Push

After pushing, verify it worked:
```bash
git log --oneline -5
git status
```

You should see:
- `Your branch is up to date with 'origin/main'`
- No uncommitted changes (if you committed everything)

