"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const todoController_1 = require("../controllers/todoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// Get all todos and create new todo
router.route('/')
    .get(todoController_1.getTodos)
    .post(todoController_1.createTodo);
// Get, update, and delete a specific todo
router.route('/:id')
    .get(todoController_1.getTodo)
    .put(todoController_1.updateTodo)
    .delete(todoController_1.deleteTodo);
// Mark a todo as completed (separate endpoint for convenience)
router.patch('/:id/complete', todoController_1.markTodoCompleted);
exports.default = router;
