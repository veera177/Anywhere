# Backend Folder Structure

This is the **Backend (Java Spring Boot)** folder for the multi-service delivery application.

## Project Structure

```
d:\springboot\start-app\start-app/
├── src/main/java/com/app/start_app/
│   ├── ai/                          # AI Services (Gemini, Ollama)
│   ├── area/                        # Area & District Management
│   ├── cart/                        # Shopping Cart Services
│   ├── config/                      # Security & App Configuration
│   ├── courier/                     # Courier Tracking
│   ├── delivery/                    # Delivery Fee Calculation
│   ├── food/                        # Food/Restaurant Services
│   ├── grocery/                     # Grocery Store Services
│   ├── medicine/                    # Medicine/Pharmacy Services
│   ├── order/                       # Order Management
│   ├── payment/                     # Payment Services
│   ├── platform/                    # Platform Configuration
│   ├── prescription/                # Prescription Management
│   ├── security/                    # Authentication & Security
│   ├── service/                     # Business Logic Services
│   ├── settlement/                  # Settlement Services
│   ├── user/                        # User Profile Management
│   └── StartAppApplication.java     # Main Application Entry Point
│
├── database/                        # Database Scripts (moved to D:\anywhere)
├── pom.xml                          # Maven Dependencies
├── mvnw / mvnw.cmd                  # Maven Wrapper
└── README.md                        # Documentation
```

## Services Overview

| Service | Path | Purpose |
|---------|------|---------|
| **AI** | `ai/` | Gemini & Ollama integration for intelligent features |
| **Area** | `area/` | District and location management |
| **Cart** | `cart/` | Shopping cart functionality |
| **Courier** | `courier/` | Real-time courier tracking |
| **Delivery** | `delivery/` | Delivery fee calculation & distance computation |
| **Food** | `food/` | Food delivery & restaurant management |
| **Grocery** | `grocery/` | Grocery store & product management |
| **Medicine** | `medicine/` | Pharmacy & medicine management |
| **Order** | `order/` | Order processing & management |
| **Payment** | `payment/` | Payment gateway integration |
| **Prescription** | `prescription/` | Prescription verification |
| **User** | `user/` | User profile & management |

## Setup Instructions

1. **Install Java & Maven**: Ensure Java 11+ and Maven are installed
2. **Run Application**:
   ```bash
   mvn spring-boot:run
   ```
3. **Build Project**:
   ```bash
   mvn clean package
   ```

## Database
- Database scripts are located in `D:\anywhere`
- See Database folder structure for SQL schemas

## Frontend
- React frontend is located in `C:\Users\veera vadivelan\OneDrive\Desktop`
- See Frontend folder structure for UI components
