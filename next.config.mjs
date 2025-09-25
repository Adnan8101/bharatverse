/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        domains: ['bharatverse.vercel.app', 'localhost']
    },
    logging: {
        fetches: {
            fullUrl: false,
        },
    },
    experimental: {
        // Suppress warning messages for expected Clerk redirects in development
        optimizePackageImports: ['@clerk/nextjs']
    },
    // Moved from experimental as per Next.js 15 requirements
    serverExternalPackages: [],
    // Vercel deployment optimization
    trailingSlash: false,
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
                ]
            }
        ]
    }
};

export default nextConfig;
