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
exports.getLearnerPerformance = exports.enrollUserInCourse = exports.getUserCourses = exports.courseContents = exports.getCourses = exports.deleteUserAccount = exports.getLearnerProgress = exports.updatePreferences = exports.updateUserProfile = exports.getUserProfile = void 0;
const User_1 = require("@/models/User");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const qs_1 = __importDefault(require("qs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const MOODLE_URL = process.env.MOODLE_URL;
const moodleToken = process.env.MOODLE_API_TOKEN; // Your stored Moodle token
/**
 * Get user profile
 * @route GET /api/users/profile
 */
const getUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserProfile = getUserProfile;
/**
 * Update user profile
 * @route PUT /api/users/profile
 */
const updateUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { name, email, favoritePasstime, productivityHabit, skillInProgress, } = req.body;
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Update basic fields
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        // Update custom profile fields
        // First ensure the field exists in the User model
        if (!user.profile) {
            user.profile = {};
        }
        if (favoritePasstime)
            user.profile.favoritePasstime = favoritePasstime;
        if (productivityHabit)
            user.profile.productivityHabit = productivityHabit;
        if (skillInProgress)
            user.profile.skillInProgress = skillInProgress;
        const updatedUser = yield user.save();
        // Construct response object with all relevant fields
        const userResponse = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            favoritePasstime: (_b = updatedUser.profile) === null || _b === void 0 ? void 0 : _b.favoritePasstime,
            productivityHabit: (_c = updatedUser.profile) === null || _c === void 0 ? void 0 : _c.productivityHabit,
            skillInProgress: (_d = updatedUser.profile) === null || _d === void 0 ? void 0 : _d.skillInProgress,
        };
        res.status(200).json(userResponse);
    }
    catch (error) {
        next(error);
    }
});
exports.updateUserProfile = updateUserProfile;
/**
 * Update user preferences
 * @route PUT /api/users/preferences
 */
const updatePreferences = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { interests } = req.body;
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.preferences.interests = interests || user.preferences.interests;
        yield user.save();
        res.status(200).json({ message: "Preferences updated successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePreferences = updatePreferences;
/**
 * Get learner progress (for coaches)
 * @route GET /api/users/learners/:learnerId/progress
 */
const getLearnerProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO: Implement this function
});
exports.getLearnerProgress = getLearnerProgress;
/**
 * Delete user account
 * @route DELETE /api/users/profile
 */
const deleteUserAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        yield user.deleteOne();
        res.status(200).json({ message: "User account deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUserAccount = deleteUserAccount;
const getCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moodleUrlcourses = `${MOODLE_URL}/webservice/rest/server.php`;
        const response = yield axios_1.default.get(moodleUrlcourses, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_course_get_courses",
                moodlewsrestformat: "json",
            },
        });
        res.json(response.data); // Return courses to frontend
    }
    catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Failed to fetch courses" });
    }
});
exports.getCourses = getCourses;
//in frontend
// fetch("http://your-backend-url/api/courses")
//     .then(response => response.json())
//     .then(data => console.log("Courses:", data))
//     .catch(error => console.error("Error:", error));
const courseContents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moodleUrl = `${MOODLE_URL}/webservice/rest/server.php`;
        const { courseId } = req.params;
        if (!courseId) {
            res.status(400).json({ message: "Course ID is required" });
            return;
        }
        const response = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_course_get_contents",
                moodlewsrestformat: "json",
                courseid: courseId,
            },
        });
        res.json(response.data); // Ensure a valid response is returned
    }
    catch (error) {
        console.error("Error fetching course contents:", error);
        res.status(500).json({ message: "Failed to fetch course contents" });
    }
});
exports.courseContents = courseContents;
//in frontend
// fetch("http://yourserver.com/api/course/5") // 5 is the Course ID
//   .then((response) => response.json())
//   .then((data) => console.log(data))
//   .catch((error) => console.error("Error fetching course contents:", error));
const getUserCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
        const moodleToken = req.headers['x-moodle-token'];
        // console.log("Moodle Token from custom header:", moodleToken);
        // const moodleToken="c0cc40c5f931c1dd32efa5d1ebda4f50";
        if (!moodleToken) {
            res.status(401).json({ message: "Unauthorized - Missing token" });
            return;
        }
        const userInfoResponse = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_webservice_get_site_info",
                moodlewsrestformat: "json",
            },
        });
        const userId = (_a = userInfoResponse.data) === null || _a === void 0 ? void 0 : _a.userid;
        if (!userId) {
            res.status(400).json({ message: "User ID not found" });
            return;
        }
        // console.log("User ID:", userId);
        const coursesResponse = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_enrol_get_users_courses",
                moodlewsrestformat: "json",
                userid: userId,
            },
        });
        res.json(coursesResponse.data); // ✅ Ensure response is sent
    }
    catch (error) {
        console.error("Error fetching user courses:", error);
        res.status(500).json({ message: "Failed to fetch user-specific courses" });
    }
});
exports.getUserCourses = getUserCourses;
const enrollUserInCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = req.query.userId;
        const courseId = req.query.courseId;
        const roleId = req.query.roleId ? Number(req.query.roleId) : 5;
        const timestart = req.query.timestart ? Number(req.query.timestart) : 0;
        const timeend = req.query.timeend ? Number(req.query.timeend) : 0;
        const suspend = req.query.suspend ? Number(req.query.suspend) : 0;
        console.log("req.query", req.query);
        const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
        console.log("req.body", req.body);
        if (!userId || !courseId) {
            res.status(400).json({ message: "User ID and Course ID are required" });
            return;
        }
        // ✅ Moodle API requires URL-encoded format (not JSON)
        const payload = qs_1.default.stringify({
            wstoken: moodleToken,
            wsfunction: "enrol_manual_enrol_users",
            moodlewsrestformat: "json",
            "enrolments[0][roleid]": roleId || 5, // 📌 Default role: Student (5)
            "enrolments[0][userid]": userId,
            "enrolments[0][courseid]": courseId,
            "enrolments[0][timestart]": timestart || 0, // Optional
            "enrolments[0][timeend]": timeend || 0, // Optional
            "enrolments[0][suspend]": suspend || 0, // Optional
        });
        // ✅ Sending request with correct headers
        const response = yield axios_1.default.post(moodleUrl, payload, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        console.log("Enrollment response:", response.data);
        res.status(200).json({ message: "User enrolled successfully", data: response.data });
    }
    catch (error) {
        console.error("Enrollment error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res
            .status(500)
            .json({ message: "Failed to enroll user", error: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data });
    }
});
exports.enrollUserInCourse = enrollUserInCourse;
const getLearnerPerformance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Mock data for now - in a real implementation, you would:
        // 1. Query Moodle for assignment grades and submission status
        // 2. Calculate performance metrics
        // 3. Return structured data
        // For now, return mock data
        const performanceData = {
            grade: 8.966,
            submissions: [
                { month: "Jan", completed: 8, total: 10 },
                { month: "Feb", completed: 7, total: 8 },
                { month: "Mar", completed: 9, total: 9 },
            ],
            courseProgress: [
                { id: "1", title: "Leadership Basics", progress: 78 },
                { id: "2", title: "Team Management", progress: 45 },
                { id: "3", title: "Decision Making", progress: 92 },
            ],
            assignmentStatus: {
                completed: 24,
                pending: 3,
                late: 1,
            },
            recentActivity: [
                {
                    id: "1",
                    description: 'Completed "Leadership Communication" module',
                    timestamp: "Yesterday at 4:30 PM",
                    type: "module_completion",
                },
                {
                    id: "2",
                    description: 'Submitted assignment "Team Building Exercise"',
                    timestamp: "March 14, 2025 at 10:15 AM",
                    type: "assignment_submission",
                },
                {
                    id: "3",
                    description: 'Started "Decision Making in Crisis" module',
                    timestamp: "March 13, 2025 at 2:45 PM",
                    type: "course_started",
                },
            ],
        };
        res.status(200).json(performanceData);
    }
    catch (error) {
        next(error);
    }
});
exports.getLearnerPerformance = getLearnerPerformance;
