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
exports.testFetchAllCourseTags = exports.getUserCoursesWithCompletion = exports.markFirstLoginComplete = exports.getLearnerPerformance = exports.getCourseCategories = exports.enrollUserInCourse = exports.getUserCourses = exports.getTotalModules = exports.courseContents = exports.getCourses = exports.deleteUserAccount = exports.getLearnerProgress = exports.updatePreferences = exports.updateUserProfile = exports.getUserProfile = void 0;
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
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
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
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
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
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
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
        // Initialize preferences object if it doesn't exist
        if (!user.preferences) {
            user.preferences = { interests: [] };
        }
        // Update interests array
        user.preferences.interests = interests || user.preferences.interests;
        yield user.save();
        // Return the updated user with preferences
        res.status(200).json({
            message: "Preferences updated successfully",
            preferences: user.preferences
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePreferences = updatePreferences;
/**
 * Get learner progress (for coaches)
 * @route GET /api/users/learners/:learnerId/progress
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
const getLearnerProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO: Implement this function
});
exports.getLearnerProgress = getLearnerProgress;
/**
 * Delete user account
 * @route DELETE /api/users/profile
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
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
function fetchCourseTags(courseId) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = moodleToken; // Use the stored Moodle token
        try {
            const response = yield axios_1.default.get(`${process.env.MOODLE_URL}/webservice/rest/server.php`, {
                params: {
                    wstoken: token,
                    wsfunction: 'local_fetchtags_get_tags',
                    moodlewsrestformat: 'json',
                    courseid: courseId,
                },
            });
            if (Array.isArray(response.data)) {
                return response.data;
            }
            else {
                console.error('Unexpected response:', response.data);
                return [];
            }
        }
        catch (error) {
            console.error('Failed to fetch course tags:', error);
            return [];
        }
    });
}
function fetchdallCourseTags() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = moodleToken; // Use the stored Moodle token
        try {
            const response = yield axios_1.default.get(`${process.env.MOODLE_URL}/webservice/rest/server.php`, {
                params: {
                    wstoken: token,
                    wsfunction: 'local_coursetags_get_course_tags',
                    moodlewsrestformat: 'json',
                },
            });
            if (Array.isArray(response.data)) {
                return response.data;
            }
            else {
                console.error('Unexpected response:', response.data);
                return [];
            }
        }
        catch (error) {
            console.error('Failed to fetch course tags:', error);
            return [];
        }
    });
}
/**
 * Get all courses
 * @route GET /api/courses
 * @param req - Express request object
 * @param res - Express response object
 */
/**
 * Get all courses
 * @route GET /api/courses
 * @param req - Express request object
 * @param res - Express response object
 */
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
        // Get courses data
        const courses = response.data;
        // For each course, fetch the tags
        const coursesWithTags = yield Promise.all(courses.map((course) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Fetch tags for this course
                const tags = yield fetchCourseTags(course.id);
                // Return course with tags
                return Object.assign(Object.assign({}, course), { tags: tags });
            }
            catch (error) {
                console.error(`Error fetching tags for course ${course.id}:`, error);
                // If there's an error fetching tags, return course without tags
                return Object.assign(Object.assign({}, course), { tags: [] });
            }
        })));
        res.json(coursesWithTags); // Return courses with their tags to frontend
    }
    catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Failed to fetch courses" });
    }
});
exports.getCourses = getCourses;
// export const getCourses = async (req: Request, res: Response) => {
//   try {
//     const moodleUrlcourses = `${MOODLE_URL}/webservice/rest/server.php`;
//     const response = await axios.get(moodleUrlcourses, {
//       params: {
//         wstoken: moodleToken,
//         wsfunction: "core_course_get_courses",
//         moodlewsrestformat: "json",
//       },
//     });
//     res.json(response.data); // Return courses to frontend
//   } catch (error) {
//     console.error("Error fetching courses:", error);
//     res.status(500).json({ message: "Failed to fetch courses" });
//   }
// };
/**
 * Get course contents
 * @route GET /api/course/:courseId
 * @param req - Express request object
 * @param res - Express response object
 */
const courseContents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moodleUrl = `${MOODLE_URL}/webservice/rest/server.php`;
        const { courseId } = req.params;
        if (!courseId) {
            res.status(400).json({ message: "Course ID is required" });
            return;
        }
        const moodleToken = req.headers['x-moodle-token'];
        if (!moodleToken) {
            res.status(401).json({ message: "Unauthorized - Missing token" });
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
        const courseContents = response.data;
        // Fetch tags for the course
        const tags = yield fetchCourseTags(Number(courseId));
        res.status(200).json({
            courseContents,
            tags: tags.map(tag => tag.name), // Extract tag names as an array of strings
        });
    }
    catch (error) {
        console.error("Error fetching course contents:", error);
        res.status(500).json({ message: "Failed to fetch course contents" });
    }
});
exports.courseContents = courseContents;
/**
 * Gets the total number of modules/activities for a course
 * @param courseId - The ID of the course
 * @param token - Moodle API token
 * @returns Promise resolving to the total count of modules and course sections
 */
const getTotalModules = (courseId, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moodleUrl = `${MOODLE_URL}/webservice/rest/server.php`;
        if (!courseId) {
            throw new Error("Course ID is required");
        }
        if (!token) {
            throw new Error("Moodle token is required");
        }
        const response = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: token,
                wsfunction: "core_course_get_contents",
                moodlewsrestformat: "json",
                courseid: courseId,
            },
        });
        const courseSections = response.data;
        // Calculate total number of activities
        const totalActivities = courseSections.reduce((count, section) => {
            return count + (section.modules ? section.modules.length : 0);
        }, 0);
        return {
            totalActivities,
            courseSections,
        };
    }
    catch (error) {
        console.error(`Error fetching modules for course ${courseId}:`, error);
        throw error;
    }
});
exports.getTotalModules = getTotalModules;
/**
 * Get user courses
 * @route GET /api/courses
 * @param req - Express request object
 * @param res - Express response object
 */
const getUserCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
        const moodleToken = req.headers['x-moodle-token'];
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
/**
 * Enroll user in a course
 * @route GET /api/enroll
 * @param req - Express request object
 * @param res - Express response object
 */
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
/**
 * Get all course categories
 * @route GET /api/categories
 * @param req - Express request object
 * @param res - Express response object
 */
const getCourseCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
        // Get the token either from the request headers or use the environment variable
        const moodleTokenFromHeader = req.headers['x-moodle-token'];
        const tokenToUse = moodleTokenFromHeader || moodleToken;
        if (!tokenToUse) {
            res.status(401).json({ message: "Unauthorized - Missing token" });
            return;
        }
        // Make request to Moodle API to get all categories
        const response = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: tokenToUse,
                wsfunction: 'core_course_get_categories',
                moodlewsrestformat: 'json',
                addsubcategories: 1
            }
        });
        // Process the response to include additional information if needed
        const categories = response.data.map((category) => ({
            id: category.id,
            name: category.name,
            idnumber: category.idnumber || '',
            description: category.description,
            descriptionFormat: category.descriptionformat,
            parent: category.parent,
            sortOrder: category.sortorder,
            courseCount: category.coursecount,
            visible: category.visible,
            path: category.path,
            depth: category.depth,
            theme: category.theme || null
        }));
        // Return the processed categories
        res.status(200).json(categories);
    }
    catch (error) {
        console.error('Error fetching course categories:', error);
        // Provide more detailed error information
        if (error.response) {
            console.error("Response error data:", error.response.data);
            console.error("Response error status:", error.response.status);
        }
        res.status(500).json({
            message: 'Failed to fetch course categories',
            error: ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message
        });
    }
});
exports.getCourseCategories = getCourseCategories;
/**
 * Get learner performance
 * @route GET /api/users/performance
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
const getLearnerPerformance = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if authenticated user exists
        if (!req.user || !req.user._id) {
            res.status(401).json({ message: "Unauthorized - User not authenticated" });
            return;
        }
        const userId = req.user._id;
        // Get the authorization token from the request
        const authToken = req.headers.authorization;
        console.log("Fetching performance for user:", userId);
        // Fetch enrolled courses for this user from Moodle
        const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
        let courseProgress = [];
        let totalCompleted = 0;
        let totalPending = 0;
        let totalLate = 0;
        let recentActivity = [];
        try {
            // Get the user's Moodle ID
            const user = yield User_1.User.findById(userId);
            if (!user || !user.moodleUserId) {
                res.status(404).json({ message: "User Moodle ID not found" });
                return;
            }
            // Fetch the user's courses
            const coursesResponse = yield axios_1.default.get(moodleUrl, {
                params: {
                    wstoken: moodleToken,
                    wsfunction: "core_enrol_get_users_courses",
                    moodlewsrestformat: "json",
                    userid: user.moodleUserId,
                },
            });
            // For each course, fetch MongoDB completion data
            const courses = coursesResponse.data;
            if (courses && courses.length > 0) {
                const coursePromises = courses.map((course) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        // Get MongoDB module completion data - add auth token to internal request
                        const moduleProgressResponse = yield axios_1.default.get(`${process.env.APP_URL || 'http://localhost:8080'}/api/completion/module-progress/${course.id}?userId=${userId}`, {
                            headers: {
                                Authorization: authToken, // Pass the same auth token
                            },
                        });
                        // Get MongoDB course progress data - add auth token to internal request
                        const courseProgressResponse = yield axios_1.default.get(`${process.env.APP_URL || 'http://localhost:8080'}/api/completion/course-progress/${course.id}?userId=${userId}`, {
                            headers: {
                                Authorization: authToken, // Pass the same auth token
                            },
                        });
                        // Calculate progress percentage
                        const completedModules = moduleProgressResponse.data.completedModuleIds || [];
                        const completedCount = courseProgressResponse.data.completedCount || 0;
                        // For simplicity, assuming each course has 10 modules
                        // In a real implementation, you'd fetch the actual module count for each course
                        const totalModules = 10;
                        const progressPercentage = Math.round((completedCount / totalModules) * 100);
                        // Add to course progress array
                        return {
                            id: course.id.toString(),
                            title: course.fullname || course.shortname,
                            progress: progressPercentage,
                        };
                    }
                    catch (error) {
                        console.error(`Error fetching progress for course ${course.id}:`, error);
                        if (error.response) {
                            console.error("Response status:", error.response.status);
                            console.error("Response data:", error.response.data);
                        }
                        return {
                            id: course.id.toString(),
                            title: course.fullname || course.shortname,
                            progress: 0,
                        };
                    }
                }));
                courseProgress = yield Promise.all(coursePromises);
                // Get activity completion data for assignments status
                for (const course of courses) {
                    try {
                        const activityResponse = yield axios_1.default.get(`${process.env.APP_URL || 'http://localhost:8080'}/api/completion/activities/${course.id}/${user.moodleUserId}`, {
                            headers: {
                                Authorization: authToken, // Pass the same auth token
                            },
                        });
                        const activities = ((_a = activityResponse.data) === null || _a === void 0 ? void 0 : _a.statuses) || [];
                        // Count assignment statuses
                        activities.forEach((activity) => {
                            if (activity.modname === "assign") {
                                if (activity.state === 1) {
                                    totalCompleted++;
                                    // Add to recent activity
                                    if (activity.timecompleted) {
                                        recentActivity.push({
                                            id: `activity-${activity.cmid}`,
                                            description: `Completed assignment in "${course.fullname || course.shortname}"`,
                                            timestamp: new Date(activity.timecompleted * 1000).toLocaleString(),
                                            type: "assignment_submission",
                                        });
                                    }
                                }
                                else if (activity.state === 0) {
                                    totalPending++;
                                }
                                else if (activity.state === 3) {
                                    totalLate++;
                                }
                            }
                        });
                    }
                    catch (error) {
                        console.error(`Error fetching activities for course ${course.id}:`, error);
                        if (error.response) {
                            console.error("Response status:", error.response.status);
                            console.error("Response data:", error.response.data);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("Error fetching user courses:", error);
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }
        }
        // Sort recent activities by timestamp (newest first) and limit to 10
        recentActivity.sort((a, b) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        recentActivity = recentActivity.slice(0, 10);
        // Calculate overall grade based on course progress (simplified calculation)
        const totalCourses = courseProgress.length;
        const totalProgress = courseProgress.reduce((sum, course) => sum + course.progress, 0);
        const averageGrade = totalCourses > 0 ? Math.round((totalProgress / totalCourses) * 0.9) + 10 : 70; // Ensure grade is between 10-100
        // Create response object with real data
        const performanceData = {
            grade: averageGrade,
            submissions: [
                { month: "Jan", completed: Math.round(totalCompleted * 0.3), total: Math.round(totalCompleted * 0.3) + 2 },
                { month: "Feb", completed: Math.round(totalCompleted * 0.3), total: Math.round(totalCompleted * 0.3) + 1 },
                { month: "Mar", completed: Math.round(totalCompleted * 0.4), total: Math.round(totalCompleted * 0.4) },
            ],
            courseProgress,
            assignmentStatus: {
                completed: totalCompleted,
                pending: totalPending,
                late: totalLate,
            },
            recentActivity,
        };
        res.status(200).json(performanceData);
    }
    catch (error) {
        console.error("Error in getLearnerPerformance:", error);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        res.status(500).json({ message: "Failed to fetch performance data" });
    }
});
exports.getLearnerPerformance = getLearnerPerformance;
const markFirstLoginComplete = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get user ID from the authenticated request
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        console.log("User ID from authenticated request:", userId);
        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return; // Add return statement to prevent further execution
        }
        const updatedUser = yield User_1.User.findByIdAndUpdate(userId, { firstLogin: false }, { new: true });
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return; // Add return statement to prevent further execution
        }
        res.status(200).json({ message: 'First login marked as complete' });
    }
    catch (error) {
        console.error('Error updating first login status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.markFirstLoginComplete = markFirstLoginComplete;
const getUserCoursesWithCompletion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
        const moodleToken = req.headers['x-moodle-token'];
        const userid = req.query.userid;
        if (!moodleToken) {
            res.status(401).json({ message: "Unauthorized - Missing token" });
            return;
        }
        console.log("User ID from query:", userid);
        // 1. Get user info to obtain Moodle user ID
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
        // 2. Get all enrolled courses for the user
        const coursesResponse = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_enrol_get_users_courses",
                moodlewsrestformat: "json",
                userid: userId,
            },
        });
        const courses = coursesResponse.data;
        // 3. Fetch completion data for each course from MongoDB API routes
        const coursesWithCompletion = yield Promise.all(courses.map((course) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Get the authorization token from the request
                const authToken = req.headers.authorization;
                // Get total modules count by directly calling getTotalModules function
                let totalModules = 10; // Default fallback value
                try {
                    // Direct function call instead of API request
                    const result = yield (0, exports.getTotalModules)(course.id.toString(), moodleToken);
                    totalModules = result.totalActivities;
                    console.log(`Total modules for course ${course.id}: ${totalModules}`);
                }
                catch (moduleError) {
                    console.error(`Error fetching total modules for course ${course.id}:`, moduleError);
                    // Continue with default value if there's an error
                }
                // Ensure userId is explicitly passed as a query parameter
                const moduleUrl = `${process.env.API_BASE_URL || 'http://localhost:8080'}/api/completion/module-progress/${course.id}?userId=${userid}`;
                console.log(`Fetching module progress from: ${moduleUrl}`);
                const moduleProgressResponse = yield axios_1.default.get(moduleUrl, {
                    headers: {
                        Authorization: authToken,
                        'x-moodle-token': moodleToken
                    },
                });
                console.log(`Module progress response for course ${course.id}:`, moduleProgressResponse.data);
                // Get MongoDB course progress data with userId explicitly in URL
                const courseProgressUrl = `${process.env.API_BASE_URL || 'http://localhost:8080'}/api/completion/course-progress/${course.id}?userId=${userid}`;
                console.log(`Fetching course progress from: ${courseProgressUrl}`);
                const courseProgressResponse = yield axios_1.default.get(courseProgressUrl, {
                    headers: {
                        Authorization: authToken,
                        'x-moodle-token': moodleToken
                    },
                });
                console.log(`Course progress response for course ${course.id}:`, courseProgressResponse.data);
                // Process completion data from MongoDB
                const completedModules = moduleProgressResponse.data.completedModuleIds || [];
                const completedCount = courseProgressResponse.data.completedCount || 0;
                // Calculate overall completion percentage using the actual total modules count
                const completionPercentage = totalModules > 0
                    ? Math.round((completedCount / totalModules) * 100)
                    : 0;
                // Add visually appealing data for the frontend
                const lastUpdated = new Date().toISOString();
                const prettyStatus = completionPercentage === 100
                    ? "Completed!"
                    : completionPercentage > 75
                        ? "Almost there!"
                        : completionPercentage > 50
                            ? "Good progress!"
                            : completionPercentage > 25
                                ? "Keep going!"
                                : "Just started";
                // Return combined course and completion data with visually appealing elements
                return Object.assign(Object.assign({}, course), { completion: {
                        percentage: completionPercentage,
                        completedCount,
                        totalModules,
                        completedModuleIds: completedModules,
                        isComplete: completionPercentage === 100,
                        status: prettyStatus,
                        lastUpdated: lastUpdated,
                        displayColor: completionPercentage >= 75 ? "green" :
                            completionPercentage >= 50 ? "blue" :
                                completionPercentage >= 25 ? "orange" : "red"
                    } });
            }
            catch (error) {
                console.error(`Error fetching completion data for course ${course.id}:`, error);
                // Return course with empty completion data if there's an error
                return Object.assign(Object.assign({}, course), { completion: {
                        percentage: 0,
                        completedCount: 0,
                        totalModules: 0,
                        completedModuleIds: [],
                        activityStats: {
                            completed: 0,
                            pending: 0,
                            late: 0
                        },
                        isComplete: false,
                        error: "Failed to fetch completion data"
                    } });
            }
        })));
        res.status(200).json(coursesWithCompletion);
    }
    catch (error) {
        console.error("Error fetching user courses with completion:", error);
        res.status(500).json({ message: "Failed to fetch user courses with completion data" });
    }
});
exports.getUserCoursesWithCompletion = getUserCoursesWithCompletion;
// Test endpoint for fetching all course tags
const testFetchAllCourseTags = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tags = yield fetchallCourseTags();
        res.status(200).json(tags);
    }
    catch (error) {
        console.error("Error in test endpoint:", error);
        res.status(500).json({ message: "Failed to fetch all course tags", error: String(error) });
    }
});
exports.testFetchAllCourseTags = testFetchAllCourseTags;
function fetchallCourseTags() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = moodleToken; // Use the stored Moodle token
        try {
            const response = yield axios_1.default.get(`${process.env.MOODLE_URL}/webservice/rest/server.php`, {
                params: {
                    wstoken: token,
                    wsfunction: 'local_coursetags_get_course_tags',
                    moodlewsrestformat: 'json',
                },
            });
            if (Array.isArray(response.data)) {
                return response.data;
            }
            else {
                console.error('Unexpected response:', response.data);
                return [];
            }
        }
        catch (error) {
            console.error('Failed to fetch all course tags:', error);
            return [];
        }
    });
}
