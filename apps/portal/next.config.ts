import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    transpilePackages: ['@repo/ui', '@repo/db', '@repo/types'],
}

export default nextConfig
