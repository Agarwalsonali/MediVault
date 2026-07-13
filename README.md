# 🏥 MediVault – Medical Report Management System

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js"/>
  <img src="https://img.shields.io/badge/Express.js-API-black?style=for-the-badge&logo=express"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb"/>
  <img src="https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge"/>
</p>

## 📖 Overview

**MediVault** is a secure **Medical Report Management System (MRMS)** developed to simplify the storage, management, and sharing of patients' medical reports.

The system provides dedicated dashboards for **Admin**, **Staff (Nurse/Lab Technician)**, and **Patients**, enabling efficient report management while ensuring privacy and security.

Doctors do not require an account to access reports. Patients can securely share reports using **time-limited secure links**.

---

## 🚀 Features

### 👨‍💼 Admin Module

- Secure Admin Login
- Dashboard Analytics
- Create Staff Accounts
- Manage Staff
- Manage Patients
- Manage Reports
- View System Statistics
- Profile Management

---

### 👩‍⚕️ Staff Module

- Secure Login with OTP Verification
- Upload Medical Reports
- Search Patients
- View Patient Details
- Manage Uploaded Reports
- Update Profile

---

### 🧑 Patient Module

- Secure Registration
- Email OTP Verification
- Login Authentication
- Complete Patient Profile
- View Medical Reports
- Download Reports
- Medical History
- Update Personal Information
- Share Reports with Doctors

---

### 🔗 Secure Report Sharing

Patients can generate a secure report link that can be shared with doctors.

Features:

- Time-limited access
- Secure URL
- Read-only report view
- Automatic expiration after 30 minutes

---

## 🔐 Authentication & Security

- JWT Authentication
- Email OTP Verification
- Password Encryption using bcrypt
- Protected Routes
- Role-Based Authorization
- Secure File Upload
- Token-based Sessions
- Forgot Password via OTP
- Reset Password

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT
- bcrypt
- Nodemailer
- OTP Verification

---

## 📂 Project Structure

```
MediVault
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── services/
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── uploads/
│
├── README.md
└── package.json
```

---

## 📸 System Modules

### Authentication

- Register
- Login
- Verify OTP
- Forgot Password
- Reset Password

---

### Admin Dashboard

- Dashboard
- Staff Management
- Patient Management
- Reports
- Profile

---

### Staff Dashboard

- Dashboard
- Upload Report
- Patient Search
- Report Management
- Profile

---

### Patient Dashboard

- Dashboard
- Medical Reports
- Download Reports
- Medical History
- Share Report
- Profile

---

## 📌 API Features

### Authentication APIs

- Register User
- Generate Registration OTP
- Login
- Verify OTP
- Forgot Password
- Reset Password
- Logout

### Report APIs

- Upload Report
- Download Report
- Delete Report
- View Reports

### Patient APIs

- Patient Profile
- Medical History
- Share Report

### Admin APIs

- Create Staff
- Manage Users
- Dashboard Statistics

---

## 💻 Installation

### Clone Repository

```bash
git clone https://github.com/Agarwalsonali/MediVault.git
```

### Navigate

```bash
cd MediVault
```

### Install Frontend

```bash
cd frontend
npm install
```

### Install Backend

```bash
cd backend
npm install
```

---

## ▶️ Run Project

### Backend

```bash
nodemon index.js
```

### Frontend

```bash
npm run dev
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email

EMAIL_PASS=your_email_password

CLIENT_URL=http://localhost:5173
```

---

## 📈 Future Enhancements

- AI-powered medical report summarization
- OCR for scanned reports
- QR Code based report sharing
- Appointment Booking
- Doctor Dashboard
- Notification System
- Cloud Storage Integration
- Mobile Application
- Multi-language Support

---

## Author

- Sonali Agarwal


---

## ⭐ If you like this project

Give this repository a **⭐ Star** and feel free to contribute!