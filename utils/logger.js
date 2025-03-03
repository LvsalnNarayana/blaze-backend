import winston from "winston";
import moment from "moment";

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${moment(timestamp).format(
    "DD-MM-YYYY HH:mm:ss"
  )} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  format: combine(colorize(), timestamp(), myFormat),
  transports: [new winston.transports.Console()],
});

export default logger;
