# StayGen — Next-Gen Student Living OS 🚀

> **StayGen** is a production-ready, startup-grade full-stack SaaS platform for managing modern student housing, hostel accommodations, mess facilities, security passes, and campus living operations. Inspired by Apple, Linear, Stripe, and Airbnb design aesthetics.

![StayGen Banner](https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features at a Glance

### 🏢 Admin Portal
* **Dashboard Analytics**: Real-time statistics, monthly revenue tracking, occupancy rates, and interactive Recharts charts.
* **Student Directory**: Complete student records, roll numbers, room assignments, profile completion meters, and emergency contact details.
* **Smart Room Management**: Add/Edit rooms, track bed capacity, AC/Attached amenities, and maintenance status.
* **Booking Approval Flow**: Manage student room requests with instant **Approve** or **Reject** (with custom rejection reasons).
* **Complaint Resolution System**: Ticket handling with category tags, status transition pipeline (`Open` → `In Progress` → `Resolved` → `Closed`), priority levels, and student photo evidence.
* **Attendance & QR Tracking**: Daily attendance statistics, weekly bar charts, and QR code pass generation.
* **Mess & Menu Manager**: Weekly meal schedules (Mon-Sun), real-time rating analytics per meal, and interactive menu editor.
* **Fee Collection**: Automatic invoice generation, payment status filters (`Paid`, `Pending`, `Overdue`), and manual cash/online payment entry.
* **Visitor Security Pass**: Monitor guest requests, generate digital QR codes, and trigger entry/exit.
* **Notice Board**: Campus-wide announcements with priority banners (`Urgent`, `High`, `Medium`, `Low`) and categories.
* **Inventory Management**: Track hostel furniture, electronics, and supplies with automatic low-stock alerts.
* **Laundry Tracker**: Track batch laundry requests with 5-stage progression stepper (`Requested` → `Picked Up` → `In Progress` → `Ready` → `Delivered`).
* **Lost & Found**: Community lost item log with photo attachments and status filtering.

### 🎓 Student Portal
* **Personalized Dashboard**: Today's mess menu, attendance rate meter (with 75% threshold alert), pending fees banner, and latest announcements.
* **Profile Management**: Upload profile avatar via Cloudinary, update phone/course/college info.
* **Room Booking**: Browse available rooms, select check-in/out dates, and track request status.
* **Complaint Desk**: Raise issues with photo evidence, select category/priority, and view admin response messages.
* **Attendance Tracker**: View monthly attendance percentage, present/absent logs, and historical records.
* **Fee Payments**: View pending invoices, discount breakdowns, and trigger payments.
* **Mess & Food Rating**: View daily meal schedule and give 5-star ratings for meals.
* **Visitor Pre-Registration**: Register guests in advance to generate downloadable QR entry passes.
* **Laundry Requests**: Submit batch clothing lists with custom washing instructions.
* **Notice Desk**: Stay updated with priority notices.

### 🛡️ Security Guard Portal
* **Live Entry Monitor**: Real-time list of visitors awaiting entry vs inside campus.
* **One-Touch Verification**: Instant **Check In** and **Check Out** triggers.
* **Daily Visitor Statistics**: Real-time counter for total visitors and average duration.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4, Framer Motion, TanStack Query (React Query v5), React Hook Form, Zod, Recharts, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express.js, MongoDB Atlas (Mongoose v8), JWT Authentication (Access + Refresh Rotation), bcrypt |
| **Integrations** | Cloudinary (Image Uploads), Multer (File Handling), Nodemailer (Gmail SMTP Email Notifications), Socket.io (Real-time updates) |

---

## 📁 Directory Structure

```
StayGen/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary config
│   │   ├── controllers/     # Controller logic for all 13 modules
│   │   ├── middleware/      # Auth, Role Guard, Error Handler, Upload
│   │   ├── models/          # 15 Mongoose Schema models
│   │   ├── routes/          # Express API route modules
│   │   ├── utils/           # Database seed script & helpers
│   │   └── server.js        # Express app entry point
│   └── .env                 # Backend environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Auth route guards & shared UI
│   │   ├── contexts/        # AuthContext & ThemeContext
│   │   ├── layouts/         # AdminLayout, StudentLayout, SecurityLayout
│   │   ├── lib/             # Axios API instance & utility functions
│   │   ├── pages/           # Landing, Auth, Admin (13), Student (10), Security (1)
│   │   ├── App.tsx          # React Router setup & QueryClient
│   │   └── index.css        # Design tokens, typography & animations
│   └── vite.config.ts       # Vite bundler configuration
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- MongoDB Atlas Database URI

### 1. Clone & Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=your_mongodb_atlas_connection_string

JWT_SECRET=staygen_jwt_super_secret_key_2024
JWT_REFRESH_SECRET=staygen_refresh_secret_key_2024
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=StayGen <your_email@gmail.com>

APP_NAME=StayGen
APP_URL=http://localhost:5000
```

### 2. Seed Initial Database

```bash
node src/utils/seed.js
```

### 3. Run Backend Server

```bash
npm run dev
```
> Server runs on `http://localhost:5000`

---

### 4. Setup & Run Frontend

In a new terminal tab:

```bash
cd frontend
npm install
npm run dev
```
> App runs on `http://localhost:5173`

---

## 🔑 Demo Access Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@staygen.com` | `Admin@123` |
| **Hostel Manager** | `manager@staygen.com` | `Admin@123` |
| **Security Guard** | `security@staygen.com` | `Admin@123` |
| **Student** | `student1@staygen.com` | `Student@123` |

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Push code to GitHub.
2. Import `frontend/` project to Vercel.
3. Set Build Command: `npm run build` and Output Directory: `dist`.
4. Add environment variable: `VITE_API_URL=https://your-backend-api.onrender.com/api`.

### Backend (Render / Railway)
1. Import `backend/` directory to Render as a Web Service.
2. Set Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `SMTP_*`).
3. Set Start Command: `node src/server.js`.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

Developed with ❤️ by **Team StayGen**.
