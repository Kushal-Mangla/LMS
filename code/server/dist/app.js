"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("@/middlewares/authMiddleware");
const courseController_1 = require("@/controllers/courseController");
const router = express_1.default.Router();
/**
 * @route GET /courses
 * @desc Get all courses
 * @access Public
 */
router.get('/', courseController_1.getAllCourses);
/**
 * @route GET /courses/:courseId
 * @desc Get course by ID
 * @access Public
 */
router.get('/:courseId', courseController_1.getCourseById);
/**
 * @route POST /courses
 * @desc Create a new course
 * @access Private
 */
router.post('/', authMiddleware_1.protect, courseController_1.createCourse);
/**
 * @route PUT /courses/:courseId
 * @desc Update a course
 * @access Private
 */
router.put('/:courseId', authMiddleware_1.protect, courseController_1.updateCourse);
/**
 * @route DELETE /courses/:courseId
 * @desc Delete a course
 * @access Private
 */
router.delete('/:courseId', authMiddleware_1.protect, courseController_1.deleteCourse);
/**
 * @route GET /courses/:courseId/contents
 * @desc Get course contents
 * @access Public
 */
router.get('/:courseId/contents', courseController_1.getCourseContents);
/**
 * @route POST /courses/:courseId/enroll
 * @desc Enroll user in a course
 * @access Private
 */
router.post('/:courseId/enroll', authMiddleware_1.protect, courseController_1.enrollUserInCourse);
/**
 * @route GET /categories
 * @desc Get all course categories
 * @access Public
 */
router.get('/categories', courseController_1.getCourseCategories);
exports.default = router;
