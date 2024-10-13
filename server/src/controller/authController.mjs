import passport from 'passport';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User } from '../mongoose/schemas/index.js';
import { comparePassword } from '../utils/helpers.mjs';

dotenv.config();
const CLIENT_URL = process.env.CLIENT_URL;

class AuthController {
    static handleLoginSuccess(req, res) {
        console.log('res', req.user);
        try {
            if (req.user) {
                res.status(200).json({
                    success: true,
                    message: 'Login successfully!',
                    user: req.user,
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }
        } catch (error) {
            console.error('Error handling login success:', error);
            res.status(500).json({
                success: false,
                message: `Internal Server Error: ${error}`,
            });
        }
    }

    static handleLoginFailed(req, res) {
        res.status(401).json({
            success: false,
            message: 'Login failure!',
        });
    }

    static handleLogout(req, res) {
        res.status(200).json({
            success: true,
            message: 'Logout successful!',
        });
    }

    static async handleLocalAuth(req, res) {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user || !comparePassword(password, user.password)) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }
            const token = AuthController.signToken(user.id);
            res.json({ success: true, message: 'Authentication successful', token });
        } catch (error) {
            console.error('Error during local authentication:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    }

    static handleGoogleAuth = passport.authenticate('google');
    static handleGoogleAuthCallback = AuthController.handleOAuthCallback('google');

    static handleFacebookAuth = passport.authenticate('facebook');
    static handleFacebookCallback = AuthController.handleOAuthCallback('facebook');

    static handleOAuthCallback(provider) {
        return (req, res, next) => {
            passport.authenticate(provider, {
                failureRedirect: '/auth/login/failed',
                session: false,
            })(req, res, (err) => {
                if (err) {
                    return next(err);
                }
                const token = AuthController.signToken(req.user.id);
                console.log('token', token);
                res.redirect(`${CLIENT_URL}/account/login?token=${token}`);
            });
        };
    }

    static signToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    }
}

export default AuthController;
