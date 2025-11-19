import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { connectionToDatabase } from '@/src/util/db';
import { ExistingUserResult, User } from '@/src/types/sign-up';

export async function POST(request: NextRequest) {
    try {
        const { name, last_name, email, contact, company, address, role, password } = await request.json();

        // Validate input fields
        if (!name || !last_name || !email || !contact || !company || !address || !role || !password) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Hash password before saving it to the database
        const hashedPassword = await hash(password, 10);
        const db = await connectionToDatabase();

        // Check if the admin already exists
        const existingUser = await db.query<ExistingUserResult>(
            `SELECT COUNT(*) AS count FROM "admin" WHERE email = $1`,
            [email]
        );

        // If email already exists, return a conflict response
        if (existingUser.rows[0]?.count > 0) {
            return NextResponse.json(
                { success: false, message: "Email already exists" },
                { status: 409 }
            );
        }

        // Insert the new admin into the database
        const result = await db.query(
            `INSERT INTO "admin" (name, last_name, email, contact, company, address, role, password)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [name, last_name, email, contact, company, address, role, hashedPassword]
        );

        // Check if the insertion was successful
        if (result.rowCount !== 1) {
            throw new Error('Failed to insert admin');
        }

        return NextResponse.json(
            {
                success: true,
                message: 'User registered successfully',
                userId: result.rows[0].id
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Failed to register admin' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const db = await connectionToDatabase();
        const admin = await db.query<User>("SELECT * FROM \"admin\"");

        return NextResponse.json(admin.rows, { status: 200 });
    } catch (error) {
        console.error('Fetch admin error:', error);
        return NextResponse.json(
            { error: "Failed to fetch admin" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();

        // Validate input fields
        if (!id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Delete the admin from the database
        const db = await connectionToDatabase();
        const result = await db.query(
            "DELETE FROM \"admin\" WHERE id = $1",
            [id]
        );

        // If no rows were affected, return a not found response
        if (result.rowCount == 0) {
            return NextResponse.json(
                { error: "No admin found with the specified ID" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "User deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete admin error:', error);
        return NextResponse.json(
            { error: "Failed to delete admin" },
            { status: 500 }
        );
    }
}