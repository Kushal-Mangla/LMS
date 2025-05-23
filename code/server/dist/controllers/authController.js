"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = exports.register = exports.login = void 0;
const User_1 = require("@/models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const moodleService_1 = require("@/services/moodleService");
const moodleService_2 = require("@/services/moodleService");
const axios_1 = __importDefault(require("axios"));
const moodleService_3 = require("@/services/moodleService");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const qs_1 = __importDefault(require("qs"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const MOODLE_URL = process.env.MOODLE_URL;
/**
 * Mapping of role names to their corresponding Moodle role IDs
 */
const roleMapping = {
    'admin': 1,
    'coach': 3,
    'learner': 5,
};
/**
 * Authenticates a user and generates a JWT token
 * @async
 * @param {AuthRequest} req - Express request object with email and password
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 *
 * @throws {400} - If email or password is missing
 * @throws {404} - If user is not found
 * @throws {401} - If password is incorrect
 * @throws {500} - For internal server errors
 */
// export const logidfn = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
//     console.log("Login endpoint reached");
//     try {
//         console.log(req.body);
//         const { email, password } = req.body;
//         if (!email || !password) {
//             res.status(400).json({ message: "Email and password are required" });
//             return;
//         }
//         const user = await User.findOne({ email });
//         if (!user) {
//             res.status(404).json({ message: "User not found" });
//             return;
//         }
//         const isPasswordCorrect = await user.comparePassword(password);
//         if (!isPasswordCorrect) {
//             res.status(401).json({ message: "Invalid password" });
//             return;
//         }
//         // Generate JWT for your app
//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
//         // Get Moodle login token
//         let moodleToken = null;
//         try {
//             moodleToken = await getMoodleToken(email, password);
//             console.log("Moodle token:", moodleToken); 
//         } catch (error) {
//             console.error("Error fetching Moodle token:", error);
//         }
//         // Construct Moodle Auto-login URL
//         const moodleAutoLoginUrl = `${MOODLE_URL}/login/index.php?token=${moodleToken}`;
//         console.log("moodleId:", user.moodleUserId);
//         res.status(200).json({ token, moodleAutoLoginUrl, user: { id: user._id, moodleToken: moodleToken, moodleid: user.moodleUserId, name: user.name, email: user.email, role: user.role, firstLogin: user.firstLogin } });
//         return;
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//         next(error);
//     } finally {
//         console.log("Login endpoint finished");
//     }
// };
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Login endpoint reached");
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isPasswordCorrect = yield user.comparePassword(password);
        if (!isPasswordCorrect) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }
        // 1. Generate JWT for your app
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        let moodleToken = null;
        try {
            moodleToken = yield (0, moodleService_3.getMoodleToken)(email, password);
            console.log("Moodle token:", moodleToken);
        }
        catch (error) {
            console.error("Error fetching Moodle token:", error);
        }
        // 2. Generate Moodle one-time login URL via auth_userkey only for coach users
        let moodleLoginUrl = null;
        const moodleAutoLoginUrl = `${MOODLE_URL}/login/index.php?token=${moodleToken}`;
        // Only generate the special login URL for coach users
        if (user.role === 'coach') {
            try {
                const MOODLE_TOKEN = process.env.MOODLE_API_TOKEN; // Token for web service user
                const MOODLE_URL = process.env.MOODLE_URL || 'https://yourmoodle.com';
                const FUNCTION_NAME = 'auth_userkey_request_login_url';
                const serverUrl = `${MOODLE_URL}/webservice/rest/server.php?wstoken=${MOODLE_TOKEN}&wsfunction=${FUNCTION_NAME}&moodlewsrestformat=json`;
                console.log(email);
                const params = qs_1.default.stringify({
                    'user[username]': email, // or 'user[email]' if that's the configured mapping field
                });
                const response = yield axios_1.default.post(serverUrl, params, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                });
                console.log("Response from Moodle:", response.data);
                moodleLoginUrl = response.data.loginurl;
            }
            catch (error) {
                console.error('Failed to get Moodle login URL:', error);
            }
        }
        res.status(200).json({
            token,
            moodleAutoLoginUrl, moodleLoginUrl,
            user: {
                id: user._id,
                moodleToken: moodleToken,
                moodleid: user.moodleUserId,
                name: user.name,
                email: user.email,
                role: user.role,
                firstLogin: user.firstLogin
            }
        });
        // res.status(200).json({ token, moodleAutoLoginUrl, user: { id: user._id, moodleToken: moodleToken, moodleid: user.moodleUserId, name: user.name, email: user.email, role: user.role, firstLogin: user.firstLogin } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        next(error);
    }
    finally {
        console.log("Login endpoint finished");
    }
});
exports.login = login;
/**
 * Registers a new user in both the application and Moodle
 * @async
 * @param {AuthRequest} req - Express request object with user details
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 *
 * @throws {400} - If required fields are missing
 * @throws {409} - If user already exists
 * @throws {500} - For internal server errors
 */
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Register endpoint reached");
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            res.status(400).json({ message: "Name, email, password, and role are required" });
            return;
        }
        // Check if user already exists in the database
        let existingUser = yield User_1.User.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: "User already exists" });
            return;
        }
        // First, create user in Moodle
        let userId;
        try {
            userId = yield (0, moodleService_1.createMoodleUser)(name, email, email.split('@')[0], password);
            if (!userId) {
                throw new Error("Moodle user creation failed");
            }
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error("Error creating Moodle user:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                res.status(500).json({ message: "Moodle registration failed", error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message });
            }
            else {
                console.error("Error during Moodle registration:", error.message);
                res.status(500).json({ message: "Moodle registration error: Check Email Syntax", error: error.message });
            }
            return;
        }
        // Assign role in Moodle
        try {
            const roleId = roleMapping[role];
            console.log("Role ID:", roleId);
            yield (0, moodleService_2.assignUserRole)(userId, roleId);
        }
        catch (error) {
            console.error("Error assigning role in Moodle:", error.message);
            res.status(500).json({ message: "Failed to assign role in Moodle", error: error.message });
            return;
        }
        // Only if Moodle registration succeeds, save the user in MongoDB
        const newUser = new User_1.User({ name, email, password, role, moodleUserId: userId, firstLogin: true });
        yield newUser.save();
        // Generate JWT Token
        // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
        res.status(201).json({
            message: "User registered successfully",
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, firstLogin: newUser.firstLogin },
        });
    }
    catch (error) {
        console.error("Unexpected server error:", error);
        res.status(500).json({ message: "Internal server error" });
        next(error);
    }
    finally {
        console.log("Register endpoint finished");
    }
});
exports.register = register;
/**
 * Validates a JWT token and returns user information
 * @async
 * @param {AuthRequest} req - Express request object with authorization header
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 *
 * @throws {400} - If token is missing
 * @throws {404} - If user is not found
 * @throws {500} - For internal server errors
 */
const validateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("Validate token endpoint reached");
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(400).json({ message: "Token is required" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield User_1.User.findById(decoded.id);
        if (!user) {
            res.status(404).json({ message: "No user found with this id" });
            return;
        }
        res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        next(error);
        return;
    }
    finally {
        console.log("Validate token endpoint finished");
    }
});
exports.validateToken = validateToken;
