import { defineType, defineField } from "sanity";

export default defineType({
  name: "organization",
  title: "Organizations",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Organization Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Role / Position",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "startDate", title: "Start Date", type: "date" }),
    defineField({ name: "endDate", title: "End Date", type: "date" }),
    defineField({
      name: "isCurrent",
      title: "Currently Active",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
  ],
});