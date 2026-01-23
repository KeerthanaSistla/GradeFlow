import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db';
import { seedDefaultAdmin, seedDefaultDepartment, printAdminCredentials } from './utils/dbSeeder';

// Route imports
import adminRoutes from './routes/adminRoutes';
import facultyRoutes from './routes/facultyRoutes';
import studentRoutes from './routes/studentRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // Connect to database
    await connectDB();
    console.log('✓ MongoDB connected\n');

    // Seed default data
    await seedDefaultAdmin();
    await seedDefaultDepartment();

    // Print credentials
    printAdminCredentials();

    // Routes
    app.get('/', (req, res) => {
      res.json({ ok: true, message: 'GradeFlow Backend Running' });
    });

    app.use('/api/admin', adminRoutes);
    app.use('/api/faculty', facultyRoutes);
    app.use('/api/student', studentRoutes);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Error handling
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Error:', err);
      res.status(500).json({ error: err.message || 'Server error' });
    });

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints:`);
      console.log(`   - POST   /api/admin/login`);
      console.log(`   - GET    /api/admin/departments`);
      console.log(`   - POST   /api/faculty/login`);
      console.log(`   - GET    /api/faculty/dashboard`);
      console.log(`   - POST   /api/student/login`);
      console.log(`   - GET    /api/student/dashboard\n`);
    });
  } catch (err) {
    console.error('Server start error:', err);
    process.exit(1);
  }
}

start();
