import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL is set
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('Please set DATABASE_URL in your Vercel project settings.');
    console.error('For Supabase, use the connection pooling URL (port 6543)');
}

// For Supabase connection pooling, we need to disable prepared statements
// by adding ?pgbouncer=true to the DATABASE_URL
let databaseUrl = process.env.DATABASE_URL || '';

// Automatically append ?pgbouncer=true for Supabase connection pooling
if (databaseUrl.includes('pooler.supabase.com') && !databaseUrl.includes('?')) {
    databaseUrl += '?pgbouncer=true';
} else if (databaseUrl.includes('pooler.supabase.com') && !databaseUrl.includes('pgbouncer=true')) {
    // If URL already has query params, append with &
    databaseUrl += (databaseUrl.endsWith('?') || databaseUrl.endsWith('&') ? '' : '&') + 'pgbouncer=true';
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
