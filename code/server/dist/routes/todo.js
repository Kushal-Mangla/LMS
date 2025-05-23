"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const todoControllers_1 = require("../controllers/todoControllers");
const router = express_1.default.Router();
// All routes require authentication
// GET /api/todos - Get all todos for the authenticated user
router.get('/', todoControllers_1.getTodos);
// POST /api/todos - Create a new todo
router.post('/', todoControllers_1.createTodo);
// PUT /api/todos/:id - Toggle todo completion status
router.put('/:id', todoControllers_1.updateTodo);
// DELETE /api/todos/:id - Delete a todo
router.delete('/:id', todoControllers_1.deleteTodo);
exports.default = router;
