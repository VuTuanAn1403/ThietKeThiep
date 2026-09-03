import React from 'react';

export function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nhacotiec.vn';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NHÀ CÓ TIỆC',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Nền tảng tạo thiệp cưới, sinh nhật, sự kiện online thông minh và cá nhân hóa tại Việt Nam.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@nhacotiec.vn',
      contactType: 'customer support',
      availableLanguage: ['Vietnamese', 'English'],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NHÀ CÓ TIỆC',
    url: siteUrl,
    description: 'Tạo thiệp cưới và sự kiện online cao cấp với xác nhận RSVP tức thì.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/templates?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
