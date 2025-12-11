import { connectionToDatabase } from '@/src/util/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get('user_id');

        if (!user_id) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        const result = await db.query(
            `SELECT permissions FROM permissions WHERE user_id = $1`,
            [user_id]
        );

        if (result.rows.length == 0) {
            return NextResponse.json(
                { success: true, data: [] },
                { status: 200 }
            );
        }

        const permissionsData = result.rows[0].permissions;

        let parsedPermissions;
        if (typeof permissionsData == 'string') {
            try {
                parsedPermissions = JSON.parse(permissionsData);
            } catch (err) {
                console.error('Failed to parse permissions:', err);
                parsedPermissions = permissionsData;
            }
        } else {
            parsedPermissions = permissionsData;
        }

        return NextResponse.json(
            { success: true, data: parsedPermissions },
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
        const permissionsData = await request.json();
        const user_id = request.headers.get('user_id');

        if (!user_id) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        if (!Array.isArray(permissionsData)) {
            return NextResponse.json(
                { success: false, error: 'Invalid data format' },
                { status: 400 }
            );
        }

        const db = await connectionToDatabase();

        const existing = await db.query(
            `SELECT 1 FROM permissions WHERE user_id = $1`,
            [user_id]
        );

        if (existing.rows.length == 0) {
            await db.query(
                `INSERT INTO permissions (user_id, permissions)
                 VALUES ($1, $2)`,
                [user_id, JSON.stringify(permissionsData)]
            );
        } else {
            await db.query(
                `UPDATE permissions
                 SET permissions = $1
                 WHERE user_id = $2`,
                [JSON.stringify(permissionsData), user_id]
            );
        }

        return NextResponse.json(
            { success: true, message: 'Permissions updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in PUT /api/permissions:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
