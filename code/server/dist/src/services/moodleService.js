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
exports.assignUserRole = exports.getMoodleToken = exports.createMoodleUser = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const MOODLE_URL = process.env.MOODLE_URL;
const MOODLE_REGISTER_URL = `${MOODLE_URL}/webservice/rest/server.php`;
const MOODLE_LOGIN_URL = `${MOODLE_URL}/login/token.php`;
const MOODLE_API_TOKEN = process.env.MOODLE_API_TOKEN;
if (!MOODLE_URL || !MOODLE_API_TOKEN) {
    throw new Error("Missing MOODLE_URL or MOODLE_API_TOKEN in environment variables");
}
/**
 * Creates a new user in Moodle
 * @async
 * @param {string} name - Full name of the user
 * @param {string} email - User's email address
 * @param {string} username - Desired username
 * @param {string} password - User's password
 * @returns {Promise<number>} Created user's ID
 * @throws {Error} If user creation fails
 */
const createMoodleUser = (name, email, username, password) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const formData = new URLSearchParams();
        formData.append("wstoken", MOODLE_API_TOKEN);
        formData.append("wsfunction", "core_user_create_users");
        formData.append("moodlewsrestformat", "json");
        formData.append("users[0][username]", email);
        formData.append("users[0][firstname]", name.split(" ")[0]);
        formData.append("users[0][lastname]", name.split(" ").slice(1).join(" ") || "User");
        formData.append("users[0][email]", email);
        formData.append("users[0][password]", password);
        formData.append("users[0][auth]", "manual");
        console.log("Sending request to Moodle:", formData.toString());
        const response = yield axios_1.default.post(MOODLE_REGISTER_URL, formData.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        console.log("Moodle Response:", response.data);
        if (response.data && !response.data.exception) {
            console.log("Moodle User Created:", response.data);
            return response.data[0].id;
        }
        else {
            console.error("Moodle Error Response:", response.data);
            throw new Error(response.data.message || "Moodle user creation failed.");
        }
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("Moodle API Error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        }
        else {
            console.error("Unexpected Error:", error.message);
        }
        throw new Error("Failed to create Moodle user.");
    }
});
exports.createMoodleUser = createMoodleUser;
const getMoodleToken = (username, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🚀 Sending request to Moodle for token");
        const response = yield axios_1.default.post(MOODLE_LOGIN_URL, null, {
            params: {
                username: username.trim(),
                password: password.trim(),
                service: "MoodleAPIService", // Make sure this matches the service in Moodle
            },
        });
        if (response.data.token) {
            return response.data.token;
        }
        else {
            console.error("Failed to get Moodle token:", response.data);
            return null;
        }
    }
    catch (error) {
        console.error("Error fetching Moodle token:", error);
        return null;
    }
});
exports.getMoodleToken = getMoodleToken;
/**
 * Assigns a role to a user in Moodle
 * @async
 * @param {number} userid - Moodle user ID
 * @param {number} roleid - Moodle role ID to assign
 * @returns {Promise<any>} Response from Moodle API
 * @throws {Error} If role assignment fails
 */
const assignUserRole = (userid, roleid) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const params = new URLSearchParams();
        params.append("wstoken", MOODLE_API_TOKEN);
        params.append("wsfunction", "core_role_assign_roles");
        params.append("moodlewsrestformat", "json");
        // Correctly formatted assignments
        params.append("assignments[0][roleid]", String(roleid));
        params.append("assignments[0][userid]", String(userid));
        params.append("assignments[0][contextid]", "1"); // Adjust if needed
        params.append("assignments[0][contextlevel]", "system"); // Adjust as needed
        console.log("🚀 Sending role assignment request:", params.toString());
        const response = yield axios_1.default.post(MOODLE_REGISTER_URL, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        console.log(" Moodle Role Assignment done:");
        return response.data;
    }
    catch (error) {
        console.error(" Moodle Role Assignment Error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new Error("Failed to assign role.");
    }
});
exports.assignUserRole = assignUserRole;
