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
exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getTodos = void 0;
require("../types/express"); // Import the extended Request interface
const Todo_1 = __importDefault(require("../models/Todo"));
// Get all todos for the authenticated user
const getTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const todos = yield Todo_1.default.find({ user: userId }).sort({ date: -1 });
        res.json(todos);
    }
    catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getTodos = getTodos;
// Create a new todo
const createTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Please enter text for the todo' });
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const newTodo = new Todo_1.default({
            text,
            user: userId,
            completed: false
        });
        const savedTodo = yield newTodo.save();
        res.json(savedTodo);
    }
    catch (err) {
        console.error('Error creating todo:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createTodo = createTodo;
// Toggle todo completion status
const updateTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const todo = yield Todo_1.default.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        // Check if the todo belongs to the authenticated user
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        // Toggle the completed status
        todo.completed = !todo.completed;
        const updatedTodo = yield todo.save();
        res.json(updatedTodo);
    }
    catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateTodo = updateTodo;
// Delete a todo
const deleteTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const todo = yield Todo_1.default.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        // Check if the todo belongs to the authenticated user
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        yield todo.deleteOne();
        res.json({ message: 'Todo removed' });
    }
    catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteTodo = deleteTodo;
