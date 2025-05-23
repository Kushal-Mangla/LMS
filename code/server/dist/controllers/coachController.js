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
exports.getAllStudentsFromCoachCourses = exports.getAllStudentsWithCourses = exports.getCourseGrades = exports.getStudentGrades = exports.getCourseStudents = exports.getTotalModules = exports.getCoachCourses = void 0;
const User_1 = require("@/models/User");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const MOODLE_URL = process.env.MOODLE_URL;
const moodleToken = process.env.MOODLE_API_TOKEN; // Your stored Moodle token
/**
 * Helper function to get MongoDB user ID from Moodle user ID
 */
const getMongoUserIdFromMoodleId = (moodleUserId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user in MongoDB that has this moodleUserId
        const user = yield User_1.User.findOne({ moodleUserId });
        if (!user) {
            console.error(`No MongoDB user found for Moodle user ID: ${moodleUserId}`);
            return null;
        }
        return user.id.toString();
    }
    catch (error) {
        console.error(`Error looking up MongoDB user for Moodle ID ${moodleUserId}:`, error);
        return null;
    }
});
/**
 * Get coach courses
 * @route GET /api/coach/courses
 * @param req - Express request object
 * @param res - Express response object
 */
const getCoachCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
        const moodleToken = req.headers["x-moodle-token"];
        if (!moodleToken) {
            res.status(401).json({ message: "Unauthorized - Missing token" });
            return;
        }
        // ✅ Fetch User ID (Coach ID)
        const userInfoResponse = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_webservice_get_site_info",
                moodlewsrestformat: "json",
            },
        });
        const userId = userInfoResponse.data.userid;
        if (!userId) {
            res.status(400).json({ message: "Failed to retrieve user ID" });
            return;
        }
        // ✅ Fetch courses where the user is enrolled
        const enrolledCoursesResponse = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_enrol_get_users_courses",
                moodlewsrestformat: "json",
                userid: userId,
            },
        });
        const enrolledCourses = enrolledCoursesResponse.data;
        if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) {
            res.status(404).json({ message: "No enrolled courses found" });
            return;
        }
        let coachCourses = [];
        // ✅ Check role in each course
        for (const course of enrolledCourses) {
            const enrolledUsersResponse = yield axios_1.default.get(moodleUrl, {
                params: {
                    wstoken: moodleToken,
                    wsfunction: "core_enrol_get_enrolled_users",
                    moodlewsrestformat: "json",
                    courseid: course.id,
                },
            });
            const enrolledUsers = enrolledUsersResponse.data;
            // Find the current user in the enrolled list and check roles
            const coachEntry = enrolledUsers.find((user) => user.id === userId);
            if (coachEntry && coachEntry.roles.some((role) => role.roleid === 3)) {
                coachCourses.push(course);
            }
        }
        if (coachCourses.length === 0) {
            res.status(404).json({ message: "No courses found where the user is an editing teacher" });
            return;
        }
        res.json(coachCourses); // ✅ Return only courses where the user is an editing teacher
    }
    catch (error) {
        console.error("❌ Error fetching coach courses:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ message: "Failed to fetch coach-specific courses" });
    }
});
exports.getCoachCourses = getCoachCourses;
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
 * ✅ Get all students enrolled in a coach's course
 * @route GET /api/coach/course/:courseId/students
 * @param req - Express request object
 * @param res - Express response object
 */
const getCourseStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Fetching students for course...");
    try {
        const courseId = parseInt(req.params.courseId);
        const authToken = req.headers.authorization;
        if (!courseId) {
            res.status(400).json({ error: "Course ID is required" });
            return;
        }
        // Get moodle token from request headers or environment variable
        const moodleToken = req.headers["x-moodle-token"] || process.env.MOODLE_API_TOKEN;
        if (!moodleToken) {
            res.status(401).json({ message: "Unauthorized - Missing Moodle token" });
            return;
        }
        // Get total modules count for this course
        let totalModules = 10; // Default fallback value
        try {
            const result = yield (0, exports.getTotalModules)(courseId.toString(), moodleToken);
            totalModules = result.totalActivities;
            console.log(`Total modules for course ${courseId}: ${totalModules}`);
        }
        catch (moduleError) {
            console.error(`Error fetching total modules for course ${courseId}:`, moduleError);
            // Continue with default value if there's an error
        }
        const params = new URLSearchParams({
            wstoken: moodleToken,
            wsfunction: "core_enrol_get_enrolled_users",
            moodlewsrestformat: "json",
            courseid: String(courseId),
        });
        const response = yield axios_1.default.get(`${MOODLE_URL}/webservice/rest/server.php?${params.toString()}`);
        // Filter only students (roleid 5 is typically student)
        const students = response.data.filter((user) => user.roles.some((role) => role.roleid === 5));
        // Enhance each student with completion data
        const studentsWithCompletion = yield Promise.all(students.map((student) => __awaiter(void 0, void 0, void 0, function* () {
            const moodleUserId = student.id; // This is the Moodle ID
            try {
                // Convert Moodle user ID to MongoDB user ID
                const userId = yield getMongoUserIdFromMoodleId(moodleUserId);
                if (!userId) {
                    throw new Error(`No MongoDB user found for Moodle user ID: ${moodleUserId}`);
                }
                // Now use the MongoDB userId for fetching completion data
                const moduleUrl = `${process.env.API_BASE_URL || 'http://localhost:8080'}/api/completion/module-progress/${courseId}?userId=${userId}`;
                console.log(`Fetching module progress for MongoDB user ${userId} (Moodle ID: ${moodleUserId}) in course ${courseId} from: ${moduleUrl}`);
                const moduleProgressResponse = yield axios_1.default.get(moduleUrl, {
                    headers: {
                        Authorization: authToken,
                        'x-moodle-token': moodleToken
                    },
                });
                // Get MongoDB course progress data with MongoDB userId
                const courseProgressUrl = `${process.env.API_BASE_URL || 'http://localhost:8080'}/api/completion/course-progress/${courseId}?userId=${userId}`;
                console.log(`Fetching course progress for MongoDB user ${userId} (Moodle ID: ${moodleUserId}) in course ${courseId} from: ${courseProgressUrl}`);
                const courseProgressResponse = yield axios_1.default.get(courseProgressUrl, {
                    headers: {
                        Authorization: authToken,
                        'x-moodle-token': moodleToken
                    },
                });
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
                // Return student with completion data
                return Object.assign(Object.assign({}, student), { mongoUserId: userId, completion: {
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
            catch (completionError) {
                console.error(`Error fetching completion data for Moodle user ${moodleUserId} in course ${courseId}:`, completionError);
                // Return student with default completion data if fetching fails
                return Object.assign(Object.assign({}, student), { completion: {
                        percentage: 0,
                        completedCount: 0,
                        totalModules,
                        completedModuleIds: [],
                        isComplete: false,
                        status: "Data unavailable",
                        lastUpdated: new Date().toISOString(),
                        displayColor: "gray"
                    } });
            }
        })));
        res.json(studentsWithCompletion);
    }
    catch (error) {
        console.error("Error fetching students:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ error: "Failed to fetch students", details: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data });
    }
});
exports.getCourseStudents = getCourseStudents;
/**
 * Get student grades
 * @route GET /api/coach/course/:courseId/student/:userId/grades
 * @param req - Express request object
 * @param res - Express response object
 */
const getStudentGrades = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Fetching student grades...");
    try {
        const { courseId, userId } = req.params;
        const moodleToken = process.env.MOODLE_API_TOKEN;
        if (!courseId || !userId) {
            res.status(400).json({ error: "Course ID and User ID are required" });
            return;
        }
        const params = new URLSearchParams({
            wstoken: moodleToken,
            wsfunction: "gradereport_user_get_grade_items",
            moodlewsrestformat: "json",
            courseid: courseId,
            userid: userId,
        });
        const response = yield axios_1.default.get(`${process.env.MOODLE_URL}/webservice/rest/server.php?${params.toString()}`);
        res.json(response.data);
    }
    catch (error) {
        console.error("Error fetching student grades:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ error: "Failed to fetch student grades", details: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data });
    }
});
exports.getStudentGrades = getStudentGrades;
/**
 * Get course grades
 * @param courseId - Course ID
 * @returns List of grades for all students in the course
 */
const getCourseGrades = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // ✅ Get all students enrolled in the course
        const { data: enrolledUsers } = yield axios_1.default.get(`${MOODLE_URL}/webservice/rest/server.php`, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_enrol_get_enrolled_users",
                moodlewsrestformat: "json",
                courseid: String(courseId),
            },
        });
        // ✅ Filter only students (roleid 5 is typically student)
        const students = enrolledUsers.filter((user) => user.roles.some((role) => role.roleid === 5));
        let gradesList = [];
        for (const student of students) {
            // ✅ Fetch grade items for each student
            const { data: gradesData } = yield axios_1.default.get(`${MOODLE_URL}/webservice/rest/server.php`, {
                params: {
                    wstoken: moodleToken,
                    wsfunction: "gradereport_user_get_grade_items",
                    moodlewsrestformat: "json",
                    courseid: String(courseId),
                    userid: String(student.id),
                },
            });
            console.log(gradesData);
            // ✅ Handle case where `gradesData.gradeitems` is null or undefined
            const gradeItems = gradesData.gradeitems || []; // Default to an empty array if null
            console.log(gradeItems);
            gradesList.push({
                studentId: student.id,
                studentName: `${student.firstname} ${student.lastname}`,
                grades: gradeItems.map((grade) => ({
                    itemname: grade.itemname || "No item name", // Default value if itemname is missing
                    grade: grade.graderaw !== null ? grade.graderaw : "No grade", // Handle null grades
                    maxgrade: grade.grademax !== null ? grade.grademax : "No max grade", // Handle null max grade
                })),
            });
        }
        return gradesList;
    }
    catch (error) {
        console.error("❌ Error fetching grades:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
});
exports.getCourseGrades = getCourseGrades;
/**
 * Get all students with their enrolled courses
 * @route GET /api/coach/all-students
 * @param req - Express request object
 * @param res - Express response object
 */
const getAllStudentsWithCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Fetching all students with courses...");
    try {
        const moodleToken = process.env.MOODLE_API_TOKEN;
        const moodleUrl = `${MOODLE_URL}/webservice/rest/server.php`;
        // Step 1: Get all courses
        const { data: allCourses } = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_course_get_courses",
                moodlewsrestformat: "json",
            },
        });
        // Create a course lookup map for faster access
        const coursesMap = new Map(allCourses.map((course) => [course.id, { id: course.id, name: course.fullname }]));
        // Step 2: Get all students by checking each course
        let allStudents = {};
        for (const course of allCourses) {
            // Skip system courses or categories
            if (course.id <= 1)
                continue;
            const { data: enrolledUsers } = yield axios_1.default.get(moodleUrl, {
                params: {
                    wstoken: moodleToken,
                    wsfunction: "core_enrol_get_enrolled_users",
                    moodlewsrestformat: "json",
                    courseid: String(course.id),
                },
            });
            // Filter only students from enrolled users
            const students = enrolledUsers.filter((user) => user.roles.some((role) => role.roleid === 5));
            // Add course to each student's courses list
            for (const student of students) {
                const studentId = student.id;
                if (!allStudents[studentId]) {
                    // First time seeing this student
                    allStudents[studentId] = {
                        id: student.id,
                        fullname: `${student.firstname} ${student.lastname}`,
                        email: student.email,
                        profileimageurl: student.profileimageurl,
                        lastaccess: student.lastaccess,
                        courses: [{ id: course.id, name: course.fullname }]
                    };
                }
                else {
                    // Add this course to existing student
                    allStudents[studentId].courses.push({ id: course.id, name: course.fullname });
                }
            }
        }
        // Convert map to array
        const studentsArray = Object.values(allStudents);
        res.json(studentsArray);
    }
    catch (error) {
        console.error("Error fetching all students:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ error: "Failed to fetch students", details: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data });
    }
});
exports.getAllStudentsWithCourses = getAllStudentsWithCourses;
/**
 * Get all students from the coach's courses
 * @route GET /api/coach/students
 * @param req - Express request object
 * @param res - Express response object
 */
const getAllStudentsFromCoachCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("Fetching all students from coach courses...");
    try {
        const moodleUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php`;
        const moodleToken = req.headers["x-moodle-token"];
        if (!moodleToken) {
            res.status(401).json({ message: "Unauthorized - Missing token" });
            return;
        }
        // Step 1: Fetch User ID (Coach ID)
        const userInfoResponse = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_webservice_get_site_info",
                moodlewsrestformat: "json",
            },
        });
        const coachId = userInfoResponse.data.userid;
        if (!coachId) {
            res.status(400).json({ message: "Failed to retrieve user ID" });
            return;
        }
        // Step 2: Get coach's courses
        const enrolledCoursesResponse = yield axios_1.default.get(moodleUrl, {
            params: {
                wstoken: moodleToken,
                wsfunction: "core_enrol_get_users_courses",
                moodlewsrestformat: "json",
                userid: coachId,
            },
        });
        const enrolledCourses = enrolledCoursesResponse.data;
        if (!Array.isArray(enrolledCourses) || enrolledCourses.length === 0) {
            res.status(404).json({ message: "No enrolled courses found" });
            return;
        }
        // Step 3: Filter for courses where user is a coach (role ID 3)
        let coachCourses = [];
        for (const course of enrolledCourses) {
            const enrolledUsersResponse = yield axios_1.default.get(moodleUrl, {
                params: {
                    wstoken: moodleToken,
                    wsfunction: "core_enrol_get_enrolled_users",
                    moodlewsrestformat: "json",
                    courseid: course.id,
                },
            });
            const enrolledUsers = enrolledUsersResponse.data;
            const coachEntry = enrolledUsers.find((user) => user.id === coachId);
            if (coachEntry && coachEntry.roles.some((role) => role.roleid === 3)) {
                coachCourses.push(course);
            }
        }
        if (coachCourses.length === 0) {
            res.status(404).json({ message: "No courses found where the user is a coach" });
            return;
        }
        // Step 4: Collect all students from coach's courses, maintaining unique entries
        let allStudents = {};
        for (const course of coachCourses) {
            const { data: enrolledUsers } = yield axios_1.default.get(moodleUrl, {
                params: {
                    wstoken: moodleToken,
                    wsfunction: "core_enrol_get_enrolled_users",
                    moodlewsrestformat: "json",
                    courseid: String(course.id),
                },
            });
            // Filter only students from enrolled users
            const students = enrolledUsers.filter((user) => user.roles.some((role) => role.roleid === 5));
            // Add course to each student's courses list
            for (const student of students) {
                const studentId = student.id;
                if (!allStudents[studentId]) {
                    // First time seeing this student
                    allStudents[studentId] = {
                        id: student.id,
                        fullname: `${student.firstname} ${student.lastname}`,
                        email: student.email,
                        profileimageurl: student.profileimageurl,
                        lastaccess: student.lastaccess,
                        courses: [{ id: course.id, name: course.fullname }]
                    };
                }
                else {
                    // Add this course to existing student's courses
                    // Check if course is already in student's courses (prevent duplicates)
                    if (!allStudents[studentId].courses.some((c) => c.id === course.id)) {
                        allStudents[studentId].courses.push({ id: course.id, name: course.fullname });
                    }
                }
            }
        }
        // Convert map to array
        const studentsArray = Object.values(allStudents);
        res.json(studentsArray);
    }
    catch (error) {
        console.error("Error fetching students from coach courses:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(500).json({ error: "Failed to fetch students", details: (_b = error.response) === null || _b === void 0 ? void 0 : _b.data });
    }
});
exports.getAllStudentsFromCoachCourses = getAllStudentsFromCoachCourses;
