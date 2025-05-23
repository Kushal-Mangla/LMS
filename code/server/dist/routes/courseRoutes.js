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
// Import the fetchCourseTags function from userController
const userController_1 = require("@/controllers/userController");
const router = express_1.default.Router();
/**
 * @route GET /api/courses/tags/:courseId
 * @desc Get tags for a specific course
 * @access Public
 */
router.get('/tags/:courseId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({ message: "Course ID is required" });
        }
        const tags = yield (0, userController_1.fetchCourseTags)(Number(courseId));
        res.json(tags);
    }
    catch (error) {
        console.error('Error fetching course tags:', error);
        res.status(500).json({ message: 'Failed to fetch course tags' });
    }
}));
exports.default = router;
