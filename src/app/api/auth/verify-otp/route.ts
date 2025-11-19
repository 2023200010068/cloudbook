import { NextResponse } from "next/server";
import { connectionToDatabase } from "@/src/util/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { otp, email } = await req.json();

    if (!otp || !email) {
      return NextResponse.json(
        { message: "OTP and email are required" },
        { status: 400 }
      );
    }

    const db = await connectionToDatabase();

    const result = await db.query(
      `SELECT otp
       FROM admin
       WHERE email = $1
       AND otp_expires_at > NOW()`,
      [email]
    );

    if (result.rows.length == 0) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    const storedOtpHash = result.rows[0].otp as string;
    const inputOtpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (storedOtpHash !== inputOtpHash) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Clear OTP after verification
    await db.query(
      `UPDATE admin
       SET otp = NULL,
           otp_expires_at = NULL
       WHERE email = $1`,
      [email]
    );

    return NextResponse.json(
      { message: "OTP verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
