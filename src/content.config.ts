import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title:       z.string(),
    type:        z.enum(['university', 'game', 'independent']),
    date:        z.coerce.date(),
    cover:       z.string(),
    tags:        z.array(z.string()),
    stack:       z.array(z.string()),
    description: z.string(),
    featured:    z.boolean().default(false),
    links: z.object({
      github: z.string().url().optional(),
      demo:   z.string().url().optional(),
      paper:  z.string().url().optional(),
      play:   z.string().url().optional(),
    }).optional(),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: z.object({
    photo: z.string().optional(),
    education: z.array(z.object({
      degree:      z.string(),
      institution: z.string(),
      year:        z.string(),
    })),
    experience: z.array(z.object({
      role:    z.string(),
      company: z.string(),
      period:  z.string(),
      bullets: z.array(z.string()),
    })),
    skills: z.record(z.string(), z.array(z.string())),
    awards: z.array(z.string()).optional(),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/site' }),
  schema: z.object({
    name:     z.string(),
    tagline:  z.string(),
    role:     z.string(),
    intro:    z.string(),
    email:    z.string().email(),
    github:   z.string().url(),
    linkedin:  z.string().url(),
    artstation: z.string().url().optional(),
    cv:       z.string(),
    location: z.string().optional(),
    projects_page_desc:       z.string().optional(),
    university_section_desc:  z.string().optional(),
    independent_section_desc: z.string().optional(),
    games_section_desc:       z.string().optional(),
  }),
});

export const collections = { projects, about, site };
