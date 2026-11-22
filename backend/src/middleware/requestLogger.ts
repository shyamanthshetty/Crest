import { type Request, type Response, type NextFunction } from "express";

// ANSI color codes for readability in terminal / docker logs
const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};

const getStatusColor = (status: number): string => {
  if (status >= 500) return colors.red;
  if (status >= 400) return colors.yellow;
  if (status >= 300) return colors.cyan;
  if (status >= 200) return colors.green;
  return colors.reset;
};

const getMethodColor = (method: string): string => {
  switch (method.toUpperCase()) {
    case "GET":
      return colors.blue;
    case "POST":
      return colors.green;
    case "PUT":
    case "PATCH":
      return colors.yellow;
    case "DELETE":
      return colors.red;
    default:
      return colors.magenta;
  }
};

/**
 * Request logging middleware that outputs method, URL, status code, and latency in ms.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });

  // Wait until response has finished sending headers and body
  res.on("finish", () => {
    const duration = Math.round(performance.now() - start);
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;

    const methodColor = getMethodColor(method);
    const statusColor = getStatusColor(status);

    console.log(
      `${colors.dim}[${timestamp}]${colors.reset} ` +
      `${methodColor}${method.padEnd(6)}${colors.reset} ` +
      `${url.padEnd(30)} ` +
      `-> ${statusColor}${status}${colors.reset} ` +
      `${colors.dim}(${duration}ms)${colors.reset}`
    );
  });

  next();
};
