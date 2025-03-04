/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'is1-ssl.mzstatic.com',
                port: '',
                pathname: '/image/thumb/**',
                search: '',
            },
        ],
    },
};

export default nextConfig;
