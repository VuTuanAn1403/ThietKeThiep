import { MetadataRoute } from 'next';
import { TemplateService } from '@/services/template.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nhacotiec.vn';
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/case-studies`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/swagger-ui`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    const templates = await TemplateService.getTemplates();
    const templateRoutes: MetadataRoute.Sitemap = templates.map((tpl: import('@/types/database.types').Template) => ({
      url: `${baseUrl}/templates/${tpl.slug}`,
      lastModified: new Date(tpl.updated_at || lastModified),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...templateRoutes];
  } catch (err) {
    return staticRoutes;
  }
}
