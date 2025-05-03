"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Skin analysis endpoint (stubbed)
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // In production, process req.file.buffer with AI service
        const results = { hydration: 80, oiliness: 30, spots: 5 };
        res.json({ results });
    }
    catch (e) {
        console.error('Skin analysis error:', e);
        res.status(500).json({ error: 'Analysis failed' });
    }
});
exports.default = router;
