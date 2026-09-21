import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog posts, converted from Jekyll's `_posts/`.
 *
 * `slug` is explicit because Astro lowercases ids and two legacy URLs have
 * mixed case (/Facebook-API-en-bot-de-Messenger/, /Facebook-API-in-Messenger-bot/).
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    slug: z.string(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});

export const collections = { blog };
