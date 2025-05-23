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
const express_1 = __importDefault(require("express"));
const completionControllerMoodle_1 = require("@/controllers/completionControllerMoodle");
const mongoCompletionController_1 = require("../controllers/mongoCompletionController");
const router = express_1.default.Router();
/**
 * @route GET /api/completion/module-progress/:courseId
 * @desc Get completed modules for a course
 * @access Public
 */
router.get('/module-progress/:courseId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoCompletionController_1.getCompletedModules)(req, res);
}));
/**
 * @route POST /api/completion/complete-module
 * @desc Mark a module as complete
 * @access Public
 */
router.post('/complete-module', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoCompletionController_1.markModuleComplete)(req, res);
}));
/**
 * @route GET /api/completion/course-progress/:courseId
 * @desc Get course progress
 * @access Public
 */
router.get('/course-progress/:courseId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongoCompletionController_1.getCourseProgress)(req, res);
}));
/**
 * @route GET /api/completion/activities/:courseId/:userId
 * @desc Get all activity completion statuses in a course
 * @access Public
 */
router.get("/activities/:courseId/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = parseInt(req.params.courseId);
        const userId = parseInt(req.params.userId);
        const data = yield (0, completionControllerMoodle_1.getActivityCompletionStatus)(courseId, userId);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
/**
 * @route GET /api/completion/course/:courseId/:userId
 * @desc Get course completion status
 * @access Public
 */
router.get("/course/:courseId/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = parseInt(req.params.courseId);
        const userId = parseInt(req.params.userId);
        const data = yield (0, completionControllerMoodle_1.getCourseCompletionStatus)(courseId, userId);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
/**
 * @route POST /api/completion/course/self-complete
 * @desc Mark a course as self-completed
 * @access Public
 */
router.post("/course/self-complete", (req, res) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { courseId } = req.body;
            const moodleToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]; // Extract Bearer Token
            if (!courseId) {
                return res.status(400).json({ error: "Course ID is required" });
            }
            if (!moodleToken) {
                return res.status(401).json({ error: "Authorization token is required" });
            }
            const data = yield (0, completionControllerMoodle_1.markCourseSelfCompleted)(Number(courseId), moodleToken);
            return res.json(data);
        }
        catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    }))();
});
/**
 * @route POST /api/completion/activity/update
 * @desc Update an activity's completion status manually
 * @access Public
 */
router.post("/activity/update", (req, res) => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { cmid, completed } = req.body;
            const moodleToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]; // Extract Bearer Token
            if (!moodleToken) {
                return res.status(401).json({ error: "Authorization token is required" });
            }
            if (!cmid || completed === undefined) {
                return res.status(400).json({
                    error: "Course Module ID and completion status are required",
                });
            }
            const data = yield (0, completionControllerMoodle_1.updateActivityCompletionStatus)(Number(cmid), completed, moodleToken);
            return res.json(data);
        }
        catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ error: error.message });
            }
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    }))();
});
exports.default = router;
