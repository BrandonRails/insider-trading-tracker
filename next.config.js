const crypto = require('crypto');

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['bullmq', 'ioredis'],
  
  // Enable static optimization for better performance
  output: 'standalone',
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false, // Security: block SVG uploads
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Bundle analyzer (conditional)
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzerConfig: {
      client: {
        analyzerMode: 'static',
        openAnalyzer: false,
      },
    },
  }),
  
  // Security headers - OWASP ASVS 5.0 compliant
  async headers() {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy - Strict, nonce-based
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production' 
              ? `default-src 'none'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://vitals.vercel-analytics.com https://region1.google-analytics.com; frame-src https://js.stripe.com https://hooks.stripe.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com; upgrade-insecure-requests; block-all-mixed-content;`
              : `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: wss:; frame-ancestors 'none';`
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Referrer policy for privacy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions policy - disable unnecessary features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()'
          },
          // Cross-Origin policies
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          // Security headers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Server identification (hide for security)
          {
            key: 'Server',
            value: 'InsiderPilot'
          }
        ],
      },
    ];
  },
  
  // Redirects for SEO and security
  async redirects() {
    return [
      // Redirect www to apex domain
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.insiderpilot.com' }],
        destination: 'https://insiderpilot.com/:path*',
        permanent: true,
      },
      // Legacy redirects (if migrating from old URLs)
      {
        source: '/feed',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Rewrites for clean URLs and API routing
  async rewrites() {
    return [
      // Clean ticker URLs
      {
        source: '/stock/:symbol',
        destination: '/ticker/:symbol',
      },
      // API versioning
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    // Security: Remove console logs in production
    if (!dev) {
      config.optimization.minimizer.push(
        new webpack.DefinePlugin({
          'console.log': 'function(){}',
          'console.warn': 'function(){}',
          'console.error': 'function(){}',
        })
      );
    }
    
    return config;
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_NAME: 'Insider Pilot',
    NEXT_PUBLIC_APP_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000',
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Performance optimizations
  poweredByHeader: false, // Security: hide Next.js header
  generateEtags: true,
  compress: true,
};

module.exports = nextConfig;