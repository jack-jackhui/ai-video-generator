// app/videoGen/_middleware.js
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
    const session = await getToken({ req });

    if (!session) {
        const url = req.nextUrl.clone();
        url.pathname = '/'; // Adjust the login route as necessary
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}
