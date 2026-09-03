import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nhacotiec.vn';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/templates',
          '/templates/*',
          '/case-studies',
          '/faq',
          '/privacy',
          '/i/*',
          '/swagger-ui',
        ],
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/admin',
          '/admin/*',
          '/api/*',
          '/403',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
