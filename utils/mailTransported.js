import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "mailhog",
  port: 1025,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
});

export default transporter;
