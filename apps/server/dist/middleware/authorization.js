"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
function requireRole(role) {
    return async (req, res, next) => {
        try {
            const auth = req.auth;
            if (!auth || !auth.sub) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const auth0Id = auth.sub;
            const user = await prismaClient_1.default.user.findUnique({ where: { auth0Id } });
            if (!user || user.role !== role) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            next();
        }
        catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    };
}
exports.requireRole = requireRole;
