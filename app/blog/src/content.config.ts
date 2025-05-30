import { defineCollection, z } from "astro:content";
import { githubLoader } from "@utils/github-loader";
import { ARTICLE_PAT } from "astro:env/server";

const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),

  date: z.date(),
  updated: z.date().optional(),

  image: z.string().optional(),
  copyright: z.boolean().default(true),
});

const post = defineCollection({
  loader: githubLoader({
    owner: "yy4382",
    repo: "blog-posts",
    ref: "release",
    path: "",
    pat: ARTICLE_PAT,
  }),
  schema: baseSchema.extend({
    tags: z.array(z.string()),
    series: z
      .object({
        title: z.string().optional(),
        id: z.string(),
        order: z.number().optional(),
      })
      .optional(),
    highlight: z.boolean().optional(),
    published: z.boolean(),
  }),
});

const page = defineCollection({
  loader: githubLoader({
    owner: "yy4382",
    repo: "blog-posts",
    ref: "release-page",
    path: "",
    pat: ARTICLE_PAT,
  }),
  schema: baseSchema,
});

export const collections = { post, page };
