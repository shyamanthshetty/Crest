import { type Request, type Response } from "express";
import prisma from "../db/prisma.js";

// Format seconds into a human-readable duration (e.g., 2d 4h 12m 30s)
const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
};

// Format bytes into readable megabytes (MB)
const formatBytes = (bytes: number): string => {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

/**
 * Checks database connectivity with a timeout to avoid hanging when the database is unreachable.
 */
const checkDatabaseHealth = async (
  timeoutMs = 3000
): Promise<{ isUp: boolean; latencyMs: number | null; error: string | null }> => {
  const start = performance.now();
  let timer: NodeJS.Timeout | null = null;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Database check timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
      timer.unref();
    });

    await Promise.race([prisma.$queryRaw`SELECT 1`, timeoutPromise]);
    const latencyMs = Math.round(performance.now() - start);
    return { isUp: true, latencyMs, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database connection failed";
    return { isUp: false, latencyMs: null, error: errorMsg };
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
};

/**
 * Full Health Check: Returns server status, uptime, system resources,
 * and verifies database connectivity with response latency.
 */
export const getHealth = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const dbHealth = await checkDatabaseHealth();
  const isHealthy = dbHealth.isUp;
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    uptimeFormatted: formatUptime(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    services: {
      server: {
        status: "up",
        responseTimeMs: Date.now() - startTime,
      },
      database: {
        status: dbHealth.isUp ? "up" : "down",
        ...(dbHealth.latencyMs !== null ? { responseTimeMs: dbHealth.latencyMs } : {}),
        ...(dbHealth.error ? { error: dbHealth.error } : {}),
      },
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: formatBytes(memoryUsage.rss),
        heapTotal: formatBytes(memoryUsage.heapTotal),
        heapUsed: formatBytes(memoryUsage.heapUsed),
      },
    },
  };

  return res.status(isHealthy ? 200 : 503).json(healthData);
};

/**
 * Liveness Probe: Fast ping returning 200 OK.
 * Useful for container orchestration and uptime monitoring (e.g. Kubernetes, AWS ALB, Uptime Kuma)
 * to check that the Node.js event loop is responsive without querying the database.
 */
export const getLiveness = (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
};

/**
 * Readiness Probe: Confirms the server is ready to accept incoming traffic
 * by actively validating database connectivity.
 */
export const getReadiness = async (req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();

  if (dbHealth.isUp) {
    return res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
      database: {
        status: "up",
        responseTimeMs: dbHealth.latencyMs,
      },
    });
  }

  return res.status(503).json({
    status: "not_ready",
    timestamp: new Date().toISOString(),
    database: {
      status: "down",
      error: dbHealth.error,
    },
  });
};
