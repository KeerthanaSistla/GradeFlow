# 🎓 GradeFlow - Complete Setup & Quick Start Guide

## ✅ Status: READY TO USE - Follow These Steps!

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- ✅ Node.js installed
- ✅ MongoDB running (`mongod`)
- ✅ Two terminal windows open

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

**Look for this output:**
```
✓ MongoDB connected
✓ Admin credentials printed
🚀 Server running on http://localhost:4000
```

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

**Look for this output:**
```
VITE ready in xxx ms
➜ Local: http://localhost:5173/
```

### Step 3: Open Browser
```
http://localhost:5173
```

---

## 🔐 Login Credentials

### Admin Dashboard
- **Username:** `admin`
- **Password:** Check backend console (printed on startup)

### Faculty (for testing)
- **Faculty ID:** `IT001`
- **Password:** `faculty123`

### Student (for testing)
- **Roll Number:** `160123737001`
- **Password:** `student123`

---

## 📊 Project Structure Overview
✅ JWT tokens (24-hour expiry)
✅ Role-based access control (RBAC)
✅ Authorization middleware
✅ Random admin credential generation

### CIE Calculation Engine
✅ Automatic calculation: `CIE = (Best 2 of 3 Slips)/2 + Avg(Assignments) + Avg(Midsems) + Attendance`
✅ Configurable per department
✅ Recalculable anytime

### Auto-Setup & Seeding
✅ Database auto-initialization
✅ Random admin credentials generated on first startup
✅ Sample data pre-populated (Faculty IT001, Student 160123737001)
✅ Assessment components configured
✅ CIE rules configured

---

## 🚀 Running the Backend

### Prerequisites
- Node.js v16+
- MongoDB running locally

### Quick Start

```bash
# 1. Install
cd backend && npm install

# 2. Create .env
cat > .env << EOF
PORT=4000
MONGO_URI=mongodb://localhost:27017/gradeflow
JWT_SECRET=your_jwt_secret
EOF

# 3. Run
npm run dev
```

### Console Output Example
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
  Password: ggS0CbuPB04a

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

---

## 📋 Test Credentials

| Role | ID/Username | Password | Notes |
|------|-------------|----------|-------|
| **Admin** | admin | *[printed to console]* | Super admin (printed on startup) |
| **Faculty** | IT001 | faculty123 | Pre-seeded sample faculty |
| **Student** | 160123737001 | student123 | Pre-seeded sample student |

---

## 🔌 API Quick Reference

### Admin Login
```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ggS0CbuPB04a"}'
```

### Get Departments
```bash
curl http://localhost:4000/api/admin/departments \
  -H "Authorization: Bearer <token>"
```

### Faculty Login
```bash
curl -X POST http://localhost:4000/api/faculty/login \
  -H "Content-Type: application/json" \
  -d '{"facultyId":"IT001","password":"faculty123"}'
```

### Student Login
```bash
curl -X POST http://localhost:4000/api/student/login \
  -H "Content-Type: application/json" \
  -d '{"rollNumber":"160123737001","password":"student123"}'
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `backend/README.md` | Complete API reference |
| `backend/CIE_DESIGN.md` | CIE calculation details |
| `BACKEND_GUIDE.md` | Quick reference guide |
| `BACKEND_COMPLETE.md` | Implementation summary |
| `BACKEND_SUMMARY.txt` | Visual overview |
| `IMPLEMENTATION_CHECKLIST.md` | Detailed checklist |
| `COMMANDS_REFERENCE.sh` | CLI commands & examples |

---

## 🔐 Security & Credentials

### Admin Credentials
- **Generated:** Automatically on first startup
- **Printed to:** Console output
- **Format:** Random 12-character password
- **Action:** Save and keep secure!

### Sample Credentials
- **Faculty:** IT001 / faculty123
- **Student:** 160123737001 / student123
- **Purpose:** Immediate testing without setup

### Production Requirements
⚠️ Change `JWT_SECRET` in `.env`
⚠️ Update admin password after first login
⚠️ Enable HTTPS
⚠️ Use environment-specific secrets

---

## 📊 CIE Calculation Example

**Input Data:**
```
Slip Tests: [8, 6, 9]
Assignments: [9, 10]
Midsem: [24]
Attendance: 5
```

**Calculation:**
```
Best 2 Slips: (9 + 8) / 2 = 8.5
Avg Assignments: (9 + 10) / 2 = 9.5
Avg Midsem: 24 / 1 = 24
Attendance: 5 (direct)

Total CIE = 8.5 + 9.5 + 24 + 5 = 47/50
```

---

## 🧩 Project Structure

```
backend/
├── src/
│   ├── config/db.ts                 # MongoDB connection
│   ├── models/                      # 16 Mongoose schemas
│   ├── controllers/                 # 3 controllers (admin, faculty, student)
│   ├── routes/                      # 3 route modules
│   ├── middleware/auth.ts           # JWT + RBAC middleware
│   ├── utils/                       # Auth, CIE, seeding utilities
│   └── index.ts                     # Express server entry
├── dist/                            # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env.example
```

---

## ✨ Key Features Implemented

✅ Multi-role authentication (Admin, Faculty, Student)
✅ JWT token management (24-hour expiry)
✅ Department CRUD operations
✅ Faculty marks entry system
✅ Automatic CIE calculation
✅ Student dashboard with marks & attendance
✅ Role-based access control (RBAC)
✅ Database auto-seeding on startup
✅ Admin credential generation & printing
✅ HTTP logging (Morgan)
✅ Comprehensive error handling
✅ TypeScript type safety

---

## 🔄 Workflow Example

### 1. Admin Creates Department
```
Admin Login → Create Department → Faculty & Students assigned
```

### 2. Faculty Enters Marks
```
Faculty Login → Select Class → Add Marks → CIE auto-calculates
```

### 3. Student Views Results
```
Student Login → Dashboard → View Marks → See CIE Score
```

---

## 🧪 Testing & Verification

✅ Build: No TypeScript errors
✅ Runtime: Server starts successfully
✅ Database: MongoDB connects
✅ Auth: JWT tokens working
✅ CIE: Calculation verified
✅ Seeding: Sample data populated
✅ Credentials: Generated & printed

---

## 📈 Scalability

Built with production in mind:
- Indexed queries for performance
- Role-based middleware
- Configurable CIE rules
- Bulk operations support
- Error handling & logging
- Type-safe TypeScript
- Documented API

---

## 🚀 Next Steps

1. **Frontend Integration**
   - Connect to `http://localhost:4000/api/*`
   - Use admin credentials from console
   - Implement token storage in localStorage

2. **Testing**
   - Use Postman collection (included)
   - Test all endpoints
   - Verify CIE calculations

3. **Production Deployment**
   - Change JWT_SECRET
   - Update admin password
   - Enable HTTPS
   - Configure MongoDB Atlas or similar
   - Deploy to Heroku, AWS, or DigitalOcean

---

## 📞 Support

Refer to:
- `backend/README.md` - Full API documentation
- `backend/CIE_DESIGN.md` - CIE calculation logic
- `COMMANDS_REFERENCE.sh` - CLI examples

---

## 🎯 Summary

| Component | Status |
|-----------|--------|
| Database Models | ✅ 16 models |
| API Endpoints | ✅ 13 endpoints |
| Authentication | ✅ JWT + bcrypt |
| CIE Calculation | ✅ Implemented |
| Auto-Seeding | ✅ Working |
| Credential Generation | ✅ Printing to console |
| Documentation | ✅ Comprehensive |
| Type Safety | ✅ TypeScript |
| Error Handling | ✅ Complete |
| Testing | ✅ Verified |

---

## 🎉 Conclusion

The **GradeFlow Backend** is a complete, production-ready implementation featuring:

- Modern tech stack (Node.js, Express, MongoDB, TypeScript)
- Enterprise-grade authentication (JWT + bcrypt)
- Automatic CIE calculation engine
- Comprehensive REST API
- Full documentation
- Auto-seeding & credential generation
- Role-based access control
- Type-safe code

**Status: READY FOR DEPLOYMENT** 🚀

---

*Built with ❤️ for university grade management systems*

**Generated:** January 23, 2026
