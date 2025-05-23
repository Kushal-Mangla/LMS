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
exports.getCourseProgress = exports.markModuleComplete = exports.getCompletedModules = void 0;
const ModuleCompletion_1 = __importDefault(require("../models/ModuleCompletion"));
/**
 * Get all completed modules for a user in a specific course
 * @route GET /api/completion/module-progress/:courseId
 * @param req - Express request object
 * @param res - Express response object
 */
const getCompletedModules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const { userId } = req.query; // Get userId from query params
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const completions = yield ModuleCompletion_1.default.find({
            userId: String(userId),
            courseId: Number(courseId)
        });
        // Extract just the moduleIds for the frontend
        const completedModuleIds = completions.map(completion => completion.moduleId);
        console.log('completedModuleIds:', completedModuleIds);
        res.status(200).json({ completedModuleIds });
    }
    catch (error) {
        console.error('Error fetching completed modules:', error);
        res.status(500).json({ message: 'Failed to fetch completed modules' });
    }
});
exports.getCompletedModules = getCompletedModules;
/**
 * Mark a module as complete
 * @route POST /api/completion/complete-module
 * @param req - Express request object
 * @param res - Express response object
 */
const markModuleComplete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId, moduleId, userId } = req.body;
        if (!userId || !courseId || !moduleId) {
            return res.status(400).json({ message: 'User ID, Course ID and Module ID are required' });
        }
        // Create or update the completion record
        yield ModuleCompletion_1.default.findOneAndUpdate({
            userId: String(userId),
            courseId: Number(courseId),
            moduleId: Number(moduleId)
        }, { completedAt: new Date() }, { upsert: true, new: true });
        // Get the updated list of completed modules for this course
        const completions = yield ModuleCompletion_1.default.find({
            userId: String(userId),
            courseId: Number(courseId)
        });
        console.log('completions:', completions);
        const completedModuleIds = completions.map(completion => completion.moduleId);
        res.status(200).json({
            message: 'Module marked as complete',
            completedModuleIds
        });
    }
    catch (error) {
        console.error('Error marking module as complete:', error);
        res.status(500).json({ message: 'Failed to mark module as complete' });
    }
});
exports.markModuleComplete = markModuleComplete;
/**
 * Get course progress (percentage of completed modules)
 * @route GET /api/completion/course-progress/:courseId
 * @param req - Express request object
 * @param res - Express response object
 */
const getCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { courseId } = req.params;
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Count completed modules for this course
        const completedCount = yield ModuleCompletion_1.default.countDocuments({
            userId: String(userId),
            courseId: Number(courseId)
        });
        // For simplicity, just return the count of completed modules
        // The frontend can calculate the percentage
        res.status(200).json({
            completedCount,
            userId: userId
        });
    }
    catch (error) {
        console.error('Error getting course progress:', error);
        res.status(500).json({ message: 'Failed to get course progress' });
    }
});
exports.getCourseProgress = getCourseProgress;
