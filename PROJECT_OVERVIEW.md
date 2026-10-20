# Multi-Service Delivery Platform - Project Overview

A comprehensive full-stack application for managing food delivery, grocery shopping, and pharmacy services in one platform.

## 📁 Project Locations

Your project is organized across **3 separate folders** for better organization:

### 1. **BACKEND** (Java Spring Boot)
📂 Location: `d:\springboot\start-app\start-app`

Contains all backend services:
- REST APIs for all features
- Business logic & database operations
- Authentication & security
- Integration with external services (Gemini, Ollama)

**Services in Backend:**
- `ai/` - AI integration
- `food/` - Food delivery
- `grocery/` - Grocery shopping
- `medicine/` - Pharmacy services
- `order/` - Order management
- `payment/` - Payment processing
- `courier/` - Delivery tracking
- `user/` - User management

**How to Run:**
```bash
cd d:\springboot\start-app\start-app
mvn spring-boot:run
```
Backend will run on: `http://localhost:8080`

---

### 2. **FRONTEND** (React)
📂 Location: `C:\Users\veera vadivelan\OneDrive\Desktop`

Contains all React UI components:
- User interface for all features
- Service API integration
- State management
- Responsive design

**Services in Frontend:**
- `src/services/` - API calls to backend
- `src/pages/` - Feature pages
- `src/components/` - Reusable components
- `src/context/` - State management
- `src/hooks/` - Custom React hooks

**How to Run:**
```bash
cd C:\Users\veera vadivelan\OneDrive\Desktop
npm install
npm start
```
Frontend will run on: `http://localhost:3000`

---

### 3. **DATABASE** (SQL Scripts)
📂 Location: `D:\anywhere`

Contains all database schemas & initialization scripts:
- User profiles & authentication
- Food delivery tables
- Grocery store data
- Pharmacy & prescriptions
- Orders & payments
- Courier tracking
- Seed data for testing

**Key Files:**
- `user-profile.sql` - User tables
- `fooddelivery.sql` - Food service tables
- `grocery_store.sql` - Grocery service tables
- `pharmacy.sql` - Pharmacy service tables
- `payment.sql` - Payment tables
- `courier-tracking.sql` - Delivery tracking tables
- `seed_3_stores.sql` - Sample data

**How to Setup:**
```bash
mysql -u root -p startapp_db < user-profile.sql
mysql -u root -p startapp_db < fooddelivery.sql
mysql -u root -p startapp_db < grocery_store.sql
mysql -u root -p startapp_db < pharmacy.sql
mysql -u root -p startapp_db < payment.sql
mysql -u root -p startapp_db < courier-tracking.sql
mysql -u root -p startapp_db < district-areas.sql
mysql -u root -p startapp_db < seed_3_stores.sql
```

---

## 🔗 How They Connect

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React)                            │
│  C:\Users\veera vadivelan\OneDrive\Desktop              │
│  - Pages & Components                                    │
│  - User Interface                                        │
│  - HTTP Requests to Backend                             │
└────────────────────┬────────────────────────────────────┘
                     │ API Calls (http://localhost:8080)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Spring Boot)                       │
│  d:\springboot\start-app\start-app                      │
│  - REST APIs                                             │
│  - Business Logic                                        │
│  - Database Operations                                   │
└────────────────────┬────────────────────────────────────┘
                     │ SQL Queries
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (MySQL)                            │
│  D:\anywhere                                             │
│  - SQL Schemas                                           │
│  - Data Tables                                           │
│  - Seed Data                                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Quick Start Guide

### Step 1: Setup Database
```bash
# Create database
mysql -u root -p
CREATE DATABASE startapp_db;
USE startapp_db;

# Run all SQL scripts from D:\anywhere
mysql -u root -p startapp_db < D:\anywhere\user-profile.sql
mysql -u root -p startapp_db < D:\anywhere\fooddelivery.sql
mysql -u root -p startapp_db < D:\anywhere\grocery_store.sql
mysql -u root -p startapp_db < D:\anywhere\pharmacy.sql
mysql -u root -p startapp_db < D:\anywhere\payment.sql
mysql -u root -p startapp_db < D:\anywhere\courier-tracking.sql
mysql -u root -p startapp_db < D:\anywhere\district-areas.sql
```

### Step 2: Configure Backend
```bash
cd d:\springboot\start-app\start-app

# Update application.properties with database credentials
# Check: src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/startapp_db
spring.datasource.username=root
spring.datasource.password=your_password

# Start backend
mvn spring-boot:run
```
Backend ready on: `http://localhost:8080`

### Step 3: Configure & Run Frontend
```bash
cd C:\Users\veera vadivelan\OneDrive\Desktop

# Create .env file
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GEMINI_KEY=your_gemini_api_key

# Install & start
npm install
npm start
```
Frontend ready on: `http://localhost:3000`

---

## 🏗️ Architecture Overview

### Backend Services (Java)
| Service | Purpose | Database Tables |
|---------|---------|-----------------|
| **Food** | Food delivery & restaurants | restaurants, food_products |
| **Grocery** | Grocery store management | grocery_stores, grocery_products |
| **Pharmacy** | Pharmacy & prescriptions | pharmacies, medicines, prescriptions |
| **Order** | Order processing | orders, order_items |
| **Payment** | Payment handling | payments |
| **Courier** | Delivery tracking | couriers, routes |
| **User** | User management | users, addresses |
| **Cart** | Shopping cart | carts, cart_items |
| **AI** | Gemini/Ollama integration | - |
| **Delivery** | Fee calculation | delivery_fees, districts |

### Frontend Pages (React)
| Page | Service | Purpose |
|------|---------|---------|
| **Home** | All services | Dashboard & navigation |
| **Restaurant** | Food | Browse & order food |
| **Grocery** | Grocery | Shop groceries |
| **Pharmacy** | Medicine | Buy medicines |
| **Cart** | Cart | Review & manage items |
| **Order** | Order | Track orders |
| **Payment** | Payment | Checkout |
| **Tracking** | Courier | Real-time delivery tracking |
| **User** | User | Profile management |

---

## 🔐 Security Notes

- Backend handles all authentication via JWT tokens
- Database credentials should be in `.env` or `application.properties`
- Frontend communicates only through HTTPS/API
- Sensitive data never stored in frontend

---

## 📚 Documentation Links

- **Backend Structure**: See `BACKEND_STRUCTURE.md` in backend folder
- **Frontend Structure**: See `FRONTEND_STRUCTURE.md` in frontend folder
- **Database Structure**: See `DATABASE_STRUCTURE.md` in database folder

---

## 🚀 Development Workflow

1. **Database Changes**: Update SQL files in `D:\anywhere/`
2. **Backend Changes**: Update Java services in `d:\springboot\start-app\start-app/`
3. **Frontend Changes**: Update React components in `C:\Users\veera vadivelan\OneDrive\Desktop/`
4. **Test**: Use Postman for API testing or browser dev tools for frontend

---

## ❓ Common Commands

### Backend (Spring Boot)
```bash
# Start development server
mvn spring-boot:run

# Build jar file
mvn clean package

# Run tests
mvn test
```

### Frontend (React)
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Database (MySQL)
```bash
# Connect to MySQL
mysql -u root -p

# Select database
USE startapp_db;

# View tables
SHOW TABLES;

# Backup database
mysqldump -u root -p startapp_db > backup.sql

# Restore database
mysql -u root -p startapp_db < backup.sql
```

---

## 📞 Support

For issues or questions about the project structure, refer to the specific structure files:
- Backend issues → `BACKEND_STRUCTURE.md`
- Frontend issues → `FRONTEND_STRUCTURE.md`
- Database issues → `DATABASE_STRUCTURE.md`
