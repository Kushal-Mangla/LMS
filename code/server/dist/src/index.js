"use strict";
/**
 * Main server entry point
 * @module index
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const userDb_1 = require("./config/userDb");
const debugRoutes_1 = __importDefault(require("./routes/debugRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
/**
 * Load environment variables from .env file
 * Path is relative to the dist directory
 */
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
/**
 * Express application instance
 * @type {Express}
 */
const app = (0, express_1.default)();
/**
 * Server port number
 * Falls back to 3000 if PORT environment variable is not set
 * @type {number}
 */
const port = process.env.PORT || 3000;
/**
 * Initialize database connection
 */
(0, userDb_1.connectUserDatabase)();
/**
 * Middleware Setup
 * - CORS: Enable Cross-Origin Resource Sharing
 * - express.json(): Parse JSON request bodies
 */
app.use((0, cors_1.default)());
app.use(express_1.default.json());
/**
 * Route Definitions
 * - /api/debug: Development and debugging endpoints
 * - /api/auth: Authentication and authorization endpoints
 */
app.use('/api/debug', debugRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
/**
 * Start the Express server
 * Logs the port number and local URL in development mode
 */
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    if (process.env.NODE_ENV === 'development') {
        console.log(`http://localhost:${port}`);
    }
    ;
});
