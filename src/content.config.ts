import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Accepts a valid https?:// URL or an empty string (what the CMS writes for blank fields).
// Empty strings are coerced to undefined before Zod's URL check runs.
const optionalUrl = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.string().url().optional()
);

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
      github: optionalUrl,
      demo:   optionalUrl,
      paper:  optionalUrl,
      play:   optionalUrl,
    }).optional(),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: z.object({
    professional_summary: z.object({
      heading:   z.string(),
      photo:     z.string().optional(),
      photo_alt: z.string().optional(),
    }),
    technical_skills: z.object({
      heading: z.string(),
      groups:  z.array(z.object({
        name:   z.string(),
        skills: z.array(z.string()),
      })),
    }),
    education: z.object({
      heading: z.string(),
      entries: z.array(z.object({
        degree:      z.string(),
        institution: z.string(),
        location:    z.string().optional(),
        start_date:  z.string(),
        end_date:    z.string(),
        description: z.string().optional(),
        logo:        z.string().optional(),
      })),
    }),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experience' }),
  schema: z.object({
    work_history: z.object({
      heading: z.string(),
      entries: z.array(z.object({
        role:        z.string(),
        company:     z.string(),
        location:    z.string().optional(),
        start_date:  z.string(),
        end_date:    z.string(),
        description: z.string(),
        bullets:     z.array(z.string()),
        logo:        z.string().optional(),
      })),
    }),
    volunteering: z.object({
      heading: z.string(),
      entries: z.array(z.object({
        role:         z.string(),
        organization: z.string(),
        location:     z.string().optional(),
        start_date:   z.string(),
        end_date:     z.string(),
        description:  z.string(),
        bullets:      z.array(z.string()).optional(),
        logo:         z.string().optional(),
      })),
    }),
    cv: z.object({
      heading:      z.string(),
      intro:        z.string(),
      button_label: z.string(),
      file:         z.string(),
    }),
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
    artstation: optionalUrl,
    cv:       z.string(),
    location: z.string().optional(),
    projects_page_desc:       z.string().optional(),
    university_section_desc:  z.string().optional(),
    independent_section_desc: z.string().optional(),
    games_section_desc:       z.string().optional(),
  }),
});

export const collections = { projects, about, experience, site };
