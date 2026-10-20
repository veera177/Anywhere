# 🚀 START HERE - Complete Integration Guide

**Make your Backend, Frontend, and Database work together smoothly in 5 minutes**

---

## ⚡ Quick Start (Fastest Way)

### 1️⃣ One-Click Start (Recommended)
**Windows Only:**
1. Make sure MySQL is running
2. Double-click: `d:\springboot\start-app\start-app\RUN_ALL.bat`
3. Wait 30 seconds for everything to start
4. Browser will open automatically to `http://localhost:5173`
5. Login with `demo@gmail.com` / `12345`

**That's it!** All three components start automatically.

---

## 🛠️ Manual Setup (5 Minutes)

If the one-click doesn't work, or you're on Mac/Linux:

### Step 1: Initialize Database (1 minute)
```bash
# Open terminal/command prompt
cd D:\anywhere

# Run database setup
mysql -u root -p < SETUP_DATABASE.sql

# Verify (should show 27 tables)
mysql -u root -p anywhere -e "SHOW TABLES;"
```

### Step 2: Start Backend (1 minute)
**Terminal Window 1:**
```bash
cd d:\springboot\start-app\start-app
mvn spring-boot:run

# Wait for: "Started StartAppApplication"
# Backend runs on: http://localhost:8080
```

### Step 3: Start Frontend (1 minute)
**Terminal Window 2:**
```bash
cd C:\Users\veera vadivelan\OneDrive\Desktop\react

# First time only:
npm install

# Start dev server:
npm run dev

# Wait for: "Local: http://localhost:5173"
```

### Step 4: Open in Browser
- Visit: `http://localhost:5173`
- Login with: `demo@gmail.com` / `12345`

---

## ✅ Verification Checklist

After everything is running, verify all components work:

### ✓ Database Check
```bash
mysql -u root -p anywhere -e "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM districts;"
# Should show: 1 user, 27 districts
```

### ✓ Backend Check
```bash
# In browser or terminal:
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}
```

### ✓ Frontend Check
- Open: `http://localhost:5173`
- Should see the app interface
- No errors in DevTools console (F12)

### ✓ Login Test
1. Click "Login" button
2. Enter: `demo@gmail.com`
3. Enter password: `12345`
4. Click "Submit"
5. Should redirect to dashboard

**If all 4 checks pass:** ✅ You're ready to go!

---

## 📊 What's Running Where

```
DATABASE          BACKEND           FRONTEND
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  MySQL       │  │  Spring Boot │  │  React Vite  │
│ localhost:   │  │ localhost:   │  │ localhost:   │
│ 3306         │  │ 8080         │  │ 5173         │
│ anywhere DB  │  │ /api         │  │ /            │
└──────────────┘  └──────────────┘  └──────────────┘
       ▲                  ▲                 ▲
       │                  │                 │
       └─────── Database Queries ─────────┘
       │                                     │
       └─────────── API Calls ──────────────┘
```

---

## 🔑 Important URLs & Credentials

| Component | URL | Credentials |
|-----------|-----|-------------|
| **Frontend** | http://localhost:5173 | demo@gmail.com / 12345 |
| **Backend** | http://localhost:8080/api | JWT Token required |
| **Database** | localhost:3306 | root / sql205071 |
| **Health Check** | http://localhost:8080/actuator/health | No auth needed |

---

## 🧪 Test All Features

Once logged in, test these features:

### 1. Food Delivery
- Navigate to "Food" section
- Should load restaurant list from database
- Can add items to cart

### 2. Grocery Shopping
- Navigate to "Grocery" section
- Should load store list
- Can add items to cart

### 3. Pharmacy
- Navigate to "Pharmacy" section
- Should load pharmacies
- Can add medicines to cart

### 4. Orders
- Add items to cart from any service
- Go to "Orders" or "Checkout"
- Should show items and total

### 5. Track Delivery
- After placing order, should show tracking
- Real-time courier location updates

---

## 🐛 Troubleshooting

### Problem: "Port 8080 already in use"
**Solution:**
```bash
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID)
taskkill /PID <PID_NUMBER> /F

# Or use different port:
# Edit: d:\springboot\start-app\start-app\src\main\resources\application.properties
# Change: server.port=8080 to server.port=8081
```

### Problem: "Cannot connect to database"
**Solution:**
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# If fails, start MySQL (Windows):
net start MySQL80

# Verify credentials in application.properties match:
spring.datasource.username=root
spring.datasource.password=sql205071
```

### Problem: Frontend shows "Failed to fetch from /api"
**Solution:**
1. Check backend is running: `curl http://localhost:8080/actuator/health`
2. Clear browser cache: F12 → Storage → Clear All
3. Check Vite proxy config: `vite.config.js` should have `/api` proxy to `http://localhost:8080`

### Problem: "Invalid or expired token"
**Solution:**
1. Clear localStorage: F12 → Storage → LocalStorage → Clear All
2. Close and reopen browser
3. Login again: `demo@gmail.com` / `12345`
4. Should get new JWT token

### Problem: Database password error
**Solution:**
```bash
# Change MySQL root password back to sql205071 (or change in application.properties)
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'sql205071';
EXIT;
```

---

## 🔧 Advanced Configuration

### Change Database Credentials
1. Update MySQL password: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';`
2. Update backend: `d:\springboot\start-app\start-app\src\main\resources\application.properties`
   - `spring.datasource.password=newpassword`

### Change Backend Port
1. Edit: `d:\springboot\start-app\start-app\src\main\resources\application.properties`
2. Change: `server.port=8080` to `server.port=8081`
3. Update frontend proxy in: `vite.config.js` (change target to `8081`)

### Change JWT Secret (for Production)
1. Edit: `d:\springboot\start-app\start-app\src\main\resources\application.properties`
2. Change: `jwt.secret=your-new-secret-key-at-least-32-characters-long`
3. Restart backend

### Add Razorpay Payment Support
1. Get API keys from https://razorpay.com
2. Edit: `d:\springboot\start-app\start-app\src\main\resources\application.properties`
3. Add:
   ```properties
   razorpay.key.id=your_key_id
   razorpay.key.secret=your_key_secret
   ```

### Enable AI Features
1. Edit: `d:\springboot\start-app\start-app\src\main\resources\application.properties`
2. For Ollama (local):
   ```properties
   ai.provider=ollama
   ollama.api.url=http://localhost:11434/api/generate
   ollama.model=llama3.2
   ```
3. For Gemini (cloud):
   ```properties
   ai.provider=gemini
   gemini.api.key=your_api_key
   ```

---

## 📁 Project Structure

```
Your Project Layout:
├── Backend (d:\springboot\start-app\start-app)
│   ├── pom.xml (Maven dependencies)
│   ├── src/main/java (Java code)
│   └── src/main/resources (Configuration)
│
├── Frontend (C:\Users\veera vadivelan\OneDrive\Desktop\react)
│   ├── package.json (NPM dependencies)
│   ├── vite.config.js (Build config)
│   └── my-react-app/src (React code)
│
└── Database (D:\anywhere)
    └── *.sql (Database schemas)
```

---

## 📝 File Locations Reference

| What | Location |
|------|----------|
| Backend code | `d:\springboot\start-app\start-app\src\main\java` |
| Backend config | `d:\springboot\start-app\start-app\src\main\resources\application.properties` |
| Frontend code | `C:\Users\veera vadivelan\OneDrive\Desktop\react\my-react-app\src` |
| Frontend config | `C:\Users\veera vadivelan\OneDrive\Desktop\react\.env` |
| Database scripts | `D:\anywhere\*.sql` |
| Start scripts | Various `.bat` files in each folder |

---

## 🎯 Typical Development Workflow

### Daily Development
1. **Morning:** Run `RUN_ALL.bat` (starts everything)
2. **During day:** Edit code in IDE, changes auto-reload
3. **Testing:** Use http://localhost:5173 in browser
4. **Debugging:** Use DevTools (F12) for frontend, console for backend
5. **Evening:** Close terminal windows (Ctrl+C)

### After code changes:
- **Backend changes:** Manually restart backend (Ctrl+C and run again)
- **Frontend changes:** Auto-reload in browser (5173)
- **Database changes:** Restart backend to recognize new schema

---

## 🚀 Next Steps

Once everything is running smoothly:

1. **Explore Features**
   - Test food, grocery, pharmacy ordering
   - Try cart and checkout flow
   - Check delivery tracking

2. **Add Test Data**
   - Add sample restaurants/stores to database
   - Create test orders
   - Test payment flows

3. **Customize**
   - Update company name/logo in frontend
   - Adjust colors and styling
   - Add your branding

4. **Integrate External Services**
   - Razorpay (payments)
   - Ollama/Gemini (AI features)
   - Google Maps (location services)

5. **Deploy**
   - Build frontend: `npm run build`
   - Build backend: `mvn clean package`
   - Deploy to server

---

## 📞 Getting Help

### If Something Doesn't Work
1. **Check logs:** Look at terminal output for error messages
2. **Use Test Script:** Run `TEST_INTEGRATION.ps1` to verify all components
3. **Check Documentation:** See detailed guides:
   - Backend: `BACKEND_STRUCTURE.md`
   - Frontend: `FRONTEND_STRUCTURE.md`
   - Database: `DATABASE_STRUCTURE.md`
   - Integration: `INTEGRATION_SETUP.md`

### Common Issues
- **Port conflicts:** Kill process using the port, then restart
- **Database errors:** Make sure MySQL is running and credentials match
- **CORS errors:** Make sure backend CORS is configured for localhost
- **JWT errors:** Clear localStorage and login again

---

## ✨ You're All Set!

Your complete Backend + Frontend + Database system is ready to use!

**Quick checklist before you start:**
- [ ] MySQL is running
- [ ] You've run the database setup script
- [ ] Java 11+ is installed
- [ ] Maven is installed
- [ ] Node.js 14+ is installed
- [ ] You're in the right directories

**Let's go!** 🎉

```
1. Run: RUN_ALL.bat
2. Wait for browser to open
3. Login with: demo@gmail.com / 12345
4. Start exploring and building!
```

---

## 📚 Additional Resources

- **Backend docs:** See `BACKEND_STRUCTURE.md` in backend folder
- **Frontend docs:** See `FRONTEND_STRUCTURE.md` in frontend folder
- **Database docs:** See `DATABASE_STRUCTURE.md` in database folder
- **API endpoints:** Available at `http://localhost:8080/actuator/health` (basic) or check controllers
- **Test data:** Database includes demo user and 27 districts with sample areas

---

Happy coding! 🚀
