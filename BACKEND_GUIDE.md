# 🚀 GradeFlow Backend - Quick Reference

## Server Status

✅ **Backend running successfully** on `http://localhost:4000`

## 🔐 Admin Credentials (Printed on Startup)

Generated randomly on first run. Check terminal output for:

```
═════════════════════════════════════════════════════════
                    🔐 ADMIN CREDENTIALS                 
═════════════════════════════════════════════════════════

  Username: admin
  Password: [UNIQUE_GENERATED_PASSWORD]
```

## 📋 Sample Test Credentials

Pre-seeded for immediate testing:

| Role    | ID/Username    | Password      | Details                  |
|---------|----------------|---------------|--------------------------|
| Faculty | IT001          | faculty123    | Professor in IT Dept     |
| Student | 160123737001   | student123    | Enrolled in IT1 section  |

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint            | Body                         |
|--------|---------------------|------------------------------|
| POST   | `/api/admin/login`  | `{ username, password }`     |
| POST   | `/api/faculty/login`| `{ facultyId, password }`    |
| POST   | `/api/student/login`| `{ rollNumber, password }`   |

### Admin Management

| Method | Endpoint                     | Auth    |
|--------|------------------------------|---------|
| GET    | `/api/admin/departments`     | Admin   |
| POST   | `/api/admin/departments`     | Admin   |
| PUT    | `/api/admin/departments/:id` | Admin   |
| DELETE | `/api/admin/departments/:id` | Admin   |

### Faculty Operations

| Method | Endpoint                          | Auth    |
|--------|-----------------------------------|---------|
| GET    | `/api/faculty/dashboard`          | Faculty |
| POST   | `/api/faculty/marks`              | Faculty |
| GET    | `/api/faculty/marks/:assignmentId`| Faculty |
| POST   | `/api/faculty/attendance`         | Faculty |

### Student Dashboard

| Method | Endpoint                              | Auth    |
|--------|---------------------------------------|---------|
| GET    | `/api/student/dashboard`              | Student |
| GET    | `/api/student/marks/:assignmentId`    | Student |
| GET    | `/api/student/attendance/:assignmentId`| Student |

---

## 📝 Testing Example

### 1. Admin Login

```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ggS0CbuPB04a"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "_id": "...",
    "username": "admin",
    "role": "SUPER_ADMIN"
  }
}
```

### 2. Get Departments (with token)

```bash
curl -X GET http://localhost:4000/api/admin/departments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Faculty Login

```bash
curl -X POST http://localhost:4000/api/faculty/login \
  -H "Content-Type: application/json" \
  -d '{"facultyId":"IT001","password":"faculty123"}'
```

### 4. Add Student Marks

```bash
curl -X POST http://localhost:4000/api/faculty/marks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "...",
    "teachingAssignmentId": "...",
    "componentId": "...",
    "marks": 9
  }'
```

---

## 🗂️ Database Collections

Created automatically:

- **Admin** - Super admin users
- **Department** - IT (default)
- **Faculty** - IT001 (Dr. John Doe)
- **Student** - 160123737001 (Sistla Keerthana)
- **Subject** - Database, Software Eng, etc.
- **TeachingAssignment** - Faculty-Subject-Student mapping
- **StudentAssessment** - Marks storage
- **CIEConfiguration** - CIE rules
- **UserAuth** - Unified authentication

---

## 🔄 CIE Calculation

Automatic when marks are added:

```
CIE = (Best 2 of 3 Slips)/2 + Avg(Assignments) + Avg(Midsems) + Attendance
```

Example: `8.5 + 9.5 + 24 + 5 = 47/50`

---

## 🛠️ Development Commands

```bash
# Development (with hot reload)
npm run dev

# Build to dist/
npm run build

# Production
npm run start
```

---

## ⚙️ Environment Variables (.env)

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/gradeflow
JWT_SECRET=your_jwt_secret_here_change_in_production
```

---

## 📊 CIE Rules

Default configuration per department:

| Component     | Max Marks | Consideration        |
|---------------|-----------|----------------------|
| Slip Tests    | 10        | Best 2 of 3          |
| Assignments   | 10        | Average              |
| Midsem        | 25        | Average              |
| Attendance    | 5         | Direct input (0-5)   |
| **Total CIE** | **50**    | Sum of all above     |

---

## 🔒 Security

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens expire in 24 hours
- ✅ Role-based access control (RBAC)
- ✅ Authorization header validation
- ⚠️ Change `JWT_SECRET` before production
- ⚠️ Update admin password after first login

---

## 🐛 Troubleshooting

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
→ Start MongoDB: `mongod`

**Port Already in Use**
```
EADDRINUSE: address already in use :::4000
```
→ Change PORT in .env or kill process on port 4000

**Invalid Token**
```
401 Unauthorized
```
→ Ensure token is included in Authorization header: `Bearer <token>`

---

## 📚 Documentation

- See [backend/README.md](./README.md) for full API docs
- See [backend/CIE_DESIGN.md](./CIE_DESIGN.md) for CIE calculation details

---

**🎓 GradeFlow - University Grade Management System**
