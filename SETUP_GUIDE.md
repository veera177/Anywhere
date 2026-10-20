# Complete Setup Guide - Multi-Service Delivery Platform

A step-by-step guide to set up and run the complete application with Backend, Frontend, and Database.

---

## Prerequisites

Make sure you have installed:
- **Java 11+** and Maven
- **Node.js 14+** and npm
- **MySQL 5.7+** or **MariaDB**
- **Git** (for version control)

---

## Step-by-Step Setup

### PHASE 1: DATABASE SETUP ⚙️

#### 1.1 Create Database

Open MySQL command line:
```bash
mysql -u root -p
```

Create database:
```sql
CREATE DATABASE startapp_db;
USE startapp_db;
```

#### 1.2 Run SQL Scripts

Execute all SQL files from `D:\anywhere` in this order:

```bash
cd D:\anywhere

# Core user and address data
mysql -u root -p startapp_db < user-profile.sql
mysql -u root -p startapp_db < address-management.sql
mysql -u root -p startapp_db < address-locations.sql

# Service specific tables
mysql -u root -p startapp_db < fooddelivery.sql
mysql -u root -p startapp_db < grocery_store.sql
mysql -u root -p startapp_db < pharmacy.sql
mysql -u root -p startapp_db < prescription-verification.sql

# Order and Payment
mysql -u root -p startapp_db < cart.sql
mysql -u root -p startapp_db < orderitems.sql
mysql -u root -p startapp_db < payment.sql

# Delivery and Logistics
mysql -u root -p startapp_db < delivery-fee-settings.sql
mysql -u root -p startapp_db < courier-tracking.sql
mysql -u root -p startapp_db < district-areas.sql

# Seed/Sample Data (Optional - for testing)
mysql -u root -p startapp_db < seed_3_stores.sql
mysql -u root -p startapp_db < seed_new_districts.sql
```

#### 1.3 Verify Database

Verify all tables are created:
```bash
mysql -u root -p startapp_db
SHOW TABLES;
```

You should see tables like: users, restaurants, food_products, carts, orders, etc.

---

### PHASE 2: BACKEND SETUP 🔧

#### 2.1 Open Backend Folder

```bash
cd d:\springboot\start-app\start-app
```

#### 2.2 Configure Database Connection

Edit `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/startapp_db
spring.datasource.username=root
spring.datasource.password=your_mysql_password

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Logging
logging.level.root=INFO
logging.level.com.app.start_app=DEBUG

# Application Name
spring.application.name=start-app
```

**Replace:**
- `your_mysql_password` with your actual MySQL root password

#### 2.3 Update Other Configurations (if needed)

If using external AI services, update configuration:
- Gemini API Key → Set in environment or config
- Ollama endpoint → `http://localhost:11434` (if running locally)

#### 2.4 Build Backend

```bash
mvn clean install
```

This will download all dependencies. Takes 2-5 minutes first time.

#### 2.5 Run Backend

```bash
mvn spring-boot:run
```

**Expected Output:**
```
Started StartAppApplication in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

**Backend is now running on:** `http://localhost:8080`

**Verify Backend:**
```bash
# Test health check
curl http://localhost:8080/actuator/health
```

---

### PHASE 3: FRONTEND SETUP 🎨

#### 3.1 Open Frontend Folder

```bash
cd C:\Users\veera vadivelan\OneDrive\Desktop
```

#### 3.2 Create Environment Configuration

Create `.env` file:

```
# Backend API Configuration
REACT_APP_API_URL=http://localhost:8080/api

# Optional: External APIs
REACT_APP_GEMINI_KEY=your_gemini_api_key_here
REACT_APP_OLLAMA_URL=http://localhost:11434
```

**Note:** If you don't have API keys, the app will work with limited functionality.

#### 3.3 Install Dependencies

```bash
npm install
```

This downloads all React dependencies. Takes 1-3 minutes.

#### 3.4 Start Development Server

```bash
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view the application in the browser.
Local: http://localhost:3000
```

**Frontend is now running on:** `http://localhost:3000`

The browser should automatically open. If not, navigate to `http://localhost:3000`

---

## Verification Checklist ✅

### Database is Running
- [ ] MySQL is running and accessible
- [ ] Database `startapp_db` exists
- [ ] All SQL tables are created
- [ ] Sample data is seeded (if you ran seed scripts)

**Verify:**
```bash
mysql -u root -p startapp_db
SHOW TABLES;
```

### Backend is Running
- [ ] Backend server is running on `http://localhost:8080`
- [ ] Database connection is successful
- [ ] No connection errors in console

**Verify:**
```bash
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}
```

### Frontend is Running
- [ ] Frontend server is running on `http://localhost:3000`
- [ ] Browser opens and shows the application
- [ ] API calls are connecting to backend

**Verify:**
- Open Chrome DevTools (F12)
- Go to Network tab
- Interact with the app
- You should see API calls to `http://localhost:8080/api/...`

---

## Testing the Connection

### Test 1: Check Backend Health

```bash
curl http://localhost:8080/actuator/health
```

**Expected Response:**
```json
{"status":"UP"}
```

### Test 2: Test API Endpoint

```bash
# Get all restaurants (if food service is available)
curl http://localhost:8080/api/restaurants
```

**Expected Response:** JSON array of restaurants or empty array

### Test 3: Open Frontend in Browser

- Navigate to `http://localhost:3000`
- Check browser console (F12) for any errors
- Try clicking on a feature (e.g., Food, Grocery)
- Should load data from backend

---

## Common Issues & Solutions

### Issue: Backend won't start - "Port 8080 already in use"

**Solution:**
```bash
# Find process using port 8080 (Windows)
netstat -ano | findstr :8080

# Kill the process
taskkill /PID <PID_NUMBER> /F

# Or change backend port in application.properties
server.port=8081
```

### Issue: Database connection failed

**Solution:**
```bash
# Check MySQL is running
net start MySQL80  # (Windows)

# Verify credentials in application.properties
# Test connection
mysql -u root -p -h localhost -D startapp_db
```

### Issue: Frontend shows "Cannot GET /api/..."

**Solution:**
- Check backend is running on `http://localhost:8080`
- Check `.env` file has correct `REACT_APP_API_URL`
- Check browser console for CORS errors
- Restart both frontend and backend

### Issue: npm install takes too long

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install

# Or use yarn (faster)
npm install -g yarn
yarn install
```

---

## Running Each Component Separately

If you need to restart individual components:

### Restart Database
```bash
# Windows - Stop MySQL
net stop MySQL80

# Windows - Start MySQL
net start MySQL80
```

### Restart Backend
```bash
cd d:\springboot\start-app\start-app
mvn spring-boot:run
```

### Restart Frontend
```bash
cd C:\Users\veera vadivelan\OneDrive\Desktop
npm start
```

---

## Development Workflow

### Daily Development

1. **Start services in order:**
   ```bash
   # Terminal 1: Backend
   cd d:\springboot\start-app\start-app
   mvn spring-boot:run

   # Terminal 2: Frontend
   cd C:\Users\veera vadivelan\OneDrive\Desktop
   npm start

   # Database: Should already be running
   ```

2. **Make changes:**
   - Backend changes auto-reload (sometimes need restart)
   - Frontend changes auto-reload in browser

3. **Test changes:**
   - Frontend: Browser automatically refreshes
   - Backend: Check console for errors
   - Database: Use MySQL Workbench or CLI

### Deployment

1. **Build Backend:**
   ```bash
   cd d:\springboot\start-app\start-app
   mvn clean package
   # Creates: target/start-app-1.0.jar
   ```

2. **Build Frontend:**
   ```bash
   cd C:\Users\veera vadivelan\OneDrive\Desktop
   npm run build
   # Creates: build/ folder
   ```

3. **Deploy:**
   - Upload JAR file to server
   - Upload build/ to web server
   - Configure environment variables on server

---

## Troubleshooting Commands

### Check Port Status
```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :3000
```

### Clear Cache/Rebuild
```bash
# Backend
cd d:\springboot\start-app\start-app
mvn clean install

# Frontend
cd C:\Users\veera vadivelan\OneDrive\Desktop
rm -r node_modules package-lock.json
npm install
```

### Check Logs
```bash
# Backend logs
# Check console output for errors

# Frontend logs
# Open browser DevTools (F12) → Console tab
```

### Test API Manually
```bash
# Using curl
curl -X GET http://localhost:8080/api/restaurants
curl -X GET http://localhost:8080/api/grocery/stores
curl -X GET http://localhost:8080/api/pharmacy/medicines
```

---

## Next Steps

Once everything is running:

1. **Explore the Application:**
   - Try food delivery
   - Try grocery shopping
   - Try pharmacy/medicine shopping
   - Test order and payment flow

2. **Make Changes:**
   - Frontend: Edit files in `src/`
   - Backend: Edit Java files
   - Database: Edit SQL files

3. **Test Changes:**
   - Use browser DevTools
   - Use API testing tool like Postman
   - Use MySQL Workbench

4. **Monitor:**
   - Watch backend console for errors
   - Check browser console for frontend errors
   - Monitor database for slow queries

---

## Need Help?

- **Backend Issues:** Check `BACKEND_STRUCTURE.md`
- **Frontend Issues:** Check `FRONTEND_STRUCTURE.md`
- **Database Issues:** Check `DATABASE_STRUCTURE.md`
- **Project Overview:** Check `PROJECT_OVERVIEW.md`

---

## Quick Reference

| Component | Location | Port | Status |
|-----------|----------|------|--------|
| Database | D:\anywhere | 3306 | MySQL |
| Backend | d:\springboot\start-app\start-app | 8080 | Spring Boot |
| Frontend | C:\Users\veera vadivelan\OneDrive\Desktop | 3000 | React |

All systems ready? You're all set! 🚀
