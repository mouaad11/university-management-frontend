// src/app/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const role = localStorage.getItem('role');

    if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
    } else if (role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student', request.url));
    } else if (role === 'PROFESSOR') {
        return NextResponse.redirect(new URL('/professor', request.url));
    }

    return NextResponse.next();
}