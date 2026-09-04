# 🛒 NoviCart — Full-Stack E-Commerce Application

NoviCart is a full-stack e-commerce web application built with **React.js, FastAPI, Python, SQLAlchemy, and PostgreSQL**.

The application provides a complete shopping workflow including user authentication, product browsing, cart management, checkout, order history, and an admin dashboard.

The project has been **deployed and tested end-to-end** using **Amazon S3, AWS EC2, Nginx, and Neon PostgreSQL**.

---

## 🚀 Live Application

**Live Website:**  
`YOUR_S3_WEBSITE_URL`

**Backend API / Swagger Documentation:**  
`YOUR_EC2_PUBLIC_IP/docs`

---

## ✨ Features

### 👤 User Features

- User registration and login
- JWT-based authentication
- Protected API endpoints
- Product browsing
- Product categories
- Add products to cart
- Increase and decrease cart quantities
- Remove products from cart
- Cart total calculation
- Checkout and order creation
- Order confirmation
- Order history

### 🛠️ Admin Features

- Admin authentication
- Admin dashboard
- Order statistics
- View customer orders
- Update order status
- Admin order management

---

## 🧰 Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- React Router
- Fetch API

### Backend
- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- Python-JOSE
- Passlib
- Bcrypt

### Database
- PostgreSQL
- Neon
- SQLAlchemy ORM

### Deployment & Infrastructure
- Amazon S3 — React static website hosting
- AWS EC2 — FastAPI backend
- Ubuntu
- Nginx — Reverse proxy
- systemd — Backend service management

---

## 🏗️ Architecture

```text
                         USERS
                           │
                           ▼
                ┌─────────────────────┐
                │   React + Vite      │
                │     Frontend        │
                │     Amazon S3       │
                └──────────┬──────────┘
                           │
                      API Requests
                           │
                           ▼
                ┌─────────────────────┐
                │       Nginx         │
                │     AWS EC2         │
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │      FastAPI        │
                │      Backend        │
                └──────────┬──────────┘
                           │
                      SQLAlchemy
                           │
                           ▼
                ┌─────────────────────┐
                │ PostgreSQL / Neon   │
                │      Database       │
                └─────────────────────┘
```

---

## 📂 Project Structure

```text
NoviCart/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── security.py
│   ├── dependencies.py
│   ├── requirements.txt
│   └── ...
│
├── .gitignore
└── README.md
```

---

## 🔐 Authentication

NoviCart uses JWT-based authentication for protected operations.

```text
User Login
    │
    ▼
FastAPI validates credentials
    │
    ▼
JWT access token generated
    │
    ▼
Frontend receives token
    │
    ▼
Token sent with protected API requests
    │
    ▼
FastAPI validates token
    │
    ▼
Protected resource accessed
```

Passwords are hashed before being stored, and sensitive configuration such as database credentials is kept in environment variables.

---

## 🛒 Application Workflow

```text
Browse Products
      │
      ▼
Add Product to Cart
      │
      ▼
Update Quantity
      │
      ▼
Review Cart
      │
      ▼
Checkout
      │
      ▼
Create Order
      │
      ▼
Order Confirmation
      │
      ▼
View Order History
```

---

## 🔌 API

The backend is implemented using FastAPI and provides REST APIs for:

- Authentication
- Products
- Product categories
- Cart operations
- Orders
- Admin operations

FastAPI's interactive Swagger documentation is available at:

```text
/docs
```

---

# 💻 Local Development

## Prerequisites

Make sure the following are installed:

- Python 3.9+
- Node.js
- npm
- PostgreSQL database or a Neon PostgreSQL database

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd NoviCart
```

## 2. Backend Setup

```bash
cd backend
```

Create a virtual environment.

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## 3. Configure Backend Environment Variables

Create a `.env` file inside the `backend` directory:

```env
DATABASE_URL=your_postgresql_connection_string
```

**Never commit `.env` or database credentials to GitHub.**

## 4. Start the Backend

```bash
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

## 5. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite.

---

# 🏭 Production Build

Create a production build:

```bash
npm run build
```

Vite generates:

```text
frontend/dist/
```

These static files can be deployed to Amazon S3.

---

# ☁️ Deployment

### Frontend

```text
React Source
     │
     ▼
npm run build
     │
     ▼
frontend/dist/
     │
     ▼
Amazon S3
     │
     ▼
Live Website
```

### Backend

```text
Internet
    │
    ▼
Nginx :80
    │
    ▼
FastAPI / Uvicorn :8000
    │
    ▼
Neon PostgreSQL
```

Nginx works as a reverse proxy and forwards incoming requests to FastAPI.

The backend is managed as a systemd service.

---

# 🧪 Testing

The deployed application was tested end-to-end.

Verified functionality includes:

- User registration
- User login
- JWT authentication
- Product retrieval
- Product categories
- Cart operations
- Cart quantity updates
- Cart item removal
- Checkout
- Order creation
- Order confirmation
- Order history
- Admin dashboard
- Admin order management
- Order status updates
- Frontend-to-backend communication
- API functionality
- Database integration

---

# 🔒 Security

Security considerations implemented in the project include:

- JWT authentication
- Password hashing with Passlib/Bcrypt
- Protected backend endpoints
- Environment variables for sensitive configuration
- `.env` excluded from Git
- CORS configuration for the deployed frontend
- Backend running behind Nginx
- Database credentials kept outside source code

---

# 📚 What I Learned

This project provided practical experience with:

- REST API development using FastAPI
- React and Python backend integration
- JWT authentication
- SQLAlchemy ORM
- PostgreSQL database integration
- API error handling
- CORS configuration
- Environment variable management
- Linux server administration
- Nginx reverse proxy configuration
- AWS EC2 deployment
- Amazon S3 static website hosting
- Production builds
- Frontend-backend integration
- End-to-end testing

---

# 🚀 Future Improvements

- HTTPS using CloudFront
- Custom domain
- Payment gateway integration
- Product image storage
- Product search and filtering
- Pagination
- Email notifications
- Expanded admin product management
- Automated testing
- CI/CD pipeline

---

## 👨‍💻 Author

**Lokesh Sonar**

Full-Stack Developer  
Python • FastAPI • React • PostgreSQL • AWS

---

## ⭐ Project

If you find this project useful, feel free to star the repository.
