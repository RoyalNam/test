import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User } from '../mongoose/schemas/user.mjs';
dotenv.config();

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        console.error(err);
        res.sendStatus(403);
    }
};
