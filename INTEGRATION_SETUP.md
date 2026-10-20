# Complete Integration Setup Guide

**Make Backend, Frontend & Database Work Together Smoothly**

---

## 🎯 Quick Start (5 Minutes)

### Prerequisites Check
```powershell
# Check Java is installed
java -version  # Should be 11+

# Check Maven is installed
mvn -version

# Check Node.js is installed
node -version  # Should be 14+
npm -version

# Check MySQL is running
# Windows: Services → Look for MySQL80 (or your version)
# Or run: mysql -u root -p -e "SELECT 1;"
```

### Step 1: Initialize Database (2 minutes)
```bash
cd D:\anywhere

# Run complete database setup
mysql -u root -p < SETUP_DATABASE.sql

# Verify
mysql -u root -p anywhere -e "SHOW TABLES;"
# Should show 27 tables
```

### Step 2: Start Backend (2 minutes)
```bash
cd d:\springboot\start-app\start-app

# Start Spring Boot server
mvn spring-boot:run

# Wait for: "Started StartAppApplication in X.XXX seconds"
# Server runs on http://localhost:8080
```

### Step 3: Start Frontend (1 minute)
```bash
cd C:\Users\veera vadivelan\OneDrive\Desktop\react

# Install if first time
npm install

# Start React dev server
npm run dev

# Wait for: "Local: http://localhost:5173"
# Open browser to http://localhost:5173
```

---

## ✅ Verification Checklist

After all 3 are running:

### 1. Backend Health Check
```bash
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}
```

### 2. Frontend Loads
- Open http://localhost:5173 in browser
- Should see the app interface (no errors in console)

### 3. Test Login
**Test Credentials:**
- Email: `demo@gmail.com`
- Password: `12345`

**Steps:**
1. Click "Login" button
2. Enter email & password
3. Click "Submit"
4. Should get redirected to dashboard with JWT token in localStorage

**Verify Token:**
- Open DevTools (F12)
- Console → `localStorage.getItem('token')`
- Should see a JWT token string (format: `xxx.yyy.zzz`)

### 4. Test API Call
**In DevTools Console:**
```javascript
// Check if backend is responding
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'demo@gmail.com', 
    password: '12345' 
  })
})
.then(r => r.json())
.then(d => console.log(d))
// Should get back JWT token in response
```

---

## 🔧 Detailed Configuration

### Backend Configuration

**File:** `d:\springboot\start-app\start-app\src\main\resources\application.properties`

Current settings:
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/anywhere
spring.datasource.username=root
spring.datasource.password=sql205071

# JWT
jwt.secret=your-secret-key-change-in-production-env-variable
jwt.expiration.ms=86400000  # 24 hours

# Server
server.port=8080
```

**For Production, Change:**
```properties
# Add strong JWT secret (min 32 chars)
jwt.secret=your-very-long-random-secret-key-at-least-32-characters-long

# Add Razorpay if using payments
razorpay.key.id=YOUR_RAZORPAY_KEY_ID
razorpay.key.secret=YOUR_RAZORPAY_SECRET

# Add AI provider config if using
ai.provider=ollama  # or "gemini"
ollama.api.url=http://localhost:11434/api/generate
ollama.model=llama3.2
gemini.api.key=YOUR_GEMINI_API_KEY
```

### Frontend Configuration

**File:** `C:\Users\veera vadivelan\OneDrive\Desktop\react\.env`

Create if doesn't exist:
```
VITE_API_URL=http://localhost:8080/api
VITE_API_STAGING_URL=https://staging-api.example.com
VITE_API_PROD_URL=https://api.example.com
```

**Vite automatically uses proxy** configured in `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path
  }
}
```

### Database Configuration

**File:** `D:\anywhere\SETUP_DATABASE.sql`

Default test data:
- **Test User:** demo@gmail.com / 12345
- **Test Districts:** 27 Tamil Nadu districts (Chennai, Coimbatore, Madurai, etc.)
- **Empty Tables:** food_stores, grocery_stores, pharmacies (ready for data)

---

## 🚀 Running Components (3 Terminal Windows)

### Terminal 1: Backend
```bash
cd d:\springboot\start-app\start-app
mvn spring-boot:run

# Should see:
# Tomcat started on port(s): 8080 (http)
# Started StartAppApplication in X.XXX seconds

# Keep this running!
```

### Terminal 2: Frontend
```bash
cd C:\Users\veera vadivelan\OneDrive\Desktop\react
npm run dev

# Should see:
# Local: http://localhost:5173
# Press 'q' to quit, 'r' to restart, 'o' to open in browser

# Keep this running!
```

### Terminal 3: Testing/Admin
```bash
# Use for running commands, testing APIs, checking logs, etc.
# Available for manual testing

# Test APIs:
curl http://localhost:8080/actuator/health
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"demo@gmail.com","password":"12345"}'
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ User Browser                                                     │
│ http://localhost:5173                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/WebSocket
                         │ (Auto-includes JWT Token)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ React Frontend (Vite Dev Server)                                 │
│ C:\Users\...\OneDrive\Desktop\react                             │
│ ├── HTTP Client (apiClient.js)                                   │
│ ├── Retry Logic (3 attempts, exponential backoff)               │
│ ├── JWT Token Management (localStorage)                          │
│ └── Error Logging (sessionStorage)                               │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP (Proxied via Vite)
                         │ /api → http://localhost:8080
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Spring Boot Backend                                              │
│ d:\springboot\start-app\start-app:8080                           │
│ ├── CORS Filter (allows localhost:*)                             │
│ ├── JWT Authentication Filter (validates token)                  │
│ ├── Security Config (route protection)                           │
│ ├── Controllers (Food, Grocery, Medicine, Order, etc.)          │
│ └── Business Logic (Services)                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │ SQL Queries
                         │ (Parameterized - SQL Injection Safe)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ MySQL Database                                                   │
│ localhost:3306/anywhere                                          │
│ ├── 27 Tables (users, orders, food_stores, etc.)                │
│ ├── 27 Districts + Areas (lat/long coordinates)                 │
│ ├── Test User (demo@gmail.com)                                  │
│ └── Foreign Key Relationships (referential integrity)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
1. User enters email/password in frontend
   ↓
2. Frontend sends POST /api/auth/login
   ├─ Includes: { email, password } as JSON
   └─ No token yet (first request)
   ↓
3. Backend receives request
   ├─ Route is public (permitAll in SecurityConfig)
   ├─ No JWT filter applied
   └─ Proceeds to AuthController
   ↓
4. Backend validates credentials
   ├─ Queries users table
   ├─ Compares password (BCrypt hash if needed)
   └─ Returns JWT token if valid, 401 if invalid
   ↓
5. Frontend receives JWT token
   ├─ Stores in localStorage['token']
   ├─ Stores user info in localStorage['user']
   └─ Redirects to dashboard
   ↓
6. Subsequent requests include JWT
   ├─ Frontend: Authorization: Bearer {token}
   ├─ Backend JwtAuthenticationFilter validates
   ├─ Stores userId, email, role in request attributes
   └─ Controller can access via request.getAttribute("userId")
   ↓
7. If token expires or invalid
   ├─ Backend returns 401 Unauthorized
   ├─ Frontend catches 401
   ├─ Clears localStorage
   └─ Redirects to login page
```

---

## 🧪 Testing All Services

### Test 1: Register New User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@gmail.com",
    "phone": "9876543210",
    "password": "secure123"
  }'

# Response should include JWT token
```

### Test 2: Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@gmail.com",
    "password": "12345"
  }'

# Response: { "token": "eyJhbGc..." }
```

### Test 3: Get User Profile (Protected)
```bash
TOKEN="your-jwt-token-from-login"
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# Response should include user details
```

### Test 4: Get Food Stores (Protected)
```bash
TOKEN="your-jwt-token-from-login"
curl -X GET http://localhost:8080/api/restaurants \
  -H "Authorization: Bearer $TOKEN"

# Response should be JSON array of restaurants
```

### Test 5: Get Districts (Protected)
```bash
TOKEN="your-jwt-token-from-login"
curl -X GET http://localhost:8080/api/areas/suggestions?searchTerm=salem \
  -H "Authorization: Bearer $TOKEN"

# Response should include Salem and related areas
```

---

## ⚠️ Troubleshooting

### Issue: Backend won't start - "Port 8080 already in use"
**Solution:**
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill it
taskkill /PID <PID_NUMBER> /F

# Or use different port
# Edit application.properties: server.port=8081
```

### Issue: "Cannot connect to database"
**Solution:**
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check credentials in application.properties
spring.datasource.username=root
spring.datasource.password=sql205071  # Change if different

# Check database exists
mysql -u root -p -e "SHOW DATABASES;" | grep anywhere
```

### Issue: Frontend shows "Failed to fetch from /api"
**Solution:**
```bash
# Check backend is running
curl http://localhost:8080/actuator/health

# Check Vite proxy config
# File: vite.config.js should have:
# proxy: { '/api': { target: 'http://localhost:8080' } }

# Clear browser cache
# Press F12 → Storage → LocalStorage → Clear All
```

### Issue: "Invalid or expired token" on protected routes
**Solution:**
```bash
# Check token in DevTools
console: localStorage.getItem('token')

# If missing, login again to get new token

# Check JWT expiration (default 24 hours)
# Can extend in application.properties: jwt.expiration.ms

# Check clock skew between frontend/backend
# Sync system time
```

### Issue: CORS errors in browser console
**Solution:**
```bash
# CORS should be automatically configured for localhost
# If still failing, check SecurityConfig.java

// Should allow localhost origins:
config.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:*",
    "http://127.0.0.1:*"
));

// If deploying to production, add your domain:
// "https://yourdomain.com"
```

### Issue: Database shows "Access denied for user 'root'"
**Solution:**
```bash
# Reset MySQL root password (Windows)
# Stop MySQL
net stop MySQL80

# Start with skip-grant-tables
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --skip-grant-tables

# In new terminal, reset password
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'sql205071';
EXIT;

# Restart MySQL normally
net stop MySQL80
net start MySQL80
```

---

## 📈 Performance Monitoring

### Backend Performance
```bash
# Check active connections
curl http://localhost:8080/actuator/health

# Check metrics (if Micrometer enabled)
curl http://localhost:8080/actuator/metrics

# Check logs
# File: d:\springboot\start-app\start-app\logs\application.log
```

### Frontend Performance
```javascript
// In DevTools Console
// Check network requests
console.log(localStorage.getItem('anywhere.errorLog'))

// Check storage usage
console.log(localStorage.length)
console.log(sessionStorage.length)
```

### Database Performance
```sql
-- Check slow queries
SELECT * FROM mysql.slow_log LIMIT 10;

-- Check table sizes
SELECT table_name, round(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'anywhere'
ORDER BY size_mb DESC;

-- Check active connections
SHOW PROCESSLIST;
```

---

## 🔄 Development Workflow

### Making Backend Changes
1. Edit Java file in `d:\springboot\start-app\start-app\src\`
2. Spring Boot detects change
3. Maven recompiles (may need manual restart)
4. Test via curl or frontend

### Making Frontend Changes
1. Edit file in `C:\Users\veera vadivelan\OneDrive\Desktop\react\`
2. Vite detects change
3. Page auto-refreshes in browser
4. Check DevTools console for errors

### Making Database Changes
1. Edit SQL file in `D:\anywhere\`
2. Restart database or run queries manually
3. Backend auto-detects schema changes (hibernate.ddl-auto=update)
4. Test via API calls

---

## 📝 Important Notes

1. **JWT Secret:** Change for production! Current key is for development only.
2. **Database Credentials:** Change password! Current credentials are for development only.
3. **CORS:** Configured for localhost only. Add your domain before production deployment.
4. **Token Expiration:** Set to 24 hours. Consider refresh tokens for longer sessions.
5. **localStorage:** Tokens stored here are vulnerable to XSS. Use HttpOnly cookies for production.

---

## 🎉 You're Done!

Your Backend, Frontend, and Database are now fully integrated and running together!

**Next Steps:**
- Test all features (Food, Grocery, Medicine ordering)
- Add sample data to stores
- Configure payment/AI providers
- Deploy to production

**For help:**
- Backend issues: Check `BACKEND_STRUCTURE.md`
- Frontend issues: Check `FRONTEND_STRUCTURE.md`
- Database issues: Check `DATABASE_STRUCTURE.md`

Happy coding! 🚀
