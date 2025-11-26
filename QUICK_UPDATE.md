# 🚀 Quick Update Reference

## One-Command Update

```bash
git add . && git commit -m "Update: [your changes]" && git push origin main
```

That's it! All platforms auto-deploy.

---

## 📍 Platform URLs

- **Vercel**: https://vercel.com/dashboard
- **Render**: https://dashboard.render.com  
- **Railway**: https://railway.app/dashboard

---

## 🔄 Update Steps

1. **Make changes** → Test locally
2. **Commit & Push**:
   ```bash
   git add .
   git commit -m "Update: description"
   git push origin main
   ```
3. **Wait 2-5 minutes** → Auto-deployment happens
4. **Verify** → Check dashboards, test app

---

## 🗄️ Database Updates

If you changed `schema.sql`, run SQL on Railway:

```bash
mysql -h mainline.proxy.rlwy.net -P 50942 -u root -p'PASSWORD' railway < backend/database/schema.sql
```

Or use MySQL Workbench with Railway connection.

---

## ⚙️ Environment Variables

### Vercel (Frontend)
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### Render (Backend)
```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-secret
MYSQLHOST=mainline.proxy.rlwy.net
MYSQLPORT=50942
MYSQLUSER=root
MYSQLPASSWORD=your-password
MYSQLDATABASE=railway
FRONTEND_URL=https://pesca-pro.vercel.app
CLIENT_URL=https://pesca-pro.vercel.app
```

---

## ✅ Quick Verification

- **Vercel**: Visit your site URL
- **Render**: Check `/api/health` endpoint
- **Railway**: Check MySQL service is running

---

## 🐛 Quick Fixes

**Build fails?** → Clear cache in platform dashboard  
**CORS error?** → Update `FRONTEND_URL` in Render  
**DB error?** → Check Railway MySQL variables in Render

---

**Full Guide**: See `UPDATE_DEPLOYMENT_GUIDE.md`

