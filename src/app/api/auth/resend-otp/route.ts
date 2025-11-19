import { NextResponse } from "next/server";
import { connectionToDatabase } from "@/src/util/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const db = await connectionToDatabase();

    // Check if admin exists (PostgreSQL uses $1 placeholders)
    const result = await db.query(
      `SELECT email
       FROM "admin"
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length == 0) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Update OTP in database
    await db.query(
      `UPDATE "admin"
       SET otp = $1,
           otp_expires_at = $2
       WHERE email = $3`,
      [otpHash, otpExpiresAt, email]
    );

    // Send OTP email
    await sendOtpEmail(email, otp);

    return NextResponse.json(
      { message: "OTP resent successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}

// Helper function to send OTP email
async function sendOtpEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `CloudBook <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `
      <h1>Hi, Welcome to CloudBook!</h1>
      <p>
        <b>OTP:</b> Dear Admin, your OTP code is <b>${otp}</b>.
        Please do not share this PIN with anyone.
        <br/>It is valid for 2 minutes.
      </p>
      <p>Best Regards,<br/>CloudBook</p>
    `,
  });
}
