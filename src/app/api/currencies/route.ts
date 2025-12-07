import { connectionToDatabase } from '@/src/util/db';
import { NextRequest, NextResponse } from 'next/server';
import { QueryResult } from 'pg';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        const db = await connectionToDatabase();

        if (user_id) {
            const result: QueryResult = await db.query(
                `SELECT * FROM currencies WHERE user_id = $1`,
                [user_id]
            );

            if (result.rows.length == 0) {
                return NextResponse.json(
                    { success: false, message: 'Currency not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { success: true, data: result.rows },
                { status: 200 }
            );
        }

        const result: QueryResult = await db.query(
            `SELECT * FROM currencies`
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

export async function PUT(request: NextRequest) {
    try {
        const { user_id, currency } = await request.json();

        if (!user_id || !currency) {
            return NextResponse.json(
                { success: false, message: 'Missing user_id or currency' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        const existing: QueryResult = await db.query(
            `SELECT id FROM currencies WHERE user_id = $1`,
            [user_id]
        );

        if (existing.rows.length == 0) {
            const insertResult: QueryResult = await db.query(
                `INSERT INTO currencies (user_id, currency)
                 VALUES ($1, $2)
                 RETURNING id`,
                [user_id, currency]
            );

            return NextResponse.json(
                {
                    success: true,
                    message: 'Currency created',
                    id: insertResult.rows[0].id
                },
                { status: 201 }
            );
        } else {
            const updateResult: QueryResult = await db.query(
                `UPDATE currencies
                 SET currency = $1
                 WHERE user_id = $2`,
                [currency, user_id]
            );

            return NextResponse.json(
                {
                    success: true,
                    message: 'Currency updated',
                    affectedRows: updateResult.rowCount
                },
                { status: 200 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
