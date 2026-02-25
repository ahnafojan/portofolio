import { defineType, defineField } from "sanity";

export default defineType({
  name: "skill",
  title: "Skills",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: ["Frontend", "Backend", "Database", "DevOps", "Tools", "Other"] },
    }),
    defineField({ name: "level", title: "Level (1-5)", type: "number" }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
  ],
});