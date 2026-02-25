import { defineType, defineField } from "sanity";

export default defineType({
  name: "profile",
  title: "Profile",
  type: "document",
  fields: [
    defineField({ name: "fullName", title: "Full Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "headline", title: "Headline", type: "string" }),
    defineField({ name: "about", title: "About", type: "text" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "socials",
      title: "Social Links",
      type: "object",
      fields: [
        defineField({ name: "github", title: "GitHub", type: "url" }),
        defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
        defineField({ name: "instagram", title: "Instagram", type: "url" }),
        defineField({ name: "website", title: "Website", type: "url" }),
      ],
    }),
  ],
});