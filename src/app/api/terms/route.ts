import { connectionToDatabase } from '@/src/util/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');
        if (!user_id) {
            return NextResponse.json(
                { success: false, message: 'User ID is required' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        const result = await db.query(
            `SELECT terms FROM terms WHERE user_id = $1`,
            [user_id]
        );

        if (result.rows.length == 0) {
            return NextResponse.json(
                { success: false, data: { terms: [] } },
                { status: 404 }
            );
        }

        const record = result.rows[0];
        let terms: any[] = [];

        try {
            terms = typeof record.terms == 'string'
                ? JSON.parse(record.terms)
                : record.terms || [];
        } catch (e) {
            console.error('Error parsing terms:', e);
            terms = [];
        }

        return NextResponse.json(
            { success: true, data: { terms } },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in GET /api/terms:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { terms } = await request.json();
        const user_id = request.headers.get('user_id');

        if (!user_id) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        const existing = await db.query(
            `SELECT 1 FROM terms WHERE user_id = $1`,
            [user_id]
        );

        if (existing.rows.length > 0) {
            // Update existing
            const result = await db.query(
                `UPDATE terms SET terms = $1 WHERE user_id = $2`,
                [JSON.stringify(terms), user_id]
            );

            return (result.rowCount ?? 0) > 0
                ? NextResponse.json({ success: true, message: 'Terms updated' }, { status: 200 })
                : NextResponse.json({ success: false, message: 'Failed to update terms' }, { status: 500 });
        } else {
            // Insert new
            const result = await db.query(
                `INSERT INTO terms (user_id, terms) VALUES ($1, $2)`,
                [user_id, JSON.stringify(terms)]
            );

            return (result.rowCount ?? 0) > 0
                ? NextResponse.json({ success: true, message: 'Terms created' }, { status: 201 })
                : NextResponse.json({ success: false, message: 'Failed to create terms' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in PUT /api/terms:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Server error' },
            { status: 500 }
        );
    }
}
