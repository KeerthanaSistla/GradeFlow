#!/bin/bash
# GradeFlow Backend - Quick Command Reference

# ============================================================================
# SETUP & INSTALLATION
# ============================================================================

# Install dependencies
cd backend && npm install

# Install missing types
npm install --save-dev @types/cors @types/bcrypt

# Build TypeScript
npm run build

# ============================================================================
# RUNNING THE SERVER
# ============================================================================

# Development (with hot reload)
npm run dev

# Production build
npm run build && npm run start

# ============================================================================
# TESTING ENDPOINTS (using curl)
# ============================================================================

# 1. ADMIN LOGIN
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YOUR_PASSWORD_FROM_CONSOLE"
  }'

# Store token in variable (bash)
export ADMIN_TOKEN="<token_from_response>"

# 2. GET DEPARTMENTS (with admin token)
curl -X GET http://localhost:4000/api/admin/departments \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. CREATE DEPARTMENT
curl -X POST http://localhost:4000/api/admin/departments \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Science",
    "abbreviation": "CS",
    "password": "cs123"
  }'

# 4. FACULTY LOGIN
curl -X POST http://localhost:4000/api/faculty/login \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": "IT001",
    "password": "faculty123"
  }'

# Store faculty token
export FACULTY_TOKEN="<token_from_response>"

# 5. GET FACULTY DASHBOARD
curl -X GET http://localhost:4000/api/faculty/dashboard \
  -H "Authorization: Bearer $FACULTY_TOKEN"

# 6. ADD STUDENT MARKS
curl -X POST http://localhost:4000/api/faculty/marks \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STUDENT_ID_FROM_DB",
    "teachingAssignmentId": "ASSIGNMENT_ID_FROM_DB",
    "componentId": "COMPONENT_ID_FROM_DB",
    "marks": 9
  }'

# 7. STUDENT LOGIN
curl -X POST http://localhost:4000/api/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "rollNumber": "160123737001",
    "password": "student123"
  }'

# Store student token
export STUDENT_TOKEN="<token_from_response>"

# 8. GET STUDENT DASHBOARD
curl -X GET http://localhost:4000/api/student/dashboard \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# 9. GET STUDENT MARKS
curl -X GET http://localhost:4000/api/student/marks/ASSIGNMENT_ID \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# ============================================================================
# POSTMAN COLLECTION (for easier testing)
# ============================================================================

# 1. Create new Postman collection
# 2. Add folders: Admin, Faculty, Student
# 3. Create requests for each endpoint above
# 4. Use {{BASE_URL}} = http://localhost:4000
# 5. Use {{ADMIN_TOKEN}}, {{FACULTY_TOKEN}}, {{STUDENT_TOKEN}} variables

# ============================================================================
# ENVIRONMENT VARIABLES (.env)
# ============================================================================

# Create backend/.env file with:
cat > backend/.env << EOF
PORT=4000
MONGO_URI=mongodb://localhost:27017/gradeflow
JWT_SECRET=your_jwt_secret_here_change_in_production
EOF

# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

# Connect to MongoDB
mongosh mongodb://localhost:27017/gradeflow

# View all collections
show collections

# Check admin count
db.admins.countDocuments()

# Get first admin
db.admins.findOne()

# Check student count
db.students.countDocuments()

# View all students
db.students.find().pretty()

# Export data
mongoexport --db gradeflow --collection departments --out departments.json

# ============================================================================
# DEBUGGING & LOGS
# ============================================================================

# View recent MongoDB logs (if running mongod)
mongod --logpath /var/log/mongodb/mongod.log

# Check Node process
ps aux | grep node

# Kill process on port 4000
# Linux/Mac:
lsof -i :4000
kill -9 <PID>

# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# ============================================================================
# DEPLOYMENT
# ============================================================================

# Build for production
npm run build

# Deploy to Heroku
git push heroku main

# Deploy to DigitalOcean (via SSH)
ssh root@YOUR_DROPLET_IP
cd gradeflow/backend
git pull
npm install
npm run build
pm2 restart gradeflow-backend

# ============================================================================
# TROUBLESHOOTING
# ============================================================================

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear MongoDB data
# WARNING: This deletes all data!
use gradeflow
db.dropDatabase()

# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"

# Rebuild TypeScript
npx tsc --noEmit

# ============================================================================
# USEFUL COMMANDS
# ============================================================================

# View package.json scripts
npm run

# Check installed packages
npm list

# Update packages
npm update

# Audit security
npm audit
npm audit fix

# ============================================================================
# API RESPONSE EXAMPLES
# ============================================================================

# Successful Login Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "role": "SUPER_ADMIN"
  }
}

# Dashboard Response (Faculty)
{
  "assignments": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "facultyId": "507f1f77bcf86cd799439013",
      "subjectId": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Database Management"
      },
      "studentIds": ["507f1f77bcf86cd799439015"]
    }
  ]
}

# Student Dashboard Response
{
  "student": {
    "_id": "507f1f77bcf86cd799439015",
    "rollNumber": "160123737001",
    "name": "Sistla Keerthana",
    "section": "IT1"
  },
  "assignments": [
    {
      "subjectId": {
        "name": "Database Management"
      },
      "cie": {
        "slipScore": 8.5,
        "assignmentScore": 9.5,
        "midsemScore": 24,
        "attendanceMarks": 5,
        "totalCIE": 47
      }
    }
  ]
}

# ============================================================================
# QUICK START (One-liner)
# ============================================================================

# Install, build, and run
cd backend && npm install && npm run build && npm run dev

# ============================================================================
# MONITORING & LOGS
# ============================================================================

# Stream logs in real-time
npm run dev 2>&1 | tee app.log

# Check file sizes
du -sh src/
du -sh dist/
du -sh node_modules/

# ============================================================================
# DOCUMENTATION LINKS
# ============================================================================

# Full API Documentation
cat backend/README.md

# CIE Calculation Details
cat backend/CIE_DESIGN.md

# Quick Reference Guide
cat BACKEND_GUIDE.md

# Implementation Summary
cat BACKEND_COMPLETE.md

# ============================================================================
# END OF COMMAND REFERENCE
# ============================================================================
