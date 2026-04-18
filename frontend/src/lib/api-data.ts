import {
  albumShots,
  blogPosts,
  diaryEntries,
  siteStats,
} from '@/lib/site-content';

export function getSiteStats() {
  return {
    metrics: siteStats,
    system: {
      status: 'healthy',
      mode: 'full-stack',
      backend: 'next-route-handlers',
      updatedAt: new Date().toISOString(),
    },
  };
}

export function getBlogPayload() {
  return {
    posts: blogPosts,
    total: blogPosts.length,
  };
}

export function getAlbumPayload() {
  return {
    shots: albumShots,
    total: albumShots.length,
  };
}

export function getDiaryPayload() {
  return {
    entries: diaryEntries,
    total: diaryEntries.length,
  };
}
