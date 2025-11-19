import jwt from 'jsonwebtoken';
import { compare } from 'bcryptjs';
import { NextRequest } from 'next/server';
import { connectionToDatabase } from '@/src/util/db';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET as string;
if (!NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is not defined in the environment variables.");
}

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const requestBody = await request.json();

        // Check if email and password are provided
        if (!requestBody.email || !requestBody.password) {
            return new Response(JSON.stringify({ error: 'Email and password are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const db = await connectionToDatabase();

        // Check if the admin exists in the database
        const userQuery = await db.query(
            'SELECT * FROM "admin" WHERE TRIM(email) = $1',
            [requestBody.email]
        );

        if (userQuery.rows.length == 0) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const admin = userQuery.rows[0];

        // Validate the password
        const isPasswordValid = await compare(requestBody.password, admin.password.trim());
        if (!isPasswordValid) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: admin.id,
                name: admin.name,
                last_name: admin.last_name,
                email: admin.email,
                contact: admin.contact,
                company: admin.company,
                address: admin.address,
                role: admin.role,
                image: admin.image,
                logo: admin.logo
            },
            NEXTAUTH_SECRET,
            { expiresIn: '1h' }
        );

        // Send back the token and admin data
        const userData = {
            id: admin.id,
            name: admin.name,
            last_name: admin.last_name,
            email: admin.email,
            contact: admin.contact,
            company: admin.company,
            address: admin.address,
            role: admin.role,
            image: admin.image,
            logo: admin.logo
        };

        return new Response(
            JSON.stringify({ token, admin: userData }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Authentication error:', error);
        // Return error if authentication fails
        return new Response(
            JSON.stringify({ error: 'Failed to authenticate admin' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}