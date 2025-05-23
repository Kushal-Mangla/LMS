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
exports.connectUserDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Establishes connection to MongoDB database
 * @async
 * @function connectUserDatabase
 * @throws {Error} If connection fails
 * @returns {Promise<void>}
 */
const connectUserDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Set up connection event listeners
        mongoose_1.default.connection.on('connected', () => {
            console.log('Connected to MongoDB at: ', process.env.MONGODB_URI);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('Disconnected from MongoDB');
        });
        // Attempt to connect to MongoDB
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
    }
    catch (error) {
        console.error('Error connecting to MongoDB: ', error);
        process.exit(1);
    }
});
exports.connectUserDatabase = connectUserDatabase;
