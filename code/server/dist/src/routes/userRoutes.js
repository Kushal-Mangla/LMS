"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("@/middlewares/authMiddleware");
const userController_1 = require("@/controllers/userController");
const router = express_1.default.Router();
router.get('/profile', authMiddleware_1.protect, userController_1.getUserProfile);
router.put('/profile', authMiddleware_1.protect, userController_1.updateUserProfile);
router.put('/preferences', userController_1.updatePreferences); //tbd for r2
router.get('/learners/:learnerId/progress', authMiddleware_1.protect, userController_1.getLearnerProgress); //tbd
router.delete('/profile', authMiddleware_1.protect, userController_1.deleteUserAccount); //tbd
router.get("/course/:courseId", userController_1.courseContents); //tbd
router.get('/allcourses', userController_1.getCourses);
router.get('/courses', userController_1.getUserCourses);
router.get('/enroll', userController_1.enrollUserInCourse);
router.get('/performance', authMiddleware_1.protect, userController_1.getLearnerPerformance);
exports.default = router;
