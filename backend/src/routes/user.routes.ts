import { Router } from "express";
import { signup, login, forgotPassword, handleResetPassword } from "../controllers/user.controller.js";
import { passwordResetLimiter, authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

/**
 * @openapi
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User successfully created
 *       400:
 *         description: Bad request (e.g., missing fields)
 */
router.post("/signup", authLimiter, signup);

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, returns auth token
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authLimiter, login);

/**
 * @openapi
 * /api/users/forgot-password:
 *   post:
 *     summary: Request a password reset token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset token generated (returned in dev mode)
 *       400:
 *         description: Missing email
 */
router.post("/forgot-password", passwordResetLimiter, forgotPassword);

/**
 * @openapi
 * /api/users/reset-password:
 *   post:
 *     summary: Reset password using a valid token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post("/reset-password", passwordResetLimiter, handleResetPassword);

export default router;