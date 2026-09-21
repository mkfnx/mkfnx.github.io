/** Site metadata, ported from the Jekyll `_config.yml`. */
export const site = {
  name: 'Miguel Lopez',
  description: 'IA, programación, Python.',
  url: 'https://mkfnx.github.io',
  avatar:
    'https://raw.githubusercontent.com/barryclark/jekyll-now/master/images/jekyll-logo.png',
  /** GA4 measurement ID. Analytics stay consent-gated (see ConsentBanner). */
  ga4: 'G-46HE0ZRQ3N',
} as const;

export const footerLinks = {
  github: 'mkfnx',
  linkedin: 'mkfnx',
  stackoverflow: 'users/50073/miguel-lópez',
  youtube: 'user/Mkfnx11',
} as const;

/**
 * Giscus (GitHub Discussions comments).
 *
 * Left with empty ids on purpose: the component renders nothing until you
 * enable Discussions in the repo, install the giscus app and paste the two ids
 * from giscus.app. Nothing breaks in the meantime.
 */
export const giscus = {
  repo: 'mkfnx/mkfnx.github.io',
  repoId: '',
  category: 'Comentarios',
  categoryId: '',
  mapping: 'pathname',
} as const;

export const giscusReady = giscus.repoId !== '' && giscus.categoryId !== '';

/**
 * Tag vocabulary, in display order. Pages are generated only for tags that
 * actually have posts, so this list can stay aspirational (`sql`, `flutter`).
 */
export const tagOrder = [
  'python',
  'analytics',
  'learning',
  'career',
  'web',
  'bots',
  'ai',
  'sql',
  'flutter',
];
