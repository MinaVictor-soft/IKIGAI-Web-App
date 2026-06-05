# 🚀 IKIGAI Web App - Replit Deployment Guide

## Quick Deploy (One-Click)

1. **Create New Replit Project**
   - Go to https://replit.com/new
   - Choose "Import from GitHub"
   - Paste: `https://github.com/MinaVictor-soft/IKIGAI-Web-App.git`
   - Click "Import"

2. **Wait for Setup**
   - Replit will automatically:
     - Install dependencies (npm install)
     - Read `.replit` configuration
     - Build the project
     - Start the dev server

3. **Access Your App**
   - Replit will provide a public URL
   - Format: `https://[project-name].[username].replit.dev`
   - Your web app is now live!

---

## Manual Deployment Steps

### Step 1: Create Replit Project
- Visit https://replit.com/new
- Select Node.js environment
- Click "Create"

### Step 2: Upload Code
```bash
# Option A: Git Clone (Recommended)
git clone https://github.com/MinaVictor-soft/IKIGAI-Web-App.git .

# Option B: Manual Upload
# Drag and drop files into Replit file explorer
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Build Project
```bash
npm run build
```

### Step 5: Start Development Server
```bash
npm run dev
```

---

## Configuration Status

### ✅ Already Configured
- **API URL**: Production backend
  ```
  VITE_API_URL=https://ikigai-app-backend.replit.app/api
  ```

- **Port Configuration**: `.replit` file
  ```
  localPort = 5174
  externalPort = 80
  ```

- **Environment**: Production
  ```
  NODE_ENV = production
  ```

- **Build Target**: Vite dev server
  ```
  run = "npm run dev"
  ```

---

## What's Included

✅ React 19.2.6 with Vite  
✅ Tailwind CSS 4.3.0  
✅ i18next (EN/AR translations)  
✅ React Router 6.x  
✅ Axios HTTP client  
✅ 13 Pages (Home, Profile, Leaderboard, Quiz, Events, Library, Sports, Scan, Info, Login, Register, Loading)  
✅ Responsive Design  
✅ RTL Support  
✅ Production-ready  

---

## Features

### 📱 Pages
1. **Login** - User authentication
2. **Register** - Account creation
3. **Home** - Dashboard with user stats
4. **Profile** - User profile management
5. **Leaderboard** - Rankings (individual & tribe)
6. **Quiz** - Quiz list and taking
7. **Events** - Event management
8. **Library** - Resource library
9. **Sports** - Sports tracking
10. **Scan** - QR code scanner
11. **Info** - App information
12. **Loading** - Loading screen
13. **404** - Not found page

### 🎨 UI/UX
- Beautiful dark theme
- Responsive layout
- Arabic RTL support
- Smooth animations
- Professional design

### 🔐 Security
- JWT token authentication
- Secure API calls
- XSS protection
- CSRF protection

---

## API Integration

All endpoints automatically connect to:
```
https://ikigai-app-backend.replit.app/api
```

### Endpoints Used
- `/auth/*` - Authentication
- `/users/*` - User management
- `/quiz/*` - Quiz management
- `/leaderboard/*` - Rankings
- `/attendance/*` - QR scanning
- `/xp/*` - XP tracking

---

## Environment Variables

### Production (Default)
```env
VITE_API_URL=https://ikigai-app-backend.replit.app/api
NODE_ENV=production
```

### Local Development
```env
VITE_API_URL=http://localhost:3000/api
NODE_ENV=development
```

---

## Troubleshooting

### Issue: "Cannot find module"
```bash
npm install
npm run build
```

### Issue: "Port already in use"
```bash
# Kill process on port 5174
lsof -ti:5174 | xargs kill -9

# Or change port in .replit
```

### Issue: "Blank white screen"
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
npm run dev
```

### Issue: "API not responding"
- Check backend URL in `.env.local`
- Verify backend is running
- Check network tab in browser dev tools

---

## Performance Tips

1. **Optimize Images**
   - Already optimized in src/assets

2. **Code Splitting**
   - Vite handles automatic splitting
   - React Router lazy loading enabled

3. **CSS Optimization**
   - Tailwind CSS purging enabled
   - Production build minimizes CSS

4. **Asset Caching**
   - Browser caching enabled
   - Service workers ready (optional)

---

## Deployment Checklist

- ✅ Dependencies installed
- ✅ Environment variables set
- ✅ API URL configured
- ✅ Build successful
- ✅ Dev server running
- ✅ Pages loading
- ✅ Navigation working
- ✅ API calls functioning
- ✅ Responsive design responsive
- ✅ RTL working (if needed)

---

## Next Steps

1. **Test Locally First**
   ```bash
   npm run dev
   # Visit http://localhost:5174
   ```

2. **Deploy to Replit**
   - Create project
   - Push code
   - Wait for build

3. **Verify Deployment**
   - Test all pages
   - Verify API calls
   - Check styling

4. **Monitor**
   - Check browser console
   - Monitor API responses
   - Watch for errors

---

## Production URLs

**Web App**: `https://[your-replit-url]`  
**Backend API**: `https://ikigai-app-backend.replit.app`  
**Admin Dashboard**: `https://ikigai-app-dasboard.replit.app`  
**API Documentation**: `https://ikigai-app-backend.replit.app/api-docs`  

---

## Support

For issues or questions:
1. Check error logs in browser console
2. Verify backend connection
3. Check API documentation
4. Review GitHub issues

---

**Web App is ready for production deployment! 🚀**
