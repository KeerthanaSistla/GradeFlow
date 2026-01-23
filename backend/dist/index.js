"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = require("./config/db");
const dbSeeder_1 = require("./utils/dbSeeder");
// Route imports
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const facultyRoutes_1 = __importDefault(require("./routes/facultyRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
const PORT = process.env.PORT || 4000;
async function start() {
    try {
        // Connect to database
        await (0, db_1.connectDB)();
        console.log('✓ MongoDB connected\n');
        // Seed default data
        await (0, dbSeeder_1.seedDefaultAdmin)();
        await (0, dbSeeder_1.seedDefaultDepartment)();
        // Print credentials
        (0, dbSeeder_1.printAdminCredentials)();
        // Routes
        app.get('/', (req, res) => {
            res.json({ ok: true, message: 'GradeFlow Backend Running' });
        });
        app.use('/api/admin', adminRoutes_1.default);
        app.use('/api/faculty', facultyRoutes_1.default);
        app.use('/api/student', studentRoutes_1.default);
        // Health check
        app.get('/health', (req, res) => {
            res.json({ status: 'ok' });
        });
        // Error handling
        app.use((err, req, res, next) => {
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
    }
    catch (err) {
        console.error('Server start error:', err);
        process.exit(1);
    }
}
start();
