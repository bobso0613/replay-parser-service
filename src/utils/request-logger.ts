import fs from "node:fs/promises";
import path from "node:path";

type AccessLogEntry = {
  requestId: string;
  ip: string;
  clientIp: string;
  timestamp: string;
  route: string;
  fileName: string;
  outcome: "success" | "fail";
  errorMessage: string;
};

const logFilePath = path.join(process.cwd(), "logs", "access-log.txt");

const sanitizeLogValue = (value: string): string => {
  return value.replace(/[\r\n|]/g, " ").trim();
};

export const logAccessEntry = async (entry: AccessLogEntry): Promise<void> => {
  const logLine = [
    `requestId=${sanitizeLogValue(entry.requestId)}`,
    `timestamp=${sanitizeLogValue(entry.timestamp)}`,
    `ip=${sanitizeLogValue(entry.ip)}`,
    `client_ip=${sanitizeLogValue(entry.clientIp)}`,
    `route=${sanitizeLogValue(entry.route)}`,
    `filename=${sanitizeLogValue(entry.fileName)}`,
    `outcome=${entry.outcome}`,
    `error=${sanitizeLogValue(entry.errorMessage)}`,
  ].join(" | ");

  await fs.mkdir(path.dirname(logFilePath), { recursive: true });
  await fs.appendFile(logFilePath, `${logLine}\n`, "utf8");
};
