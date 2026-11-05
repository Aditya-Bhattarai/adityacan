// Tells the website where your content lives. You rarely need to change this file.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: '**/project.md', base: './site-content' }),
  }),
  writing: defineCollection({
    loader: glob({ pattern: 'writing/**/piece.md', base: './site-content' }),
  }),
  pages: defineCollection({
    loader: glob({ pattern: ['*.yaml', '!chapters.yaml'], base: './site-content/pages' }),
  }),
};
