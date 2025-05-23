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
const auth_js_1 = __importDefault(require("../middleware/auth.js"));
const Todo_js_1 = __importDefault(require("../models/Todo.js"));
const router = express_1.default.Router();
// Get all todos for user
router.get('/', auth_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todos = yield Todo_js_1.default.find({ user: req.user.id }).sort({ date: -1 });
        res.json(todos);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}));
// Add new todo
router.post('/', auth_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newTodo = new Todo_js_1.default({
            user: req.user.id,
            text: req.body.text
        });
        const todo = yield newTodo.save();
        res.json(todo);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}));
// Update todo
router.put('/:id', auth_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todo = yield Todo_js_1.default.findById(req.params.id);
        if (!todo)
            return res.status(404).json({ msg: 'Todo not found' });
        if (todo.user.toString() !== req.user.id)
            return res.status(401).json({ msg: 'Not authorized' });
        todo.completed = !todo.completed;
        yield todo.save();
        res.json(todo);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}));
// Delete todo
router.delete('/:id', auth_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todo = yield Todo_js_1.default.findById(req.params.id);
        if (!todo)
            return res.status(404).json({ msg: 'Todo not found' });
        if (todo.user.toString() !== req.user.id)
            return res.status(401).json({ msg: 'Not authorized' });
        yield Todo_js_1.default.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Todo removed' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}));
exports.default = router;
