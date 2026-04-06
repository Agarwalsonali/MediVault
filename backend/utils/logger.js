import fs from "fs";
import path from "path";
import winston from "winston";
import "winston-daily-rotate-file";

const logsDirectory = path.join(process.cwd(), "logs");

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

const levelOnly = (level) =>
  winston.format((info) => (info.level === level ? info : false))();

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const consoleFormat = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf(({ timestamp: ts, level, message, stack, ...meta }) => {
    const metaText = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts} [${level}] ${stack || message}${metaText}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "mrms-backend" },
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDirectory, "%DATE%-combined.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      format: fileFormat,
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDirectory, "%DATE%-error.log"),
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: combine(levelOnly("error"), fileFormat),
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDirectory, "%DATE%-warn.log"),
      level: "warn",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: combine(levelOnly("warn"), fileFormat),
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDirectory, "%DATE%-info.log"),
      level: "info",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: combine(levelOnly("info"), fileFormat),
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDirectory, "%DATE%-http.log"),
      level: "http",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      format: combine(levelOnly("http"), fileFormat),
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDirectory, "%DATE%-exceptions.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDirectory, "%DATE%-rejections.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
    }),
  ],
});

// Feature-based logger factory
export const createFeatureLogger = (feature) => {
  const transports = [
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDirectory, `%DATE%-${feature}.log`),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      format: fileFormat,
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ];

  return winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    defaultMeta: { service: "mrms-backend", feature },
    transports,
  });
};

// Pre-created feature loggers for common features
export const authLogger = createFeatureLogger("auth");
export const reportLogger = createFeatureLogger("report");
export const profileLogger = createFeatureLogger("profile");
export const patientLogger = createFeatureLogger("patient");
export const contactLogger = createFeatureLogger("contact");
export const adminLogger = createFeatureLogger("admin");
export const userLogger = createFeatureLogger("user");

export default logger;
