import { defineType, defineField } from "sanity";

export default defineType({
  name: "certificate",
  title: "Certificates",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Certificate Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "issuer", title: "Issuer", type: "string" }),
    defineField({ name: "issueDate", title: "Issue Date", type: "date" }),
    defineField({ name: "expiryDate", title: "Expiry Date", type: "date" }),
    defineField({ name: "credentialUrl", title: "Credential URL", type: "url" }),
    defineField({ name: "credentialId", title: "Credential ID", type: "string" }),
    defineField({
      name: "skills",
      title: "Related Skills",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
  ],
});