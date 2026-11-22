import { Router } from "express";
import { getHealth, getLiveness, getReadiness } from "../controllers/health.controller.js";

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Overall backend server and database health check
 *     description: Returns server status, uptime, system resources, and database connectivity latency.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: integer
 *                   example: 124
 *                 uptimeFormatted:
 *                   type: string
 *                   example: "2m 4s"
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 services:
 *                   type: object
 *                   properties:
 *                     server:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: up
 *                         responseTimeMs:
 *                           type: integer
 *                           example: 1
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: up
 *                         responseTimeMs:
 *                           type: integer
 *                           example: 5
 *                 system:
 *                   type: object
 *                   properties:
 *                     nodeVersion:
 *                       type: string
 *                       example: v22.12.0
 *                     platform:
 *                       type: string
 *                       example: win32
 *                     memory:
 *                       type: object
 *                       properties:
 *                         rss:
 *                           type: string
 *                           example: "45.20 MB"
 *                         heapTotal:
 *                           type: string
 *                           example: "22.50 MB"
 *                         heapUsed:
 *                           type: string
 *                           example: "15.10 MB"
 *       503:
 *         description: Server is degraded or database is unreachable
 */
router.get("/", getHealth);

/**
 * @openapi
 * /api/health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Lightweight check to verify the Node.js server process is responsive (does not query the database).
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server process is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: integer
 *                   example: 124
 */
router.get("/live", getLiveness);

/**
 * @openapi
 * /api/health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Verifies that database connectivity is established and the server is ready to receive traffic.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is ready to handle traffic
 *       503:
 *         description: Server is not ready (e.g. database connection failed)
 */
router.get("/ready", getReadiness);

export default router;
