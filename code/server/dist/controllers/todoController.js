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
exports.markTodoCompleted = exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getTodo = exports.getTodos = void 0;
const Todo_1 = __importDefault(require("../models/Todo"));
const mongoose_1 = require("mongoose");
// Get all todos for a user
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        // Optional query parameters for filtering
        const { status, priority, sortBy, sortOrder } = req.query;
        // Build query
        const query = { userId };
        if (status)
            query.status = status;
        if (priority)
            query.priority = priority;
        // Build sort options
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }
        else {
            sort.createdAt = -1; // Default sort by creation date, newest first
        }
        const todos = yield Todo_1.default.find(query).sort(sort);
        return res.status(200).json(todos);
    }
    catch (error) {
        console.error('Error fetching todos:', error);
        return res.status(500).json({ message: 'Error fetching todos' });
    }
});
exports.getTodos = getTodos;
// Get a single todo
const getTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            return res.status(400).json({ message: 'Invalid todo ID' });
        }
        const todo = yield Todo_1.default.findOne({ _id: id, userId });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        return res.status(200).json(todo);
    }
    catch (error) {
        console.error('Error fetching todo:', error);
        return res.status(500).json({ message: 'Error fetching todo' });
    }
});
exports.getTodo = getTodo;
// Create a new todo
const createTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const { title, description, dueDate, priority, status } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        const newTodo = new Todo_1.default({
            userId,
            title,
            description,
            dueDate,
            priority,
            status
        });
        yield newTodo.save();
        return res.status(201).json(newTodo);
    }
    catch (error) {
        console.error('Error creating todo:', error);
        return res.status(500).json({ message: 'Error creating todo' });
    }
});
exports.createTodo = createTodo;
// Update a todo
const updateTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            return res.status(400).json({ message: 'Invalid todo ID' });
        }
        const { title, description, dueDate, priority, status } = req.body;
        // Find and update the todo, ensuring it belongs to the current user
        const updatedTodo = yield Todo_1.default.findOneAndUpdate({ _id: id, userId }, { title, description, dueDate, priority, status }, { new: true, runValidators: true });
        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        return res.status(200).json(updatedTodo);
    }
    catch (error) {
        console.error('Error updating todo:', error);
        return res.status(500).json({ message: 'Error updating todo' });
    }
});
exports.updateTodo = updateTodo;
// Delete a todo
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            return res.status(400).json({ message: 'Invalid todo ID' });
        }
        // Find and delete the todo, ensuring it belongs to the current user
        const deletedTodo = yield Todo_1.default.findOneAndDelete({ _id: id, userId });
        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        return res.status(200).json({ message: 'Todo deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting todo:', error);
        return res.status(500).json({ message: 'Error deleting todo' });
    }
});
exports.deleteTodo = deleteTodo;
// Mark a todo as completed
const markTodoCompleted = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            return res.status(400).json({ message: 'Invalid todo ID' });
        }
        // Find and update the todo status, ensuring it belongs to the current user
        const updatedTodo = yield Todo_1.default.findOneAndUpdate({ _id: id, userId }, { status: 'completed' }, { new: true });
        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        return res.status(200).json(updatedTodo);
    }
    catch (error) {
        console.error('Error marking todo as completed:', error);
        return res.status(500).json({ message: 'Error marking todo as completed' });
    }
});
exports.markTodoCompleted = markTodoCompleted;
