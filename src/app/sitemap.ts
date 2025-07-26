import { MetadataRoute } from 'next';
import { getMemos } from '@/lib/get-memos';
import { i18n } from '@/i18n-config';

const BASE_URL = 'https://elysee-briefs.web.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemaps: MetadataRoute.Sitemap = [];

  // Add home pages for each locale
  for (const locale of i18n.locales) {
    sitemaps.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
    });
  }

  // Add memo pages for each locale
  for (const locale of i18n.locales) {
    const memos = await getMemos(locale);
    for (const memo of memos) {
      sitemaps.push({
        url: `${BASE_URL}/${locale}/memo/${memo.id}`,
        lastModified: new Date(memo.date),
      });
    }
  }

  return sitemaps;
}
