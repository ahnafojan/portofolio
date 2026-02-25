import { defineType, defineField } from "sanity";

export default defineType({
  name: "project",
  title: "Projects",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "summary", title: "Summary", type: "text" }),
    defineField({
      name: "thumbnails",
      title: "Thumbnails",
      description: "Bisa upload lebih dari satu gambar project untuk ditampilkan sebagai slider.",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
    }),
    defineField({
      name: "thumbnail",
      title: "Legacy Thumbnail (Single)",
      description: "Field lama. Gunakan Thumbnails untuk input baru.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "techStack",
      title: "Tech Stack",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "demoUrl", title: "Demo URL", type: "url" }),
    defineField({ name: "repoUrl", title: "Repo URL", type: "url" }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
  ],
  orderings: [
    {
      title: "Order (desc)",
      name: "orderDesc",
      by: [{ field: "order", direction: "desc" }],
    },
  ],
});
