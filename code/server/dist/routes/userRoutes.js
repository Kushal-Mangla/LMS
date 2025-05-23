"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("@/middlewares/authMiddleware");
const userController_1 = require("@/controllers/userController");
const coachController_1 = require("@/controllers/coachController");
const router = express_1.default.Router();
/**
 * @route GET /profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authMiddleware_1.protect, userController_1.getUserProfile);
/**
 * @route PUT /profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authMiddleware_1.protect, userController_1.updateUserProfile);
/**
 * @route PUT /preferences
 * @desc Update user preferences
 * @access Public
 */
router.put('/preferences', authMiddleware_1.protect, userController_1.updatePreferences); //tbd for r2
/**
 * @route GET /learners/:learnerId/progress
 * @desc Get learner progress
 * @access Private
 */
router.get('/learners/:learnerId/progress', authMiddleware_1.protect, userController_1.getLearnerProgress); //tbd
/**
 * @route DELETE /profile
 * @desc Delete user account
 * @access Private
 */
router.delete('/profile', authMiddleware_1.protect, userController_1.deleteUserAccount); //tbd
/**
 * @route GET /course/:courseId
 * @desc Get course contents
 * @access Public
 */
router.get("/course/:courseId", userController_1.courseContents); //tbd
/**
 * @route GET /allcourses
 * @desc Get all courses
 * @access Public
 */
router.get('/allcourses', userController_1.getCourses);
/**
 * @route GET /courses
 * @desc Get user courses
 * @access Public
 */
router.get('/courses', userController_1.getUserCourses);
router.get('/coursesprogress', userController_1.getUserCoursesWithCompletion);
/**
 * @route GET /enroll
 * @desc Enroll user in a course
 * @access Public
 */
router.get('/enroll', userController_1.enrollUserInCourse);
/**
 * @route GET /performance
 * @desc Get learner performance
 * @access Private
 */
router.get('/performance', authMiddleware_1.protect, userController_1.getLearnerPerformance);
/**
 * @route GET /coach/courses/:userId
 * @desc Get courses coached by a user
 * @access Public
 */
router.get("/coach/courses/:userId", coachController_1.getCoachCourses);
/**
 * @route GET /coach/students/:courseId
 * @desc Get students enrolled in a course
 * @access Public
 */
router.get("/coach/students/:courseId", coachController_1.getCourseStudents);
// router.get('/coach/students', getAllStudentsFromCoachCourses); //tbd
router.get('/coach/students', coachController_1.getAllStudentsWithCourses); //tbd
/**
 * @route GET /categories
 * @desc Get all course categories
 * @access Public
 */
router.get('/categories', userController_1.getCourseCategories);
/**
 * @route PUT /first-login-complete
 * @desc Mark first login complete
 * @access Private
 */
router.put('/first-login-complete', authMiddleware_1.protect, userController_1.markFirstLoginComplete);
router.get("/fetch-all-tags", userController_1.testFetchAllCourseTags);
exports.default = router;
