import { connectionToDatabase } from '@/src/util/db';
import { NextRequest, NextResponse } from 'next/server';
import { QueryResult } from 'pg';

// GET - Retrieve generals
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const db = await connectionToDatabase();

        // If user ID is provided, fetch user's generals
        if (user_id) {
            const result: QueryResult = await db.query(
                `SELECT * FROM generals WHERE user_id = $1`,
                [user_id]
            );

            if (result.rows.length == 0) {
                return NextResponse.json(
                    { success: false, message: 'General settings not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: result.rows },
                { status: 200 }
            );
        }

        // Fetch all generals
        const result: QueryResult = await db.query(
            `SELECT * FROM generals`
        );

        return NextResponse.json(
            { success: true, data: result.rows },
            { status: 200 }
        );
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// PUT - Create or update generals
export async function PUT(request: NextRequest) {
    try {
        const {
            user_id,
            department,
            role,
            category,
            size,
            color,
            material,
            weight
        } = await request.json();

        // Validate required fields
        if (!user_id) {
            return NextResponse.json(
                { success: false, message: 'User ID is required' },
                { status: 400 }
            );
        }

        // Validate required arrays
        const requiredArrays: Record<string, unknown> = {
            department,
            role,
            category
        };

        for (const [key, value] of Object.entries(requiredArrays)) {
            if (!Array.isArray(value)) {
                return NextResponse.json(
                    { success: false, message: `${key} must be an array` },
                    { status: 400 }
                );
            }
        }

        const db = await connectionToDatabase();

        // Check if settings exist
        const existing: QueryResult = await db.query(
            `SELECT id FROM generals WHERE user_id = $1`,
            [user_id]
        );

        if (existing.rows.length == 0) {
            // Insert new record
            const insertResult: QueryResult = await db.query(
                `INSERT INTO generals
                (user_id, department, role, category, size, color, material, weight)
                VALUES ($1,$2::jsonb,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,$7::jsonb,$8::jsonb)
                RETURNING id`,
                [
                    user_id,
                    JSON.stringify(department),
                    JSON.stringify(role),
                    JSON.stringify(category),
                    JSON.stringify(size),
                    JSON.stringify(color),
                    JSON.stringify(material),
                    JSON.stringify(weight),
                ]
            );

            return NextResponse.json(
                {
                    success: true,
                    message: 'General settings created',
                    data: { id: insertResult.rows[0].id }
                },
                { status: 201 }
            );
        } else {
            // Update existing record
            const updateResult: QueryResult = await db.query(
                `UPDATE generals
                SET department = $1::jsonb,
                    role = $2::jsonb,
                    category = $3::jsonb,
                    size = $4::jsonb,
                    color = $5::jsonb,
                    material = $6::jsonb,
                    weight = $7::jsonb
                WHERE user_id = $8`,
                [
                    JSON.stringify(department),
                    JSON.stringify(role),
                    JSON.stringify(category),
                    JSON.stringify(size),
                    JSON.stringify(color),
                    JSON.stringify(material),
                    JSON.stringify(weight),
                    user_id
                ]
            );

            return NextResponse.json(
                {
                    success: true,
                    message: 'General settings updated',
                    data: { affectedRows: updateResult.rowCount }
                },
                { status: 200 }
            );
        }
    } catch (error) {
        console.error('Error in PUT /api/generals:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error',
                error: process.env.NODE_ENV == 'development' ? error : undefined
            },
            { status: 500 }
        );
    }
}
