import type { Metadata } from 'next';
import { InvitationService } from '@/services/invitation.service';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const inv = await InvitationService.getInvitationBySlug(slug);

  if (!inv) {
    return {
      title: 'Thiệp mời không tìm thấy | NHÀ CÓ TIỆC',
      description: 'Đường dẫn thiệp mời không tồn tại hoặc đã thay đổi.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nhacotiec.vn';
  const pageUrl = `${siteUrl}/i/${slug}`;
  const title = `${inv.title} — Thiệp Mời Online | NHÀ CÓ TIỆC`;
  const description = `Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi tại ${inv.venue_name} vào ngày ${inv.event_date}.`;
  const coverImage = `${siteUrl}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'NHÀ CÓ TIỆC',
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: inv.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [coverImage],
    },
  };
}

export default async function PublicInvitationLayout({ params, children }: Props) {
  const { slug } = await params;
  const inv = await InvitationService.getInvitationBySlug(slug);

  // Generate Event Schema if invitation exists
  const eventSchema = inv
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: inv.title,
        startDate: inv.event_date,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: inv.venue_name,
          address: {
            '@type': 'PostalAddress',
            streetAddress: inv.venue_address,
            addressCountry: 'VN',
          },
        },
        image: ['https://nhacotiec.vn/opengraph-image'],
        description: `Thiệp mời sự kiện ${inv.title} tại ${inv.venue_name}.`,
      }
    : null;

  return (
    <>
      {eventSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
        />
      )}
      {children}
    </>
  );
}
