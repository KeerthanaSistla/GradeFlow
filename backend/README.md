# GradeFlow Backend

Complete Node.js + Express + MongoDB backend for university grade and attendance management.

## Features

✅ **Multi-role authentication** (Admin, Faculty, Student)  
✅ **JWT-based session management**  
✅ **Department management** (CRUD)  
✅ **Faculty marks entry** (Slip tests, assignments, midsems)  
✅ **Automatic CIE calculation** (Best 2 of 3 slip tests + averages)  
✅ **Student dashboard** (View marks, CIE, attendance)  
✅ **Role-based access control** (Middleware)  

## Tech Stack

- **Runtime:** Node.js (TypeScript)
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Development:** ts-node-dev

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/gradeflow
JWT_SECRET=your_jwt_secret_here_change_in_production
```

### 3. Start MongoDB

Ensure MongoDB is running locally or update `MONGO_URI` to your instance.

### 4. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:4000` and display:

```
✓ MongoDB connected

✓ Default admin created
✓ Default department created
✓ Sample faculty created
✓ Sample students created

═══════════════════════════════════════════════════════════
                    🔐 ADMIN CREDENTIALS
═══════════════════════════════════════════════════════════

  Username: admin
  Password: [random_password]

  ⚠️  KEEP THESE CREDENTIALS SAFE AND SECURE!
  ⚠️  Change the password after first login!

═══════════════════════════════════════════════════════════

  Sample Login Credentials:
  ─────────────────────────────────────────────────────────
  Faculty: IT001 / faculty123
  Student: 160123737001 / student123
  ─────────────────────────────────────────────────────────

🚀 Server running on http://localhost:4000
📡 API endpoints:
   - POST   /api/admin/login
   - GET    /api/admin/departments
   - POST   /api/faculty/login
   - GET    /api/faculty/dashboard
   - POST   /api/student/login
   - GET    /api/student/dashboard
```

## API Documentation

### Admin Endpoints

#### Login
```
POST /api/admin/login
Body: { username: "admin", password: "..." }
Response: { token, admin }
```

#### Get Departments
```
GET /api/admin/departments
Headers: Authorization: Bearer <token>
Response: [{ _id, name, abbreviation, ... }]
```

#### Create Department
```
POST /api/admin/departments
Headers: Authorization: Bearer <token>
Body: { name: "IT", abbreviation: "IT", password: "dept123" }
Response: { message, department }
```

---

### Faculty Endpoints

#### Login
```
POST /api/faculty/login
Body: { facultyId: "IT001", password: "..." }
Response: { token, faculty }
```

#### Get Dashboard
```
GET /api/faculty/dashboard
Headers: Authorization: Bearer <token>
Response: { assignments: [...] }
```

#### Add Student Marks
```
POST /api/faculty/marks
Headers: Authorization: Bearer <token>
Body: {
  studentId: "...",
  teachingAssignmentId: "...",
  componentId: "...",
  marks: 9
}
Response: { message, assessment, cie }
```

#### Get Student Marks
```
GET /api/faculty/marks/:teachingAssignmentId
Headers: Authorization: Bearer <token>
Response: { marks: [...] }
```

#### Mark Attendance
```
POST /api/faculty/attendance
Headers: Authorization: Bearer <token>
Body: {
  teachingAssignmentId: "...",
  studentIds: [...],
  date: "2025-01-23"
}
Response: { message, date, count }
```

---

### Student Endpoints

#### Login
```
POST /api/student/login
Body: { rollNumber: "160123737001", password: "..." }
Response: { token, student }
```

#### Get Dashboard
```
GET /api/student/dashboard
Headers: Authorization: Bearer <token>
Response: { student, assignments: [{ ..., cie }] }
```

#### Get Marks for Subject
```
GET /api/student/marks/:teachingAssignmentId
Headers: Authorization: Bearer <token>
Response: { marks: [...], cie }
```

#### Get Attendance
```
GET /api/student/attendance/:teachingAssignmentId
Headers: Authorization: Bearer <token>
Response: { attendance, percentage }
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                 # MongoDB connection
│   ├── models/
│   │   ├── Admin.ts
│   │   ├── Department.ts
│   │   ├── Faculty.ts
│   │   ├── Student.ts
│   │   ├── Subject.ts
│   │   ├── TeachingAssignment.ts
│   │   ├── StudentAssessment.ts
│   │   ├── CIEConfiguration.ts
│   │   ├── CIERuleComponent.ts
│   │   ├── UserAuth.ts
│   │   └── ... (14 models total)
│   ├── controllers/
│   │   ├── adminController.ts
│   │   ├── facultyController.ts
│   │   └── studentController.ts
│   ├── routes/
│   │   ├── adminRoutes.ts
│   │   ├── facultyRoutes.ts
│   │   └── studentRoutes.ts
│   ├── middleware/
│   │   └── auth.ts               # JWT verification
│   ├── utils/
│   │   ├── auth.ts               # bcrypt + JWT utilities
│   │   ├── cieCalculator.ts      # CIE calculation engine
│   │   ├── dbSeeder.ts           # Initial data seeding
│   │   └── seeders.ts            # Assessment components
│   └── index.ts                  # Main server entry
├── dist/                         # Compiled JavaScript
├── package.json
├── tsconfig.json
├── .env.example
└── CIE_DESIGN.md                 # CIE calculation documentation
```

---

## Database Schema Overview

### Core Collections

1. **Admin** - Super admin users
2. **Department** - University departments
3. **Faculty** - Faculty members per department
4. **Student** - Students per department
5. **Subject** - Subject master data per department
6. **TeachingAssignment** - Faculty + Subject + Students mapping
7. **StudentAssessment** - Individual student marks (slip, assignment, midsem)
8. **AttendanceSession** - Attendance records
9. **CIEConfiguration** - CIE rules per department
10. **CIERuleComponent** - Component weights in CIE calculation
11. **UserAuth** - Unified authentication for all roles

---

## CIE Calculation

### Formula

```
CIE = (Best 2 of 3 Slip Tests) / 2 + Avg(Assignments) + Avg(Midsems) + Attendance Marks
```

### Example

```
Slip Tests: [8, 6, 9]       → best 2 = (9+8)/2 = 8.5
Assignments: [9, 10]        → avg = 9.5
Midsem: [24]                → avg = 24
Attendance: 5               → direct input

Total CIE = 8.5 + 9.5 + 24 + 5 = 47/50
```

See [CIE_DESIGN.md](./CIE_DESIGN.md) for detailed calculation logic.

---

## Authentication Flow

1. **Login** → POST `/api/[role]/login`
2. **Server** → Validates credentials, generates JWT
3. **Client** → Stores token in localStorage
4. **API Calls** → Include `Authorization: Bearer <token>` header
5. **Server** → Verifies token, checks role permissions
6. **Response** → Data or 403 Forbidden

---

## Development Tips

### Run TypeScript Build

```bash
npm run build
```

### Run Production Server

```bash
npm run start
```

### Debug Logs

Morgan middleware logs all HTTP requests to console.

### Database Seeding

On first startup:
- Creates default admin with random password (printed to console)
- Creates sample IT department
- Creates sample faculty (IT001 / faculty123)
- Creates sample student (160123737001 / student123)
- Seeds CIE configuration and assessment components

---

## Security Notes

⚠️ **Before Production:**

1. Change `JWT_SECRET` in `.env`
2. Update database password in `MONGO_URI`
3. Enable HTTPS
4. Add rate limiting
5. Implement API key for external integrations
6. Audit & rotate credentials regularly

---

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`

### Build Errors
```bash
npm install
npm run build
```

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process: `lsof -i :4000` (Mac/Linux)

---

## Next Steps

- [ ] Add department-level password authentication
- [ ] Implement bulk upload (CSV/Excel)
- [ ] Add elective subject support
- [ ] Implement file uploads (documents, certificates)
- [ ] Add email notifications
- [ ] Deploy to production (Heroku, AWS, DigitalOcean)

---

**Made with ❤️ for university grade management**
