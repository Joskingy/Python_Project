import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { file, glob } from "astro/loaders";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

const text = z.string().min(1);
export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  projects: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
    schema: z.object({
      title: text,
      subtitle: text,
      category: text,
      status: text,
      summary: text,
      stack: z.array(text).min(1),
      repository: z.url().optional(),
      contribution: text,
      scope: text,
      order: z.number(),
    }),
  }),
  profile: defineCollection({
    loader: file("src/data/profile.json"),
    schema: z.object({
      name: text,
      location: text,
      focus: text,
      about: text,
      email: z.email(),
      github: z.url(),
      linkedin: z.url(),
      experience: z.array(
        z.object({ company: text, role: text, dates: text, description: text }),
      ),
      certifications: z.array(z.object({ name: text, date: text })),
      education: text,
    }),
  }),
};
