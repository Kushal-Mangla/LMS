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
exports.updateActivityCompletionStatus = exports.markCourseSelfCompleted = exports.getUserProgress = exports.getCourseCompletionStatus = exports.getActivityCompletionStatus = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const MOODLE_URL = process.env.MOODLE_URL;
const moodleToken = process.env.MOODLE_API_TOKEN; // Your stored Moodle token
/**
 * Get activity completion status
 * @param userId - User ID
 * @param courseId - Course ID
 * @returns Activity completion status
 */
const getActivityCompletionStatus = (userId, courseId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
        const moodletokenfun = process.env.MOODLE_API_TOKEN;
        const response = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodletokenfun,
                wsfunction: "core_completion_get_activities_completion_status",
                moodlewsrestformat: "json",
                userid: userId,
                courseid: courseId,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching activity completion status:", error);
        throw error;
    }
});
exports.getActivityCompletionStatus = getActivityCompletionStatus;
//state: 0 → Incomplete
// state: 1 → Completed
// state: 2 → Passed
// state: 3 → Failed
/**
 * Get course completion status
 * @param userId - User ID
 * @param courseId - Course ID
 * @returns Course completion status
 */
const getCourseCompletionStatus = (userId, courseId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
        const moodletokenfun = process.env.MOODLE_API_TOKEN;
        const response = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodletokenfun,
                wsfunction: "core_completion_get_course_completion_status",
                moodlewsrestformat: "json",
                courseid: String(courseId), // ✅ Ensure it's a valid string
                userid: String(userId), // ✅ Ensure it's a valid string    
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching course completion status:", error);
        throw error;
    }
});
exports.getCourseCompletionStatus = getCourseCompletionStatus;
//"completed": 1 → Course completed
//"completed": 0 → Course not completed
/**
 * Get user progress
 * @route GET /api/progress/:userId/:courseId
 * @param req - Express request object
 * @param res - Express response object
 */
const getUserProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, courseId } = req.params;
        if (!userId || !courseId) {
            return res.status(400).json({ message: "User ID and Course ID are required" });
        }
        const courseStatus = yield (0, exports.getCourseCompletionStatus)(Number(userId), Number(courseId));
        const activityStatus = yield (0, exports.getActivityCompletionStatus)(Number(userId), Number(courseId));
        res.json({
            courseCompletion: courseStatus,
            activityCompletion: activityStatus,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch progress data" });
    }
});
exports.getUserProgress = getUserProgress;
// Store completion data in a database
// ✅ Display a progress bar in the frontend
// ✅ Send notifications for completed courses
/**
 * Mark course as self-completed
 * @param courseId - Course ID
 * @param moodletokenfun - Moodle token
 * @returns API Response
 */
const markCourseSelfCompleted = (courseId, moodletokenfun) => __awaiter(void 0, void 0, void 0, function* () {
    const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
    try {
        const response = yield axios_1.default.post(moodleUrl, null, {
            params: {
                wstoken: moodletokenfun,
                wsfunction: "core_completion_mark_course_self_completed",
                moodlewsrestformat: "json",
                courseid: courseId,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error marking course as self-completed:", error);
        throw new Error("Failed to mark course as self-completed");
    }
});
exports.markCourseSelfCompleted = markCourseSelfCompleted;
/**
 * Manually update an activity's completion status.
 * @param cmid - Course Module ID
 * @param completed - Completion status (true/false)
 * @param moodletokenfun - Moodle token
 * @returns API Response with status and warnings
 */
const updateActivityCompletionStatus = (cmid, completed, moodletokenfun) => __awaiter(void 0, void 0, void 0, function* () {
    const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
    try {
        const response = yield axios_1.default.post(moodleUrl, null, {
            params: {
                wstoken: moodletokenfun,
                wsfunction: "core_completion_update_activity_completion_status_manually",
                moodlewsrestformat: "json",
                cmid,
                completed: completed ? 1 : 0,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error updating activity completion status:", error);
        throw new Error("Failed to update activity completion status");
    }
});
exports.updateActivityCompletionStatus = updateActivityCompletionStatus;
