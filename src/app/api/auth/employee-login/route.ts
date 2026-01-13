import { connectionToDatabase } from '@/src/util/db';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET as string;
if (!NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is not defined in the environment variables.");
}

export async function POST(request: NextRequest) {
    try {
        const requestBody = await request.json();

        if (!requestBody.email || !requestBody.password) {
            return new Response(JSON.stringify({ error: 'Email and password are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const db = await connectionToDatabase();

        const employeeResult = await db.query(
            'SELECT * FROM employees WHERE email = $1',
            [requestBody.email]
        );

        if (employeeResult.rows.length == 0) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const employee = employeeResult.rows[0];

        const isPasswordValid = await compare(requestBody.password, employee.password);
        if (!isPasswordValid) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const adminResult = await db.query(
            'SELECT contact, company, logo, address FROM admin WHERE id = $1',
            [employee.user_id]
        );

        if (adminResult.rows.length == 0) {
            return new Response(JSON.stringify({ error: 'Admin data not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const adminData = adminResult.rows[0];

        const token = jwt.sign(
        {
            id: employee.user_id,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            status: employee.status,
            contact: adminData.contact,
            company: adminData.company,
            logo: adminData.logo,
            address: adminData.address
        },
        NEXTAUTH_SECRET,
        { expiresIn: '1h' }
        );

        return new Response(JSON.stringify({ token }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Authentication error:', error);
        return new Response(JSON.stringify({ error: 'Failed to authenticate employee' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
