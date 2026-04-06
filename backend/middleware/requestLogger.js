import logger from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    logger.http("HTTP request completed", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId: req.user?.id || null,
    });
  });

  next();
};
